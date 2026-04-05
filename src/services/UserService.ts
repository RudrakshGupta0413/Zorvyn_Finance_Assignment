import prisma from '../lib/prisma.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export class UserService {
  static async listUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateUser(adminId: string, targetUserId: string, data: any) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prevent Admin from demoting themselves
    if (adminId === targetUserId && data.role && data.role !== 'ADMIN') {
      throw new ForbiddenError('You cannot demote yourself from the ADMIN role.');
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      },
    });
  }
}
