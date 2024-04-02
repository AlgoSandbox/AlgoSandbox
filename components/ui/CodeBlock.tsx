import { CodeBlock as ReactCodeBlock, CodeBlockProps } from 'react-code-block';

export default function CodeBlock(props: Omit<CodeBlockProps, 'children'>) {
  return (
    <ReactCodeBlock {...props}>
      <ReactCodeBlock.Code className="bg-black">
        <ReactCodeBlock.LineContent>
          <ReactCodeBlock.Token />
        </ReactCodeBlock.LineContent>
      </ReactCodeBlock.Code>
    </ReactCodeBlock>
  );
}
