import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PasswordUtil } from 'src/common/utils/password.util';
import { User } from 'src/users/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
  ) {
    this.logger = winstonLogger.child({
      service: 'AuthService',
    });
  }

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      this.logger.info('Validating user');
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        this.logger.info('User validation failed: User not found');
        return null;
      }
      if (await PasswordUtil.compare(pass, user.password)) {
        const { password, ...result } = user;
        this.logger.info('User validated successfully');
        return result;
      }
      this.logger.info('User validation failed: Invalid password');
      return null;
    } catch (error) {
      this.logger.error('Error validating user:', error);
      throw new BadRequestException('Error validating user credentials');
    }
  }

  async login(user: User) {
    try {
      this.logger.info('Logging in user');
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);
      this.logger.info('User logged in successfully');
      return { access_token: token };
    } catch (error) {
      this.logger.error('Error logging in user:', error);
      throw new BadRequestException('Error logging in user');
    }
  }

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      this.logger.info('Registering new user');
      const existingUser = await this.usersService.findOneByEmail(
        createUserDto.email,
      );
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
      const user = await this.usersService.create(createUserDto);
      this.logger.info('User registered successfully');
      return user;
    } catch (error) {
      this.logger.error('Error registering user:', error);
      throw new BadRequestException('Error registering user');
    }
  }
}
