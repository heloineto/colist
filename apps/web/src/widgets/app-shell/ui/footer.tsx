import { AddItemFooterButton } from '@/widgets/app-shell/ui/add-item-button';
import {
  FeedbackAction,
  HistoryAction,
  MoreOptions,
  SearchAction,
  SortAction,
} from '@/widgets/app-shell/ui/toolbar-actions';

export function Footer() {
  return (
    <div className="dark:bg-dark-600 relative flex h-full items-center justify-between gap-2 bg-gray-100 px-4 py-2">
      <div className="flex gap-2">
        <SearchAction mode="footer" />
        <SortAction mode="footer" />
        <HistoryAction mode="footer" />
        <FeedbackAction mode="footer" />
        <MoreOptions mode="footer" />
      </div>
      <AddItemFooterButton />
    </div>
  );
}
