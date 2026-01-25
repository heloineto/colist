import type { TFunction } from '@information-systems/translations';
import { useTranslation } from '@information-systems/translations';
import { SegmentedControl, type SegmentedControlProps } from '@mantine/core';
import { BugBeetle, ChatCircle } from '@phosphor-icons/react/dist/ssr';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { FeedbackForm } from './feedback-form';
import { ErrorForm } from './error-form';

export type FeedbackTabs = 'feedback' | 'error';

const getFeedbackTabs = (t: TFunction) => {
  return [
    {
      value: 'feedback',
      label: (
        <div className="flex items-center justify-center gap-1">
          <ChatCircle size="1rem" weight="bold" />
          {t({
            pt: 'Deixar feedback',
            en: 'Leave feedback',
            es: 'Dejar feedback',
          })}
        </div>
      ),
    },
    {
      value: 'error',
      label: (
        <div className="flex items-center justify-center gap-1">
          <BugBeetle size="1rem" weight="bold" />
          {t({ pt: 'Reportar erro', en: 'Report error', es: 'Reportar error' })}
        </div>
      ),
    },
  ] satisfies {
    value: FeedbackTabs;
    label: ReactNode;
  }[];
};

export interface FeedbackModalContentProps {
  initialTab?: FeedbackTabs;
  segmentedControlProps?: Partial<SegmentedControlProps>;
  onClose: () => void;
}

export function FeedbackModalContent({
  initialTab,
  segmentedControlProps,
  onClose,
}: FeedbackModalContentProps) {
  const { t } = useTranslation();
  const feedbackTypes = useMemo(() => getFeedbackTabs(t), [t]);

  const [value, onChange] = useUncontrolled<FeedbackTabs>({
    value: segmentedControlProps?.value as FeedbackTabs,
    defaultValue: (segmentedControlProps?.defaultValue ??
      initialTab) as FeedbackTabs,
    finalValue: 'feedback',
    onChange: segmentedControlProps?.onChange,
  });
  const previousRef = useRef<string | null>(null);

  useEffect(() => {
    previousRef.current = value;
  }, [value]);

  const direction = useMemo(() => {
    const currentIndex = feedbackTypes.findIndex((l) => l.value === value);
    const previousIndex = feedbackTypes.findIndex(
      (l) => l.value === previousRef.current
    );

    return currentIndex > previousIndex ? 'left' : 'right';
  }, [feedbackTypes, value]);

  return (
    <div>
      <SegmentedControl
        className="mx-md mt-md"
        data={feedbackTypes}
        fullWidth
        defaultValue={initialTab}
        {...segmentedControlProps}
        value={value}
        onChange={onChange as (value: string) => void}
      />
      <div
        className="relative h-[425px] overflow-x-hidden"
        style={
          {
            '--direction': direction === 'left' ? 1 : -1,
          } as CSSProperties
        }
      >
        <AnimatePresence initial={false}>
          <motion.div
            className="absolute top-0 flex size-full flex-col"
            key={value}
            initial={{ left: 'calc(var(--direction) * 100%)' }}
            animate={{ left: '0%' }}
            exit={{ left: 'calc(var(--direction) * -100%)' }}
          >
            {value === 'feedback' ? (
              <FeedbackForm onCancel={onClose} />
            ) : (
              <ErrorForm onCancel={onClose} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
