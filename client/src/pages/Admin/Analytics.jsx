import AdminLayout from '../../components/AdminLayout/AdminLayout';

const Analytics = () => {
    return (
        <AdminLayout>
            <div className="admin-header-flex">
                <h1 className="admin-title">Analytics Dashboard</h1>
            </div>
            <div style={{ padding: '2rem 0', color: '#64748b' }}>
                <p>Analytics charts and data will be displayed here.</p>
            </div>
        </AdminLayout>
    );
};

export default Analytics;
