import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast/Toast';
import './Profile.css';

const Profile = () => {
    const { user, token, updateUser } = useAuth();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        photo: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Fetch full profile from backend to ensure we have latest
        const fetchProfile = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        location: data.location || '',
                        photo: data.photo || '',
                        password: '',
                        confirmPassword: ''
                    });
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(true);
        try {
            const res = await fetch('http://localhost:5000/api/upload/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            const data = await res.json();
            if (res.ok) {
                // Ensure full URL is set
                const imgUrl = data.imageUrl.startsWith('http') ? data.imageUrl : `http://localhost:5000${data.imageUrl}`;
                setFormData(prev => ({ ...prev, photo: imgUrl }));
                setToast({ message: 'Avatar uploaded! Click Save Changes to apply.', type: 'success' });
            } else {
                setToast({ message: data.message || 'Image upload failed', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Error uploading image', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password) {
            if (formData.password !== formData.confirmPassword) {
                setToast({ message: 'Passwords do not match', type: 'error' });
                return;
            }
            
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                setToast({ message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.', type: 'error' });
                return;
            }
        }

        if (formData.name.trim().length < 2) {
            setToast({ message: 'Name must be at least 2 characters', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const updatePayload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                location: formData.location,
                photo: formData.photo
            };

            if (formData.password) {
                updatePayload.password = formData.password;
            }

            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatePayload)
            });

            const data = await res.json();

            if (res.ok) {
                setToast({ message: 'Profile updated successfully!', type: 'success' });
                // Update global user state
                updateUser({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    photo: data.photo,
                    location: data.location,
                    phone: data.phone
                });
                
                // Clear password fields
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            } else {
                setToast({ message: data.message || 'Failed to update profile', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Server error. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="profile-loading">Loading...</div>;

    return (
        <div className="profile-page">
            <div className="container profile-container">
                <div className="profile-sidebar">
                    <div className="profile-avatar-large" onClick={() => fileInputRef.current.click()}>
                        {uploading ? (
                            <div className="avatar-loading">Uploading...</div>
                        ) : formData.photo || user.photo ? (
                            <>
                                <img src={formData.photo || user.photo} alt={user.name} />
                                <div className="avatar-overlay">
                                    <span>Change Photo</span>
                                </div>
                            </>
                        ) : (
                            <div className="avatar-placeholder-large">
                                {user.name.charAt(0).toUpperCase()}
                                <div className="avatar-overlay">
                                    <span>Add Photo</span>
                                </div>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleImageUpload} 
                            accept="image/jpeg, image/png, image/webp" 
                        />
                    </div>
                    <h2 className="profile-name">{user.name}</h2>
                    <p className="profile-role">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                    
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-label">Member Since</span>
                            <span className="stat-value">{new Date(user.createdAt || Date.now()).getFullYear()}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-content">
                    <h1 className="profile-title">My Profile</h1>
                    <p className="profile-subtitle">Update your personal information and settings.</p>

                    <form className="profile-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                                    placeholder="10-digit number"
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input 
                                    type="text" 
                                    name="location"
                                    value={formData.location} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>

                        <h3 className="profile-section-title">Change Password</h3>
                        <p className="profile-section-desc">Leave blank if you don't want to change your password.</p>

                        <div className="form-row">
                            <div className="form-group">
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    name="password"
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {toast.message && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ message: '', type: '' })} 
                />
            )}
        </div>
    );
};

export default Profile;
