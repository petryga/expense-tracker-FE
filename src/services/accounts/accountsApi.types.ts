import type { Currency } from '../../features/expenses/helpers';

export type AccountRecord = {
  id: string;
  name: string;
  currency: Currency;
  isDefault: boolean;
};

export interface GetArgs {}

export interface PostArgs {
  data: {
    name: string;
    currency: Currency;
  };
}

export interface DeleteAccountArgs {
  id: string;
}
