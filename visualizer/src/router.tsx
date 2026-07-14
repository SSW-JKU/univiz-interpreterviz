import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Start } from './modules/start';
import { Visualization } from './modules/visualization';

let inner = [
  {
    path: '',
    element: <Start />
  },
  {
    path: 'demo',
    element: <Start isDemo />
  },
  {
    path: ':runId',
    element: <Visualization />
  }
];

let router = createBrowserRouter(
  [
    {
      path: '/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25',
      children: inner
    },
    {
      path: '/General/Staff/Weninger/Teaching/CB/InterpreterViz/v1_0',
      children: inner
    },
    {
      children: inner
    }
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true
    }
  }
);

export let Router = () => (
  <RouterProvider
    router={router}
    future={{
      v7_startTransition: true
    }}
  />
);
