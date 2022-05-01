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

/** Adds multiple transactions at once. Does not reconcile (see
importTransactions). Returns an array of ids of the newly created transactions.

If a transfer payee is given, this method does not create a transfer. Use
importTransactions if you want to create transfers.

You probably want to use importTransactions. This method is mainly for custom
importers that want to skip all the automatic stuff because it wants to create
raw data. */
export function addTransactions(
  accountId: id,
  transactions: Transaction[]
): Promise<id[]> {
  return send('api/transactions-add', { accountId, transactions });
}

/** Adds multiple transactions at once, but goes through the same process as
importing a file or downloading transactions from a bank. You probably want to
use this one. Returns an array of ids of the newly created transactions.

The import will "reconcile" transactions to avoid adding duplicates.
Transactions with the same imported_id will never be added more than once.
Otherwise, the system will match transactions with the same amount and with
similar dates and payees and try to avoid duplicates. If not using imported_id
you should check the results after importing.

It will also create transfers if a transfer payee is specified. */
export function importTransactions(
  accountId: id,
  transactions: Transaction[]
): Promise<{ errors: unknown; added: id[]; updated: id[] }> {
  return send('api/transactions-import', { accountId, transactions });
}

/** Get all the transactions in accountId between the specified dates
 * (inclusive). Returns an array of Transaction objects. */
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

/** Update fields of a transaction. fields can specify any field described in
 * Transaction. */
export function updateTransaction(
  id: id,
  fields: Partial<Transaction>
): Promise<null> {
  return send('api/transaction-update', { id, fields });
}

/** Delete a transaction. */
export function deleteTransaction(id: id): Promise<null> {
  return send('api/transaction-delete', { id });
}

/** Get all accounts. Returns an array of Account objects. */
export function getAccounts(): Promise<Account[]> {
  return send('api/accounts-get');
}

/** Create an account with an initial balance of initialBalance (defaults to 0).
 * Remember that amount has no decimal places. Returns the id of the new
 * account. */
export function createAccount(
  account: Account,
  initialBalance: amount = 0
): Promise<id> {
  return send('api/account-create', { account, initialBalance });
}

/** Update fields of an account. fields can specify any field described in
 * Account. */
export function updateAccount(id: id, fields: Partial<Account>): Promise<null> {
  return send('api/account-update', { id, fields });
}

/** Close an account. transferAccountId and transferCategoryId are optional if
the balance of the account is 0, otherwise see next paragraph.

If the account has a non-zero balance, you need to specify an account with
transferAccountId to transfer the money into. If you are transferring from an
on-budget account to an off-budget account, you can optionally specify a
category with transferCategoryId to categorize the transfer transaction.

Tranferring money to an off-budget account needs a category because money is
taken out of the budget, so it needs to come from somewhere. */
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

/** Reopen a closed account. */
export function reopenAccount(id: id): Promise<null> {
  return send('api/account-reopen', { id });
}

/** Delete an account. */
export function deleteAccount(id: id): Promise<null> {
  return send('api/account-delete', { id });
}

/** Get all category groups. */
export function getCategoryGroups(): Promise<CategoryGroup[]> {
  return send('api/categories-get', { grouped: true });
}

/** Create a category group. Returns the id of the new group. */
export function createCategoryGroup(group: CategoryGroup): Promise<id> {
  return send('api/category-group-create', { group });
}

/** Update fields of a category group. fields can specify any field described in
 * CategoryGroup. */
export function updateCategoryGroup(
  id: id,
  fields: Partial<CategoryGroup>
): Promise<id> {
  return send('api/category-group-update', { id, fields });
}

/** Delete a category group. */
export function deleteCategoryGroup(
  id: id,
  transferCategoryId?: id
): Promise<id> {
  return send('api/category-group-delete', { id, transferCategoryId });
}

/** Get all categories. */
export function getCategories(): Promise<Category[]> {
  return send('api/categories-get', { grouped: false });
}

/** Create a category. Returns the id of the new account. */
export function createCategory(category: Category): Promise<id> {
  return send('api/category-create', { category });
}

/** Update fields of a category. fields can specify any field described in
 * Category. */
export function updateCategory(
  id: id,
  fields: Partial<Category>
): Promise<null> {
  return send('api/category-update', { id, fields });
}

/** Delete a category. */
export function deleteCategory(id: id, transferCategoryId?: id): Promise<null> {
  return send('api/category-delete', { id, transferCategoryId });
}

/** Get all payees. */
export function getPayees(): Promise<Payee[]> {
  return send('api/payees-get');
}

/** Create a payee. Returns the id of the new payee. */
export function createPayee(payee: Payee): Promise<id> {
  return send('api/payee-create', { payee });
}

/** Update fields of a payee. fields can specify any field described in Payee. */
export function updatePayee(id: id, fields: Partial<Payee>): Promise<id> {
  return send('api/payee-update', { id, fields });
}

/** Delete a payee. */
export function deletePayee(id: id): Promise<null> {
  return send('api/payee-delete', { id });
}

/** Get all payees rules for payeeId. */
export function getPayeeRules(payeeId: id): Promise<PayeeRule[]> {
  return send('api/payee-rules-get', { payeeId });
}

/** Create a payee rule for payeeId. Returns the id of the new rule. */
export function createPayeeRule(payeeId: id, rule: PayeeRule): Promise<id> {
  return send('api/payee-rule-create', { payee_id: payeeId, rule });
}

/** Update fields of a payee rule. fields can specify any field described in
 * PayeeRule. */
export function updatePayeeRule(
  id: id,
  fields: Partial<PayeeRule>
): Promise<id> {
  return send('api/payee-rule-update', { id, fields });
}

/** Delete a payee rule. */
export function deletePayeeRule(id: id): Promise<null> {
  return send('api/payee-rule-delete', { id });
}
