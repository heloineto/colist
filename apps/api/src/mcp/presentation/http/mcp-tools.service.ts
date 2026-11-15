import {
  type CallToolResult,
  McpServer,
  type ToolAnnotations,
} from '@modelcontextprotocol/server';
import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { CreateCategorySchema } from '@/category/application/dtos/create-category.dto';
import { CreateCategoryUseCase } from '@/category/application/use-cases/create-category.use-case';
import { FindCategoriesUseCase } from '@/category/application/use-cases/find-categories.use-case';
import { Logger } from '@/common/application/ports/logger.port';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { CreateItemSchema } from '@/item/application/dtos/create-item.dto';
import { UpdateItemSchema } from '@/item/application/dtos/update-item.dto';
import { CreateItemUseCase } from '@/item/application/use-cases/create-item.use-case';
import { DeleteItemUseCase } from '@/item/application/use-cases/delete-item.use-case';
import { FindItemsUseCase } from '@/item/application/use-cases/find-items.use-case';
import { UpdateItemUseCase } from '@/item/application/use-cases/update-item.use-case';
import { CreateListSchema } from '@/list/application/dtos/create-list.dto';
import { AuthorizeMembershipUseCase } from '@/list/application/use-cases/authorize-membership.use-case';
import { CreateListUseCase } from '@/list/application/use-cases/create-list.use-case';
import { FindListUseCase } from '@/list/application/use-cases/find-list.use-case';
import { FindListsUseCase } from '@/list/application/use-cases/find-lists.use-case';
import { RenameListUseCase } from '@/list/application/use-cases/rename-list.use-case';
import {
  type Payload,
  settle,
  toErrorResult,
  toItemSummary,
  toListSummary,
  toResult,
} from '@/mcp/presentation/http/tool-result.mapper';

const MAX_BULK = 50;
const ListIdSchema = z
  .int()
  .positive()
  .meta({ description: 'List id (see list_lists)' });
const ItemIdSchema = z
  .int()
  .positive()
  .meta({ description: 'Item id (see get_list)' });
const CHECKED_MEANING =
  'checked=true means bought; checked=false means still on the shopping list.';

const READ_ONLY: ToolAnnotations = { readOnlyHint: true };
const ADDITIVE: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
};
const IDEMPOTENT: ToolAnnotations = { ...ADDITIVE, idempotentHint: true };
const DESTRUCTIVE: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
};

type ToolConfig<Input> = {
  title: string;
  description: string;
  inputSchema: Input;
  annotations: ToolAnnotations;
};

/** Builds the per-request MCP server: Colist's tools, acting as `user`. */
@Injectable()
export class McpTools {
  constructor(
    private readonly logger: Logger,
    private readonly authorizeMembership: AuthorizeMembershipUseCase,
    private readonly findLists: FindListsUseCase,
    private readonly findList: FindListUseCase,
    private readonly createList: CreateListUseCase,
    private readonly renameList: RenameListUseCase,
    private readonly findCategories: FindCategoriesUseCase,
    private readonly createCategory: CreateCategoryUseCase,
    private readonly findItems: FindItemsUseCase,
    private readonly createItem: CreateItemUseCase,
    private readonly updateItem: UpdateItemUseCase,
    private readonly deleteItem: DeleteItemUseCase
  ) {}

