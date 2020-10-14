import { UserModelInterface } from './user-model.interface';
import { CreateUserDto, UpdateUserDto, UpdateUserPasswordDto } from '../dtos';

export interface UserServiceInterface {
  findAll(skip: number, take: number): Promise<UserModelInterface[]>;
  findOneById(id: string): Promise<UserModelInterface>
  findOneByField(field: string, value: string): Promise<UserModelInterface>;
  findOneByUsername(username: string): Promise<UserModelInterface>;
  create(createUserDto: CreateUserDto): Promise<UserModelInterface>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<UserModelInterface>;
  updatePassword(id: string, updateUserPasswordDto: UpdateUserPasswordDto): Promise<void>;
  deleteOneById(id: string): Promise<void>;
}
