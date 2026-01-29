import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.log('Redis connection closed');
  }

  // String operations
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.redis.setex(key, ttlSeconds, value);
  }

  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.redis.exists(key);
  }

  async incr(key: string): Promise<number> {
    return await this.redis.incr(key);
  }

  async decr(key: string): Promise<number> {
    return await this.redis.decr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<number> {
    return await this.redis.expire(key, ttlSeconds);
  }

  // List operations
  async lpush(key: string, value: string): Promise<number> {
    return await this.redis.lpush(key, value);
  }

  async rpush(key: string, value: string): Promise<number> {
    return await this.redis.rpush(key, value);
  }

  async lpop(key: string): Promise<string | null> {
    return await this.redis.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return await this.redis.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redis.lrange(key, start, stop);
  }

  async llen(key: string): Promise<number> {
    return await this.redis.llen(key);
  }

  // Set operations
  async sadd(key: string, member: string): Promise<number> {
    return await this.redis.sadd(key, member);
  }

  async srem(key: string, member: string): Promise<number> {
    return await this.redis.srem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.redis.smembers(key);
  }

  async sismember(key: string, member: string): Promise<number> {
    return await this.redis.sismember(key, member);
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.redis.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    return await this.redis.hdel(key, field);
  }

  async hincrby(key: string, field: string, increment: number): Promise<number> {
    return await this.redis.hincrby(key, field, increment);
  }

  // Sorted Set operations
  async zadd(key: string, score: number, member: string): Promise<number> {
    return await this.redis.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number, withScores?: boolean): Promise<string[]> {
    if (withScores) {
      return await this.redis.zrange(key, start, stop, 'WITHSCORES');
    }
    return await this.redis.zrange(key, start, stop);
  }

  async zrevrange(key: string, start: number, stop: number, withScores?: boolean): Promise<string[]> {
    if (withScores) {
      return await this.redis.zrevrange(key, start, stop, 'WITHSCORES');
    }
    return await this.redis.zrevrange(key, start, stop);
  }

  async zscore(key: string, member: string): Promise<string | null> {
    return await this.redis.zscore(key, member);
  }

  async zrem(key: string, member: string): Promise<number> {
    return await this.redis.zrem(key, member);
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    return await this.redis.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subscriber = this.redis.duplicate();
    await subscriber.subscribe(channel);
    
    subscriber.on('message', (receivedChannel: string, message: string) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }

  // Utility methods
  async flushall(): Promise<string> {
    return await this.redis.flushall();
  }

  async ping(): Promise<string> {
    return await this.redis.ping();
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }

  // Advanced operations for specific use cases
  async cacheData(key: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    await this.setex(key, ttlSeconds, JSON.stringify(data));
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    if (!data) return null;
    
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Error parsing cached data for key ${key}:`, error);
      return null;
    }
  }

  async rateLimit(
    key: string, 
    limit: number, 
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const current = await this.incr(key);
    
    if (current === 1) {
      await this.expire(key, windowSeconds);
    }
    
    const ttl = await this.redis.ttl(key);
    const resetTime = Date.now() + (ttl * 1000);
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetTime,
    };
  }

  async acquireLock(
    lockKey: string, 
    ttlSeconds: number = 60, 
    retryAttempts: number = 5
  ): Promise<string | null> {
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    for (let i = 0; i < retryAttempts; i++) {
      const result = await this.redis.set(lockKey, lockValue, 'PX', ttlSeconds * 1000, 'NX');
      
      if (result === 'OK') {
        return lockValue;
      }
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
    }
    
    return null;
  }

  async releaseLock(lockKey: string, lockValue: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await this.redis.eval(script, 1, lockKey, lockValue);
    return result === 1;
  }
}