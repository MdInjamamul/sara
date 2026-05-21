import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Fetch cart from backend if logged in
    useEffect(() => {
        const fetchCart = async () => {
            if (!token) {
                setCart([]);
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('http://localhost:5000/api/users/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCart(data);
                }
            } catch (error) {
                console.error("Failed to fetch cart", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [token]);

    const addToCart = async (productId, quantity = 1) => {
        if (!token) {
            alert('Please login to add items to your cart.');
            return;
        }
        try {
            const res = await fetch('http://localhost:5000/api/users/cart', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId, quantity })
            });
            if (res.ok) {
                const data = await res.json();
                setCart(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to add to cart", error);
            return false;
        }
    };

    const removeFromCart = async (productId) => {
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:5000/api/users/cart/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCart(data);
            }
        } catch (error) {
            console.error("Failed to remove from cart", error);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:5000/api/users/cart/${productId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ quantity })
            });
            if (res.ok) {
                const data = await res.json();
                setCart(data);
            }
        } catch (error) {
            console.error("Failed to update cart quantity", error);
        }
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    const toggleCart = () => setIsCartOpen(!isCartOpen);
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const clearCart = () => setCart([]);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            updateQuantity,
            cartCount, 
            loading,
            isCartOpen,
            toggleCart,
            openCart,
            closeCart,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
