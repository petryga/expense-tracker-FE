import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { store } from './store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeModeProvider } from './lib/themeMode';
import { ThemedApp } from './ThemedApp';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeModeProvider>
          <ThemedApp />
        </ThemeModeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
