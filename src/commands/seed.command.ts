import { Command, Console } from 'nestjs-console';
import { DatabaseSeed } from '../database/seeds/database.seed';
import { DataSource } from 'typeorm';

@Console()
export class SeedCommand {
  constructor(private connection: DataSource) {}

  @Command({
    command: 'seed',
    description: 'Seed the database with initial data',
  })
  async seed() {
    const seeder = new DatabaseSeed(this.connection);
    await seeder.seed();
    console.log('Database seeded successfully!');
  }
}
