import { useState } from 'react';

export const useTooltip = (initialState: boolean = false, timeout: number = 3000) => {
  const [isTooltipShown, setIsTooltipShown] = useState(initialState);

  const showTooltip = () => {
    setIsTooltipShown(true);
    setTimeout(() => setIsTooltipShown(false), timeout);
  };

  return {
    isTooltipShown,
    showTooltip,
  };
};
