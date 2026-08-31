export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown
  ) {
    super(`API ${status}`);
    this.name = 'ApiError';
  }
}

export async function fetcher<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, credentials: 'include' });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      await response.json().catch(() => null)
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export type ErrorType<_E> = ApiError;
export type BodyType<B> = B;
