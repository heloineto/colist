import { createFileRoute } from '@tanstack/react-router';
import { AppPage } from '@/pages/app';

export const Route = createFileRoute('/_authed/app')({ component: AppPage });
