import { IBasicController } from '@mimi-api/contexts/common/controllers/IBasicController'
import cors from 'cors'
import { onRequest } from 'firebase-functions/v2/https'

const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204,
}

export const requestHandlers = (executors: {
  get?: IBasicController
  post?: IBasicController
  put?: IBasicController
  delete?: IBasicController
}) =>
  onRequest(
    {
      timeoutSeconds: 300,
      invoker: 'public',
      vpcConnector: 'mimi-api-vpc-connector',
      vpcConnectorEgressSettings: 'PRIVATE_RANGES_ONLY',
    },
    async (req, res) => {
      return cors(corsOptions)(req, res, async () => {
        const makeAllowedMethods = () => {
          const methods = Object.keys(executors).filter(
            method => executors[method as keyof typeof executors] !== undefined,
          )
          return methods.join(', ')
        }

        const method = req.method.toLowerCase() as keyof typeof executors
        try {
          const executor = executors[method]
          if (!executor) {
            res.status(405).set('Allow', makeAllowedMethods()).send('Method Not Allowed')
            return
          }
          await executor.execute(req, res)
        } catch (error) {
          console.error('Error occurred in requestHandlers:', error)
          res.status(500).send('Internal Server Error')
        }
      })
    },
  )
