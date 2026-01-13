import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to handle browser back/forward navigation safely
 * Prevents errors from stale state and unmounted components
 */
export const useNavigationGuard = () => {
    const location = useLocation();
    const isMountedRef = useRef(true);
    const previousLocationRef = useRef(location.pathname);

    useEffect(() => {
        isMountedRef.current = true;

        // Detect navigation direction
        const isBackNavigation = previousLocationRef.current !== location.pathname;

        if (isBackNavigation) {
            console.log(`🔙 Navigated from ${previousLocationRef.current} to ${location.pathname}`);
        }

        previousLocationRef.current = location.pathname;

        return () => {
            isMountedRef.current = false;
        };
    }, [location]);

    return {
        isMounted: () => isMountedRef.current,
        currentPath: location.pathname,
        previousPath: previousLocationRef.current
    };
};

/**
 * Safe setState that only updates if component is still mounted
 */
export const useSafeSetState = (setState) => {
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return (value) => {
        if (isMountedRef.current) {
            setState(value);
        }
    };
};

/**
 * Safely access refs with null checking
 */
export const useSafeRef = (initialValue = null) => {
    const ref = useRef(initialValue);

    const safeAccess = (callback) => {
        if (ref.current) {
            try {
                return callback(ref.current);
            } catch (error) {
                console.warn('Safe ref access failed:', error);
                return null;
            }
        }
        return null;
    };

    return [ref, safeAccess];
};

/**
 * Handle popstate (back/forward) events
 */
export const usePopstateHandler = (handler) => {
    useEffect(() => {
        const handlePopstate = (event) => {
            console.log('📍 Popstate event detected');
            handler(event);
        };

        window.addEventListener('popstate', handlePopstate);

        return () => {
            window.removeEventListener('popstate', handlePopstate);
        };
    }, [handler]);
};

/**
 * Restore scroll position on back navigation
 */
export const useScrollRestoration = () => {
    const location = useLocation();

    useEffect(() => {
        // Save scroll position before navigation
        const saveScrollPosition = () => {
            sessionStorage.setItem(
                `scroll-${location.pathname}`,
                window.pageYOffset.toString()
            );
        };

        window.addEventListener('beforeunload', saveScrollPosition);

        // Restore scroll position
        const savedPosition = sessionStorage.getItem(`scroll-${location.pathname}`);
        if (savedPosition) {
            window.scrollTo(0, parseInt(savedPosition));
        } else {
            window.scrollTo(0, 0);
        }

        return () => {
            window.removeEventListener('beforeunload', saveScrollPosition);
        };
    }, [location]);
};
