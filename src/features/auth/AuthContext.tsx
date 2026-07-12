import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { isAuthEnabled, supabase } from '../../lib/supabaseClient';
import { store } from '../../store';
import { expensesApi } from '../../services/expenses/expensesApi';
import { incomeApi } from '../../services/income/incomeApi';
import { monthlyDataApi } from '../../services/monthlyData/monthlyDataApi';
import { recurringExpensesApi } from '../../services/recurringExpenses/recurringExpensesApi';
import { recurringIncomeApi } from '../../services/recurringIncome/recurringIncomeApi';
import { categoriesApi } from '../../services/categories/categoriesApi';
import { getApiUrl, getAuthHeader } from '../../services/api';

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isAuthEnabled);

  useEffect(() => {
    if (!isAuthEnabled || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setIsLoading(false);

      if (event === 'SIGNED_IN') {
        try {
          await fetch(getApiUrl('/demo/reset'), {
            method: 'POST',
            headers: await getAuthHeader(),
          });
        } catch (error) {
          console.error('Failed to reset demo data:', error);
        }
      }

      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        store.dispatch(expensesApi.util.resetApiState());
        store.dispatch(incomeApi.util.resetApiState());
        store.dispatch(monthlyDataApi.util.resetApiState());
        store.dispatch(recurringExpensesApi.util.resetApiState());
        store.dispatch(recurringIncomeApi.util.resetApiState());
        store.dispatch(categoriesApi.util.resetApiState());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
