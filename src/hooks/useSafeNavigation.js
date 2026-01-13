import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Safe navigation hook that prevents crashes from rapid page switching
 */
export const useSafeNavigate = () => {
    const navigate = useNavigate();
    const isMountedRef = useRef(true);
    const lastNavigationRef = useRef(0);
    const NAVIGATION_COOLDOWN = 300; // ms between navigations

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const safeNavigate = useCallback((path, options = {}) => {
        const now = Date.now();

        // Prevent navigation if component unmounted
        if (!isMountedRef.current) {
            console.warn('🚫 Navigation blocked: component unmounted');
            return;
        }

        // Prevent rapid successive navigations
        if (now - lastNavigationRef.current < NAVIGATION_COOLDOWN) {
            console.warn('🚫 Navigation blocked: too fast (cooldown)');
            return;
        }

        lastNavigationRef.current = now;
        navigate(path, options);
    }, [navigate]);

    return safeNavigate;
};

/**
 * Safe state setter that prevents updates on unmounted components
 */
export const useSafeState = (initialState) => {
    const [state, setState] = useState(initialState);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const setSafeState = useCallback((value) => {
        if (isMountedRef.current) {
            setState(value);
        } else {
            console.warn('⚠️ State update blocked: component unmounted');
        }
    }, []);

    return [state, setSafeState];
};

/**
 * Cleanup all timers/intervals on unmount
 */
export const useCleanup = () => {
    const timerIdsRef = useRef(new Set());

    const addTimer = useCallback((timerId) => {
        timerIdsRef.current.add(timerId);
        return timerId;
    }, []);

    const removeTimer = useCallback((timerId) => {
        timerIdsRef.current.delete(timerId);
    }, []);

    useEffect(() => {
        return () => {
            // Clear all timers on unmount
            timerIdsRef.current.forEach(id => {
                clearTimeout(id);
                clearInterval(id);
            });
            timerIdsRef.current.clear();
            console.log('🧹 All timers cleaned up');
        };
    }, []);

    return { addTimer, removeTimer };
};
