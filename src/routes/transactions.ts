import crypto from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import checkSessionIdExists from '../middlewares/checkSessionIdExists'

async function transactions(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select('*')
    return { transactions }
  })

  app.get('/summary', { preHandler: [checkSessionIdExists] }, async (req) => {
    // pegar todas as transactions
    // const transactions = await knex('transactions').select('*')
    // // fazer a soma do amount
    // const amountSum = transactions.reduce((amount, transaction) => {
    //   return (transaction.amount += amount)
    // }, 0)
    // // retornar a soma em um objeto
    // return {
    //   summary: {
    //     amount: amountSum,
    //   },
    // }
    const { sessionId } = req.cookies
    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first()

    return { summary }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { sessionId } = req.cookies
    const { id } = getTransactionParamsSchema.parse(req.params)

    const transaction = await knex('transactions')
      .where({
        session_id: sessionId,
        id,
      })
      .first()

    return transaction
  })

  app.post('/', async (req, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const body = createTransactionBodySchema.parse(req.body)

    const { title, amount, type } = body

    const sessionId = req.cookies.sessionId || crypto.randomUUID()

    reply.cookie('sessionId', sessionId, {
      path: '/', // any route can access the cookies
      maxAge: 60 * 60 * 24 * 7, // 7 days to expire
    })

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send('Transaction created successfully')
  })
}

export default transactions
