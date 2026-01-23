// Performance utilities for mobile optimization

export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isLowEndDevice = () => {
    // Check if device has limited resources
    const memory = navigator.deviceMemory; // In GB
    const cores = navigator.hardwareConcurrency;

    // Low-end if less than 4GB RAM or less than 4 cores
    return (memory && memory < 4) || (cores && cores < 4);
};

export const shouldReduceAnimations = () => {
    return isMobile() || isLowEndDevice();
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Lazy load images
export const lazyLoadImage = (imageElement) => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    imageObserver.observe(imageElement);
};

/**
 * Pause animations when page is hidden (battery optimization)
 */
export const managePowerConsumption = () => {
    document.addEventListener('visibilitychange', () => {
        const track = document.querySelector('.infinite-scroll-track');
        if (track) {
            if (document.hidden) {
                track.style.animationPlayState = 'paused';
                console.log('[Performance] Animations paused (page hidden)');
            } else {
                track.style.animationPlayState = 'running';
                console.log('[Performance] Animations resumed (page visible)');
            }
        }
    });
};

/**
 * Optimize animations based on device capabilities
 */
export const optimizeAnimations = () => {
    // Check if device prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || shouldReduceAnimations()) {
        document.documentElement.classList.add('reduce-motion');
        console.log('[Performance] Reduced motion enabled');
    }

    // Detect low-end devices
    if (isLowEndDevice()) {
        document.documentElement.classList.add('low-end-device');
        console.log('[Performance] Low-end device optimizations enabled');
    }
};

/**
 * Monitor Core Web Vitals (development only)
 */
export const monitorPerformance = () => {
    if ('PerformanceObserver' in window && process.env.NODE_ENV === 'development') {
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('[Performance] LCP:', (lastEntry.renderTime || lastEntry.loadTime).toFixed(2), 'ms');
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // Observer not supported
        }
    }
};

/**
 * Initialize all performance optimizations
 */
export const initPerformanceOptimizations = () => {
    optimizeAnimations();
    managePowerConsumption();
    monitorPerformance();
    console.log('[Performance] Optimizations initialized');
};

