import Heading from '@components/ui/Heading';
import Markdown, { Components } from 'react-markdown';

const markdownComponents: Components = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h1: ({ node, children, ...props }) => (
    <Heading variant="h4" {...props}>
      {children}
    </Heading>
  ),
};

export default function MarkdownPreview({ markdown }: { markdown: string }) {
  return <Markdown components={markdownComponents}>{markdown}</Markdown>;
}
