import { useTranslation } from '@/deprecated/packages/translations';
import { useMemo } from 'react';

export interface LabelObject {
  singular: string;
  plural: string;
  gender: 'masculine' | 'feminine' | 'neuter';
  short: {
    singular: string;
    plural: string;
  };
}

export type Label =
  | string
  | undefined
  | null
  | {
      singular: string;
      plural?: string;
      /** The grammatical gender. See: https://en.wikipedia.org/wiki/Grammatical_gender */
      gender?: 'masculine' | 'feminine' | 'neuter';
      short?:
        | string
        | {
            singular: string;
            plural?: string;
          };
    };

export function parseLabel(label: NonNullable<Label>): LabelObject {
  if (typeof label === 'string') {
    const singular = label;

    return {
      singular,
      plural: `${singular}s`,
      gender: 'masculine',
      short: { singular, plural: `${singular}s` },
    };
  }

  const singular = label.singular;
  const plural = label.plural ?? `${singular}s`;

  let short;

  if (label.short === undefined) {
    short = {
      singular,
      plural: `${singular}s`,
    };
  } else if (typeof label.short === 'string') {
    const shortSingular = label.short;

    short = {
      singular: shortSingular,
      plural: `${shortSingular}s`,
    };
  } else {
    const shortSingular = label.short.singular;

    short = {
      singular: shortSingular,
      plural: label.short.plural ?? `${shortSingular}s`,
    };
  }

  return {
    singular,
    plural,
    gender: label.gender ?? 'masculine',
    short,
  };
}

export function useLabel(label: Label): LabelObject {
  const { t } = useTranslation();

  return useMemo(() => {
    if (label === undefined || label === null) {
      const singular = t({ pt: 'item', en: 'item', es: 'item' });
      const plural = t({ pt: 'itens', en: 'items', es: 'items' });

      return {
        singular,
        plural,
        gender: 'masculine',
        short: { singular, plural },
      };
    }

    return parseLabel(label);
  }, [label, t]);
}
