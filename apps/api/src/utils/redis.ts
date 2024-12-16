import  { createClient }  from "redis"
import dotenv from 'dotenv';
dotenv.config()
const client:ReturnType<typeof createClient>= createClient({
    url: process.env.REDIS_URL||"redis://localhost:6379",
})

client.on("error", function (error) {
  console.error(error)
})
client.on("connect", function () {
    console.log("Redis connected")
    }
)
client.connect().catch((error) => {
    console.error("Failed to connect to Redis:", error);
});

export async function setData(taskId:string, data:any):Promise<void> {
    await client.set(taskId, JSON.stringify(data))

}
export async function getData(taskId:string):Promise<any> {


   return await client.get(taskId)
}


export default client