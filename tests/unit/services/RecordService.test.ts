import { jest } from '@jest/globals';
import { RecordService } from '../../../src/services/RecordService.js';
import prisma from '../../../src/lib/prisma.js';

jest.mock('../../../src/lib/prisma.js', () => ({
  __esModule: true,
  default: {
    financialRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('RecordService', () => {
  const userId = 'user-1';
  const recordId = 'record-1';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a record correctly', async () => {
      const data = {
        amount: 100,
        type: 'INCOME' as const,
        category: 'Salary',
        date: new Date().toISOString(),
      };

      (prisma.financialRecord.create as jest.Mock).mockResolvedValue({ id: recordId, ...data });

      const result = await RecordService.create(userId, data);

      expect(prisma.financialRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...data,
          userId,
          date: expect.any(Date),
        }),
      });
      expect(result.id).toBe(recordId);
    });
  });

  describe('delete', () => {
    it('should soft delete a record', async () => {
      (prisma.financialRecord.findUnique as jest.Mock).mockResolvedValue({
        id: recordId,
        userId,
        deletedAt: null,
      });

      await RecordService.delete(userId, recordId, 'ANALYST');

      expect(prisma.financialRecord.update).toHaveBeenCalledWith({
        where: { id: recordId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
