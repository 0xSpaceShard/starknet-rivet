import React, { createContext, useContext } from 'react';

export type ViewMode = 'popup' | 'sidepanel';

const ViewContext = createContext<ViewMode>('popup');

export const useViewMode = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('ViewContext value is undefined');
  }
  return context;
};

export const ViewContextProvider = ({
  mode,
  children,
}: {
  mode: ViewMode;
  children: React.ReactNode;
}) => {
  return <ViewContext.Provider value={mode}>{children}</ViewContext.Provider>;
};
