import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    // Fetch wishlist from backend if logged in
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!token) {
                setWishlist([]);
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('http://localhost:5000/api/users/wishlist', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setWishlist(data);
                }
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, [token]);

    const toggleWishlist = async (productId) => {
        if (!token) {
            alert('Please login to use the wishlist.');
            return;
        }
        try {
            const res = await fetch('http://localhost:5000/api/users/wishlist', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId })
            });
            if (res.ok) {
                const data = await res.json();
                setWishlist(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to toggle wishlist", error);
            return false;
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => 
            (typeof item === 'object' ? item._id === productId : item === productId)
        );
    };

    const wishlistCount = wishlist.length;

    const toggleWishlistSidebar = () => setIsWishlistOpen(!isWishlistOpen);
    const openWishlist = () => setIsWishlistOpen(true);
    const closeWishlist = () => setIsWishlistOpen(false);

    return (
        <WishlistContext.Provider value={{ 
            wishlist, 
            toggleWishlist, 
            isInWishlist, 
            wishlistCount, 
            loading,
            isWishlistOpen,
            toggleWishlistSidebar,
            openWishlist,
            closeWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
