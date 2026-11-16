# MCP tool surface

Type: grilling
Status: resolved
Blocked by: 03

## Question

Which tools (and resources/prompts, if any) does the server expose, with what names, inputs and annotations? Which operations are deliberately excluded (destructive or social ones like deleting lists, managing members)? How should 'put items back in the cart' and bulk adds map to tools?

## Answer

Decided AFK 2026-11-15. Interpretation of the ask: "Claude creates lists, adds items, puts items back in the cart" + "give Claude capabilities" = expose Colist's list/item/category operations as MCP **tools**. Domain: `checked` = bought (CONTEXT.md), so "put back" = uncheck.

**Tools only.** No resources, prompts or MCP Apps (claude.ai supports them, nothing here needs them; tools cover every ask). 8 tools, snake_case, every one with `title` + annotations (`openWorldHint: false` on all):

| Tool | Input | Annotations | Maps to |
|---|---|---|---|
| `list_lists` | none | readOnly | find-lists (id, name, role, uncheckedCount) |
| `get_list` | `listId`, `checked?` (filter) | readOnly | find-list + find-categories + find-items in one call, items grouped by category |
| `create_list` | `name` | write, not destructive | create-list |
| `rename_list` | `listId`, `name` | write, idempotent | rename-list |
| `add_items` | `listId`, `items[1..50]` of `{name, amount?, categoryId?, details?}` | write, not destructive | create-item per entry |
| `update_items` | `listId`, `updates[1..50]` of `{itemId, name?, amount?, categoryId?, details?, checked?}` | write, idempotent | update-item per entry. Covers mark bought (`checked: true`) and **put back** (`checked: false`) |
| `delete_items` | `listId`, `itemIds[1..50]` | **destructive** (Claude always prompts) | delete-item per entry |
| `create_category` | `listId`, `name` | write, not destructive | create-category |

- **Bulk by default** for item tools ("add eggs, milk and bread" = one call). Applied sequentially; result reports per-entry success/error, no all-or-nothing transaction (matches LWW / offline-queue semantics).
- Input schemas reuse the existing zod DTO fields (`CreateItemSchema`, `UpdateItemSchema`) so limits stay in one place.
- Categories referenced by id; Claude reads them via `get_list`, creates with `create_category`. No auto-create-by-name.
- Results: `structuredContent` + compact JSON text, small (ids, names, amounts, checked). Well under the ~150k char cap.
- Descriptions say: "checked = bought; uncheck to put an item back on the shopping list".

**Excluded on purpose:** delete list, leave list, add/remove members (social + irreversible), rename/delete category, activities/history, profile, feedback/error reports, uploads. Easy to add later, each is one tool over an existing use-case.
