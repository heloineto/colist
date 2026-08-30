import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';
import { CategorySchema } from '@/category/domain/category';

export class CategoryDto extends createDto(CategorySchema) {}
export class CategoriesDto extends createDto(z.array(CategorySchema)) {}
