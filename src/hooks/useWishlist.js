import { useState, useEffect } from 'react';

export const useWishlist = () => {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem('wishlistItems')) || [];
        setWishlist(items);
    }, []);

    const addToWishlist = (name, quantity = 1) => {
        const newList = [...wishlist];
        const existing = newList.find(item => item.name === name);

        if (existing) {
            existing.quantity += quantity;
        } else {
            newList.push({ name, quantity });
        }

        setWishlist(newList);
        localStorage.setItem('wishlistItems', JSON.stringify(newList));
    };

    const removeFromWishlist = (name) => {
        const newList = wishlist.filter(item => item.name !== name);
        setWishlist(newList);
        localStorage.setItem('wishlistItems', JSON.stringify(newList));
    };

    const toggleWishlist = (name, quantity = 1) => {
        if (isInWishlist(name)) {
            removeFromWishlist(name);
            return false;
        } else {
            addToWishlist(name, quantity);
            return true;
        }
    };

    const updateQuantity = (name, quantity) => {
        const newList = wishlist.map(item =>
            item.name === name ? { ...item, quantity } : item
        );
        setWishlist(newList);
        localStorage.setItem('wishlistItems', JSON.stringify(newList));
    };

    const clearWishlist = () => {
        setWishlist([]);
        localStorage.setItem('wishlistItems', JSON.stringify([]));
    };

    const isInWishlist = (name) => {
        return wishlist.some(item => item.name === name);
    };

    const getTotalQty = () => {
        return wishlist.reduce((sum, item) => sum + item.quantity, 0);
    };

    return {
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        updateQuantity,
        clearWishlist,
        isInWishlist,
        getTotalQty
    };
};
