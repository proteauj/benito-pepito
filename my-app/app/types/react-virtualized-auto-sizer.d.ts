declare module 'react-virtualized-auto-sizer' {
  import * as React from 'react';

  interface AutoSizerProps {
    children: (size: { width: number; height: number }) => React.ReactNode;
    disableHeight?: boolean;
    disableWidth?: boolean;
    defaultHeight?: number;
    defaultWidth?: number;
  }

  const AutoSizer: React.FC<AutoSizerProps>;
  export default AutoSizer;
}