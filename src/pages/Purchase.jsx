import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { showCartNotification, showWishlistNotification } from '../utils/notifications';
import './Purchase.css'; // Purchase page specific styles

const Purchase = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart, getTotalQty } = useCart();
    const { toggleWishlist, isInWishlist, getTotalQty: getWishlistQty } = useWishlist();

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [modalProduct, setModalProduct] = useState(null);
    const [modalQuantity, setModalQuantity] = useState(1);
    const [currentSlide, setCurrentSlide] = useState(0);
    const videoRefs = useRef([]);

    const banners = [
        { video: "/DietCoffeeZ.webm", poster: "/bannerDC.png" },
        { video: "/PremiumTeaZ.webm", poster: "/bannerPT.png" },
        { video: "/cappuccinoZ.webm", poster: "/bannerCA.png" },
        { video: "/MilkBoostZ.webm", poster: "/bannerMB.png" },
        { video: "/MilkhorlicksZ.webm", poster: "/bannerMH.png" }
    ];

    const products = [
        { name: 'Coffee Non sugar', img: '/zcoffe.png' },
        { name: 'Tea Premium', img: '/ztea.png' },
        { name: 'Milk Boost', img: '/boost.png' },
        { name: 'Cappuccino', img: '/cappuccino.png' },
        { name: 'Milk Horlicks', img: '/horlicks.png' },
        { name: 'Coffee Premium', img: '/zcoffepre.png' }
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search');
        const productParam = params.get('product');

        if (productParam) {
            setSearchQuery(productParam);
            setFilteredProducts(products.filter(p => p.name === productParam));
        } else if (searchParam) {
            setSearchQuery(searchParam);
            setFilteredProducts(products.filter(p =>
                p.name.toLowerCase().includes(searchParam.toLowerCase())
            ));
        } else {
            setFilteredProducts(products);
        }

        const fetchNotifications = async () => {
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

                onValue(ref(db, 'notifications'), (snapshot) => {
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
    }, [location]);

    // Banner Carousel Autoslide
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Control video playback based on active slide
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (video) {
                if (index === currentSlide) {
                    video.currentTime = 0; // Reset to start
                    video.load(); // Reload the video
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            console.log('Video play prevented:', err);
                            // Retry after a short delay
                            setTimeout(() => {
                                video.play().catch(() => { });
                            }, 100);
                        });
                    }
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        });
    }, [currentSlide]);

    // Handle scroll card clicks to open modal
    useEffect(() => {
        const cards = document.querySelectorAll('.scroll-card .card-inner');
        const handleCardClick = (e) => {
            const card = e.currentTarget;
            const name = card.dataset.name;
            const img = card.dataset.img;
            setModalProduct({ name, img });
            setModalQuantity(1);
        };

        cards.forEach(card => {
            card.addEventListener('click', handleCardClick);
        });

        return () => {
            cards.forEach(card => {
                card.removeEventListener('click', handleCardClick);
            });
        };
    }, []);

    const closeModal = () => {
        setModalProduct(null);
        setModalQuantity(1);
    };

    const handleModalAddToCart = () => {
        if (modalProduct) {
            handleAddToCart(modalProduct.name, 1); // Always add 1 quantity from modal
            closeModal();
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase())
            ));
        }
    };

    const handleAddToCart = (productName, quantity) => {
        const deliveryAddress = localStorage.getItem('deliveryAddress');
        if (!deliveryAddress) {
            alert('Please set delivery address in Profile first.');
            navigate('/profile');
            return;
        }

        addToCart(productName, quantity);
        showCartNotification(`${quantity}× ${productName}`);
    };

    const handleWishlistToggle = (productName, quantity) => {
        const added = toggleWishlist(productName, quantity);
        if (added) {
            showWishlistNotification(`${productName} added to wishlist!`);
        } else {
            showWishlistNotification(`${productName} removed from wishlist!`);
        }
    };

    return (
        <>
            <style>{`
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          85% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -20px); }
        }
        @keyframes cartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}</style>

            <div>
                <Navbar
                    wishlistCount={getWishlistQty()}
                    notificationCount={notificationCount}
                    onSearch={handleSearch}
                />

                <div className="infinite-scroll-container">
                    <div className="infinite-scroll-track">
                        {[...products, ...products].map((product, index) => (
                            <div key={index} className="scroll-card">
                                <div className="card-inner" data-name={product.name} data-img={product.img} style={{ cursor: 'pointer' }}>
                                    <div className={index % 6 === 0 ? 'best-seller-tag' : index % 6 === 1 ? 'offer-tag' : 'new-tag'}>
                                        {index % 6 === 0 ? 'Best Seller' : index % 6 === 1 ? 'UP TO 10% OFF' : 'SPECIAL'}
                                    </div>
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
                                    webkit-playsinline="true"
                                    x-webkit-airplay="allow"
                                    autoPlay
                                    muted
                                    loop
                                    preload="metadata"
                                    poster={banner.poster}
                                    disablePictureInPicture
                                >
                                    <source src={banner.video} type="video/webm" />
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

                <section className="products-section">
                    <h2>Shop</h2>
                    <p>Discover our selection of beverages, crafted to perfection for your enjoyment</p>
                    <div className="products-wrapper">
                        <div className="products-grid">
                            {filteredProducts.map((product, index) => (
                                <ProductCard
                                    key={index}
                                    product={product}
                                    isInWishlist={isInWishlist(product.name)}
                                    onAddToCart={handleAddToCart}
                                    onWishlistToggle={handleWishlistToggle}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Modal for scroll card products */}
                {modalProduct && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeModal}>×</button>
                            <img src={modalProduct.img} alt={modalProduct.name} />

                            {/* Tag like scroll cards */}
                            {modalProduct.name.toLowerCase().includes('coffee') && (
                                <div className="best-seller-tag">Best Seller</div>
                            )}
                            {modalProduct.name.toLowerCase().includes('tea') && (
                                <div className="offer-tag">UP TO 10% OFF</div>
                            )}
                            {!modalProduct.name.toLowerCase().includes('coffee') && !modalProduct.name.toLowerCase().includes('tea') && (
                                <div className="new-tag">SPECIAL</div>
                            )}

                            <h3>{modalProduct.name}</h3>

                            <button className="modal-cart-btn" onClick={handleModalAddToCart}>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                )}

                <BottomNav currentPage="purchase" cartCount={getTotalQty()} />
            </div>
        </>
    );
};

const ProductCard = ({ product, isInWishlist, onAddToCart, onWishlistToggle }) => {
    const [quantity, setQuantity] = useState(1);

    return (
        <div className="product-card" data-name={product.name}>
            <img src={product.img} alt={product.name} />
            <div className="product-info">
                <h3 className="visible">{product.name}</h3>
                <div className="quantity-row">
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="quantity-input"
                    />
                    <button
                        className="wishlist-btn"
                        title="Add to Wishlist"
                        onClick={() => onWishlistToggle(product.name, quantity)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            fill={isInWishlist ? 'red' : 'none'}
                            stroke={isInWishlist ? 'none' : 'black'}
                            strokeWidth={isInWishlist ? '0' : '2'}
                        >
                            <path d="M12 21s-8-4.58-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.42-8 11-8 11Z" />
                        </svg>
                    </button>
                </div>
                <button
                    className="add-cart-btn"
                    onClick={() => onAddToCart(product.name, quantity)}
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginRight: '6px' }}
                    >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default Purchase;
