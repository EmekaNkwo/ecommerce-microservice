// src/database/database.monitor.ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseMonitor {
  constructor(@InjectDataSource() private connection: DataSource) {}

  getPoolStats() {
    const pool = (this.connection.driver as any).pool;
    return {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
      max: pool.options.max,
      min: pool.options.min,
    };
  }
}
