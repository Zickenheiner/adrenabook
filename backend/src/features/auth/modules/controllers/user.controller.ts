import {
  CreateUserDto,
  UpdateUserDto,
} from '@features/auth/domains/dtos/user.dto';
import { UserEntity } from '@features/auth/domains/entities/user.entity';
import { IUserService } from '@features/auth/interfaces/services/user.iservice';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Patch,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserEntity],
  })
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({
    summary: 'Get user by id',
    description: 'Retrieve a user by its id',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the user to retrieve',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The user with the given id',
    type: UserEntity,
  })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @ApiOperation({
    summary: 'Create user',
    description: 'Create a new user',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'The data to create a new user',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'The created user',
    type: Boolean,
  })
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiOperation({
    summary: 'Update user',
    description: 'Update a user',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the user to update',
    required: true,
    type: String,
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'The updated user data',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'The updated user',
    type: Boolean,
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a user',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the user to delete',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The deleted user',
    type: Boolean,
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
