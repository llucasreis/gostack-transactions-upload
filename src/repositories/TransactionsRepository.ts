/* eslint-disable no-param-reassign */
import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionsWithBalance {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async findWithBalance(): Promise<TransactionsWithBalance> {
    const transactions = await this.find({ relations: ['category'] });
    const balance = await this.getBalance(transactions);

    return {
      transactions,
      balance,
    };
  }

  public async getBalance(transactions?: Transaction[]): Promise<Balance> {
    if (!transactions) {
      transactions = await this.find();
    }
    const { income, outcome } = transactions.reduce(
      (acm: Balance, transaction: Transaction) => {
        switch (transaction.type) {
          case 'income':
            acm.income += transaction.value;
            break;
          case 'outcome':
            acm.outcome += transaction.value;
            break;
          default:
            break;
        }
        return acm;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
