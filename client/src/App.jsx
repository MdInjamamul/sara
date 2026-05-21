import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Analytics from './pages/Admin/Analytics';
import Orders from './pages/Admin/Orders';
import HomepageManager from './pages/Admin/Homepage/HomepageManager';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/homepage" element={<HomepageManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
