// The trailing `.js` is required by the TypeScript compiler in certain configs:

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  // <----- Different module path!!!
  interface Transactions {
    id: string
    session_id?: string
    title: string
    amount: number
    created_at: string
  }

  interface Users {
    decimal: number
    timestamp: string
  }

  interface Tables {
    transactions: Transactions
    users: Users
  }
}
