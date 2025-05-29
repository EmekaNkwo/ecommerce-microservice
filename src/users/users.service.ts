import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
  ) {
    this.logger = winstonLogger.child({
      service: 'UsersService',
    });
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      this.logger.info('Creating new user');
      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);
      this.logger.info('User created successfully');
      return this.toResponseDto(savedUser);
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw new BadRequestException('Error creating user');
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    try {
      this.logger.info('Fetching all users');
      const users = await this.usersRepository.find();
      this.logger.info('Users fetched successfully');
      return users.map((user) => this.toResponseDto(user));
    } catch (error) {
      this.logger.error('Error fetching users:', error);
      throw new BadRequestException('Error fetching users');
    }
  }

  async findOne(id: string): Promise<UserResponseDto> {
    try {
      this.logger.info(`Fetching user with id ${id}`);
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        this.logger.info(`User with id ${id} not found`);
        throw new NotFoundException(`User with id ${id} not found`);
      }
      this.logger.info(`User with id ${id} found`);
      return this.toResponseDto(user);
    } catch (error) {
      this.logger.error(`Error fetching user with id ${id}:`, error);
      throw new BadRequestException(`Error fetching user with id ${id}`);
    }
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    try {
      this.logger.info(`Fetching user with email ${email}`);
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        this.logger.info(`User with email ${email} not found`);
        return undefined;
      }
      this.logger.info(`User with email ${email} found`);
      return user;
    } catch (error) {
      this.logger.error(`Error fetching user with email ${email}:`, error);
      throw new BadRequestException(`Error fetching user with email ${email}`);
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      this.logger.info(`Updating user with id ${id}`);
      const existingUser = await this.findOne(id);
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.usersRepository.update(id, updateUserDto);
      const updatedUser = await this.findOne(id);
      this.logger.info(`User with id ${id} updated successfully`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user with id ${id}:`, error);
      throw new BadRequestException(`Error updating user with id ${id}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.info(`Deleting user with id ${id}`);
      const user = await this.findOne(id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.usersRepository.delete(id);
      this.logger.info(`User with id ${id} deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting user with id ${id}:`, error);
      throw new BadRequestException(`Error deleting user with id ${id}`);
    }
  }
}
