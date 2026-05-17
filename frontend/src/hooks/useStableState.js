// Hook to prevent infinite re-renders
import { useState, useCallback, useRef } from "react";

export const useStableState = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);

  const setStableState = useCallback((newValue) => {
    const value =
      typeof newValue === "function" ? newValue(stateRef.current) : newValue;

    if (stateRef.current !== value) {
      stateRef.current = value;
      setState(value);
    }
  }, []);

  return [state, setStableState];
};

export default useStableState;
