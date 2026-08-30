import { createZodDto } from 'nestjs-zod';
import type { z } from 'zod';

type PropertySchema = Record<string, unknown> & { type?: unknown };
type MetadataFactory = () => Record<string, PropertySchema>;
type ZodDtoClass = { _OPENAPI_METADATA_FACTORY: MetadataFactory };

/**
 * zod 4 emits nullable primitives as `type: ['string', 'null']`; @nestjs/swagger
 * reads any `type` array as a nested array (→ `string[]`). Rewrite them to `anyOf`
 * before swagger sees them (nestjs-zod 5.5 doesn't; drop this when it does).
 */
function toAnyOf(property: PropertySchema): PropertySchema {
  if (!Array.isArray(property.type)) return property;
  const { type, ...rest } = property;
  const markers = Object.fromEntries(
    Object.entries(rest).filter(([key]) => key.startsWith('x-nestjs_zod'))
  );
  const variant = Object.fromEntries(
    Object.entries(rest).filter(
      ([key]) => !key.startsWith('x-nestjs_zod') && key !== 'required'
    )
  );
  return {
    ...markers,
    required: rest['required'],
    type: '',
    anyOf: (type as string[]).map((name) =>
      name === 'null' ? { type: 'null' } : { ...variant, type: name }
    ),
  };
}

function patchFactory(dto: ZodDtoClass) {
  const original = dto._OPENAPI_METADATA_FACTORY;
  dto._OPENAPI_METADATA_FACTORY = function patched(this: ZodDtoClass) {
    const properties = original.call(this) as Record<string, PropertySchema>;
    return Object.fromEntries(
      Object.entries(properties).map(([key, property]) => [
        key,
        toAnyOf(property),
      ])
    );
  };
  return dto;
}

/** `createZodDto` with the nullable-primitive OpenAPI fix applied to both the input and `.Output` classes. */
export function createDto<T extends z.ZodType>(schema: T) {
  const Dto = createZodDto(schema);
  patchFactory(Dto as unknown as ZodDtoClass);
  const descriptor = Object.getOwnPropertyDescriptor(Dto, 'Output');
  // eslint-disable-next-line @typescript-eslint/unbound-method -- called with `Dto` below
  const getOutput = descriptor?.get;
  if (getOutput) {
    Object.defineProperty(Dto, 'Output', {
      get(this: unknown) {
        return patchFactory(getOutput.call(this) as ZodDtoClass);
      },
    });
  }
  return Dto;
}
