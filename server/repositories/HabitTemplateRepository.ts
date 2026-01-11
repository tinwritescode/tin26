import { inject, injectable } from 'inversify'
import { TYPES } from './types.js'
import type { PrismaClient, HabitTemplate } from '@prisma/client'
import type {
  IHabitTemplateRepository,
  HabitTemplateWithHabits,
} from './interfaces.js'

@injectable()
export class HabitTemplateRepository implements IHabitTemplateRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(
    id: string,
    userId: string,
  ): Promise<HabitTemplate | null> {
    return this.prisma.habitTemplate.findFirst({
      where: {
        id,
        userId,
      },
    })
  }

  async findByUserId(userId: string): Promise<HabitTemplate[]> {
    return this.prisma.habitTemplate.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async create(data: {
    userId: string
    name: string
  }): Promise<HabitTemplate> {
    return this.prisma.habitTemplate.create({
      data: {
        userId: data.userId,
        name: data.name,
      },
    })
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string },
  ): Promise<HabitTemplate> {
    // Verify ownership first
    const template = await this.findById(id, userId)
    if (!template) {
      throw new Error('Template not found or access denied')
    }

    return this.prisma.habitTemplate.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
      },
    })
  }

  async delete(id: string, userId: string): Promise<void> {
    // Verify ownership first
    const template = await this.findById(id, userId)
    if (!template) {
      throw new Error('Template not found or access denied')
    }

    await this.prisma.habitTemplate.delete({
      where: { id },
    })
  }

  async findWithHabits(
    id: string,
    userId: string,
  ): Promise<HabitTemplateWithHabits | null> {
    return this.prisma.habitTemplate.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        habits: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
  }
}
