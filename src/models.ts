export interface ITransaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expenses';
  date: string;
  comment?: string;
}

export interface ITransactionList extends Array<ITransaction> {}
