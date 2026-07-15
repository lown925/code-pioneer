import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type UserRecord = {
  id: number;
  username: string;
  nickname: string;
  createdAt: Date;
  updatedAt: Date;
};

type CreateUserInput = {
  username: string;
  nickname: string;
};

type UserDelegate = {
  create(args: { data: CreateUserInput }): Promise<UserRecord>;
  findUnique(args: { where: { id: number } }): Promise<UserRecord | null>;
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(input: CreateUserInput) {
    const user = await this.userModel.create({
      data: input,
    });

    return {
      success: true,
      data: user,
    };
  }

  async getUserById(id: number) {
    const user = await this.userModel.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: user,
    };
  }

  private get userModel(): UserDelegate {
    return (this.prisma as PrismaService & { user: UserDelegate }).user;
  }
}
