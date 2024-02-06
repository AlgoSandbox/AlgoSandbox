import clsx from 'clsx';
import {
  createContext,
  DetailedHTMLProps,
  HTMLAttributes,
  useContext,
  useMemo,
} from 'react';

type HeadingVariant = 'h1' | 'h2' | 'h3' | 'h4';

type HeadingProps = {
  variant: HeadingVariant;
  children: React.ReactNode;
  className?: string;
};

type HeadingContextType = {
  level: number;
};

const HeadingContext = createContext<HeadingContextType>({ level: 0 });

export function HeadingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { level } = useContext(HeadingContext);

  const value = useMemo(() => {
    return { level: level + 1 };
  }, [level]);

  return (
    <HeadingContext.Provider value={value}>{children}</HeadingContext.Provider>
  );
}

const headingClasses: Record<HeadingVariant, string> = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
};

export function HeadingContent({ children }: { children: React.ReactNode }) {
  return <HeadingContextProvider>{children}</HeadingContextProvider>;
}

export default function Heading({
  variant,
  children,
  className,
}: HeadingProps) {
  const { level } = useContext(HeadingContext);

  const commonProps: DetailedHTMLProps<
    HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  > = {
    className: clsx(headingClasses[variant], className),
  };

  return (
    <>
      {level === 1 && <h1 {...commonProps}>{children}</h1>}
      {level === 2 && <h2 {...commonProps}>{children}</h2>}
      {level === 3 && <h3 {...commonProps}>{children}</h3>}
      {level === 4 && <h4 {...commonProps}>{children}</h4>}
    </>
  );
}
