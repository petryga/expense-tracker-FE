import { FC, useState } from 'react';
import { Button, IconButton, TextField } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryBudgetMutation,
} from '../../services/categories/categoriesApi';
import { parseBudgetInput } from '../../services/categories/helpers';
import WarningModal from '../../components/warningModal/WarningModal';
import styles from './CategoriesPanel.module.css';

const budgetInputStyles = {
  "& input[type='number']::-webkit-inner-spin-button, & input[type='number']::-webkit-outer-spin-button":
    {
      WebkitAppearance: 'none',
      margin: 0,
    },
};

export const CategoriesPanel: FC = () => {
  const { data: categories } = useGetCategoriesQuery({});
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategoryBudget] = useUpdateCategoryBudgetMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [subcategoryDrafts, setSubcategoryDrafts] = useState<Record<string, string>>({});
  const [budgetDrafts, setBudgetDrafts] = useState<Record<string, string>>({});
  const [openModal, setOpenModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const topLevelCategories = (categories ?? []).filter((category) => !category.parentCategoryId);
  const subcategoriesByParent = (categories ?? []).reduce<Record<string, typeof categories>>(
    (acc, category) => {
      if (!category.parentCategoryId) return acc;
      acc[category.parentCategoryId] = [...(acc[category.parentCategoryId] ?? []), category];
      return acc;
    },
    {},
  );

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await createCategory({ data: { name: newCategoryName.trim() } }).unwrap();
    setNewCategoryName('');
  };

  const handleAddSubcategory = async (parentCategoryId: string) => {
    const name = subcategoryDrafts[parentCategoryId]?.trim();
    if (!name) return;
    await createCategory({ data: { name, parentCategoryId } }).unwrap();
    setSubcategoryDrafts((drafts) => ({ ...drafts, [parentCategoryId]: '' }));
  };

  const getBudgetDraft = (id: string, savedBudget: number | null) =>
    budgetDrafts[id] ?? (savedBudget !== null ? String(savedBudget) : '');

  const handleBudgetDraftChange = (id: string, value: string) => {
    setBudgetDrafts((drafts) => ({ ...drafts, [id]: value }));
  };

  const handleBudgetSave = (id: string) => {
    const value = budgetDrafts[id];
    if (value === undefined) return;
    updateCategoryBudget({ id, budget: parseBudgetInput(value) });
  };

  const handleBudgetClear = (id: string) => {
    setBudgetDrafts((drafts) => ({ ...drafts, [id]: '' }));
    updateCategoryBudget({ id, budget: null });
  };

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setOpenModal(true);
  };

  const handleDelete = () => {
    if (pendingDeleteId) {
      deleteCategory({ id: pendingDeleteId });
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.addCategoryRow}>
        <TextField
          label="New category name"
          size="small"
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
        />
        <Button
          startIcon={<FontAwesomeIcon icon={faPlus as IconProp} />}
          onClick={handleAddCategory}
        >
          Add category
        </Button>
      </div>

      {topLevelCategories.map((category) => (
        <div key={category.id} className={styles.categoryBlock}>
          <div className={styles.categoryHeader}>
            <span className={styles.categoryName}>{category.name}</span>
            {category.isDefault && <span className={styles.defaultLabel}>Default</span>}
            {!category.isDefault && (
              <IconButton size="small" onClick={() => handleDeleteClick(category.id)}>
                <FontAwesomeIcon icon={faTrash as IconProp} className={styles.icon} size="xs" />
              </IconButton>
            )}
          </div>

          {(subcategoriesByParent[category.id] ?? []).map((subcategory) => (
            <div key={subcategory.id} className={styles.subcategoryRow}>
              <span className={styles.subcategoryName}>{subcategory.name}</span>
              {subcategory.isDefault && <span className={styles.defaultLabel}>Default</span>}
              {!subcategory.isDefault && <span />}
              <TextField
                className={styles.budgetInput}
                placeholder="Budget"
                size="small"
                variant="standard"
                type="number"
                sx={budgetInputStyles}
                value={getBudgetDraft(subcategory.id, subcategory.budget)}
                onChange={(event) => handleBudgetDraftChange(subcategory.id, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleBudgetSave(subcategory.id);
                  }
                }}
              />
              <IconButton size="small" onClick={() => handleBudgetSave(subcategory.id)}>
                <FontAwesomeIcon icon={faCheck as IconProp} className={styles.icon} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleBudgetClear(subcategory.id)}
                disabled={getBudgetDraft(subcategory.id, subcategory.budget) === ''}
              >
                <FontAwesomeIcon icon={faTimes as IconProp} className={styles.icon} size="xs" />
              </IconButton>
              {!subcategory.isDefault ? (
                <IconButton size="small" onClick={() => handleDeleteClick(subcategory.id)}>
                  <FontAwesomeIcon icon={faTrash as IconProp} className={styles.icon} size="xs" />
                </IconButton>
              ) : (
                <span />
              )}
            </div>
          ))}

          <div className={styles.addSubcategoryRow}>
            <TextField
              label="New subcategory name"
              size="small"
              value={subcategoryDrafts[category.id] ?? ''}
              onChange={(event) =>
                setSubcategoryDrafts((drafts) => ({ ...drafts, [category.id]: event.target.value }))
              }
            />
            <Button
              startIcon={<FontAwesomeIcon icon={faPlus as IconProp} />}
              onClick={() => handleAddSubcategory(category.id)}
            >
              Add subcategory
            </Button>
          </div>
        </div>
      ))}

      <WarningModal open={openModal} setOpen={setOpenModal} onDelete={handleDelete} />
    </div>
  );
};
