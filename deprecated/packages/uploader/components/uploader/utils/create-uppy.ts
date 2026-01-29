import { Uppy } from '@uppy/core';
import Webcam, { type WebcamOptions } from '@uppy/webcam';
import ImageEditor from '@uppy/image-editor';
import Audio, { type AudioOptions } from '@uppy/audio';
import Tus from '@uppy/tus';
import type { Restrictions } from '@uppy/core/lib/Restricter';
import { type Session } from '@supabase/supabase-js';
import { type ImageEditorOptions } from '@uppy/image-editor/lib/ImageEditor';
import { type StorageMetadata } from '../uploader';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseStorageURL = `${supabaseUrl}/storage/v1/upload/resumable`;

const registeredPlugins = {
  Webcam,
  ImageEditor,
  Audio,
} as const;

export type UppyPlugin = keyof typeof registeredPlugins;

const defaultOptions = {
  Webcam: { showVideoSourceDropdown: true },
  Audio: {},
  ImageEditor: {},
} satisfies Record<UppyPlugin, unknown>;

export interface CreateUppyParams {
  session: Session;
  restrictions?: Partial<Restrictions>;
  plugins: string[];
  options?: {
    Webcam?: WebcamOptions<StorageMetadata, Record<string, never>>;
    ImageEditor?: ImageEditorOptions;
    Audio?: AudioOptions;
  };
}

export function createUppy({
  session,
  plugins,
  restrictions,
  options,
}: CreateUppyParams) {
  const uppy = new Uppy<StorageMetadata>({ restrictions });

  for (const plugin of plugins) {
    if (plugin in registeredPlugins) {
      const registeredPlugin = registeredPlugins[plugin as UppyPlugin];
      const defaultOpts = defaultOptions[plugin as UppyPlugin];
      const opts = options?.[plugin as UppyPlugin];

      // @ts-expect-error --- Making TypeScript infer this would be too complex
      uppy.use(registeredPlugin, { ...defaultOpts, ...opts });
    } else {
      console.error(`Plugin "${plugin}" is not registered`);
    }
  }

  uppy.use(Tus, {
    limit: 1,
    endpoint: supabaseStorageURL,
    headers: {
      authorization: `Bearer ${session.access_token}`,
      'x-upsert': 'true',
    },
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    // NOTE: it must be set to 6MB (for now) do not change it
    chunkSize: 6 * 1024 * 1024,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    allowedMetaFields: [
      'bucketName',
      'objectName',
      'contentType',
      'cacheControl',
    ],
  });

  return uppy;
}
