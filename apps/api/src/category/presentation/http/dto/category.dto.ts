import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CategorySchema } from '@/category/domain/category';

export class CategoryDto extends createZodDto(CategorySchema) {}
export class CategoriesDto extends createZodDto(z.array(CategorySchema)) {}
