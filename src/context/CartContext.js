// ../context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Load cart from local storage on initial load
    try {
      const localData = localStorage.getItem('sivagamiTradersCart'); // Use a unique key for localStorage
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  // Save cart to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sivagamiTradersCart', JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

  const addToCart = (product, quantityToAdd = 1) => {
    setCart(currentCart => {
      const existingProductIndex = currentCart.findIndex(item => item.id === product.id);

      let updatedCart;
      if (existingProductIndex !== -1) {
        // Item already in cart, update its quantity
        updatedCart = currentCart.map((item, index) =>
          index === existingProductIndex
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
        toast.success(`${product.name} quantity updated in cart!`, {
            position: "bottom-left", autoClose: 2000, hideProgressBar: false,
            closeOnClick: true, pauseOnHover: true, draggable: true, theme: "light",
            closeButton: false
        });
      } else {
        // Item not in cart, add it
        updatedCart = [...currentCart, { ...product, quantity: quantityToAdd }];
        toast.success(`${product.name} added to cart!`, {
            position: "bottom-left", autoClose: 2000, hideProgressBar: false,
            closeOnClick: true, pauseOnHover: true, draggable: true, theme: "light",
            closeButton: false
        });
      }
      return updatedCart;
    });
  };

  const increaseQuantity = (productId) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
    // Optional: toast for quantity increase if desired, or let the +/- be silent visual updates
    // const product = cart.find(item => item.id === productId);
    // if(product) toast.info(`Quantity for ${product.name} increased.`, { autoClose: 1500});
  };

  const decreaseQuantity = (productId) => {
    setCart(currentCart => {
      const itemToDecrease = currentCart.find(item => item.id === productId);

      if (itemToDecrease && itemToDecrease.quantity > 1) {
        return currentCart.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
        // Optional: toast for quantity decrease
        // toast.info(`Quantity for ${itemToDecrease.name} decreased.`, { autoClose: 1500});
      } else if (itemToDecrease && itemToDecrease.quantity === 1) {
        // If quantity is 1, effectively remove the item
        // We'll let removeFromCart handle the toast for removal
        return currentCart.filter(item => item.id !== productId);
      }
      return currentCart; // Should not happen if itemToDecrease is undefined, but good practice
    });

    // If item was at quantity 1 and now removed, show "removed" toast
    const itemAfterDecrease = cart.find(item => item.id === productId);
    const originalItem = cart.find(item => item.id === productId); // Find original before potential removal in setCart
    if (originalItem && originalItem.quantity === 1 && !itemAfterDecrease) {
      toast.info(`${originalItem.name} removed from cart.`, {
        position: "bottom-left", autoClose: 2000, hideProgressBar: false,
        closeOnClick: true, pauseOnHover: true, draggable: true, theme: "light",
        closeButton: false
      });
    }
  };

  const removeFromCart = (productId) => {
    const itemRemoved = cart.find(item => item.id === productId);
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
    if (itemRemoved) {
      toast.info(`${itemRemoved.name} removed from cart.`, {
        position: "bottom-left", autoClose: 2000, hideProgressBar: false,
        closeOnClick: true, pauseOnHover: true, draggable: true, theme: "light",
        closeButton: false
      });
    }
  };

  // updateQuantity is still useful if you have a direct number input for quantity in a cart page, for example.
  // If you only use +/- buttons, it could be removed. I'll keep it for flexibility.
  const updateQuantity = (productId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    if (isNaN(quantity) || quantity < 0) return; // Basic validation

    if (quantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(currentCart =>
        currentCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    // No toast needed usually for manual clear, but could be added if triggered by user action e.g. "Clear Cart" button
    // toast.info("Cart cleared!");
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((totalQuantity, item) => totalQuantity + item.quantity, 0);
  };

  // Rename 'cart' to 'cartItems' in the value for consistency with previous examples, if you prefer.
  // I'll stick to 'cart' as per your existing code structure.
  const value = {
    cart, // This is your array of cart items
    addToCart,
    removeFromCart,
    updateQuantity, // For direct quantity set
    increaseQuantity, // New
    decreaseQuantity, // New
    clearCart,
    getTotalPrice,
    getCartCount,   // New helper
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};