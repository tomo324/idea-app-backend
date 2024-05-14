import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';
import { UserOptionalHash } from 'src/auth/interface';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserNameById(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      return user?.name;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async editUser(userId: number, dto: EditUserDto) {
    try {
      const user: UserOptionalHash = await this.prisma.user.update({
        where: { id: userId },
        data: { ...dto },
      });
      delete user.hash;
      return user;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  // 外部キー制約のため、ユーザーの投稿から削除する必要がある
  async deleteUser(userId: number) {
    try {
      await this.prisma.$transaction([
        this.prisma.post.deleteMany({ where: { authorId: userId } }),
        this.prisma.user.delete({ where: { id: userId } }),
      ]);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
