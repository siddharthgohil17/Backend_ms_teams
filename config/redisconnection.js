import redis from 'redis';

const redisClient = redis.createClient(6379, '127.0.0.1');

redisClient.on('connect', () => {
  console.log('Connected to Redis');

});
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

//CACHE DATA ON REDIS
const getRedisData=(key)=>{
    // console.log(key);
    return redisClient.get(key);
}


//RETRIVE CACHE DATA FROM REDIS

const setRedisData=(key,value)=>{
    return redisClient.set(key,value);
}


export { redisClient,setRedisData,getRedisData};