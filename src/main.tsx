import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { store } from './store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#eeb12e',
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <Suspense fallback={<></>}>
              <App />
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
