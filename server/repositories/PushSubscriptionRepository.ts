import { inject, injectable } from 'inversify'
import { TYPES } from './types.js'
import type { PrismaClient, PushSubscription } from '@prisma/client'
import type { IPushSubscriptionRepository } from './interfaces.js'

@injectable()
export class PushSubscriptionRepository
  implements IPushSubscriptionRepository
{
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async create(data: {
    userId: string
    endpoint: string
    keys: { p256dh: string; auth: string }
  }): Promise<PushSubscription> {
    return this.prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: data.userId,
          endpoint: data.endpoint,
        },
      },
      create: {
        userId: data.userId,
        endpoint: data.endpoint,
        keys: data.keys,
      },
      update: {
        keys: data.keys,
        updatedAt: new Date(),
      },
    })
  }

  async findByUserId(userId: string): Promise<PushSubscription[]> {
    return this.prisma.pushSubscription.findMany({
      where: { userId },
    })
  }

  async delete(userId: string, endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.delete({
      where: {
        userId_endpoint: {
          userId,
          endpoint,
        },
      },
    })
  }
}
