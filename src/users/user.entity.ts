// src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import { PasswordUtil } from 'src/common/utils/password.util';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await PasswordUtil.hash(this.password);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await PasswordUtil.compare(attempt, this.password);
  }
}
