import { PrismaClient } from '@prisma/client'

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  try {
    console.log('Testing database connection...')

    // 接続テスト
    await prisma.$connect()
    console.log('Successfully connected to database')

    // 簡単なクエリテスト
    const result = await prisma.$queryRaw`SELECT * FROM _prisma_migrations`
    console.log('Query result:', result)
  } catch (error) {
    console.error('Connection error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
