import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { AuthUser } from '../auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { Role } from '../auth/role.decorator';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(returns => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      return this.usersService.createAccount(createAccountInput);
    } catch (error) {
      return {
        error,
        ok: false,
      }
    }
  }

  @Mutation(returns => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      return this.usersService.login(loginInput);
    } catch (error) {
      return {
        ok: false,
        error,
      }
    }
  }

  @Query(returns => User)
  @Role(['Any'])
  me(@AuthUser() authUser: User){
    return authUser;
  }

  @Query(returns => UserProfileOutput)
  @Role(['Any'])
  async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
    try {
    const user = await this.usersService.findById(userProfileInput.userId);
    if (!user) {
      throw Error();
    }
    return {
      ok: true,
      user,
    }
    }catch (e) {
      return {
        error: 'User not found',
        ok: false,
      }
    }
  }

  @Mutation(returns => EditProfileOutput)
  @Role(['Any'])
  async editProfile(@AuthUser() authUser: User, @Args('input') editProfileInput: EditProfileInput): Promise<EditProfileOutput> {
      try {
          await this.usersService.editProfile(authUser.id, editProfileInput);
          return {
            ok: true,
          }
      } catch (error) {
        return {
          ok: false,
          error
        }
      }
  }

  @Mutation(returns => VerifyEmailOutput)
  async verifyEmail(@Args('input') verifyEmailInput: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      await this.usersService.verifyEmail(verifyEmailInput.code);
      return {
        ok: true,
      }
    } catch (error) {
      return {
        ok: false,
        error
      }
    }
  }
}
