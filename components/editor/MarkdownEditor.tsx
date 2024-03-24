'use client';

import { MDXEditorMethods } from '@mdxeditor/editor';
import dynamic from 'next/dynamic';
import { forwardRef } from 'react';

import { MarkdownEditorProps } from './InitializedMDXEditor';

const Editor = dynamic(() => import('./InitializedMDXEditor'), {
  ssr: false,
});

const MarkdownEditor = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
  (props, ref) => <Editor {...props} editorRef={ref} />,
);

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;
