import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { BadRequestException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mock, mockReset } from 'vitest-mock-extended';
import type { CreateCategoryUseCase } from '@/category/application/use-cases/create-category.use-case';
import type { FindCategoriesUseCase } from '@/category/application/use-cases/find-categories.use-case';
import type { Category } from '@/category/domain/category';
import type { Logger } from '@/common/application/ports/logger.port';
import type { ActiveUserType } from '@/iam/domain/active-user';
import type { CreateItemUseCase } from '@/item/application/use-cases/create-item.use-case';
import type { DeleteItemUseCase } from '@/item/application/use-cases/delete-item.use-case';
import type { FindItemsUseCase } from '@/item/application/use-cases/find-items.use-case';
import type { UpdateItemUseCase } from '@/item/application/use-cases/update-item.use-case';
import type { Item } from '@/item/domain/item';
import type { MembershipRepository } from '@/list/application/ports/membership.repository';
import { AuthorizeMembershipUseCase } from '@/list/application/use-cases/authorize-membership.use-case';
import type { CreateListUseCase } from '@/list/application/use-cases/create-list.use-case';
import type { FindListUseCase } from '@/list/application/use-cases/find-list.use-case';
import type { FindListsUseCase } from '@/list/application/use-cases/find-lists.use-case';
import type { RenameListUseCase } from '@/list/application/use-cases/rename-list.use-case';
import type { List } from '@/list/domain/list';
import type { MembershipRole } from '@/list/domain/membership';
import { McpTools } from '@/mcp/presentation/http/mcp-tools.service';

const LIST_ID = 7;
const user: ActiveUserType = {
  id: 'a0000000-0000-4000-8000-000000000001',
  email: 'ana@x.test',
  name: 'Ana',
  image: null,
};
const now = new Date();
const dates = { createdAt: now, updatedAt: now };
const list: List = {
  id: LIST_ID,
  name: 'Mercado',
  role: 'owner',
  uncheckedCount: 1,
  ...dates,
};
const category: Category = { id: 3, listId: LIST_ID, name: 'Frios', ...dates };
const baseItem: Item = {
  id: 1,
  listId: LIST_ID,
  categoryId: null,
  clientId: null,
  name: 'Leite',
  amount: 1,
  checked: false,
  details: null,
  ...dates,
};
const item = (overrides: Partial<Item> = {}): Item => ({
  ...baseItem,
  ...overrides,
});

const membershipRepository = mock<MembershipRepository>();
const logger = mock<Logger>();
const useCases = {
  findLists: mock<FindListsUseCase>(),
  findList: mock<FindListUseCase>(),
  createList: mock<CreateListUseCase>(),
  renameList: mock<RenameListUseCase>(),
  findCategories: mock<FindCategoriesUseCase>(),
  createCategory: mock<CreateCategoryUseCase>(),
  findItems: mock<FindItemsUseCase>(),
  createItem: mock<CreateItemUseCase>(),
  updateItem: mock<UpdateItemUseCase>(),
  deleteItem: mock<DeleteItemUseCase>(),
};

let client: Client;

beforeEach(async () => {
  [membershipRepository, logger, ...Object.values(useCases)].forEach(mockReset);
  const tools = new McpTools(
    logger,
    new AuthorizeMembershipUseCase(membershipRepository),
    useCases.findLists,
    useCases.findList,
    useCases.createList,
    useCases.renameList,
    useCases.findCategories,
    useCases.createCategory,
    useCases.findItems,
    useCases.createItem,
    useCases.updateItem,
    useCases.deleteItem
  );
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'test', version: '1.0.0' });
  await tools.createServer(user).connect(serverTransport);
  await client.connect(clientTransport);
});

afterEach(async () => {
  await client.close();
});

function as(role: MembershipRole | null) {
  membershipRepository.findOne.mockResolvedValue(
    role && { userId: user.id, listId: LIST_ID, role, createdAt: now }
  );
}

async function call(name: string, args: Record<string, unknown> = {}) {
  const result = await client.callTool({ name, arguments: args });
  return result as {
    isError?: boolean;
    structuredContent?: Record<string, unknown>;
    content: { type: string; text: string }[];
  };
}

describe('tools/list', () => {
  it('exposes the 8 tools, each titled and closed-world', async () => {
    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name)).toEqual([
      'list_lists',
      'get_list',
      'create_list',
      'rename_list',
      'add_items',
      'update_items',
      'delete_items',
      'create_category',
    ]);
    for (const tool of tools) {
      expect(tool.title).toBeTruthy();
      expect(tool.annotations?.openWorldHint).toBe(false);
    }
    expect(
      Object.fromEntries(tools.map((tool) => [tool.name, tool.annotations]))
    ).toMatchObject({
      get_list: { readOnlyHint: true },
      add_items: { destructiveHint: false },
      delete_items: { destructiveHint: true },
    });
  });
});

const listScoped: [string, Record<string, unknown>, () => unknown][] = [
  ['get_list', {}, () => useCases.findList.execute],
  ['rename_list', { name: 'Feira' }, () => useCases.renameList.execute],
  [
    'add_items',
    { items: [{ name: 'Ovos' }] },
    () => useCases.createItem.execute,
  ],
  [
    'update_items',
    { updates: [{ itemId: 1, checked: true }] },
    () => useCases.updateItem.execute,
  ],
  ['delete_items', { itemIds: [1] }, () => useCases.deleteItem.execute],
  ['create_category', { name: 'Frios' }, () => useCases.createCategory.execute],
];

