import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useId, useMemo } from 'react';
import type { Body, UppyFile } from '@uppy/core';
import { Dashboard, useUppyEvent } from '@uppy/react';
import { v4 as uuidv4 } from 'uuid';
import type { DashboardProps } from '@uppy/react/lib/Dashboard';
import { useTranslation } from '@information-systems/translations';
import { joinStoragePaths } from '../../utils/join-storage-paths';
import {
  createUppy,
  type UppyPlugin,
  type CreateUppyParams,
} from './utils/create-uppy';
import { esEs, ptBr } from './locales';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/webcam/dist/style.min.css';
import '@uppy/image-editor/dist/style.min.css';
import '@uppy/audio/dist/style.min.css';
import './uploader.css';

export interface StorageMetadata {
  [key: string]: unknown;
  fileId: string;
  bucketName: string;
  objectName: string;
  contentType: string | undefined;
}

export interface UploaderProps
  extends
    Omit<
      DashboardProps<StorageMetadata, Body>,
      'uppy' | 'onSubmit' | 'plugins'
    >,
    Omit<CreateUppyParams, 'plugins'> {
  path: string;
  bucket: string;
  onSubmit?: (files: UppyFile<StorageMetadata, Body>[]) => void;
  setIsDirty: Dispatch<SetStateAction<boolean>>;
  plugins?: UppyPlugin[];
}

// FUTURE: Check out Compressor and Golden Retriever
// FUTURE: Support uploading via URL
// FUTURE: Fix bug when uploading multiple pictures
export function Uploader({
  path,
  bucket,
  onSubmit,
  setIsDirty,
  session,
  restrictions,
  plugins = ['Webcam', 'ImageEditor', 'Audio'] as const,
  options,
  ...rest
}: UploaderProps) {
  const id = useId();
  const { t } = useTranslation();

  const uppy = useMemo(
    () => createUppy({ session, plugins, restrictions, options }),
    // eslint-disable-next-line react-hooks/exhaustive-deps --- Uppy should never be recreated
    []
  );

  const onFileAdded = useCallback(
    (file: UppyFile<StorageMetadata, Body>) => {
      setIsDirty(true);
      const fileId = uuidv4();

      file.meta = {
        ...file.meta,
        bucketName: bucket,
        objectName: joinStoragePaths(path, fileId),
        contentType: file.type,
        cacheControl: 3600,
        fileId,
      };
    },
    [bucket, path, setIsDirty]
  );

  useUppyEvent(uppy, 'file-added', onFileAdded);

  const locale = t({
    en: undefined,
    es: esEs,
    pt: ptBr,
  });

  return (
    <Dashboard
      id={id}
      plugins={plugins}
      proudlyDisplayPoweredByUppy={false}
      uppy={uppy}
      doneButtonHandler={() => onSubmit?.(uppy.getFiles())}
      locale={locale}
      {...rest}
    />
  );
}
