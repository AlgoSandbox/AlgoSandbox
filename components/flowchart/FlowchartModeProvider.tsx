import { createContext, useContext, useMemo } from 'react';

export type FlowchartMode = 'basic' | 'intermediate' | 'advanced';

const FlowchartModeContext = createContext<{
  flowchartMode: FlowchartMode;
  setFlowchartMode: (mode: FlowchartMode) => void;
}>({
  flowchartMode: 'basic',
  setFlowchartMode: () => {},
});

export function useFlowchartMode() {
  return useContext(FlowchartModeContext);
}

export default function FlowchartModeProvider({
  flowchartMode,
  onFlowchartModeChange: setFlowchartMode,
  children,
}: {
  flowchartMode: FlowchartMode;
  onFlowchartModeChange: (mode: FlowchartMode) => void;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ flowchartMode, setFlowchartMode }),
    [flowchartMode, setFlowchartMode],
  );

  return (
    <FlowchartModeContext.Provider value={value}>
      {children}
    </FlowchartModeContext.Provider>
  );
}
