import { Button, Checkbox, Modal, Rating, SegmentedControl, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BugBeetleIcon, ChatCircleIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useFeedback } from '@/features/feedback/model/feedback-context';
import { AttachmentsInput } from '@/features/feedback/ui/attachments-input';
import { useErrorsCreate } from '@/shared/api/generated/reports/reports';
import { useFeedbacksCreate } from '@/shared/api/generated/reports/reports';

const RATINGS = [1, 2, 3, 4, 5] as const;

function FeedbackForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const form = useForm({ initialValues: { rating: 0, message: '', files: [] as string[] }, validate: { rating: (value) => (value > 0 ? null : t('feedback.ratingRequired')) } });
  const send = useFeedbacksCreate({ mutation: { meta: { success: t('feedback.sent') }, onSuccess: onDone } });
  const rating = RATINGS.find((value) => value === form.values.rating);

  return (
    <form className="flex flex-col gap-3 p-4" onSubmit={form.onSubmit(({ rating: value, message, files }) => send.mutate({ data: { rating: value, message, files } }))}>
      <h2 className="text-2xl font-bold">{t('feedback.title')}</h2>
      <p className="text-sm text-dimmed">{t('feedback.subtitle')}</p>
      <div className="flex flex-col items-center gap-1">
        <Rating size="2.5rem" value={form.values.rating} onChange={(value) => form.setFieldValue('rating', value)} />
        <p className="h-5 text-sm">{rating ? t(`feedback.ratings.r${rating}`) : form.errors.rating}</p>
      </div>
      <Textarea label={<>{t('feedback.message')} <span className="text-dimmed">{t('common.optional')}</span></>} autosize minRows={3} {...form.getInputProps('message')} />
      <AttachmentsInput onChange={(files) => form.setFieldValue('files', files)} />
      <div className="mt-2 flex gap-2">
        <Button variant="default" className="grow basis-0" onClick={onDone}>{t('common.cancel')}</Button>
        <Button type="submit" className="grow basis-0" loading={send.isPending}>{t('common.send')}</Button>
      </div>
    </form>
  );
}

function ErrorForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const form = useForm({ initialValues: { message: '', allowCommunication: true, files: [] as string[] }, validate: { message: (value) => (value.trim() ? null : t('feedback.error.descriptionRequired')) } });
  const send = useErrorsCreate({ mutation: { meta: { success: t('feedback.error.sent') }, onSuccess: onDone } });

  return (
    <form className="flex flex-col gap-3 p-4" onSubmit={form.onSubmit((values) => send.mutate({ data: values }))}>
      <h2 className="text-2xl font-bold">{t('feedback.error.title')}</h2>
      <p className="text-sm text-dimmed">{t('feedback.error.subtitle')}</p>
      <Textarea label={t('feedback.error.description')} autosize minRows={4} {...form.getInputProps('message')} />
      <AttachmentsInput onChange={(files) => form.setFieldValue('files', files)} />
      <Checkbox label={t('feedback.error.allowContact')} {...form.getInputProps('allowCommunication', { type: 'checkbox' })} />
      <div className="mt-2 flex gap-2">
        <Button variant="default" className="grow basis-0" onClick={onDone}>{t('common.cancel')}</Button>
        <Button type="submit" className="grow basis-0" loading={send.isPending}>{t('feedback.error.submit')}</Button>
      </div>
    </form>
  );
}

export function FeedbackModal() {
  const { t } = useTranslation();
  const { opened, tab, setTab, close } = useFeedback();

  return (
    <Modal opened={opened} onClose={close} withCloseButton={false} classNames={{ body: 'p-0!' }}>
      <SegmentedControl className="mx-4 mt-4" fullWidth value={tab} onChange={(value) => setTab(value)}
        data={[
          { value: 'feedback', label: <span className="flex items-center justify-center gap-1"><ChatCircleIcon size="1rem" weight="bold" />{t('feedback.tabFeedback')}</span> },
          { value: 'error', label: <span className="flex items-center justify-center gap-1"><BugBeetleIcon size="1rem" weight="bold" />{t('feedback.tabError')}</span> },
        ]} />
      <div className="overflow-hidden">
        <div className="flex items-start transition-transform duration-300 ease-in-out" style={{ transform: `translateX(${tab === 'feedback' ? 0 : -100}%)` }}>
          <div className="w-full shrink-0">{tab === 'feedback' && <FeedbackForm onDone={close} />}</div>
          <div className="w-full shrink-0">{tab === 'error' && <ErrorForm onDone={close} />}</div>
        </div>
      </div>
    </Modal>
  );
}
