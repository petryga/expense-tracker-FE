import { createContext } from 'react';
import type { ImportDetail } from '../../../services/imports/importsApi.types';

// Shared with the grid's toolbar and footer slots.
export const ReviewContext = createContext<{
  detail: ImportDetail;
  decisionsCount: number;
  waiting: number;
  pending: number;
  saving: boolean;
  onConfirm: () => void;
} | null>(null);
