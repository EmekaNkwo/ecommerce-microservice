import { Controller, Get } from '@nestjs/common';
import { DatabaseMonitor } from './database.monitor';

@Controller('db')
export class DatabaseController {
  constructor(private dbMonitor: DatabaseMonitor) {}

  @Get('stats')
  getDbStats() {
    return this.dbMonitor.getPoolStats();
  }
}
