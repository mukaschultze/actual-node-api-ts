export type id = string;
export type date = string;
export type month = string;
export type amount = number;

export type Budget = unknown;

export interface Transaction {
  id?: id;
  account: id;
  date: date;
  amount?: amount;
  /** In a create request, this overrides payee_name. */
  payee?: id;
  /** If given, a payee will be created with this name. If this matches an already existing payee, it will use it.
  /** * Only available in a create request */
  payee_name?: string;
  /** This can be anything. Meant to represent the raw description when importing, allowing the user to see the original value. */
  imported_payee?: string;
  category?: id;
  notes?: string;
  /** A unique id usually given by the bank, if importing. Use this is avoid duplicate transactions. */
  imported_id?: string;
  /** If a transfer, the id of the transaction in the other account for the transfer. See transfers. */
  transfer_id?: string;
  /** A flag indicating if the transaction has cleared or not. */
  cleared?: boolean;
  /** An array of subtransactions for a split transaction. See split transactions.
  /** * Only available in a get or create request */
  subtransactions?: Transaction[];
}

export type AccountType =
  | 'checking'
  | 'savings'
  | 'credit'
  | 'investment'
  | 'mortgage'
  | 'debt'
  | 'other';

export interface Account {
  id?: id;
  name: string;
  /** Must be a valid type. */
  type: AccountType;
  /** Defaults to false */
  offbudget?: boolean;
  /** Defaults to false */
  closed?: boolean;
}

export interface Category {
  id?: id;
  name: string;
  group_id: boolean;
  /** Defaults to false */
  is_income?: boolean;
}

export interface CategoryGroup {
  id?: id;
  name: string;
  /** Defaults to false */
  is_income?: boolean;
  /** An array of categories in this group. Not valid when creating or updating a category group
   * * Only available in a get. */
  categories?: Category[];
}

export interface Payee {
  id?: id;
  name: string;
  category?: id;
  /** The id of the account this payee transfers to/from, if this is a transfer payee. */
  transfer_acct?: id;
}

export interface PayeeRule {
  id?: id;
  payee_id: id;
  /** Must be one of equals or contains */
  type: string;
  /** Value to match imported payee names on */
  value?: string;
}
