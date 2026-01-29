import {
  Avatar,
  type AvatarProps,
  Button,
  createPolymorphicComponent,
  InputError,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuLabel,
  MenuTarget,
} from '@mantine/core';
import {
  PlusIcon,
  ArrowsClockwiseIcon,
  TrashIcon,
} from '@phosphor-icons/react/dist/ssr';
import { forwardRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { QueryBoundary } from '@/deprecated/packages/states';
import { useTranslation } from '@/deprecated/packages/translations';
import { useStorageUrl } from '../../hooks/use-storage-url';
import { joinStoragePaths } from '../../utils/join-storage-paths';
import { UploaderModal, type UploaderModalProps } from '../uploader-modal';
import { AvatarLoading } from './components';
import classes from './avatar-input.module.css';

export interface AvatarInputProps extends AvatarProps {
  client: SupabaseClient;
  bucket: string;
  path: string;
  signed?: boolean;
  value?: string | null;
  onChange?: (file: string | null) => void;
  error?: string;
  mode?: 'menu' | 'inline';
  avatarProps?: Partial<AvatarProps>;
  uploaderProps?: Partial<UploaderModalProps>;
}

export const AvatarInput = createPolymorphicComponent<'div', AvatarInputProps>(
  forwardRef<HTMLDivElement, AvatarInputProps>(function AvatarInput(
    {
      client,
      signed,
      value,
      onChange,
      error,
      bucket,
      path,
      mode = 'menu',
      avatarProps,
      uploaderProps,
      ...rest
    },
    ref
  ) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const urlQuery = useStorageUrl({
      client,
      signed,
      bucket,
      path: joinStoragePaths(path, value ?? ''),
      enabled: Boolean(value),
    });

    const addProps = {
      leftSection: <PlusIcon weight="bold" />,
      onClick: () => setOpen(true),
      children: t({ pt: 'Adicionar foto', en: 'Add photo', es: 'Añadir foto' }),
    };
    const updateProps = {
      leftSection: <ArrowsClockwiseIcon weight="bold" />,
      onClick: () => setOpen(true),
      children: t({
        pt: 'Atualizar foto',
        en: 'Update photo',
        es: 'Actualizar foto',
      }),
    };
    const removeProps = {
      leftSection: <TrashIcon weight="bold" />,
      onClick: () => onChange?.(null),
      children: t({
        pt: 'Remover foto',
        en: 'Remove photo',
        es: 'Eliminar foto',
      }),
      color: 'red',
    };

    const avatar = value ? (
      <QueryBoundary
        query={urlQuery}
        loadingComponent={<AvatarLoading {...rest} />}
      >
        {(query) => (
          <Avatar src={query.data.url} {...rest} {...avatarProps} ref={ref} />
        )}
      </QueryBoundary>
    ) : (
      <Avatar {...rest} {...avatarProps} ref={ref} />
    );

    let buttons;
    if (mode === 'menu') {
      buttons = (
        <Menu shadow="md" width={200} withArrow position="right">
          <MenuTarget>
            <button
              type="button"
              className={`${classes.menuButton} mantine-focus-auto`}
            >
              {avatar}
            </button>
          </MenuTarget>
          <MenuDropdown className={classes.menu}>
            <MenuLabel>
              {t({
                pt: 'Foto de perfil',
                en: 'Profile picture',
                es: 'Foto de perfil',
              })}
            </MenuLabel>
            {!value ? (
              <MenuItem {...addProps} />
            ) : (
              <>
                <MenuItem {...updateProps} />
                <MenuItem {...removeProps} />
              </>
            )}
          </MenuDropdown>
        </Menu>
      );
    } else {
      buttons = (
        <div className={classes.inlineWrapper}>
          {avatar}
          {!value ? (
            <Button size="xs" variant="light" {...addProps} />
          ) : (
            <div className={classes.buttons}>
              <Button size="xs" variant="light" {...updateProps} />
              <Button size="xs" variant="light" {...removeProps} />
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        {buttons}
        {error ? <InputError>{error}</InputError> : null}
        <UploaderModal
          client={client}
          opened={open}
          onClose={() => setOpen(false)}
          onSubmit={(files) => {
            if (files.length === 0) onChange?.(null);
            else onChange?.(files[0].meta.fileId);
            setOpen(false);
          }}
          restrictions={{
            maxNumberOfFiles: 1,
            minNumberOfFiles: 1,
            allowedFileTypes: ['image/*'],
          }}
          options={{ Webcam: { modes: ['picture'] } }}
          path={path}
          bucket={bucket}
          plugins={['Webcam', 'ImageEditor']}
          {...uploaderProps}
        />
      </>
    );
  })
);
