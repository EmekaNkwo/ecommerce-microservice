import { DataSource } from 'typeorm';
import { User } from '../../users/user.entity';
import { Logger } from 'winston';

export class DatabaseSeed {
  private readonly logger: Logger;

  constructor(
    private dataSource: DataSource,
    logger?: Logger,
  ) {
    this.logger = logger || (console as unknown as Logger);
  }

  async seed() {
    try {
      await this.seedUsers();
      this.logger.info('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Error seeding database:', error);
      throw error;
    }
  }

  private async seedUsers() {
    const userRepo = this.dataSource.getRepository(User);
    const adminEmail = 'admin@example.com';

    // Check if admin already exists
    const existingAdmin = await userRepo.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      this.logger.info('Admin user already exists');
      return;
    }

    const admin = userRepo.create({
      email: adminEmail,
      password: 'admin123', // Will be hashed by the User entity's @BeforeInsert hook
      name: 'Admin User',
    });

    await userRepo.save(admin);
    this.logger.info('Admin user created successfully');
  }
}
