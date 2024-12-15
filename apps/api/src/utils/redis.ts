import redis from "redis"

const client:ReturnType<typeof redis.createClient>= redis.createClient({
    url: process.env.REDIS_URL,
})

client.on("error", function (error) {
  console.error(error)
})
client.on("connect", function () {
    console.log("Redis connected")
    }
)

export async function setData(taskId:string, data:any):Promise<void> {
    await client.set(taskId, JSON.stringify(data))

}
export async function getData(taskId:string):Promise<any> {
   await client.get(taskId)
}


export default client