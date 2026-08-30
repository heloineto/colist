import { useState } from 'react';
import { AddItemNavButton } from '@/widgets/app-shell/ui/add-item-button';
import { FeedbackAction, HistoryAction, MoreOptions, SearchAction, SortAction } from '@/widgets/app-shell/ui/toolbar-actions';

export function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);

  return (
    <nav
      className="absolute top-0 left-0 z-10 flex h-full flex-col justify-between overflow-hidden border-r border-gray-300 bg-body py-2 transition-[width] duration-200 ease-in-out dark:border-dark-400"
      style={{ width: expanded || pinned ? '14rem' : '3.25rem' }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex flex-col px-1.5 [&_.mantine-NavLink-root]:rounded-md [&_.mantine-NavLink-root]:whitespace-nowrap">
        <SearchAction mode="nav" />
        <SortAction mode="nav" onOpenChange={setPinned} />
        <HistoryAction mode="nav" />
        <FeedbackAction mode="nav" />
        <MoreOptions mode="nav" />
      </div>
      <div className="px-1.5">
        <AddItemNavButton expanded={expanded || pinned} />
      </div>
    </nav>
  );
}
