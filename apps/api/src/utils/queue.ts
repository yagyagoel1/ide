import {Queue,Job} from  "bullmq"
import { defaultJobOptions, redisConnection } from "@repo/lib/src";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config()
const myQueue = new Queue(process.env.QUEUE_NAME as string, {
    connection: redisConnection,
    defaultJobOptions: defaultJobOptions,
  });









export async function addJobs(code:String,language:"python"|"node",input:string):Promise<null| String> {
    const taskId = uuidv4();
    const supportedLanguages = ["python","node"]
    if (!supportedLanguages.includes(language)) {
        return null
    }

  try {
    await myQueue.add(process.env.JOB_NAME as string, { code, taskId, language,input }, { jobId: taskId });
    return taskId
  }
  catch (error) {
    console.log(error)
    return null
  }
}

export async function getJobStatus(jobId:string):Promise<null|string> {
  const job = await Job.fromId(myQueue, jobId);
  
  if (!job) {
      console.log(`Job with ID ${jobId} not found.`);
      return null;
  }

  // Get the state of the job
  const state = await job.getState();
  console.log(`Job ${jobId} is in state: ${state}`);

  return state;
}