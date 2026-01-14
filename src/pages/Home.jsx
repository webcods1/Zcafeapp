import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { showCartNotification } from '../utils/notifications';
import { useNavigationGuard } from '../hooks/useNavigationGuard';

const Home = () => {
    const navigate = useNavigate();
    const { addToCart, getTotalQty } = useCart();
    const { getTotalQty: getWishlistQty } = useWishlist();
    const { isMounted } = useNavigationGuard();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const [teaIndex, setTeaIndex] = useState(0);
    const [coffeeIndex, setCoffeeIndex] = useState(0);
    const [specialIndex, setSpecialIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const videoRefs = useRef([]);

    const banners = [
        { video: "/DietCoffeeZ.webm" },
        { video: "/PremiumTeaZ.webm" },
        { video: "/cappuccinoZ.webm" },
        { video: "/MilkBoostZ.webm" },
        { video: "/MilkhorlicksZ.webm" }
    ];

    const scrollProducts = [
        { name: 'Coffee Premium', img: '/zcoffepre.png', tag: 'best-seller-tag', tagText: 'Best Seller' },
        { name: 'Tea Premium', img: '/ztea.png', tag: 'offer-tag', tagText: 'UP TO 10% OFF' },
        { name: 'Cappuccino', img: '/cappuccino.png', tag: 'new-tag', tagText: 'NEW ARRIVAL' },
        { name: 'Milk Boost', img: '/boost.png', tag: 'energy-tag', tagText: 'ENERGY' },
        { name: 'Coffee Non sugar', img: '/zcoffe.png', tag: 'healthy-tag', tagText: '0% SUGAR' },
        { name: 'Milk Horlicks', img: '/horlicks.png', tag: 'trending-tag', tagText: 'TRENDING' }
    ];

    const teaProducts = [
        { name: 'Tea Premium', img: '/ztea.png' },
        { name: 'Tea Non Sugar', img: '/zwtea.png' },
        { name: 'Masala Tea', img: '/MasalaTea.png' },
        { name: 'Lemon Tea', img: '/LemonTea.png' }

    ];

    const coffeeProducts = [
        { name: 'Coffee Premium', img: '/zcoffepre.png' },
        { name: 'Coffee Non Sugar', img: '/zcoffe.png' },
        { name: 'Milk Horlicks', img: '/horlicks.png' },
        { name: 'Milk Boost', img: '/boost.png', }

    ];

    const specialProducts = [
        { name: 'Cappuccino', img: '/cappuccino.png' },
        { name: 'Milk Horlicks', img: '/horlicks.png' },
        { name: 'Masala Tea', img: '/MasalaTea.png' },
        { name: 'Milk Boost', img: '/boost.png' }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Control video playback based on active slide
    // Control video playback based on active slide
    useEffect(() => {
        // Check if component is still mounted
        if (!isMounted()) return;

        try {
            if (!videoRefs.current || videoRefs.current.length === 0) {
                console.warn('[Video] No video refs available');
                return;
            }

            videoRefs.current.forEach((video, index) => {
                if (!video) return; // Skip if ref is null

                try {
                    if (index === currentSlide) {
                        // Reset and load video
                        if (video.paused) {
                            video.currentTime = 0;
                            const playPromise = video.play();
                            if (playPromise !== undefined) {
                                playPromise
                                    .then(() => {
                                        if (isMounted()) {
                                            console.log('[Video] Playing slide', index);
                                        }
                                    })
                                    .catch(err => {
                                        if (isMounted()) {
                                            console.log('[Video] Autoplay prevented:', err.name);
                                        }
                                    });
                            }
                        }
                    } else {
                        // Just pause the video, do NOT unload src causing black screen
                        video.pause();
                        video.currentTime = 0;
                    }
                } catch (error) {
                    console.warn('[Video] Error handling video', index, error);
                }
            });
        } catch (error) {
            console.error('[Video] Critical error in video control:', error);
        }

        // Cleanup function
        return () => {
            // No aggressive cleanup needed between slides to prevent black flashes
        };
    }, [currentSlide]);

    // iOS Fix: Enable video playback after ANY user interaction
    useEffect(() => {
        let interactionHandled = false;

        const playCurrentVideo = () => {
            const currentVideo = videoRefs.current[currentSlide];
            if (currentVideo && currentVideo.paused) {
                const playPromise = currentVideo.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log('[Video] Started playing on user interaction');
                        })
                        .catch(err => {
                            console.log('[Video] Play failed:', err);
                        });
                }
            }
        };

        const handleInteraction = () => {
            if (!interactionHandled) {
                interactionHandled = true;
                console.log('[Video] User interaction detected - enabling videos');
                playCurrentVideo();
            }
        };

        // Listen for multiple interaction types
        const events = ['touchstart', 'touchend', 'click', 'scroll'];
        events.forEach(event => {
            document.addEventListener(event, handleInteraction, { once: true, passive: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleInteraction);
            });
        };
    }, [currentSlide]);


    useEffect(() => {
        let unsubscribe = null;

        const fetchNotifications = async () => {
            if (!isMounted()) return;

            try {
                const { initializeApp, getApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
                const { getDatabase, ref, onValue } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

                const firebaseConfig = {
                    apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                    databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com"
                };

                let app;
                try {
                    app = initializeApp(firebaseConfig);
                } catch (e) {
                    if (e.code === 'app/duplicate-app') {
                        app = getApp();
                    } else {
                        throw e;
                    }
                }
                const db = getDatabase(app);

                unsubscribe = onValue(ref(db, 'notifications'), (snapshot) => {
                    if (!isMounted()) return; // Don't update if unmounted

                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        const userLoc = localStorage.getItem('deliveryAddress') || '';
                        const userComp = localStorage.getItem('companyName') || '';
                        const lastSeen = parseInt(localStorage.getItem('lastNotifSeen') || '0');

                        let count = 0;
                        Object.values(data).forEach(n => {
                            const matchLoc = n.targetLocation === 'all' || n.targetLocation === userLoc;
                            const matchComp = n.targetCompany === 'all' || n.targetCompany === userComp;
                            const notifTime = new Date(n.timestamp).getTime();
                            if (matchLoc && matchComp && notifTime > lastSeen) count++;
                        });

                        setNotificationCount(count);
                    }
                });
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();

        // Cleanup Firebase listener on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
                console.log('🧹 Notifications listener cleaned up');
            }
        };
    }, []);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.about-section h2, .about-section p, .connect-section h2, .connect-section .contact-info, .connect-section .social-links-labeled, .products-collage, .services-section');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const handleCardClick = (product) => {
        setModalProduct(product);
        setShowModal(true);
    };

    const handleAddToCart = (productName, quantity = 1) => {
        const deliveryAddress = localStorage.getItem('deliveryAddress');
        if (!deliveryAddress) {
            alert('Please set delivery address in Profile first.');
            navigate('/profile');
            return;
        }

        addToCart(productName, quantity);
        showCartNotification(`${quantity}× ${productName}`);
    };

    return (
        <>
            <Navbar
                wishlistCount={getWishlistQty()}
                notificationCount={notificationCount}
            />

            <div className="infinite-scroll-container">
                <div className="infinite-scroll-track">
                    {[...scrollProducts, ...scrollProducts].map((product, index) => (
                        <div key={index} className="scroll-card" onClick={() => handleCardClick(product)}>
                            <div className="card-inner">
                                <div className={product.tag}>{product.tagText}</div>
                                <img src={product.img} alt={product.name} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="banner-carousel container-fluid px-0">
                <div className="carousel-slides mx-auto">
                    {banners.map((banner, index) => (
                        <div
                            key={index}
                            className={`banner banner-slide ${currentSlide === index ? 'active' : ''}`}
                        >
                            <video
                                ref={el => videoRefs.current[index] = el}
                                className="banner-video"
                                playsInline
                                playsinline="true"
                                autoPlay
                                muted
                                defaultMuted
                                loop
                                preload="auto"
                                disablePictureInPicture
                                controls={false}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    backgroundColor: '#000'
                                }}
                            >
                                <source src={banner.video} type="video/webm" />
                                Your browser does not support video playback.
                            </video>
                        </div>
                    ))}
                </div>
                <div className="carousel-dots">
                    {banners.map((_, i) => (
                        <span
                            key={i}
                            className={`dot ${currentSlide === i ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(i)}
                        />
                    ))}
                </div>
            </div>

            <section className="products-collage">
                <div className="collage-header">
                    <h2>Tea Premix & Varieties</h2>
                </div>
                <div className="collage-container">
                    <div className="main-feature-area">
                        <div className="feature-slide">
                            <img src={teaProducts[teaIndex].img} alt={teaProducts[teaIndex].name} />
                        </div>
                        <div className="feature-details">
                            <h3>{teaProducts[teaIndex].name}</h3>
                            <div className="rating">{teaProducts[teaIndex].rating}</div>
                            <button className="cart-btn" onClick={() => handleAddToCart(teaProducts[teaIndex].name)}>
                                <i className="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                        </div>
                        <button className="nav-arrow prev" onClick={() => setTeaIndex((teaIndex - 1 + teaProducts.length) % teaProducts.length)}>‹</button>
                        <button className="nav-arrow next" onClick={() => setTeaIndex((teaIndex + 1) % teaProducts.length)}>›</button>
                    </div>
                    <div className="thumbnail-sidebar">
                        {teaProducts.map((product, index) => (
                            <div
                                key={index}
                                className={`thumb-item ${index === teaIndex ? 'active' : ''}`}
                                onClick={() => setTeaIndex(index)}
                            >
                                <img src={product.img} alt={product.name} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="products-collage">
                <div className="collage-header">
                    <h2>Coffee Premix & Varieties</h2>
                </div>
                <div className="collage-container">
                    <div className="main-feature-area">
                        <div className="feature-slide">
                            <img src={coffeeProducts[coffeeIndex].img} alt={coffeeProducts[coffeeIndex].name} />
                        </div>
                        <div className="feature-details">
                            <h3>{coffeeProducts[coffeeIndex].name}</h3>
                            <div className="rating">{coffeeProducts[coffeeIndex].rating}</div>
                            <button className="cart-btn" onClick={() => handleAddToCart(coffeeProducts[coffeeIndex].name)}>
                                <i className="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                        </div>
                        <button className="nav-arrow prev" onClick={() => setCoffeeIndex((coffeeIndex - 1 + coffeeProducts.length) % coffeeProducts.length)}>‹</button>
                        <button className="nav-arrow next" onClick={() => setCoffeeIndex((coffeeIndex + 1) % coffeeProducts.length)}>›</button>
                    </div>
                    <div className="thumbnail-sidebar">
                        {coffeeProducts.map((product, index) => (
                            <div
                                key={index}
                                className={`thumb-item ${index === coffeeIndex ? 'active' : ''}`}
                                onClick={() => setCoffeeIndex(index)}
                            >
                                <img src={product.img} alt={product.name} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="products-collage">
                <div className="collage-header">
                    <h2>Special Premix & Varieties</h2>
                </div>
                <div className="collage-container">
                    <div className="main-feature-area">
                        <div className="feature-slide">
                            <img src={specialProducts[specialIndex].img} alt={specialProducts[specialIndex].name} />
                        </div>
                        <div className="feature-details">
                            <h3>{specialProducts[specialIndex].name}</h3>
                            <div className="rating">{specialProducts[specialIndex].rating}</div>
                            <button className="cart-btn" onClick={() => handleAddToCart(specialProducts[specialIndex].name)}>
                                <i className="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                        </div>
                        <button className="nav-arrow prev" onClick={() => setSpecialIndex((specialIndex - 1 + specialProducts.length) % specialProducts.length)}>‹</button>
                        <button className="nav-arrow next" onClick={() => setSpecialIndex((specialIndex + 1) % specialProducts.length)}>›</button>
                    </div>
                    <div className="thumbnail-sidebar">
                        {specialProducts.map((product, index) => (
                            <div
                                key={index}
                                className={`thumb-item ${index === specialIndex ? 'active' : ''}`}
                                onClick={() => setSpecialIndex(index)}
                            >
                                <img src={product.img} alt={product.name} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="services-section">
                <div className="services-content">
                    <svg viewBox="0 0 24 24" className={`service-vehicle ${isAnimating ? 'animate-ride' : ''}`} id="home-service-gear">
                        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                    </svg>
                    <h2>SERVICE</h2>
                    <p>Our team is here to help you with any inquiries or support you need.</p>
                    <button
                        className="service-button"
                        disabled={isAnimating}
                        onClick={() => {
                            if (isAnimating) return; // Prevent double-click

                            console.log('Button clicked - starting animation');
                            setIsAnimating(true);

                            const timeoutId = setTimeout(() => {
                                console.log('5 seconds passed - navigating to /service');
                                navigate('/service');
                            }, 5000);

                            // Store timeout ID for cleanup if needed
                            window.serviceTimeout = timeoutId;
                        }}
                    >
                        Book Now <i className="fas fa-arrow-right"></i>
                    </button>
                    <div className="service-track"></div>
                </div>
            </section>

            <section className="about-section">
                <h2>ABOUT ZCAFE</h2>
                <p>Welcome to ZCafe, your premier destination for premium coffee and beverages. We are dedicated to providing high-quality products and exceptional service to coffee lovers everywhere. Our mission is to bring the finest coffee experiences to your doorstep with convenience and care.</p>
            </section>

            <section className="connect-section">
                <div className="contact-info">
                    <h2>CONNECT WITH ZCAFE</h2>
                    <p>Have questions or need assistance? Reach out to us!</p>
                    <div className="contact-item">
                        <i className="fas fa-envelope"></i>
                        <a href="mailto:zcafemarketing@gmail.com">zcafemarketing@gmail.com</a>
                    </div>
                    <div className="contact-item">
                        <i className="fas fa-phone-alt"></i>
                        <a href="tel:+918590230028">+91 85902 30028</a>
                    </div>
                    <p className="social-text">Follow us on social media for updates and promotions.</p>
                </div>
                <div className="social-links-labeled">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-instagram"></i> Instagram
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook"></i> Facebook
                    </a>
                </div>
            </section>

            {showModal && modalProduct && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        <img src={modalProduct.img} alt={modalProduct.name} />
                        <h3>{modalProduct.name}</h3>
                        <div className={modalProduct.tag}>{modalProduct.tagText}</div>
                        <button className="modal-cart-btn" onClick={() => {
                            handleAddToCart(modalProduct.name);
                            setShowModal(false);
                        }}>
                            <i className="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            )}

            <BottomNav currentPage="home" cartCount={getTotalQty()} />
        </>
    );
};

export default Home;
