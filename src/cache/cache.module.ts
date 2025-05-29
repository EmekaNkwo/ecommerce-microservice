import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: configService.get('CACHE_TTL') || 60,
        maxRetriesPerRequest: 3,
        enableOfflineQueue: true,
        connectTimeout: 5000,
        commandTimeout: 3000,
        redisOptions: {
          enableReadyCheck: true,
          maxLoadingRetryTime: 10000,
        },
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}
