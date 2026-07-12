export type CategoryRecord = {
  id: string;
  name: string;
  parentCategoryId: string | null;
  isDefault: boolean;
  budget: number | null;
};

export interface GetArgs {}

export interface PostArgs {
  data: {
    name: string;
    parentCategoryId?: string | null;
  };
}

export interface PutBudgetArgs {
  id: string;
  budget: number | null;
}

export interface DeleteCategoryArgs {
  id: string;
}
