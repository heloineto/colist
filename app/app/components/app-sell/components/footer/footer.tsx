import type { ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import { AddButton } from '../add-button';
import { SearchButton } from '../search-button';
import { SortButton } from '../sort-button';
import { MoreOptionsButton } from '../more-options-button';
// import { HistoryButton } from '../history-button';
import { FOOTER_HEIGHT } from '../../utils/constants';
import { FeedbackButton } from '../feedback-button';

interface Props extends ComponentPropsWithoutRef<'div'> {}

export function Footer({ className, ...rest }: Props) {
  return (
    <div
      className={clsx(
        'gap-xs bg-gray-1 px-lg py-xs dark:bg-dark-6 relative flex justify-between',
        className
      )}
      style={{ height: FOOTER_HEIGHT }}
      {...rest}
    >
      <div className="flex items-center gap-1">
        <SearchButton />
        <SortButton />
        {/* <HistoryButton /> */}
        <FeedbackButton />
        <MoreOptionsButton />
      </div>
      <AddButton />
    </div>
  );
}
