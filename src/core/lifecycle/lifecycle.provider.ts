import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Redis } from 'ioredis';

@Injectable()
export class LifecycleProvider implements OnApplicationShutdown {
  private readonly logger = new Logger(LifecycleProvider.name);
  private shutdownComplete = false;

  constructor(
    private readonly pgConnection: DataSource,
    private readonly redis: Redis,
  ) {}

  async onApplicationShutdown(signal?: string) {
    if (this.shutdownComplete) return;

    this.logger.log(`Shutting down (${signal || 'manual'})...`);
    const startTime = Date.now();

    try {
      // Phase 1: Stop accepting new connections/requests
      this.logger.log('Closing incoming connections...');

      // Phase 2: Close external connections
      await this.closeConnections();

      this.shutdownComplete = true;
      this.logger.log(`Shutdown completed in ${Date.now() - startTime}ms`);
    } catch (error) {
      this.logger.error('Shutdown error:', error);
      process.exit(1);
    }
  }

  private async closeConnections() {
    const closeOperations = [];

    // PostgreSQL
    if (this.pgConnection.isConnected) {
      closeOperations.push(
        this.pgConnection.close().then(() => {
          this.logger.log('PostgreSQL connection closed');
        }),
      );
    }

    // Redis
    closeOperations.push(
      this.redis.quit().then(() => {
        this.logger.log('Redis connection closed');
      }),
    );

    await Promise.allSettled(closeOperations);
  }
}
