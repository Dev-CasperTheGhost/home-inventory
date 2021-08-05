import Redis from "ioredis";

const redis = new Redis({
  host: "redis",
  port: parseInt(process.env["REDIS_PORT"]!),
  username: process.env["REDIS_USERNAME"],
  password: process.env["REDIS_PASSWORD"],
});

export async function redisGet(key: string): Promise<string | null> {
  return redis.get(key);
}

export async function redisSet<T extends string>(key: string, data: T) {
  return redis.set(key, data);
}

export async function redisDel(key: string) {
  return redis.del(key);
}