import  { exec,spawn } from 'child_process'
import  fs from 'fs';
import { Worker, Job } from "bullmq";
import  { redisConnection } from '@repo/lib/src';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config()
async function processTask(startTime:number,data:any) {
    let dockerData="",dockerError="";
    const userInput = data.userInput;
    const { taskId, code, language } = {
        code:data.code,
        language: data.language,
        taskId: data.taskId
    }

    const image = language === 'python' ? 'python:3.11-slim' : 'node:20';
    const filePath = `/tmp/${taskId}.txt`;

    fs.writeFileSync(filePath, code);

    let dockerCommand;
    let containerName="task_"+taskId
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


    const dockerProcess = spawn("docker",dockerCommand);


    dockerProcess.stdin.write(userInput);
    dockerProcess.stdin.end();  


    dockerProcess.stdout.on('data', (data) => {
        dockerData +=data
        console.log(`output ${data}`);
    });

    dockerProcess.stderr.on('data', (data) => {
        dockerError+=data
        console.error(`err ${data}`);
    });

    const timeout = 20000; 
    const timeoutHandler = setTimeout(() => {
        console.error("timeout ho gya docker....");
        exec(`docker stop ${containerName}`, (err, stdout, stderr) => {
          if (err) {
            
              console.error(`faield ${containerName}: ${stderr}`);
          } else {
                
              console.log(`container ${containerName} stop`);
          }

      });
      dockerError +="timeout"
        ///push the data to the webhook if the webhook fails then push it to the failed queue

    

    }, timeout);

    dockerProcess.on('close', (code) => {
        clearTimeout(timeoutHandler); 
        if(code==null){
          exec(`docker stop ${containerName}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Failed to stop ${containerName}: ${stderr}`);
            } else {
                console.log(`container stopped ${containerName} `);
            }
        });
        }
        dockerData +="exited"
        console.log(`Ddocker exit code ${code}`);
        console.log(performance.now()-startTime)
                ///push the data to the webhook if the webhook fails then push it to the failed queue

    });
   try {
     const response = await  axios.post(`${process.env.BASE_URL}/webhook`,{
         taskId,
         code,
         language,
         userInput,
         dockerData,
         dockerError,
         time:performance.now()-startTime,
         
     },{
         headers:{
             Authorization : `${process.env.TOKEN}`
         }
     })
   } catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error("Unknown error occurred:", error);
    } 
    //push to queue   
   }

}


const  handler  = new Worker(
    process.env.QueueName||"default",
    async (job: Job)=>{
        const startTime = performance.now();
        await processTask(startTime,job.data);

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
    console.log(`Job with id ${job?.id} has failed with error ${error.message}`);
  });   