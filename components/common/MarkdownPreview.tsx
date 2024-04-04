import CodeBlock from '@components/ui/CodeBlock';
import Heading from '@components/ui/Heading';
import clsx from 'clsx';
import Markdown, { Components } from 'react-markdown';

const markdownComponents: Components = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h1: ({ node, children, ...props }) => (
    <Heading variant="h4" {...props}>
      {children}
    </Heading>
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  code: ({ node, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');

    return match ? (
      <CodeBlock
        language={match[1]}
        code={String(children).replace(/\n$/, '')}
        {...props}
      />
    ) : (
      <code className={clsx('border px-1 rounded', className)} {...props}>
        {children}
      </code>
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  blockquote: ({ node, children, ...props }) => (
    <blockquote className="border-l-4 pl-2 text-label" {...props}>
      {children}
    </blockquote>
  ),
};

export default function MarkdownPreview({ markdown }: { markdown: string }) {
  return <Markdown components={markdownComponents}>{markdown}</Markdown>;
}
