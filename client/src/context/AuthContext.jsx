import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('sara_user');
        const storedToken = localStorage.getItem('sara_token');
        
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('sara_user', JSON.stringify(userData));
        localStorage.setItem('sara_token', authToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('sara_user');
        localStorage.removeItem('sara_token');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('sara_user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
