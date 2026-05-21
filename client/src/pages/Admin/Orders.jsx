import AdminLayout from '../../components/AdminLayout/AdminLayout';

const Orders = () => {
    return (
        <AdminLayout>
            <div className="admin-header-flex">
                <h1 className="admin-title">Manage Orders</h1>
            </div>
            <div style={{ padding: '2rem 0', color: '#64748b' }}>
                <p>Order management table will be displayed here.</p>
            </div>
        </AdminLayout>
    );
};

export default Orders;
