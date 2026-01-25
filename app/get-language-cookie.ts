import { cookies, headers } from 'next/headers';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

export async function getLanguageCookie() {
  const cookie = (await cookies()).get('language')?.value;
  const supportedLanguages = ['pt', 'en', 'es'];

  if (!cookie || !supportedLanguages.includes(cookie)) {
    const languages = new Negotiator({
      headers: {
        'accept-language': (await headers()).get('accept-language') as string,
      },
    }).languages();

    return match(languages, supportedLanguages, 'pt');
  }

  return cookie;
}
