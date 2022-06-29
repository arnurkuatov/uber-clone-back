import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { RestaurantService } from './restaurants.service';
import { AuthUser } from '../auth/auth-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { SetMetadata } from '@nestjs/common';
import { Role } from '../auth/role.decorator';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/edit.restaurant.dto';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((returns) => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
      return  this.restaurantService.createRestaurant(authUser, createRestaurantInput);
  }


  @Mutation(returns => EditRestaurantOutput)
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() authUser: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): EditRestaurantOutput {
    return { ok: true }
  }
}
