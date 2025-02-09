import { Prisma, PrismaClient } from '@prisma/client'

export type { PrismaClient }
export type PWTransaction = PrismaClient | Prisma.TransactionClient

let DBClient: { writer: PrismaClient; reader: PrismaClient }
export type DBClient = typeof DBClient

function makeClient() {
  if (DBClient) {
    return DBClient
  }

  const isProduction = process.env.ENV === 'production'
  let dbUrl = ''
  if (isProduction) {
    const socketPath = `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`
    dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost/${process.env.DB_NAME}?host=${socketPath}`
  } else if (process.env.ENV === 'local') {
    dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:5432/${process.env.DB_NAME}`
  }

  process.env.DATABASE_URL = dbUrl
  const _prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
    ],
  })

  _prismaClient.$on('query', e => {
    console.log(`Query: ${e.query}`)
    console.log(`Duration: ${e.duration}ms`)
  })

  if (isProduction) {
    _prismaClient
      .$connect()
      .then(() => console.log('Successfully connected to database'))
      .catch(err => console.error('Failed to connect to database:', err))
  }

  DBClient = { writer: _prismaClient, reader: _prismaClient }
  return DBClient
}

export const db = makeClient()
