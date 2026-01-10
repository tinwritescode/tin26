import { inject, injectable } from 'inversify'
import { TYPES } from './types.js'
import type { PrismaClient } from '@prisma/client'
import type { User } from '../../types/auth.js'
import type { IUserRepository } from './interfaces.js'

@injectable()
export class UserRepository implements IUserRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findByWorkosId(workosId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { workosId },
    })
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  async create(data: {
    workosId: string
    email: string
    firstName?: string | null
    lastName?: string | null
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        workosId: data.workosId,
        email: data.email,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
      },
    })
  }

  async update(
    id: string,
    data: {
      email?: string
      firstName?: string | null
      lastName?: string | null
    },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
      },
    })
  }

  async updateAppliedTemplate(
    userId: string,
    templateId: string | null,
  ): Promise<User> {
    // If templateId is provided, verify it exists and belongs to user
    if (templateId !== null) {
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

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        appliedTemplateId: templateId,
      },
    })
  }
}
