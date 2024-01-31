import { FastifyReply, FastifyRequest } from 'fastify'

async function checkSessionIdExists(req: FastifyRequest, reply: FastifyReply) {
  const sessionId = req.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }
}

export default checkSessionIdExists
