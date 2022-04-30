import { send } from './connection';
import { Query } from './query';
import {
  Account,
  amount,
  Budget,
  Category,
  CategoryGroup,
  date,
  id,
  month,
  Payee,
  PayeeRule,
  Transaction,
} from './types';

export { disconnect, init, runImport, runWithBudget } from './connection';
export { default as q } from './query';
export * as utils from './utils';

export async function loadBudget(budgetId: id): Promise<Budget> {
  return send('api/load-budget', { id: budgetId });
}

export async function batchBudgetUpdates(func: () => unknown) {
  await send('api/batch-budget-start');
  try {
    await func();
  } finally {
    await send('api/batch-budget-end');
  }
}

export function runQuery<T>(query: Query): Promise<T> {
  return send('api/query', { query: query.serialize() });
}

export function getBudgetMonths(): Promise<month[]> {
  return send('api/budget-months');
}

export function getBudgetMonth(month: month): Promise<Budget> {
  return send('api/budget-month', { month });
}

export function setBudgetAmount(
  month: month,
  categoryId: id,
  value: amount
): Promise<null> {
  return send('api/budget-set-amount', { month, categoryId, amount: value });
}

export function setBudgetCarryover(
  month: month,
  categoryId: id,
  flag: boolean
): Promise<null> {
  return send('api/budget-set-carryover', { month, categoryId, flag });
}

export function addTransactions(
  accountId: id,
  transactions: Transaction[]
): Promise<id[]> {
  return send('api/transactions-add', { accountId, transactions });
}

export function importTransactions(
  accountId: id,
  transactions: Transaction[]
): Promise<{ errors: unknown; added: id[]; updated: id[] }> {
  return send('api/transactions-import', { accountId, transactions });
}

export function getTransactions(
  accountId: id,
  startDate: date,
  endDate: date
): Promise<Transaction[]> {
  return send('api/transactions-get', { accountId, startDate, endDate });
}

// export function filterTransactions(accountId, text) {
//   return send('api/transactions-filter', { accountId, text });
// }

export function updateTransaction(
  id: id,
  fields: Partial<Transaction>
): Promise<null> {
  return send('api/transaction-update', { id, fields });
}

export function deleteTransaction(id: id): Promise<null> {
  return send('api/transaction-delete', { id });
}

export function getAccounts(): Promise<Account[]> {
  return send('api/accounts-get');
}

export function createAccount(
  account: Account,
  initialBalance: amount = 0
): Promise<id> {
  return send('api/account-create', { account, initialBalance });
}

export function updateAccount(id: id, fields: Partial<Account>): Promise<null> {
  return send('api/account-update', { id, fields });
}

export function closeAccount(
  id: id,
  transferAccountId?: id,
  transferCategoryId?: id
): Promise<null> {
  return send('api/account-close', {
    id,
    transferAccountId,
    transferCategoryId,
  });
}

export function reopenAccount(id: id): Promise<null> {
  return send('api/account-reopen', { id });
}

export function deleteAccount(id: id): Promise<null> {
  return send('api/account-delete', { id });
}

export function getCategoryGroups(): Promise<CategoryGroup[]> {
  return send('api/categories-get', { grouped: true });
}

export function createCategoryGroup(group: CategoryGroup): Promise<id> {
  return send('api/category-group-create', { group });
}

export function updateCategoryGroup(
  id: id,
  fields: Partial<CategoryGroup>
): Promise<id> {
  return send('api/category-group-update', { id, fields });
}

export function deleteCategoryGroup(
  id: id,
  transferCategoryId?: id
): Promise<id> {
  return send('api/category-group-delete', { id, transferCategoryId });
}

export function getCategories(): Promise<Category[]> {
  return send('api/categories-get', { grouped: false });
}

export function createCategory(category: Category): Promise<id> {
  return send('api/category-create', { category });
}

export function updateCategory(
  id: id,
  fields: Partial<Category>
): Promise<null> {
  return send('api/category-update', { id, fields });
}

export function deleteCategory(id: id, transferCategoryId?: id): Promise<null> {
  return send('api/category-delete', { id, transferCategoryId });
}

export function getPayees(): Promise<Payee[]> {
  return send('api/payees-get');
}

export function createPayee(payee: Payee): Promise<id> {
  return send('api/payee-create', { payee });
}

export function updatePayee(id: id, fields: Partial<Payee>): Promise<id> {
  return send('api/payee-update', { id, fields });
}

export function deletePayee(id: id): Promise<null> {
  return send('api/payee-delete', { id });
}

export function getPayeeRules(payeeId: id): Promise<PayeeRule[]> {
  return send('api/payee-rules-get', { payeeId });
}

export function createPayeeRule(payeeId: id, rule: PayeeRule): Promise<id> {
  return send('api/payee-rule-create', { payee_id: payeeId, rule });
}

export function updatePayeeRule(
  id: id,
  fields: Partial<PayeeRule>
): Promise<id> {
  return send('api/payee-rule-update', { id, fields });
}

export function deletePayeeRule(id: id): Promise<null> {
  return send('api/payee-rule-delete', { id });
}
