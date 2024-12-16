import  { exec,spawn } from 'child_process'
import  fs from 'fs';
import { Worker, Job } from "bullmq";
import  { redisConnection } from '@repo/lib/src';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config()
function truncateOutput(output: string, maxLength: number): string {
    if (output.length > maxLength) {
        return output.slice(0, maxLength) + "\n[...output truncated]";
    }
    return output;
}

async function processTask(startTime: number, data: any) {
    let dockerData = "", dockerError = "";
    const userInput = data.input;
    const { taskId, code, language } = {
        code: data.code,
        language: data.language,
        taskId: data.taskId
    };

    const image = language === 'python' ? 'python:3.11-slim' : 'node:20';
    const filePath = `/tmp/${taskId}.txt`;

    fs.writeFileSync(filePath, code);

    let dockerCommand;
    const containerName = "task_" + taskId;

    if (image === "node:20") {
        dockerCommand = [
            "run",
            "--name",
            containerName,
            "--rm",
            "-v",
            `${filePath}:/code.js`,
            "--read-only",
            "--cap-drop=ALL",
            "--memory=512m",
            "--cpus=1",
            "--security-opt",
            "seccomp=unconfined",
            "-i",
            "node:20-alpine",
            "node",
            "/code.js"
        ];
    } else {
        dockerCommand = [
            "run",
            "--name",
            containerName,
            "--rm",
            "-v",
            `${filePath}:/code.py`,
            "--read-only",
            "--cap-drop=ALL",
            "--memory=512m",
            "--cpus=1",
            "--security-opt",
            "seccomp=unconfined",
            "-i",
            "python:3.11-slim",
            "python",
            "/code.py"
        ];
    }

    const dockerProcess = spawn("docker", dockerCommand);

    dockerProcess.stdin.write(userInput);
    dockerProcess.stdin.end();

    dockerProcess.stdout.on('data', (data) => {
        dockerData += data;
    });

    dockerProcess.stderr.on('data', (data) => {
        dockerError += data;
    });

    const timeout = 10000;
    const timeoutHandler = setTimeout(() => {
        console.error("Docker timeout occurred.");
        exec(`docker stop ${containerName}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Failed to stop container ${containerName}: ${stderr}`);
            } else {
                console.log(`Container ${containerName} stopped due to timeout.`);
            }
        });
        dockerError += "Timeout";
    }, timeout);

    return new Promise<void>((resolve, reject) => {
        dockerProcess.on('close', async (code) => {
            clearTimeout(timeoutHandler);
            if (code === null) {
                exec(`docker stop ${containerName}`, (err, stdout, stderr) => {
                    if (err) {
                        console.error(`Failed to stop container ${containerName}: ${stderr}`);
                    } else {
                        console.log(`Container ${containerName} stopped.`);
                    }
                });
            }

            console.log(`Docker exit code: ${code}`);
            console.log(`Execution time: ${performance.now() - startTime}ms`);

            const maxLength = 5000; 
            const truncatedDockerData = truncateOutput(dockerData, maxLength);
            const truncatedDockerError = truncateOutput(dockerError, maxLength);

            try {
                await axios.post(
                    `${process.env.BASE_URL}/basic/rediswebhook`,
                    {
                        taskId,
                        code,
                        language,
                        userInput,
                        dockerData: truncatedDockerData,
                        dockerError: truncatedDockerError,
                        time: performance.now() - startTime,
                    },
                    {
                        headers: {
                            Authorization: `${process.env.TOKEN}`,
                        },
                    }
                );
                resolve();
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error.message);
                } else {
                    console.error("Unknown error occurred:", error);
                }
                reject(error);
            }
        });

        dockerProcess.on('error', (error) => {
            clearTimeout(timeoutHandler);
            console.error("Docker process error:", error);
            reject(error);
        });
    });
}




const  handler  = new Worker(
    process.env.QUEUE_NAME as string,
    async (job: Job)=>{
          const data = job.data
        const startTime = performance.now();
        await processTask(startTime,data);

    },{
        connection:redisConnection,
        removeOnComplete: {
            age: 3600, 

            count: 500, 
          },
          removeOnFail: {
            age: 24 * 3600, 
          }
    }
)
handler.on("completed", (job:Job) => {
    console.log(`Job with id ${job.id} has been completed`);
  });
  handler.on("failed", (job, error:Error) => {
    console.log(error)
    console.log(`Job with id ${job?.id} has failed with error ${error.message}`);
  });   