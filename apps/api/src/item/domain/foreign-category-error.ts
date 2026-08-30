/** The category belongs to another list (composite FK rejected it). */
export class ForeignCategoryError extends Error {
  constructor() {
    super('Category belongs to another list');
  }
}
