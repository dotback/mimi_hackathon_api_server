import { Prisma, PrismaClient } from '@prisma/client'

export type { PrismaClient }
export type PWTransaction = PrismaClient | Prisma.TransactionClient

let DBClient: { writer: PrismaClient; reader: PrismaClient }
export type DBClient = typeof DBClient

function makeClient() {
  if (DBClient) {
    return DBClient
  }

  const _prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

  DBClient = { writer: _prismaClient, reader: _prismaClient }
  return DBClient
}
export const db = makeClient()
