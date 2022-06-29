import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>,
              @InjectRepository(Verification)
              private readonly verifications: Repository<Verification>,
              private readonly jwtService: JwtService,
              private readonly mailService: MailService,
              ) {}

  async createAccount({ email, password, role }: CreateAccountInput): Promise<{ ok: boolean, error?: string }> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        //make error
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this.users.save(this.users.create({ email, password, role }));
     const verification = await this.verifications.save(this.verifications.create({
        user,
      }));
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
        return {ok: false, error: 'Couldn\'t create account' };
    }
    // check new user
    // create user & hash the password
  }

  async login({email, password}: LoginInput): Promise<{ ok: boolean, error?: string, token?: string }> {
    //find the user with the email
    //check if the password is correct
    //make a JWT and give it to the user
    try {
      const user = await this.users.findOne({email}, {select: ['id','password']});
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        }
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        }
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      }
    } catch (error) {
      return {
      ok: false,
      error,
        }
      }
  }

  async findById(id: number): Promise<User> {
    return this.users.findOne({id})
  }

  async editProfile(userId: number, { email, password }: EditProfileInput): Promise<User> {
    const user = await this.users.findOne(userId);
    if (email) {
      user.email = email;
      user.verified = false;
     const verification = await this.verifications.save(this.verifications.create({user}));
      this.mailService.sendVerificationEmail(user.email, verification.code)
    }
    if (password) {
      user.password = password;
    }
    return this.users.save(user);
  }

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verifications.findOne({code}, {relations: ['user']});
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return true;
      }
      throw new Error();
    } catch (e) {
        return false;
      }
    }
}

