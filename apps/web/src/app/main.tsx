import '@/app/styles.css';
import '@/shared/i18n';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from '@/app/providers';
import { routeTree } from '@/app/route-tree.gen';
import { installCrashCapture } from '@/shared/lib/crash-report';
import { CrashScreen } from '@/shared/ui/crash-screen';

installCrashCapture();

const router = createRouter({ routeTree, defaultErrorComponent: CrashScreen });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>
);
