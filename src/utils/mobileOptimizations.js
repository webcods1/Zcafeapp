// Advanced Mobile Optimizations for Zcafe App

/**
 * Detect if device is mobile
 */
export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Detect if device is iOS
 */
export const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Detect if device is Android
 */
export const isAndroid = () => {
    return /Android/i.test(navigator.userAgent);
};

/**
 * Get device connection speed
 */
export const getConnectionSpeed = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return 'unknown';

    const effectiveType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
    const saveData = connection.saveData; // true if user has data saver on

    return { effectiveType, saveData };
};

/**
 * Optimize for slow connections
 */
export const optimizeForSlowConnection = () => {
    const { effectiveType, saveData } = getConnectionSpeed();

    if (effectiveType === '2g' || effectiveType === 'slow-2g' || saveData) {
        // Disable videos on slow connections
        document.querySelectorAll('video').forEach(video => {
            video.pause();
            video.preload = 'none';
        });

        // Show poster images instead
        document.documentElement.classList.add('slow-connection');
        console.log('[Mobile] Slow connection detected - videos disabled');
        return true;
    }
    return false;
};

/**
 * Add passive event listeners for better scroll performance
 */
export const addPassiveEventListeners = () => {
    // Override addEventListener for touch events
    const supportsPassive = checkPassiveSupport();

    if (supportsPassive && isMobileDevice()) {
        // Add passive listeners to improve scroll performance
        const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];

        passiveEvents.forEach(event => {
            document.addEventListener(event, () => { }, { passive: true });
        });

        console.log('[Mobile] Passive event listeners enabled');
    }
};

/**
 * Check if browser supports passive event listeners
 */
function checkPassiveSupport() {
    let supportsPassive = false;
    try {
        const opts = Object.defineProperty({}, 'passive', {
            get: function () {
                supportsPassive = true;
            }
        });
        window.addEventListener('testPassive', null, opts);
        window.removeEventListener('testPassive', null, opts);
    } catch (e) { }
    return supportsPassive;
}

/**
 * Optimize touch interactions - prevent 300ms delay
 */
export const optimizeTouchInteractions = () => {
    if (isMobileDevice()) {
        // Add touch-action CSS via style tag
        const style = document.createElement('style');
        style.textContent = `
      * {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      
      a, button, input, select, textarea {
        touch-action: manipulation;
      }
    `;
        document.head.appendChild(style);
        console.log('[Mobile] Touch interactions optimized');
    }
};

/**
 * Reduce scroll jank by throttling scroll events
 */
export const optimizeScrollPerformance = () => {
    let ticking = false;

    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Your scroll handling code here
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
};

/**
 * Optimize images for mobile
 */
export const optimizeImagesForMobile = () => {
    if (!isMobileDevice()) return;

    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Add decoding="async" for better performance
        img.decoding = 'async';

        // Reduce image quality on slow connections
        const { effectiveType } = getConnectionSpeed();
        if (effectiveType === '2g' || effectiveType === 'slow-2g') {
            img.loading = 'lazy';
        }
    });

    console.log('[Mobile] Images optimized for mobile');
};

/**
 * Prevent zoom on iOS input focus
 */
export const preventIOSInputZoom = () => {
    if (isIOS()) {
        // Add viewport meta tag to prevent zoom on input focus
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content',
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
            );
        }
        console.log('[Mobile] iOS input zoom prevention enabled');
    }
};

/**
 * Optimize for battery life
 */
export const optimizeForBattery = () => {
    if (!navigator.getBattery) return;

    navigator.getBattery().then(battery => {
        const updateBatteryOptimizations = () => {
            if (battery.level < 0.2) { // Less than 20% battery
                // Reduce animations
                document.documentElement.classList.add('low-battery');

                // Pause videos
                document.querySelectorAll('video').forEach(video => {
                    video.pause();
                });

                // Slow down animations
                const track = document.querySelector('.infinite-scroll-track');
                if (track) {
                    track.style.animationDuration = '90s'; // Slower
                }

                console.log('[Mobile] Low battery mode activated');
            }
        };

        battery.addEventListener('levelchange', updateBatteryOptimizations);
        updateBatteryOptimizations();
    }).catch(() => {
        // Battery API not supported
    });
};

/**
 * Optimize video playback for mobile
 */
export const optimizeVideoForMobile = () => {
    if (!isMobileDevice()) return;

    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        // Add mobile-specific attributes
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true; // Ensure muted for autoplay

        // Reduce quality on slow connections
        const { effectiveType } = getConnectionSpeed();
        if (effectiveType === '2g' || effectiveType === 'slow-2g') {
            video.preload = 'none';
        } else {
            video.preload = 'metadata';
        }
    });

    console.log('[Mobile] Video playback optimized');
};

/**
 * Add mobile-specific CSS optimizations
 */
export const addMobileCSSOptimizations = () => {
    if (!isMobileDevice()) return;

    const style = document.createElement('style');
    style.textContent = `
    /* Mobile-specific performance optimizations */
    @media (max-width: 760px) {
      /* Reduce transform operations */
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      /* Optimize images */
      img {
        image-rendering: -webkit-optimize-contrast;
      }
      
      /* Reduce shadows on mobile */
      .product-card,
      .modal-content {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      }
      
      /* Simplify animations on slow connections */
      html.slow-connection * {
        animation-duration: 0.3s !important;
        transition-duration: 0.2s !important;
      }
      
      html.slow-connection .infinite-scroll-track {
        animation: none !important;
      }
      
      html.slow-connection video {
        display: none !important;
      }
      
      /* Low battery mode */
      html.low-battery * {
        animation-duration: 1s !important;
        transition-duration: 0.1s !important;
      }
      
      html.low-battery .infinite-scroll-track {
        animation-duration: 90s !important;
      }
    }
  `;
    document.head.appendChild(style);
    console.log('[Mobile] Mobile-specific CSS optimizations added');
};

/**
 * Initialize all mobile optimizations
 */
export const initMobileOptimizations = () => {
    if (!isMobileDevice()) {
        console.log('[Mobile] Not a mobile device, skipping mobile optimizations');
        return;
    }

    console.log('[Mobile] Initializing mobile optimizations...');

    // Run optimizations
    optimizeForSlowConnection();
    addPassiveEventListeners();
    optimizeTouchInteractions();
    optimizeScrollPerformance();
    optimizeImagesForMobile();
    preventIOSInputZoom();
    optimizeForBattery();
    addMobileCSSOptimizations();

    // Optimize videos after a short delay
    setTimeout(() => {
        optimizeVideoForMobile();
    }, 500);

    console.log('[Mobile] Mobile optimizations complete!');
};

export default {
    isMobileDevice,
    isIOS,
    isAndroid,
    getConnectionSpeed,
    optimizeForSlowConnection,
    addPassiveEventListeners,
    optimizeTouchInteractions,
    optimizeScrollPerformance,
    optimizeImagesForMobile,
    preventIOSInputZoom,
    optimizeForBattery,
    optimizeVideoForMobile,
    addMobileCSSOptimizations,
    initMobileOptimizations
};
