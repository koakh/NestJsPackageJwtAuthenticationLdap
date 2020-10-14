import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hashPassword } from '../auth/utils';
import { UpdateUserDto, UpdateUserPasswordDto } from './dtos';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRoles } from './enums';
import { UserModelInterface, UserServiceInterface } from './interfaces';
import { UserDataInterface } from './interfaces/user-data.interface';
import { User } from './models';
import { userData } from './user.data';
import { UserStore } from './user.store';
import { newUuid } from './utils';

@Injectable()
export class UserService implements UserServiceInterface {
  // init usersStore
  usersStore: UserStore = new UserStore(this.configService);

  constructor(
    private readonly configService: ConfigService,
  ) {
  }

  async findAll(skip: number, take: number): Promise<UserModelInterface[]> {
    // clone array before slice it
    const data = userData.slice()
      .map(e => { return { ...e, password: undefined } });
    const result = (skip >= 0 && take >= 0)
      ? data.splice(skip, take)
      : data;
    return result;
  }

  // internal helper to validate existing users
  async findOneById(id: string): Promise<User> {
    const user = userData.find((e: UserDataInterface) => e.id === id);
    if (!user) {
      throw new NotFoundException(`userId not found`);
    }
    // return full user data
    return user;
  }

  async findOneByField(field: string, value: string): Promise<User> {
    const user = userData.find((e: UserDataInterface) => e[field] === value);
    if (!user) {
      throw new NotFoundException(`userId not found`);
    }
    return { ...user, password: undefined };
  }

  async findOneByUsername(username: string): Promise<User> {
    try {
      return userData.find((e: UserDataInterface) => e.username === username);
    } catch (error) {
      // const errorMessage: string = (error.responses[0]) ? error.responses[0].error.message : 'Internal server error';
      // throw new HttpException({ status: HttpStatus.CONFLICT, error: errorMessage }, HttpStatus.NOT_FOUND);
      // don't show original error message, override it with a forbidden message equal to the one when fails password
      // more secure, this way we hide if username exists or not form hacking
      throw new HttpException({ status: HttpStatus.FORBIDDEN, error: 'Forbidden', message: `Forbidden resource` }, HttpStatus.FORBIDDEN);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const password = hashPassword(createUserDto.password);
    const user = {
      ...createUserDto,
      id: createUserDto.id || newUuid(),
      password,
      // default role
      roles: [UserRoles.User],
      // add date in epoch unix time
      createdDate: new Date().getTime(),
    };
    userData.push(user);
    return { ...user, password: undefined };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const findUser = await this.findOneById(id);
    const idx = userData.findIndex((e) => e.id === id);
    const user = {
      ...findUser,
      ...updateUserDto,
    };
    userData[idx] = user;
    return { ...user, password: undefined };
  }

  async updatePassword(id: string, updateUserPasswordDto: UpdateUserPasswordDto): Promise<void> {
    await this.findOneById(id);
    const idx = userData.findIndex((e) => e.id === id);
    userData[idx].password = hashPassword(updateUserPasswordDto.password);
    return;
  }

  async deleteOneById(id: string): Promise<void> {
    const findUser = await this.findOneById(id);
    const idx = userData.findIndex((e) => e.id === id);
    userData.splice(idx, 1);
    return;
  }
}
