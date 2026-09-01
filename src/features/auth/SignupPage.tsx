import { type FC, useState, type FormEvent } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { Button, Link, TextField, Typography, Alert } from '@mui/material';
import { isAuthEnabled, supabase } from '../../lib/supabaseClient';
import { useAuth } from './useAuth';
import { URLS } from '../../components/sidebar/constants';
import { AuthCard } from './AuthCard';
import styles from './AuthCard.module.css';

const SignupPage: FC = () => {
  const { session, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthEnabled) {
    return <Navigate to={URLS.expenses} replace />;
  }

  if (!isLoading && session) {
    return <Navigate to={URLS.expenses} replace />;
  }
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase!.auth.signUp({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (!data.session) {
      setMessage('Check your email to confirm your account before logging in.');
    }
  };

  return (
    <AuthCard title="Sign up" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" className={styles.alert}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" className={styles.alert}>
          {message}
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
        autoComplete="new-password"
        className={styles.field}
        slotProps={{ htmlInput: { minLength: 6 } }}
      />
      <TextField
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
        className={styles.field}
        slotProps={{ htmlInput: { minLength: 6 } }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? 'Signing up…' : 'Sign up'}
      </Button>

      <Typography variant="body2" className={styles.footerText}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" className={styles.link}>
          Log in
        </Link>
      </Typography>
    </AuthCard>
  );
};

export default SignupPage;
