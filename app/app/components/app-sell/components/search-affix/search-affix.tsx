import { useTranslation } from '@/deprecated/packages/translations';
import { Affix, Button, Transition, FocusTrap } from '@mantine/core';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr';
import { useWatch, type Control } from 'react-hook-form';
import { TextInput } from '@/deprecated/packages/mantine-hook-form';
import { useOptionsForm } from '@/app/app/utils/options-form-context';

export function SearchAffix() {
  const { t } = useTranslation();
  const optionsForm = useOptionsForm();
  const searchOpened = useWatch({
    control: optionsForm.control,
    name: 'searchOpened',
  });

  return (
    <Affix position={{ top: 0, left: 0 }} w="100%">
      <Transition
        transition="slide-down"
        mounted={searchOpened}
        onExited={() => optionsForm.setValue('search', '')}
      >
        {(transitionStyles) => (
          <FocusTrap active={searchOpened}>
            <div
              className="gap-xs px-xs dark:bg-dark-7 flex h-14 items-center bg-white"
              style={transitionStyles}
            >
              <TextInput
                leftSection={<MagnifyingGlassIcon size="1.125rem" />}
                className="grow"
                type="search"
                placeholder={t({ pt: 'Pesquisar', en: 'Search', es: 'Buscar' })}
                name="search"
                control={optionsForm.control as unknown as Control}
                data-autofocus
              />
              <Button
                variant="light"
                onClick={() => {
                  optionsForm.setValue('searchOpened', false);
                }}
              >
                {t({ pt: 'Fechar', en: 'Close', es: 'Cerrar' })}
              </Button>
            </div>
          </FocusTrap>
        )}
      </Transition>
    </Affix>
  );
}
