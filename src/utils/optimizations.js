// React Performance Optimization Utilities

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Prevents component from re-rendering if props haven't changed
 * Use with React.memo()
 */
export const shallowEqual = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
};

/**
 * Custom hook to prevent unnecessary function recreations
 */
export const useEvent = (handler) => {
    const handlerRef = useRef(null);

    useEffect(() => {
        handlerRef.current = handler;
    });

    return useCallback((...args) => {
        const fn = handlerRef.current;
        return fn(...args);
    }, []);
};

/**
 * Debounce hook to reduce function calls
 */
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Throttle hook to limit function execution rate
 */
export const useThrottle = (callback, delay) => {
    const lastRun = useRef(Date.now());

    return useCallback(
        (...args) => {
            if (Date.now() - lastRun.current >= delay) {
                callback(...args);
                lastRun.current = Date.now();
            }
        },
        [callback, delay]
    );
};

/**
 * Prevent memory leaks from state updates on unmounted components
 */
export const useIsMounted = () => {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    return useCallback(() => isMounted.current, []);
};

/**
 * Batch multiple state updates to reduce rerenders
 */
export const useBatchedState = (initialState) => {
    const [state, setState] = useState(initialState);
    const updates = useRef({});
    const timeoutRef = useRef(null);

    const batchUpdate = useCallback((key, value) => {
        updates.current[key] = value;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setState(prev => ({ ...prev, ...updates.current }));
            updates.current = {};
        }, 0);
    }, []);

    return [state, batchUpdate];
};
