import type { TFunction } from '@/deprecated/packages/translations';
import { useTranslation } from '@/deprecated/packages/translations';
import { Button, InputLabel } from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInsertMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { serializeError } from 'serialize-error';
import clsx from 'clsx';
import {
  Checkbox,
  withController,
} from '@/deprecated/packages/mantine-hook-form';
import { SimpleRichTextInput as OriginalSimpleRichTextInput } from './simple-rich-text-input';
import { supabase } from '@/deprecated/utils/supabase/create-browser-client';
import type { Json } from '@/deprecated/utils/supabase/database-types';
import {
  ERRORS_COLUMNS,
  ERRORS_TABLE,
} from '@/deprecated/utils/queries/errors';

const SimpleRichTextInput = withController(OriginalSimpleRichTextInput);

function getSchema(t: TFunction) {
  return z.object({
    error: z.unknown(),
    allowCommunication: z.boolean(),
    message: z.unknown().refine((value) => value !== null, {
      message: t({
        pt: 'Por favor, descreva o erro',
        en: 'Please, describe the error',
        es: 'Por favor, describe el error',
      }),
    }),
  });
}

const defaultValues = {
  error: null as unknown,
  message: null as unknown,
  allowCommunication: true,
};

export interface FeedbackFormProps {
  className?: string;
  error?: unknown;
  onCancel?: () => void;
}

export function ErrorForm({ className, error, onCancel }: FeedbackFormProps) {
  const { t } = useTranslation();
  const resolver = useMemo(() => zodResolver(getSchema(t)), [t]);

  const form = useForm({
    defaultValues,
    resolver,
  });

  useEffect(() => form.setValue('error', serializeError(error)), [error, form]);

  const insertMutation = useInsertMutation(
    supabase.from(ERRORS_TABLE),
    ['id'],
    ERRORS_COLUMNS
  );

  return (
    <form
      className={clsx('p-md flex grow flex-col items-center', className)}
      onSubmit={form.handleSubmit(async (values) => {
        await insertMutation.mutateAsync([
          {
            message: values.message as Json,
            error: values.error as Json,
            allowCommunication: values.allowCommunication,
          },
        ]);
        onCancel?.();
      })}
    >
      <div className="flex flex-col text-center">
        <h2 className="m-0 text-2xl">
          {t({ pt: 'Reportar erro', en: 'Report error', es: 'Reportar error' })}
        </h2>
        <div className="text-dimmed xs:text-md text-sm">
          {t({
            pt: 'Pedimos desculpas pelo inconveniente. Nos ajude-nos a corrigir este erro reportando-o',
            en: 'We apologize for the inconvenience. Help us fix this error by reporting it',
            es: 'Pedimos disculpas por el inconveniente. Ayúdenos a corregir este error informándonos',
          })}
        </div>
      </div>
      <div className="mt-md flex w-full grow flex-col">
        <InputLabel>
          {t({
            pt: 'Descrição do erro',
            en: 'Error description',
            es: 'Descripción del error',
          })}
        </InputLabel>
        <SimpleRichTextInput
          name="message"
          control={form.control}
          scrollAreaProps={{
            mah: 'calc(100dvh - 380px - var(--modal-y-offset) * 2)',
          }}
        />
      </div>
      <Checkbox
        className="mt-sm w-full"
        radius={6}
        name="allowCommunication"
        control={form.control}
        label={t({
          pt: 'Permitir que os desenvolvedores entrem contato',
          en: 'Allow developers to contact you',
          es: 'Permitir que los desarrolladores se pongan en contacto',
        })}
      />
      <div className="mt-lg gap-xs flex w-full">
        <Button className="grow basis-0" variant="default" onClick={onCancel}>
          {t({ pt: 'Cancelar', en: 'Cancel', es: 'Cancelar' })}
        </Button>
        <Button className="grow basis-0" type="submit">
          {t({ pt: 'Reportar erro', en: 'Report error', es: 'Reportar error' })}
        </Button>
      </div>
    </form>
  );
}
