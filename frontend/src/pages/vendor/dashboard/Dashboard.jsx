import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../../apis/config/interceptors';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    weeklyRevenue: 0,
    weeklyOrders: 0,
    weeklySales: []
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch analytics and vendor orders in parallel
        const [analyticsRes, ordersRes] = await Promise.all([
          api.get('/api/orders/vendor/analytics'),
          api.get('/api/orders/vendor'),
          api.get('/api/products/product-count')
        ]);

        setAnalytics(analyticsRes.data);

        // Sort orders descending to get the latest ones, then take the top 3
        const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const sortedOrders = ordersData.sort((a, b) => b.id - a.id).slice(0, 3);
        setRecentOrders(sortedOrders);
       // setProductCount(productCountRes.data);

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchProductCount = async () => {
      try {
        const productCountRes = await api.get('/api/products/product-count');
        const countData = productCountRes.data;
        
        const actualCount = typeof countData === 'object' && countData !== null
          ? (countData.count ?? countData.totalProducts ?? countData.productCount ?? 0)
          : (Number(countData) || 0);

        setProductCount(actualCount);
      } catch (error) {
        console.error("Failed to load product count", error);
      }
    };


    fetchDashboardData();
    fetchProductCount();
  }, []);


  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const salesData = weekDays.map(dayName => {
    const found = analytics.weeklySales && analytics.weeklySales.find(item => {
      const itemDay = item.day ? item.day.slice(0, 3) : '';
      return itemDay.toLowerCase() === dayName.toLowerCase();
    });
    return {
      day: dayName,
      Sales: found ? (found.income ?? found.Sales ?? 0) : 0
    };
  });

  return (
    <div className="container-fluid pt-4">
 
      {/* Main header part */}
      <div className="mb-4">
        <h2 className="fw-bold">Dashboard</h2>
        <p className="text-muted small">Here's Your Statistics</p>
      </div>

      {/* blocks */}
      <div className="row g-3">
        {/* block 1 */}
        <div className="col-12 col-md-4">
          <div className="p-3 border rounded bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted small text-uppercase fw-semibold mb-1">Total Sales</h6>
              <h3 className="fw-bold mb-0">
                ₹{loading ? '...' : analytics.weeklyRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="fs-3">💰</div>
          </div>
        </div>

        {/* block 2 */}
        <div className="col-12 col-md-4">
          <div className="p-3 border rounded bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted small text-uppercase fw-semibold mb-1">Total Orders</h6>
              <h3 className="fw-bold mb-0">
                {loading ? '...' : analytics.weeklyOrders}
              </h3>
            </div>
            <div className="fs-3">📦</div>
          </div>
        </div>
        
        {/* block 3 */}
        <div className="col-12 col-md-4">
          <div className="p-3 border rounded bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted small text-uppercase fw-semibold mb-1">Total Products</h6>
              <h3 className="fw-bold mb-0">{loading ? '...' : productCount}</h3>
            </div>
            <div className="fs-3">🏷️</div>
          </div>
        </div>
      </div> {/* Closes blocks row */}
   
 
      {/* VISUAL SALES PERFORMANCE CHART */}
      <div className="mt-4">
        <div className="p-4 border rounded bg-white shadow-sm">
          
          <div className="mb-3">
            <h5 className="fw-bold mb-1">Sales Performance</h5>
            <p className="text-muted small mb-0">Weekly revenue trends analysis</p>
          </div>

          {/* Dynamic container adjusting height to 300px */}
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              
              {/* Using an AreaChart for a premium shaded curve appearance */}
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                
                {/* Horizontal configuration axes lines */}
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6c757d', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6c757d', fontSize: 12 }} />
                
                {/* Clean hover menu box revealing numbers */}
                <Tooltip />
                
                {/* Gradient area line tracking path coordinates */}
                <Area type="monotone" dataKey="Sales" stroke="#0d6efd" fillOpacity={0.1} fill="#0d6efd" strokeWidth={2} />
              </AreaChart>

            </ResponsiveContainer>
          </div>

        </div>
      </div>
      {/* chart part ends here */}

      {/* RECENT ORDERS TABLE CARD*/}
      <div className="mt-4">
        <div className="p-4 border rounded bg-white shadow-sm">
          
          {/* Table Header inside Card */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Recent Orders</h5>
          </div>

          {/* Table Responsive Frame wrapper */}
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              
              {/* Table Column Labels Headers */}
              <thead className="table-light text-secondary small">
                <tr>
                  <th>Order ID</th>
                  <th>Product(s)</th>
                  <th>Subtotal</th>
                  <th>Status</th>
                </tr>
              </thead>
              
              {/* Table Body Content Rows */}
              <tbody className="small">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-muted">Loading recent orders...</td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-muted">No recent orders found.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusClass = 
                      order.status === 'DELIVERED' ? 'bg-success-subtle text-success border-success-subtle' :
                      order.status === 'PENDING' ? 'bg-warning-subtle text-warning-emphasis border-warning-subtle' :
                      'bg-secondary-subtle text-secondary border-secondary-subtle';

                    return (
                      <tr key={order.id}>
                        <td className="fw-semibold">#ORD-{order.id}</td>
                        <td>
                          {order.items && order.items.length > 0 
                            ? order.items.map(item => item.productName).join(', ') 
                            : 'N/A'}
                        </td>
                        <td>₹{Number(order.subtotal).toFixed(2)}</td>
                        <td>
                          <span className={`badge border px-2 py-1 ${statusClass}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>

        </div>
      </div>
      {/* recent table part ends here  */}

    </div> // Closes the main container-fluid
  );
};

export default Dashboard;