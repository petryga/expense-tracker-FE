import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from '../store';

// The real reducers and middleware over a fresh cache. Pass the same `store` to a
// second call to simulate leaving a page and coming back to it.
export const renderWithStore = (
  ui: ReactElement,
  {
    route = '/',
    store = createStore(),
  }: { route?: string; store?: ReturnType<typeof createStore> } = {},
) => ({
  store,
  ...render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  ),
});
