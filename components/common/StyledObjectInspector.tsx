import { useTheme } from 'next-themes';
import { ComponentProps } from 'react';
import { chromeDark, ObjectInspector } from 'react-inspector';

const customChromeDark = {
  ...chromeDark,
  BASE_BACKGROUND_COLOR: 'transparent',
};

export default function StyledObjectInspector(
  props: ComponentProps<typeof ObjectInspector>,
) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? customChromeDark : 'chromeLight';
  return (
    <ObjectInspector
      {...props}
      theme={theme as string}
      expandLevel={5}
      style={{
        height: '100%',
      }}
    />
  );
}
