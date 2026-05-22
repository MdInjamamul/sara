import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Toast from '../../components/Toast/Toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../pages/AdminDashboard/AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL.replace('/api', '')}${path}`;
};

// Define outside component to prevent re-renders
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
    ]
};

const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block', 'list', 'indent',
    'link', 'image', 'color', 'background', 'align'
];

const BlogManager = () => {
    const { token } = useAuth();

    // List state
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [view, setView] = useState('list'); // 'list' | 'editor'
    const [deleteId, setDeleteId] = useState(null);

    // Editor state
    const [editingPost, setEditingPost] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [coverImagePreview, setCoverImagePreview] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [status, setStatus] = useState('draft');
    const [isFeatured, setIsFeatured] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (view === 'list') fetchPosts();
    }, [view, token]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/blog?status=all&limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setPosts(data.data || []);
        } catch (err) {
            console.error('Failed to fetch posts', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingPost(null);
        setTitle('');
        setContent('');
        setExcerpt('');
        setCoverImage('');
        setCoverImagePreview('');
        setCategory('');
        setTags('');
        setStatus('draft');
        setIsFeatured(false);
    };

    const handleNewPost = () => {
        resetForm();
        setView('editor');
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setTitle(post.title);
        setContent(post.content);
        setExcerpt(post.excerpt || '');
        setCoverImage(post.coverImage || '');
        setCoverImagePreview(post.coverImage ? getImageUrl(post.coverImage) : '');
        setCategory(post.category);
        setTags(post.tags ? post.tags.join(', ') : '');
        setStatus(post.status);
        setIsFeatured(post.isFeatured);
        setView('editor');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                const filePath = data.imageUrl || data.filePath || data.path || data.url;
                setCoverImage(filePath);
                setCoverImagePreview(getImageUrl(filePath));
            } else {
                setToast({ message: 'Failed to upload image', type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'Image upload failed', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim() || !category.trim()) {
            setToast({ message: 'Title, content, and category are required', type: 'error' });
            return;
        }

        setSaving(true);
        const body = {
            title,
            content,
            excerpt,
            coverImage,
            category,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            status,
            isFeatured
        };

        try {
            const url = editingPost ? `${API_URL}/blog/${editingPost._id}` : `${API_URL}/blog`;
            const method = editingPost ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok) {
                setToast({ message: data.message || 'Post saved successfully!', type: 'success' });
                resetForm();
                setView('list');
            } else {
                setToast({ message: data.message || 'Failed to save post', type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'An error occurred while saving', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`${API_URL}/blog/${deleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPosts(prev => prev.filter(p => p._id !== deleteId));
                setToast({ message: 'Post deleted successfully', type: 'success' });
            } else {
                setToast({ message: 'Failed to delete post', type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'Delete failed', type: 'error' });
        } finally {
            setDeleteId(null);
        }
    };

    const handleToggleFeatured = async (postId) => {
        try {
            const res = await fetch(`${API_URL}/blog/${postId}/featured`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setPosts(prev => prev.map(p => ({
                    ...p,
                    isFeatured: p._id === postId ? data.data.isFeatured : (data.data.isFeatured ? false : p.isFeatured)
                })));
                setToast({ message: data.message, type: 'success' });
            }
        } catch (err) {
            setToast({ message: 'Failed to toggle featured', type: 'error' });
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    // Stats
    const totalPosts = posts.length;
    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.filter(p => p.status === 'draft').length;
    const featuredCount = posts.filter(p => p.isFeatured).length;

    return (
        <AdminLayout>
            {view === 'list' ? (
                <>
                    {/* Header */}
                    <div className="admin-header-flex">
                        <h1 className="admin-title">Blog Manager</h1>
                        <button className="add-product-btn" onClick={handleNewPost}>+ New Post</button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Total Posts', value: totalPosts, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>, color: '#3b82f6' },
                            { label: 'Published', value: publishedCount, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>, color: '#10b981' },
                            { label: 'Drafts', value: draftCount, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>, color: '#f59e0b' },
                            { label: 'Featured', value: featuredCount, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#8b5cf6" stroke="#8b5cf6" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>, color: '#8b5cf6' }
                        ].map(s => (
                            <div key={s.label} style={{
                                background: 'var(--color-bg-light)', border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading posts...</div>
                    ) : posts.length === 0 ? (
                        <div className="empty-state">
                            <p>No blog posts yet. Click "New Post" to create your first article!</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Cover</th>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Featured</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map(post => (
                                        <tr key={post._id}>
                                            <td>
                                                <div style={{
                                                    width: 50, height: 50, borderRadius: 'var(--radius-sm)',
                                                    overflow: 'hidden', background: 'var(--color-bg-light)'
                                                }}>
                                                    {post.coverImage ? (
                                                        <img src={getImageUrl(post.coverImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="table-name">{post.title}</td>
                                            <td><span className="category-badge">{post.category}</span></td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                                                    color: '#fff', textTransform: 'capitalize',
                                                    background: post.status === 'published' ? '#10b981' : '#f59e0b'
                                                }}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleToggleFeatured(post._id)}
                                                    title={post.isFeatured ? 'Remove from featured' : 'Set as featured'}
                                                    style={{
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        fontSize: '1.3rem', opacity: post.isFeatured ? 1 : 0.3,
                                                        transition: 'opacity 0.2s'
                                                    }}
                                                >
                                                    ⭐
                                                </button>
                                            </td>
                                            <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{formatDate(post.createdAt)}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="admin-btn edit-btn" onClick={() => handleEdit(post)}>Edit</button>
                                                    <button className="admin-btn delete-btn" onClick={() => setDeleteId(post._id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Editor View */}
                    <div className="admin-header-flex">
                        <h1 className="admin-title">{editingPost ? 'Edit Post' : 'Create New Post'}</h1>
                        <button className="admin-btn" onClick={() => { resetForm(); setView('list'); }}
                            style={{ background: 'var(--color-bg-light)', border: '1px solid var(--color-border)' }}>
                            ← Back to Posts
                        </button>
                    </div>

                    <div style={{
                        background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                        padding: '2rem', marginTop: '1rem'
                    }}>
                        {/* Title */}
                        <input
                            type="text"
                            placeholder="Post title..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem 0', fontSize: '1.5rem', fontWeight: 700,
                                border: 'none', borderBottom: '2px solid var(--color-border)', outline: 'none',
                                fontFamily: 'var(--font-heading)', marginBottom: '1.5rem',
                                background: 'transparent'
                            }}
                        />

                        {/* Category + Tags */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-text-muted)' }}>Category *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Herbal Wellness"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-text-muted)' }}>Tags (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. herbs, wellness, ayurveda"
                                    value={tags}
                                    onChange={e => setTags(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Cover Image</label>
                            {coverImagePreview && (
                                <div style={{ position: 'relative', marginBottom: '0.75rem', display: 'inline-block' }}>
                                    <img src={coverImagePreview} alt="Cover" style={{
                                        maxHeight: 200, borderRadius: 'var(--radius-sm)', objectFit: 'cover', display: 'block'
                                    }} />
                                    <button onClick={() => { setCoverImage(''); setCoverImagePreview(''); }}
                                        style={{
                                            position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff',
                                            border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
                                            fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>✕</button>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <label style={{
                                    padding: '0.5rem 1rem', background: 'var(--color-bg-light)', border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500
                                }}>
                                    {uploading ? 'Uploading...' : 'Choose Image'}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                                </label>
                                {!coverImagePreview && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>JPG, PNG, WebP supported</span>}
                            </div>
                        </div>

                        {/* React Quill Editor */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Content *</label>
                            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                                <ReactQuill
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Write your blog post..."
                                    style={{ minHeight: 300 }}
                                />
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-text-muted)' }}>Excerpt</label>
                            <textarea
                                placeholder="Brief summary of the post. Auto-generated from content if left empty."
                                value={excerpt}
                                onChange={e => setExcerpt(e.target.value)}
                                rows={3}
                                style={{
                                    width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '0.9rem',
                                    fontFamily: 'inherit', resize: 'vertical'
                                }}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                Leave empty to auto-generate from content
                            </span>
                        </div>

                        {/* Status + Featured + Save */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {/* Status Toggle */}
                                <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                    <button onClick={() => setStatus('draft')}
                                        style={{
                                            padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                                            fontWeight: 600, fontFamily: 'inherit',
                                            background: status === 'draft' ? '#f59e0b' : 'var(--color-bg-light)',
                                            color: status === 'draft' ? '#fff' : 'var(--color-text-muted)'
                                        }}>Draft</button>
                                    <button onClick={() => setStatus('published')}
                                        style={{
                                            padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                                            fontWeight: 600, fontFamily: 'inherit',
                                            background: status === 'published' ? '#10b981' : 'var(--color-bg-light)',
                                            color: status === 'published' ? '#fff' : 'var(--color-text-muted)'
                                        }}>Published</button>
                                </div>

                                {/* Featured Checkbox */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                                    Featured
                                </label>
                            </div>

                            <button onClick={handleSave} disabled={saving}
                                className="add-product-btn"
                                style={{ minWidth: 160 }}>
                                {saving ? 'Saving...' : (editingPost ? 'Update Post' : 'Publish Post')}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="delete-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Delete Blog Post</h3>
                        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
                        <div className="delete-modal-actions">
                            <button className="admin-btn" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="admin-btn delete-btn" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />}
        </AdminLayout>
    );
};

export default BlogManager;
