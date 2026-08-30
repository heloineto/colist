import { Affix, Button, FocusTrap, TextInput, Transition } from '@mantine/core';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useListUi } from '@/shared/lib/list-ui-state';

export function SearchAffix() {
  const { t } = useTranslation();
  const { search, setSearch, searchOpened, closeSearch } = useListUi();

  return (
    <Affix position={{ top: 0, left: 0 }} w="100%" zIndex={150}>
      <Transition transition="slide-down" mounted={searchOpened}>
        {(styles) => (
          <FocusTrap active={searchOpened}>
            <div
              className="dark:bg-dark-700 flex h-14 items-center gap-2 bg-white px-2"
              style={styles}
            >
              <TextInput
                className="grow"
                type="search"
                data-autofocus
                leftSection={<MagnifyingGlassIcon size="1.125rem" />}
                placeholder={t('shell.search')}
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                onKeyDown={(event) => event.key === 'Escape' && closeSearch()}
              />
              <Button variant="light" onClick={closeSearch}>
                {t('common.close')}
              </Button>
            </div>
          </FocusTrap>
        )}
      </Transition>
    </Affix>
  );
}
