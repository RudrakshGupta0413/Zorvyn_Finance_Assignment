import prisma from '../lib/prisma.js';
import { CreateRecordInput, UpdateRecordInput, PaginationParams } from '../types/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export class RecordService {
  static async create(userId: string, data: CreateRecordInput) {
    return prisma.financialRecord.create({
      data: {
        ...data,
        userId,
        date: new Date(data.date),
      },
    });
  }

  static async list(userId: string, filters: any, pagination: PaginationParams) {
    const { type, category, startDate, endDate } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      deletedAt: null,
    };

    if (type) where.type = type;
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(userId: string, recordId: string, role: string) {
    const record = await prisma.financialRecord.findUnique({
      where: { id: recordId },
    });

    if (!record || record.deletedAt) {
      throw new NotFoundError('Record not found');
    }

    if (role !== 'ADMIN' && record.userId !== userId) {
      throw new ForbiddenError('You do not have permission to access this record');
    }

    return record;
  }

  static async update(userId: string, recordId: string, role: string, data: UpdateRecordInput) {
    const record = await this.getById(userId, recordId, role);

    return prisma.financialRecord.update({
      where: { id: recordId },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  static async delete(userId: string, recordId: string, role: string) {
    const record = await this.getById(userId, recordId, role);

    await prisma.financialRecord.update({
      where: { id: recordId },
      data: { deletedAt: new Date() },
    });

    return { id: recordId };
  }
}
