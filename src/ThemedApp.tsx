import { Suspense, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App.tsx';
import { AuthProvider } from './features/auth/AuthContext';
import { useThemeMode, type ThemeMode } from './lib/themeMode';

const buildTheme = (mode: ThemeMode) =>
  createTheme({
    palette: { mode },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: '#eeb12e',
            lineHeight: 'normal',
          },
          startIcon: {
            display: 'inline',
          },
          endIcon: {
            display: 'inline',
          },
        },
      },

      MuiButtonBase: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: '#eeb12e',
            },
            '&:focus': {
              outline: 'none',
            },
          },
        },
      },
    },
  });

export function ThemedApp() {
  const { mode } = useThemeMode();
  const theme = useMemo(() => buildTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Suspense fallback={<></>}>
          <App />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}
