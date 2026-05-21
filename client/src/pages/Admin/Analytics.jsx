import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import './Analytics.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Analytics = () => {
  const { token } = useAuth();
  const [period, setPeriod] = useState('monthly');
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const salesCanvasRef = useRef(null);
  const categoryCanvasRef = useRef(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const headers = { Authorization: `Bearer ${token}` };

        const [
          dashboardRes,
          salesRes,
          topProductsRes,
          categorySalesRes,
          orderStatusRes
        ] = await Promise.all([
          fetch(`${API_URL}/analytics/dashboard`, { headers }),
          fetch(`${API_URL}/analytics/sales?period=${period}`, { headers }),
          fetch(`${API_URL}/analytics/top-products`, { headers }),
          fetch(`${API_URL}/analytics/category-sales`, { headers }),
          fetch(`${API_URL}/analytics/order-status`, { headers })
        ]);

        if (!dashboardRes.ok) throw new Error('Failed to fetch analytics');

        const [
          dashboardData,
          salesDataResult,
          topProductsData,
          categorySalesData,
          orderStatusData
        ] = await Promise.all([
          dashboardRes.json(),
          salesRes.json(),
          topProductsRes.json(),
          categorySalesRes.json(),
          orderStatusRes.json()
        ]);

        setStats(dashboardData.data || dashboardData);
        setSalesData(salesDataResult.data || salesDataResult);
        setTopProducts(topProductsData.data || topProductsData);
        setCategorySales(categorySalesData.data || categorySalesData);
        setStatusDist(orderStatusData.data || orderStatusData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    }
  }, [token, period]);

  useEffect(() => {
    if (!loading && salesData && salesData.length > 0) {
      drawSalesChart();
    }
    if (!loading && categorySales && categorySales.length > 0) {
      drawCategoryChart();
    }
  }, [loading, salesData, categorySales]);

  const drawSalesChart = () => {
    const canvas = salesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const maxVal = Math.max(...salesData.map(d => d.totalSales || d.revenue || d.amount || 0), 10);
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.strokeStyle = '#e5e7eb';
    ctx.stroke();
    
    // Draw bars
    const barWidth = chartWidth / salesData.length;
    salesData.forEach((d, i) => {
      const val = d.totalSales || d.revenue || d.amount || 0;
      const barHeight = (val / maxVal) * chartHeight;
      const x = padding + i * barWidth;
      const y = height - padding - barHeight;
      
      // Bar background
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + (barWidth * 0.1), y, barWidth * 0.8, barHeight);
      
      // Label
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      const label = d._id || d.date || `P${i+1}`;
      ctx.fillText(label, x + barWidth / 2, height - padding + 15);
    });
  };

  const drawCategoryChart = () => {
    const canvas = categoryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    ctx.clearRect(0, 0, width, height);
    
    const total = categorySales.reduce((acc, curr) => acc + (curr.totalSales || curr.count || curr.amount || 0), 0);
    let startAngle = 0;
    
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
    
    categorySales.forEach((d, i) => {
      const val = d.totalSales || d.count || d.amount || 0;
      const sliceAngle = total === 0 ? 0 : (val / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      // Draw legend (simple implementation)
      ctx.fillRect(width - 80, 20 + i * 20, 10, 10);
      ctx.fillStyle = '#374151';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(d._id || d.category || `Cat ${i+1}`, width - 65, 29 + i * 20);
      
      startAngle += sliceAngle;
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR' }).format(value || 0);
  };

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="loading-message">Loading analytics...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <select 
            className="period-select" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {stats && (
          <div className="stats-cards-grid">
            <div className="stat-card">
              <span className="stat-card-title">Total Revenue</span>
              <span className="stat-card-value">{formatCurrency(stats.totalRevenue || stats.revenue || 0)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-title">Total Orders</span>
              <span className="stat-card-value">{stats.totalOrders || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-title">Total Users</span>
              <span className="stat-card-value">{stats.totalUsers || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-title">Total Products</span>
              <span className="stat-card-value">{stats.totalProducts || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-title">Pending Orders</span>
              <span className="stat-card-value">{stats.pendingOrders || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-title">Today's Orders</span>
              <span className="stat-card-value">{stats.todaysOrders || 0}</span>
            </div>
          </div>
        )}

        <div className="analytics-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Sales Overview</h3>
            </div>
            <div className="chart-container">
              <canvas ref={salesCanvasRef} width="600" height="300"></canvas>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Category Sales</h3>
            </div>
            <div className="chart-container">
              <canvas ref={categoryCanvasRef} width="300" height="300"></canvas>
            </div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Top Products</h3>
            </div>
            <ul className="top-products-list">
              {topProducts && topProducts.length > 0 ? (
                topProducts.map((product, idx) => (
                  <li key={idx} className="top-product-item">
                    <span className="product-name">{product.name || product._id || 'Unknown'}</span>
                    <span className="product-sales">{product.sales || product.count || product.totalSold || 0} sold</span>
                  </li>
                ))
              ) : (
                <li>No top products data</li>
              )}
            </ul>
          </div>
          
          <div className="chart-card">
            <div className="chart-header">
              <h3>Order Status</h3>
            </div>
            <ul className="top-products-list">
              {statusDist && statusDist.length > 0 ? (
                statusDist.map((status, idx) => (
                  <li key={idx} className="top-product-item">
                    <span className="product-name">{status._id || status.status || 'Unknown'}</span>
                    <span className="product-sales">{status.count || 0} orders</span>
                  </li>
                ))
              ) : (
                <li>No order status data</li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Analytics;
