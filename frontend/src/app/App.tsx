import { RouterProvider } from 'react-router';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { router } from '@/app/routes';
import '@/shared/utils/suppressRechartsWarnings';

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}