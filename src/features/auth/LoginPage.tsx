import { type FC, useState, type FormEvent } from 'react';
import { Link as RouterLink, Navigate, useLocation } from 'react-router-dom';
import { Button, Link, TextField, Typography, Alert } from '@mui/material';
import { isAuthEnabled, supabase } from '../../lib/supabaseClient';
import { useAuth } from './useAuth';
import { URLS } from '../../components/sidebar/constants';
import { AuthCard } from './AuthCard';
import styles from './AuthCard.module.css';

const LoginPage: FC = () => {
  const { session, isLoading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthEnabled) {
    return <Navigate to={URLS.expenses} replace />;
  }

  if (!isLoading && session) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? URLS.expenses;
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
    }
  };

  return (
    <AuthCard title="Log in" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" className={styles.alert}>
          {error}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        className={styles.field}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        className={styles.field}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? 'Logging in…' : 'Log in'}
      </Button>

      <Typography variant="body2" className={styles.footerText}>
        Don&apos;t have an account?{' '}
        <Link component={RouterLink} to="/signup" className={styles.link}>
          Sign up
        </Link>
      </Typography>
    </AuthCard>
  );
};

export default LoginPage;
