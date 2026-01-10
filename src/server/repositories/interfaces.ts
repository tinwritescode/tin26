import type { User } from '../../types/auth.js'

export interface IUserRepository {
  findByWorkosId: (workosId: string) => Promise<User | null>
  findById: (id: string) => Promise<User | null>
  create: (data: {
    workosId: string
    email: string
    firstName?: string | null
    lastName?: string | null
  }) => Promise<User>
  update: (
    id: string,
    data: {
      email?: string
      firstName?: string | null
      lastName?: string | null
    },
  ) => Promise<User>
}
