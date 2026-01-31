import { MenuItem, MenuLabel, useMantineColorScheme } from '@mantine/core';
import {
  MoonStarsIcon,
  SunIcon,
  WrenchIcon,
} from '@phosphor-icons/react/dist/ssr';

export function ColorSchemeMenuItems() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <>
      <MenuLabel>Tema</MenuLabel>
      <MenuItem
        className={
          colorScheme === 'auto'
            ? '!bg-primary-light !text-primary-light-color'
            : ''
        }
        leftSection={<WrenchIcon size={18} />}
        onClick={() => setColorScheme('auto')}
        h="2.25rem"
      >
        Sistema
      </MenuItem>
      <MenuItem
        className={
          colorScheme === 'light'
            ? '!bg-primary-light !text-primary-light-color'
            : ''
        }
        leftSection={<SunIcon size={18} />}
        onClick={() => setColorScheme('light')}
        h="2.25rem"
      >
        Claro
      </MenuItem>
      <MenuItem
        className={
          colorScheme === 'dark'
            ? '!bg-primary-light !text-primary-light-color'
            : ''
        }
        leftSection={<MoonStarsIcon size={18} />}
        onClick={() => setColorScheme('dark')}
        h="2.25rem"
      >
        Escuro
      </MenuItem>
    </>
  );
}
