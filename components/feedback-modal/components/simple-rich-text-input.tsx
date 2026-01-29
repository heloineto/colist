import type { RichTextEditorProps } from '@mantine/tiptap';
import { RichTextEditor, Link } from '@mantine/tiptap';
import type { Content } from '@tiptap/react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import {
  TextBIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextTSlashIcon,
  TextUnderlineIcon,
} from '@phosphor-icons/react/dist/ssr';
import type { ScrollAreaAutosizeProps } from '@mantine/core';
import { ScrollArea } from '@mantine/core';
import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';

function BoldIcon() {
  return <TextBIcon size="1rem" />;
}
function ItalicIcon() {
  return <TextItalicIcon size="1rem" />;
}
function UnderlineIcon() {
  return <TextUnderlineIcon size="1rem" />;
}
function StrikethroughIcon() {
  return <TextStrikethroughIcon size="1rem" />;
}
function ClearFormattingIcon() {
  return <TextTSlashIcon size="1rem" />;
}

export interface SimpleRichTextInputProps extends Omit<
  RichTextEditorProps,
  'editor' | 'children'
> {
  scrollAreaProps?: ScrollAreaAutosizeProps;
  value?: Content;
  onChange?: (content: Content) => void;
  onBlur?: () => void;
}

export const SimpleRichTextInput = forwardRef(function SimpleRichTextInput(
  {
    scrollAreaProps,
    value,
    onChange,
    onBlur,
    ...rest
  }: SimpleRichTextInputProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link],
    content: value,
    onBlur: () => onBlur?.(),
    onUpdate: (p) => onChange?.(p.editor.getJSON()),
    immediatelyRender: false,
  });

  return (
    <RichTextEditor
      className="flex grow flex-col overflow-hidden"
      editor={editor}
      {...rest}
      ref={ref}
    >
      <RichTextEditor.Toolbar>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold icon={BoldIcon} />
          <RichTextEditor.Italic icon={ItalicIcon} />
          <RichTextEditor.Underline icon={UnderlineIcon} />
          <RichTextEditor.Strikethrough icon={StrikethroughIcon} />
          <RichTextEditor.ClearFormatting icon={ClearFormattingIcon} />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
      <div className="relative grow">
        <ScrollArea
          className="!absolute top-0 left-0 size-full cursor-text"
          type="auto"
          onClick={() => editor?.commands.focus()}
          {...scrollAreaProps}
        >
          <RichTextEditor.Content />
        </ScrollArea>
      </div>
    </RichTextEditor>
  );
});
