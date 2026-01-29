import { useTranslation } from '@/deprecated/packages/translations';
import { ActionIcon, Tooltip, NavLink } from '@mantine/core';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr';
import { useWatch } from 'react-hook-form';
import { useOptionsForm } from '@/app/app/_utils/options-form-context';

interface Props {
  mode?: 'nav' | 'footer';
}

export function SearchButton({ mode = 'footer' }: Props) {
  const { t } = useTranslation();
  const optionsForm = useOptionsForm();
  const searchOpened = useWatch({
    control: optionsForm.control,
    name: 'searchOpened',
  });

  const label = t({ pt: 'Pesquisar', en: 'Search', es: 'Buscar' });

  return (
    <>
      {mode === 'nav' ? (
        <NavLink
          label={label}
          component="button"
          leftSection={<MagnifyingGlassIcon size="1.25rem" />}
          onClick={() => optionsForm.setValue('searchOpened', !searchOpened)}
          active={searchOpened}
        />
      ) : (
        <Tooltip label={label} openDelay={0}>
          <ActionIcon
            className="-ml-2"
            variant={searchOpened ? 'light' : 'subtle'}
            color={searchOpened ? undefined : 'gray'}
            size="2.25rem"
            radius="md"
            onClick={() => optionsForm.setValue('searchOpened', !searchOpened)}
          >
            <MagnifyingGlassIcon size="1.375rem" />
          </ActionIcon>
        </Tooltip>
      )}
    </>
  );
}
