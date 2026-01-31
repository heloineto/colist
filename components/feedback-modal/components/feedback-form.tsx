import type { TFunction } from '@/deprecated/packages/translations';
import { useTranslation } from '@/deprecated/packages/translations';
import { Button, InputLabel } from '@mantine/core';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInsertMutation } from '@supabase-cache-helpers/postgrest-react-query';
import clsx from 'clsx';
import { withController } from '@/deprecated/packages/mantine-hook-form';
import { FeedbackRating } from './feedback-rating';
import { SimpleRichTextInput as OriginalSimpleRichTextInput } from './simple-rich-text-input';
import {
  FEEDBACKS_COLUMNS,
  FEEDBACKS_TABLE,
} from '@/deprecated/utils/queries/feedbacks';
import { supabase } from '@/deprecated/utils/supabase/create-browser-client';
import type { Json } from '@/deprecated/utils/supabase/database-types';

const SimpleRichTextInput = withController(OriginalSimpleRichTextInput);

function getSchema(t: TFunction) {
  return z.object({
    rating: z.number({
      error: t({
        pt: 'Por favor, dê uma nota',
        en: 'Please, give a rating',
        es: 'Por favor, da una nota',
      }),
    }),
    message: z.unknown(),
  });
}

const defaultValues = {
  rating: null as null | number,
  message: null as unknown,
};

export interface FeedbackFormProps {
  className?: string;
  onCancel?: () => void;
}

export function FeedbackForm({ className, onCancel }: FeedbackFormProps) {
  const { t } = useTranslation();
  const resolver = useMemo(() => zodResolver(getSchema(t)), [t]);

  const form = useForm({
    defaultValues,
    resolver,
  });

  const insertMutation = useInsertMutation(
    supabase.from(FEEDBACKS_TABLE),
    ['id'],
    FEEDBACKS_COLUMNS
  );

  return (
    <form
      className={clsx('p-md flex grow flex-col items-center', className)}
      onSubmit={form.handleSubmit(async (values) => {
        await insertMutation.mutateAsync([
          { message: values.message as Json, rating: values.rating },
        ]);
        onCancel?.();
      })}
    >
      <div className="flex flex-col text-center">
        <h2 className="m-0 text-2xl">
          {t({
            pt: 'Avalie sua experiência',
            en: 'Rate Your Experience',
            es: 'Califica tu experiencia',
          })}
        </h2>
        <div className="text-dimmed xs:text-md text-sm">
          {t({
            pt: 'Seu feedback nos ajuda a aprimorar a experiência de todos. Obrigado por compartilhar!',
            en: "Your feedback helps us enhance everyone's experience. Thank you for sharing!",
            es: 'Tu opinión nos ayuda a mejorar la experiencia de todos. Gracias por compartir!',
          })}
        </div>
      </div>
      <FeedbackRating className="mt-md" name="rating" control={form.control} />
      <div className="mt-md flex w-full grow flex-col">
        <InputLabel>
          {t({ pt: 'Mensagem', en: 'Message', es: 'Mensaje' })}
          <span className="text-dimmed">
            {t({ pt: ' (opcional)', en: ' (optional)', es: ' (opcional)' })}
          </span>
        </InputLabel>
        <SimpleRichTextInput
          name="message"
          control={form.control}
          scrollAreaProps={{
            h: '100%',
          }}
        />
      </div>
      <div className="mt-md gap-xs flex w-full">
        <Button className="grow basis-0" variant="default" onClick={onCancel}>
          {t({ pt: 'Cancelar', en: 'Cancel', es: 'Cancelar' })}
        </Button>
        <Button className="grow basis-0" type="submit">
          {t({ pt: 'Enviar', en: 'Send', es: 'Enviar' })}
        </Button>
      </div>
    </form>
  );
}
