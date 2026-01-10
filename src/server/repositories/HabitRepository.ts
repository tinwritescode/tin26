import { inject, injectable } from 'inversify'
import { TYPES } from './types.js'
import type { PrismaClient, Habit } from '@prisma/client'
import type { IHabitRepository } from './interfaces.js'

@injectable()
export class HabitRepository implements IHabitRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  private async verifyTemplateOwnership(
    templateId: string,
    userId: string,
  ): Promise<void> {
    const template = await this.prisma.habitTemplate.findFirst({
      where: {
        id: templateId,
        userId,
      },
    })

    if (!template) {
      throw new Error('Template not found or access denied')
    }
  }

  async findByTemplateId(
    templateId: string,
    userId: string,
  ): Promise<Habit[]> {
    await this.verifyTemplateOwnership(templateId, userId)

    return this.prisma.habit.findMany({
      where: {
        templateId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  async findById(id: string, userId: string): Promise<Habit | null> {
    const habit = await this.prisma.habit.findUnique({
      where: { id },
      include: {
        template: true,
      },
    })

    if (!habit || habit.template.userId !== userId) {
      return null
    }

    return habit
  }

  async create(
    data: {
      templateId: string
      icon: string
      name: string
      description?: string | null
    },
    userId: string,
  ): Promise<Habit> {
    // Verify template ownership before creating
    await this.verifyTemplateOwnership(data.templateId, userId)

    return this.prisma.habit.create({
      data: {
        templateId: data.templateId,
        icon: data.icon,
        name: data.name,
        description: data.description || null,
      },
    })
  }

  async update(
    id: string,
    userId: string,
    data: {
      icon?: string
      name?: string
      description?: string | null
    },
  ): Promise<Habit> {
    // Verify ownership first
    const habit = await this.findById(id, userId)
    if (!habit) {
      throw new Error('Habit not found or access denied')
    }

    return this.prisma.habit.update({
      where: { id },
      data: {
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    })
  }

  async delete(id: string, userId: string): Promise<void> {
    // Verify ownership first
    const habit = await this.findById(id, userId)
    if (!habit) {
      throw new Error('Habit not found or access denied')
    }

    await this.prisma.habit.delete({
      where: { id },
    })
  }
}
