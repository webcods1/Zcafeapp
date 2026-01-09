import { useState, useEffect } from 'react';

export const useCart = () => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        setCart(cartItems);
    }, []);

    const addToCart = (name, quantity) => {
        const newCart = [...cart];
        const existing = newCart.find(item => item.name === name);

        if (existing) {
            existing.quantity += quantity;
        } else {
            newCart.push({ name, quantity });
        }

        setCart(newCart);
        localStorage.setItem('cartItems', JSON.stringify(newCart));
        return newCart;
    };

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('cartItems', JSON.stringify(newCart));
    };

    const updateQuantity = (name, quantity) => {
        const newCart = cart.map(item =>
            item.name === name ? { ...item, quantity } : item
        );
        setCart(newCart);
        localStorage.setItem('cartItems', JSON.stringify(newCart));
    };

    const removeFromCart = (name) => {
        const newCart = cart.filter(item => item.name !== name);
        setCart(newCart);
        localStorage.setItem('cartItems', JSON.stringify(newCart));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.setItem('cartItems', JSON.stringify([]));
    };

    const getTotalQty = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    return {
        cart,
        addToCart,
        updateCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalQty
    };
};
