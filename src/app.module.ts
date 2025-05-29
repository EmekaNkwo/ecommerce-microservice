import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CacheConfigModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';
import { SeedCommand } from './commands/seed.command';
import { LifecycleProvider } from './core/lifecycle/lifecycle.provider';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    ProductModule,
    AuthModule,
    UsersModule,
    CacheConfigModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedCommand, LifecycleProvider],
})
export class AppModule {}
