import { useEffect, useRef, useState, type FC, type ReactNode } from 'react';
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
import { AuthContext } from './useAuth';

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isAuthEnabled);
  // Supabase re-fires 'SIGNED_IN' on things like tab/window focus, not just
  // an actual login - track the last known user id so we only treat it as a
  // real sign-in when the identity actually changes, not on every re-fire
  // for an already-active session.
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthEnabled || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      lastUserIdRef.current = data.session?.user?.id ?? null;
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setIsLoading(false);

      const newUserId = newSession?.user?.id ?? null;
      const isNewSignIn = event === 'SIGNED_IN' && newUserId !== lastUserIdRef.current;
      lastUserIdRef.current = newUserId;

      if (isNewSignIn) {
        try {
          await fetch(getApiUrl('/demo/reset'), {
            method: 'POST',
            headers: await getAuthHeader(),
          });
        } catch (error) {
          console.error('Failed to reset demo data:', error);
        }
      }

      if (event === 'SIGNED_OUT' || isNewSignIn) {
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

  return <AuthContext.Provider value={{ session, isLoading }}>{children}</AuthContext.Provider>;
};
