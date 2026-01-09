// Notification utilities
export const showCartNotification = (productName) => {
    const notification = document.createElement('div');
    notification.textContent = `${productName} added!`;
    notification.style.cssText = `
    position: fixed;
    bottom: 55px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
    animation: slideUpFade 2s ease-out forwards;
    margin-bottom: 0;
  `;
    document.body.appendChild(notification);

    // Pulse the cart badge
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.style.animation = 'cartPulse 0.5s ease-out';
        setTimeout(() => {
            cartBadge.style.animation = '';
        }, 500);
    }

    setTimeout(() => {
        notification.remove();
    }, 2000);
};

export const showWishlistNotification = (text) => {
    const notification = document.createElement('div');
    notification.textContent = text;
    notification.style.cssText = `
    position: fixed;
    bottom: 55px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #ff512f 0%, #dd2476 100%);
    color: white;
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 8px 30px rgba(221, 36, 118, 0.4);
    animation: slideUpFade 2s ease-out forwards;
    margin-bottom: 0;
  `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
};

export const showSuccessNotification = (message) => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    bottom: 55px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    color: white;
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 8px 30px rgba(46, 204, 113, 0.4);
    animation: slideUpFade 2s ease-out forwards;
    margin-bottom: 0;
  `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
};
