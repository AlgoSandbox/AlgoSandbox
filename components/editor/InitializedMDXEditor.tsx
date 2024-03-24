'use client';

import '@mdxeditor/editor/style.css';

import { Button } from '@components/ui';
import {
  diffSourcePlugin,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  useCellValue,
  usePublisher,
  useRealm,
  viewMode$,
} from '@mdxeditor/editor';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import { type ForwardedRef } from 'react';

export type MarkdownEditorMode = 'rich-text' | 'source';

export type MarkdownEditorProps = MDXEditorProps & {
  mode?: MarkdownEditorMode;
  onModeChange?: (mode: MarkdownEditorMode) => void;
};

function ViewModeSelect() {
  const viewMode = useCellValue(viewMode$);
  const setViewMode = usePublisher(viewMode$);

  return (
    <div className="flex gap-2">
      <Button
        label="Rich"
        variant="filled"
        role="checkbox"
        selected={viewMode === 'rich-text'}
        onClick={() => {
          setViewMode('rich-text');
        }}
      />
      <Button
        label="Source"
        variant="filled"
        role="checkbox"
        selected={viewMode === 'source'}
        onClick={() => {
          setViewMode('source');
        }}
      />
    </div>
  );
}

function ViewModeListener({
  onModeChange,
}: {
  onModeChange?: (viewMode: MarkdownEditorMode) => void;
}) {
  const realm = useRealm();
  realm.sub(viewMode$, (value) => {
    if (value !== 'diff') {
      return onModeChange?.(value);
    }
  });
  return null;
}

export default function InitializedMDXEditor({
  editorRef,
  mode,
  onModeChange,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MarkdownEditorProps) {
  const { resolvedTheme } = useTheme();

  return (
    <MDXEditor
      className={clsx(resolvedTheme === 'dark' && 'dark-theme')}
      plugins={[
        diffSourcePlugin({ viewMode: mode }),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <ViewModeSelect />
              <UndoRedo />
              <ViewModeListener onModeChange={onModeChange} />
            </>
          ),
        }),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
