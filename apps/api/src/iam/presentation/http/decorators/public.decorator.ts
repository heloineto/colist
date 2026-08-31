import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** No session required; the caller is still attributed when a cookie is present. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
