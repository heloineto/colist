import { useState } from 'react';
import { Button } from '@mantine/core';
import { Plus } from '@phosphor-icons/react/dist/ssr';
import { useTranslation } from '@information-systems/translations';
import { showNotification } from '@mantine/notifications';
import { CollapsibleNavbar } from '@information-systems/mantine';
import { SearchButton } from '../search-button';
import { SortButton } from '../sort-button';
import { MoreOptionsButton } from '../more-options-button';
// import { HistoryButton } from '../history-button';
import { FeedbackButton } from '../feedback-button';
import classes from './navbar.module.css';
import { useItemForm } from '@/app/app/_utils/item-form-context';
import { useListContext } from '@/app/app/_utils/list-context';

export function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [hover, setHover] = useState(false);
  const [sortOpened, setSortOpened] = useState(false);
  const [moreOptionsOpened, setMoreOptionsOpened] = useState(false);
  const itemForm = useItemForm();
  const { t } = useTranslation();
  const { listId } = useListContext();

  const onCollapse = () => {
    if (moreOptionsOpened) {
      setMoreOptionsOpened(false);
      setTimeout(() => setExpanded(false), 100);
      return;
    }

    setExpanded(false);
  };

  return (
    <CollapsibleNavbar
      className="justify-between border-2!"
      expanded={expanded}
      onChange={setExpanded}
      onMouseEnter={() => {
        setExpanded(true);
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);

        if (!sortOpened) {
          onCollapse();
        }
      }}
    >
      <div>
        <SearchButton mode="nav" />
        <SortButton
          mode="nav"
          opened={sortOpened}
          onChange={(o) => {
            setSortOpened(o);
            if (!o && !hover) {
              onCollapse();
            }
          }}
        />
        {/* <HistoryButton mode="nav" /> */}
        <FeedbackButton mode="nav" />
        <MoreOptionsButton
          mode="nav"
          opened={moreOptionsOpened}
          onChange={setMoreOptionsOpened}
        />
      </div>
      <div className="mx-1">
        <Button
          className={classes.addButton}
          radius="xl"
          leftSection={<Plus size="1.5rem" weight="bold" />}
          onClick={() => {
            if (!listId) {
              showNotification({
                message: t({
                  pt: 'Nenhuma lista selecionada',
                  en: 'No list selected',
                  es: 'No se ha seleccionado ninguna lista',
                }),
                color: 'red',
              });

              return;
            }
            itemForm.disclosure.open();
          }}
        >
          {t({ pt: 'Adicionar item', en: 'Add item', es: 'Agregar artículo' })}
        </Button>
      </div>
    </CollapsibleNavbar>
  );
}
