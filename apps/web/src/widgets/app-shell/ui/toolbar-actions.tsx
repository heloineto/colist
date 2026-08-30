import { ActionIcon, Drawer, NavLink, Popover, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  ArrowsDownUpIcon,
  BugBeetleIcon,
  ChatCircleIcon,
  ClockCounterClockwiseIcon,
  DotsThreeIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  SignOutIcon,
  TrashIcon,
  type Icon,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectedList } from '@/entities/list';
import { useFeedback } from '@/features/feedback';
import { useHistory } from '@/features/history';
import { useListActions } from '@/features/lists';
import { useListUi } from '@/shared/lib/list-ui-state';
import { SortOptions } from '@/widgets/app-shell/ui/sort-options';

export type Mode = 'nav' | 'footer';

type ActionProps = { mode: Mode; icon: Icon; label: string; onClick?: () => void; active?: boolean; disabled?: boolean; children?: ReactNode };

/** One toolbar action rendered as a NavLink (desktop navbar) or a tooltip'd ActionIcon (mobile footer). */
export function Action({ mode, icon: IconComponent, label, onClick, active, disabled, children }: ActionProps) {
  if (mode === 'nav') {
    return (
      <NavLink component="button" label={label} active={active} disabled={disabled} onClick={onClick} leftSection={<IconComponent size="1.125rem" />}>
        {children}
      </NavLink>
    );
  }
  return (
    <Tooltip label={label} openDelay={0}>
      <ActionIcon variant={active ? 'light' : 'subtle'} color={active ? undefined : 'gray'} size="2.25rem" radius="md" disabled={disabled} onClick={onClick} aria-label={label}>
        <IconComponent size="1.375rem" />
      </ActionIcon>
    </Tooltip>
  );
}

export function SearchAction({ mode }: { mode: Mode }) {
  const { t } = useTranslation();
  const { searchOpened, openSearch, closeSearch } = useListUi();
  return <Action mode={mode} icon={MagnifyingGlassIcon} label={t('shell.search')} active={searchOpened} onClick={searchOpened ? closeSearch : openSearch} />;
}

export function SortAction({ mode, onOpenChange }: { mode: Mode; onOpenChange?: (opened: boolean) => void }) {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false, { onOpen: () => onOpenChange?.(true), onClose: () => onOpenChange?.(false) });
  const action = <Action mode={mode} icon={ArrowsDownUpIcon} label={t('shell.sortBy')} active={opened} onClick={open} />;

  if (mode === 'nav') {
    return (
      <Popover opened={opened} onChange={(value) => !value && close()} width={220} position="right-start" withArrow shadow="md" offset={-4}>
        <Popover.Target><div>{action}</div></Popover.Target>
        <Popover.Dropdown><SortOptions /></Popover.Dropdown>
      </Popover>
    );
  }
  return (
    <>
      {action}
      <Drawer opened={opened} onClose={close} position="bottom" size={360} withCloseButton={false} classNames={{ content: 'rounded-t-lg!' }}>
        <SortOptions />
      </Drawer>
    </>
  );
}

export function FeedbackAction({ mode }: { mode: Mode }) {
  const { t } = useTranslation();
  const feedback = useFeedback();
  return <Action mode={mode} icon={ChatCircleIcon} label={t('shell.feedback')} onClick={() => feedback.open('feedback')} />;
}

export function HistoryAction({ mode }: { mode: Mode }) {
  const { t } = useTranslation();
  const history = useHistory();
  const { listId } = useSelectedList();
  return <Action mode={mode} icon={ClockCounterClockwiseIcon} label={t('shell.history')} disabled={listId === null} onClick={history.open} />;
}

export function MoreOptions({ mode, onClose }: { mode: Mode; onClose?: () => void }) {
  const { t } = useTranslation();
  const { list } = useSelectedList();
  const actions = useListActions(list);
  const feedback = useFeedback();
  const [opened, { open, close }] = useDisclosure(false);
  const run = (callback: () => void) => () => {
    close();
    onClose?.();
    callback();
  };

  const links = (
    <>
      <NavLink component="button" className="px-4!" label={t('shell.editList')} disabled={!actions} leftSection={<NotePencilIcon size="1.125rem" />} onClick={run(() => actions?.edit())} />
      {actions?.isOwner !== false && (
        <NavLink component="button" className="px-4!" label={t('shell.deleteList')} disabled={!actions} leftSection={<TrashIcon size="1.125rem" />} onClick={run(() => actions?.remove())} />
      )}
      {actions?.isOwner === false && (
        <NavLink component="button" className="px-4!" label={t('shell.leaveList')} leftSection={<SignOutIcon size="1.125rem" />} onClick={run(() => actions.leave())} />
      )}
      <NavLink component="button" className="px-4!" label={t('shell.reportError')} leftSection={<BugBeetleIcon size="1.125rem" />} onClick={run(() => feedback.open('error'))} />
    </>
  );

  if (mode === 'nav') {
    return (
      <Action mode="nav" icon={DotsThreeIcon} label={t('shell.moreOptions')} active={opened} onClick={opened ? close : open}>
        {opened && links}
      </Action>
    );
  }
  return (
    <>
      <Action mode="footer" icon={DotsThreeIcon} label={t('shell.moreOptions')} onClick={open} />
      <Drawer opened={opened} onClose={close} position="bottom" size="auto" withCloseButton={false} classNames={{ content: 'rounded-t-lg!', body: 'px-0! py-2! flex flex-col' }}>
        {links}
      </Drawer>
    </>
  );
}