describe.each(listScoped)('%s membership', (name, args, useCase) => {
  beforeEach(() => {
    useCases.findList.execute.mockResolvedValue(list);
    useCases.findCategories.execute.mockResolvedValue([]);
    useCases.findItems.execute.mockResolvedValue([]);
    useCases.renameList.execute.mockResolvedValue(list);
    useCases.createItem.execute.mockResolvedValue({
      item: item(),
      created: true,
    });
    useCases.updateItem.execute.mockResolvedValue(item());
    useCases.createCategory.execute.mockResolvedValue(category);
  });

  it('hides the list from non-members', async () => {
    as(null);

    const result = await call(name, { listId: LIST_ID, ...args });

    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toBe('List not found');
    expect(useCase()).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith({
      message: 'MCP tool call',
      data: {
        tool: name,
        userId: user.id,
        listId: LIST_ID,
        ok: false,
        error: 'List not found',
      },
    });
  });

  it.each(['owner', 'member'] as const)('works for the %s', async (role) => {
    as(role);

    const result = await call(name, { listId: LIST_ID, ...args });

    expect(result.isError).toBeFalsy();
    expect(useCase()).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith({
      message: 'MCP tool call',
      data: { tool: name, userId: user.id, listId: LIST_ID, ok: true },
    });
  });
});

describe('list_lists', () => {
  it("returns the user's lists, compact", async () => {
    useCases.findLists.execute.mockResolvedValue([list]);

    const result = await call('list_lists');

    expect(useCases.findLists.execute).toHaveBeenCalledWith(user.id);
    const lists = [
      { id: LIST_ID, name: 'Mercado', role: 'owner', uncheckedCount: 1 },
    ];
    expect(result.structuredContent).toEqual({ lists });
    expect(JSON.parse(result.content[0]?.text ?? '')).toEqual({ lists });
  });
});

describe('get_list', () => {
  it('groups items by category and passes the checked filter', async () => {
    as('member');
    useCases.findList.execute.mockResolvedValue(list);
    useCases.findCategories.execute.mockResolvedValue([category]);
    useCases.findItems.execute.mockResolvedValue([
      item({ id: 1, categoryId: 3, name: 'Queijo' }),
      item({ id: 2, name: 'Pão' }),
    ]);

    const result = await call('get_list', { listId: LIST_ID, checked: false });

    expect(useCases.findItems.execute).toHaveBeenCalledWith(LIST_ID, {
      sort: 'name',
      order: 'asc',
      checked: false,
    });
    expect(result.structuredContent).toMatchObject({
      id: LIST_ID,
      categories: [
        { id: 3, name: 'Frios', items: [{ id: 1, name: 'Queijo' }] },
      ],
      uncategorized: [{ id: 2, name: 'Pão' }],
    });
  });
});

describe('add_items', () => {
  it('applies entries in order with per-entry results', async () => {
    as('member');
    useCases.createItem.execute
      .mockResolvedValueOnce({ item: item({ id: 1 }), created: true })
      .mockRejectedValueOnce(
        new BadRequestException('Category not in this list')
      )
      .mockResolvedValueOnce({ item: item({ id: 3 }), created: true });

    const result = await call('add_items', {
      listId: LIST_ID,
      items: [
        { name: 'Leite' },
        { name: 'Ovos', categoryId: 99 },
        { name: 'Pão' },
      ],
    });

    const [, , defaults] = useCases.createItem.execute.mock.calls[0] ?? [];
    expect(defaults).toEqual({
      name: 'Leite',
      amount: 1,
      categoryId: null,
      details: null,
    });
    expect(result.structuredContent).toMatchObject({
      results: [
        { ok: true, item: { id: 1 } },
        { ok: false, error: 'Category not in this list' },
        { ok: true, item: { id: 3 } },
      ],
    });
  });
});

describe('update_items', () => {
  it('puts a bought item back on the list', async () => {
    as('member');
    useCases.updateItem.execute.mockResolvedValue(item({ checked: false }));

    const result = await call('update_items', {
      listId: LIST_ID,
      updates: [{ itemId: 1, checked: false }],
    });

    expect(useCases.updateItem.execute).toHaveBeenCalledWith(user, LIST_ID, 1, {
      checked: false,
    });
    expect(result.structuredContent).toMatchObject({
      results: [{ ok: true, item: { id: 1, checked: false } }],
    });
  });
});

describe('input validation', () => {
  it.each([
    [
      'add_items',
      { items: Array.from({ length: 51 }, () => ({ name: 'Ovos' })) },
    ],
    ['update_items', { updates: [{ itemId: 1 }] }],
  ])('rejects bad %s input before touching data', async (name, args) => {
    as('member');

    const result = await call(name, { listId: LIST_ID, ...args });

    expect(result.isError).toBe(true);
    expect(useCases.createItem.execute).not.toHaveBeenCalled();
    expect(useCases.updateItem.execute).not.toHaveBeenCalled();
  });
});

describe('unexpected errors', () => {
  it('hide the cause from the client and log it', async () => {
    useCases.findLists.execute.mockRejectedValue(new Error('db down'));

    const result = await call('list_lists');

    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toBe('Internal error');
    expect(logger.error).toHaveBeenCalled();
  });
});
