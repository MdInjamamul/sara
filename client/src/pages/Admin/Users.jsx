import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Toast from '../../components/Toast/Toast';
import '../../pages/AdminDashboard/AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Users = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState(''); // '' means all, 'user', 'admin'
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [deleteModalOpen, setDeleteModalOpen] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [token, search, role, page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/users?page=${page}&limit=50&search=${search}&role=${role}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || data.data?.users || data);
            } else {
                setToast({ message: 'Failed to load users', type: 'error' });
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            setToast({ message: 'An error occurred while fetching users', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRole = async (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        try {
            const res = await fetch(`${API_URL}/admin/users/${user._id}/role`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                setToast({ message: `User role updated to ${newRole}`, type: 'success' });
                fetchUsers();
            } else {
                const data = await res.json();
                setToast({ message: data.message || 'Failed to update user role', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred', type: 'error' });
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModalOpen) return;
        
        try {
            const res = await fetch(`${API_URL}/admin/users/${deleteModalOpen._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setToast({ message: 'User deleted successfully', type: 'success' });
                setDeleteModalOpen(null);
                fetchUsers();
            } else {
                const data = await res.json();
                setToast({ message: data.message || 'Failed to delete user', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred', type: 'error' });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <AdminLayout>
            <div className="admin-header-flex">
                <h1 className="admin-title">Manage Users</h1>
            </div>

            <div className="admin-section">
                <div className="admin-filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', flex: '1', minWidth: '200px' }}
                    />
                    <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    >
                        <option value="">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading users...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Date Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(!users || users.length === 0) ? (
                                    <tr>
                                        <td colSpan="6" className="empty-state">No users found matching the criteria.</td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id}>
                                            <td className="table-name">{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phone || 'N/A'}</td>
                                            <td>
                                                <span style={{ 
                                                    backgroundColor: user.role === 'admin' ? '#dbeafe' : '#f1f5f9', 
                                                    color: user.role === 'admin' ? '#1d4ed8' : '#475569', 
                                                    padding: '4px 10px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: '600',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="table-actions" style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                                <button 
                                                    className="admin-btn edit-btn" 
                                                    onClick={() => handleToggleRole(user)}
                                                    style={{ width: '100px' }}
                                                >
                                                    {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                                                </button>
                                                <button 
                                                    className="admin-btn delete-btn" 
                                                    onClick={() => setDeleteModalOpen(user)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="delete-modal-overlay" style={{ zIndex: 1000 }} onClick={() => setDeleteModalOpen(null)}>
                    <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '1rem', color: '#b91c1c' }}>Delete User</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Are you sure you want to delete user <strong>{deleteModalOpen.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="delete-modal-actions">
                            <button className="admin-btn cancel-btn" onClick={() => setDeleteModalOpen(null)}>Cancel</button>
                            <button className="admin-btn delete-btn" onClick={handleDeleteUser}>Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />}
        </AdminLayout>
    );
};

export default Users;
