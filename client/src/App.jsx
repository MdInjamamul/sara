import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Analytics from './pages/Admin/Analytics';
import Reports from './pages/Admin/Reports';
import Users from './pages/Admin/Users';
import Newsletter from './pages/Admin/Newsletter';
import Orders from './pages/Admin/Orders';
import HomepageManager from './pages/Admin/Homepage/HomepageManager';
import BlogManager from './pages/Admin/BlogManager';
import ContactMessages from './pages/Admin/ContactMessages';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Profile from './pages/Profile/Profile';
import Checkout from './pages/Checkout/Checkout';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import MyOrders from './pages/MyOrders/MyOrders';
import Contact from './pages/Contact/Contact';
import About from './pages/About/About';
import Blog from './pages/Blog/Blog';
import BlogPost from './pages/Blog/BlogPost';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import CartSidebar from './components/CartSidebar/CartSidebar';
import WishlistSidebar from './components/WishlistSidebar/WishlistSidebar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute adminOnly={true}><Analytics /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute adminOnly={true}><Reports /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><Users /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly={true}><Orders /></ProtectedRoute>} />
            <Route path="/admin/homepage" element={<ProtectedRoute adminOnly={true}><HomepageManager /></ProtectedRoute>} />
            <Route path="/admin/blog" element={<ProtectedRoute adminOnly={true}><BlogManager /></ProtectedRoute>} />
            <Route path="/admin/contact" element={<ProtectedRoute adminOnly={true}><ContactMessages /></ProtectedRoute>} />
            <Route path="/admin/newsletter" element={<ProtectedRoute adminOnly={true}><Newsletter /></ProtectedRoute>} />
          </Routes>
          <CartSidebar />
          <WishlistSidebar />
        </div>
      </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
