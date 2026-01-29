import { type ReactNode } from 'react';
import { LoadingState, type LoadingStateProps } from '../loading-state';
import { ErrorState, type ErrorStateProps } from '../error-state';
import { EmptyState, type EmptyStateProps } from '../empty-state';

interface Query<TData = unknown> {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  refetch: () => void;
  data: TData | undefined;
  error: unknown;
}

export type QueryBoundaryProps<
  TData = unknown,
  TQuery extends Query<TData> = Query<TData>,
> = (
  | {
      query: TQuery;
      queries?: undefined;
      children: (query: TQuery & { data: NonNullable<TData> }) => ReactNode;
    }
  | {
      query?: undefined;
      queries: TQuery[];
      children: (queries: TQuery[]) => ReactNode;
    }
) & {
  loadingTitle?: string;
  loadingProps?: LoadingStateProps;
  forceLoading?: boolean;
  errorComponent?: ReactNode;
  errorTitle?: string;
  errorProps?: ErrorStateProps;
  forceError?: boolean;
  loadingComponent?: ReactNode;
  withEmptyState?: boolean;
  emptyTitle?: string;
  emptyProps?: EmptyStateProps;
  forceEmpty?: boolean;
  emptyComponent?: ReactNode;
};

export function QueryBoundary<
  TData = unknown,
  TQuery extends Query<TData> = Query<TData>,
>({
  query,
  queries,
  children,
  loadingTitle,
  loadingProps,
  forceLoading,
  errorComponent,
  errorTitle,
  errorProps,
  forceError,
  loadingComponent,
  withEmptyState,
  emptyTitle,
  emptyProps,
  forceEmpty,
  emptyComponent,
}: QueryBoundaryProps<TData, TQuery>) {
  const isLoading =
    forceLoading || (query?.isPending ?? queries?.every((q) => q.isPending));

  if (isLoading) {
    return (
      loadingComponent ?? (
        <LoadingState title={loadingTitle} {...loadingProps} />
      )
    );
  }

  const isError =
    forceError || (query?.isError ?? queries?.every((q) => q.isError));

  if (isError) {
    return (
      errorComponent ?? (
        <ErrorState
          query={query ?? queries}
          title={errorTitle}
          {...errorProps}
        />
      )
    );
  }

  if (withEmptyState) {
    const isEmpty =
      forceEmpty || (Array.isArray(query?.data) && query.data.length === 0);

    if (isEmpty) {
      return (
        emptyComponent ?? <EmptyState title={emptyTitle} {...emptyProps} />
      );
    }
  }

  // @ts-expect-error --- FUTURE: Fix this
  return <>{children(query ?? queries)}</>;
}
