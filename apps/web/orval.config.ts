import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: { target: 'http://localhost:5100/api/openapi/json' },
    output: {
      clean: true,
      mode: 'tags-split',
      client: 'react-query',
      httpClient: 'fetch',
      target: 'src/shared/api/generated',
      schemas: 'src/shared/api/generated/models',
      override: {
        mutator: { path: 'src/shared/api/fetcher.ts', name: 'fetcher' },
        query: { useInvalidate: true },
        fetch: { includeHttpResponseReturnType: false },
      },
    },
  },
});
