import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import './styles/index.css';

import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetails />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<div style={{padding: '24px', color: 'white'}}>Products Management (Coming Phase 2)</div>} />
            <Route path="products/new" element={<div style={{padding: '24px', color: 'white'}}>New Product (Coming Phase 2)</div>} />
            <Route path="homepage" element={<div style={{padding: '24px', color: 'white'}}>Homepage Management (Coming Phase 3)</div>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