  createServer(user: ActiveUserType): McpServer {
    const server = new McpServer({ name: 'colist', version: '1.0.0' });
    const tool = <Input extends z.ZodObject>(
      name: string,
      config: ToolConfig<Input>,
      run: (args: z.output<Input>) => Promise<Payload>
    ) =>
      server.registerTool<never, z.ZodObject>(
        name,
        {
          ...config,
          annotations: { ...config.annotations, openWorldHint: false },
        },
        (args) => this.call(name, user, args as z.output<Input>, run)
      );

    tool(
      'list_lists',
      {
        title: 'List shopping lists',
        description:
          "The user's lists: id, name, the user's role and uncheckedCount (items still to buy).",
        inputSchema: z.strictObject({}),
        annotations: READ_ONLY,
      },
      async () => ({
        lists: (await this.findLists.execute(user.id)).map(toListSummary),
      })
    );

    tool(
      'get_list',
      {
        title: 'Get a list with its items',
        description: `One list with its items grouped by category (items without one under uncategorized). ${CHECKED_MEANING} Pass checked to filter.`,
        inputSchema: z.strictObject({
          listId: ListIdSchema,
          checked: z.boolean().optional(),
        }),
        annotations: READ_ONLY,
      },
      async ({ listId, checked }) => {
        const [list, categories, items] = await Promise.all([
          this.findList.execute(user.id, listId),
          this.findCategories.execute(listId),
          this.findItems.execute(listId, {
            sort: 'name',
            order: 'asc',
            checked,
          }),
        ]);
        const itemsIn = (categoryId: number | null) =>
          items
            .filter((item) => item.categoryId === categoryId)
            .map(toItemSummary);

        return {
          ...toListSummary(list),
          categories: categories.map(({ id, name }) => ({
            id,
            name,
            items: itemsIn(id),
          })),
          uncategorized: itemsIn(null),
        };
      }
    );

    tool(
      'create_list',
      {
        title: 'Create a list',
        description: 'Create a new shopping list owned by the user.',
        inputSchema: CreateListSchema,
        annotations: ADDITIVE,
      },
      async (dto) => toListSummary(await this.createList.execute(user.id, dto))
    );

    tool(
      'rename_list',
      {
        title: 'Rename a list',
        description: 'Rename a list.',
        inputSchema: CreateListSchema.extend({ listId: ListIdSchema }),
        annotations: IDEMPOTENT,
      },
      async ({ listId, name }) =>
        toListSummary(await this.renameList.execute(user, listId, { name }))
    );

    tool(
      'add_items',
      {
        title: 'Add items',
        description: `Add 1 to ${MAX_BULK} items to a list in one call. amount defaults to 1; categoryId must be a category of this list (see get_list, create_category). Applied in order; results[i] reports items[i].`,
        inputSchema: z.strictObject({
          listId: ListIdSchema,
          items: z
            .array(CreateItemSchema.omit({ clientId: true }))
            .min(1)
            .max(MAX_BULK),
        }),
        annotations: ADDITIVE,
      },
      ({ listId, items }) =>
        settle(items, async (dto) => {
          const { item } = await this.createItem.execute(user, listId, dto);
          return { item: toItemSummary(item) };
        })
    );

    tool(
      'update_items',
      {
        title: 'Update items',
        description: `Edit 1 to ${MAX_BULK} items of a list; only the fields passed change. ${CHECKED_MEANING} Mark bought with checked=true; put an item back on the shopping list with checked=false. Applied in order; results[i] reports updates[i].`,
        inputSchema: z.strictObject({
          listId: ListIdSchema,
          updates: z
            .array(
              z
                .strictObject({
                  itemId: ItemIdSchema,
                  ...UpdateItemSchema.shape,
                })
                .refine(
                  (update) => Object.keys(update).length > 1,
                  'Nothing to update'
                )
            )
            .min(1)
            .max(MAX_BULK),
        }),
        annotations: IDEMPOTENT,
      },
      ({ listId, updates }) =>
        settle(updates, async ({ itemId, ...dto }) => {
          const item = await this.updateItem.execute(user, listId, itemId, dto);
          return { item: toItemSummary(item) };
        })
    );

    tool(
      'delete_items',
      {
        title: 'Delete items',
        description: `Permanently delete 1 to ${MAX_BULK} items from a list. To mark items bought, use update_items with checked=true instead. Applied in order; results[i] reports itemIds[i].`,
        inputSchema: z.strictObject({
          listId: ListIdSchema,
          itemIds: z.array(ItemIdSchema).min(1).max(MAX_BULK),
        }),
        annotations: DESTRUCTIVE,
      },
      ({ listId, itemIds }) =>
        settle(itemIds, async (itemId) => {
          await this.deleteItem.execute(user, listId, itemId);
          return { itemId };
        })
    );

    tool(
      'create_category',
      {
        title: 'Create a category',
        description:
          'Create a category in a list, to group items (assign it with categoryId in add_items/update_items).',
        inputSchema: CreateCategorySchema.extend({ listId: ListIdSchema }),
        annotations: ADDITIVE,
      },
      async ({ listId, name }) => {
        const category = await this.createCategory.execute(user, listId, {
          name,
        });
        return { id: category.id, name: category.name };
      }
    );

    return server;
  }

  /** Membership check first, one log line, use-case errors as `isError` results. */
  private async call<Args extends object>(
    tool: string,
    user: ActiveUserType,
    args: Args,
    run: (args: Args) => Promise<Payload>
  ): Promise<CallToolResult> {
    const { listId } = args as { listId?: number };
    const data = { tool, userId: user.id, listId };

    try {
      if (listId !== undefined) {
        await this.authorizeMembership.execute(user.id, listId);
      }
      const payload = await run(args);
      this.logger.info({
        message: 'MCP tool call',
        data: { ...data, ok: true },
      });
      return toResult(payload);
    } catch (error) {
      return this.fail(error, data);
    }
  }

  private fail(error: unknown, data: Payload): CallToolResult {
    const result = toErrorResult(error);

    if (error instanceof HttpException) {
      this.logger.info({
        message: 'MCP tool call',
        data: { ...data, ok: false, error: error.message },
      });
    } else {
      this.logger.error({ message: 'MCP tool call', error, data });
    }

    return result;
  }
}
