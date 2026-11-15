import type { CallToolResult } from '@modelcontextprotocol/server';
import { HttpException } from '@nestjs/common';
import type { Item } from '@/item/domain/item';
import type { List } from '@/list/domain/list';

export type Payload = Record<string, unknown>;

export function toListSummary({ id, name, role, uncheckedCount }: List) {
  return { id, name, role, uncheckedCount };
}

export function toItemSummary(item: Item) {
  const { id, name, amount, checked, categoryId, details } = item;
  return { id, name, amount, checked, categoryId, details };
}

/** `structuredContent` + the same compact JSON as text (for clients that only read text). */
export function toResult(payload: Payload): CallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload) }],
    structuredContent: payload,
  };
}

/** Use-case (HTTP) exceptions carry user-safe messages; anything else stays opaque. */
export function toErrorResult(error: unknown): CallToolResult {
  const message =
    error instanceof HttpException ? error.message : 'Internal error';
  return { content: [{ type: 'text', text: message }], isError: true };
}

function toEntryResult(payload: Payload): Payload {
  return { ok: true, ...payload };
}

function toEntryError(error: unknown): Payload {
  if (!(error instanceof HttpException)) throw error;

  return { ok: false, error: error.message };
}

/** Bulk: sequential, one result per entry (same order), no all-or-nothing. */
export async function settle<Entry>(
  entries: Entry[],
  apply: (entry: Entry) => Promise<Payload>
): Promise<Payload> {
  const results: Payload[] = [];

  for (const entry of entries) {
    results.push(await apply(entry).then(toEntryResult, toEntryError));
  }

  return { results };
}
