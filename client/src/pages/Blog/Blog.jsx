import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './Blog.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL.replace('/api', '')}${path}`;
};

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [featuredPost, setFeaturedPost] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchFeaturedPost();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [currentPage, selectedCategory]);

    const fetchFeaturedPost = async () => {
        try {
            const res = await fetch(`${API_URL}/blog/featured`);
            const data = await res.json();
            if (data.success && data.data) {
                setFeaturedPost(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch featured post', err);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
            const res = await fetch(`${API_URL}/blog?page=${currentPage}&limit=6${categoryParam}`);
            const data = await res.json();
            if (data.success) {
                setPosts(data.data || []);
                setTotalPages(data.totalPages || 1);
                setCategories(data.categories || []);
            }
        } catch (err) {
            console.error('Failed to fetch posts', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setCurrentPage(1);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="blog-page">
            <Navbar />
            <main>
                {/* Hero */}
                <section className="blog-hero">
                    <div className="container">
                        <h1>Our Blog</h1>
                        <p>Insights, tips, and stories from the world of herbal wellness</p>
                        <div className="breadcrumb">
                            <Link to="/">Home</Link> / <span>Blog</span>
                        </div>
                    </div>
                </section>

                <div className="blog-main container">
                    {/* Featured Post */}
                    {featuredPost && (
                        <Link to={`/blog/${featuredPost.slug}`} className="featured-post">
                            <div className="featured-post-image">
                                {featuredPost.coverImage ? (
                                    <img src={getImageUrl(featuredPost.coverImage)} alt={featuredPost.title} />
                                ) : (
                                    <div className="featured-placeholder">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                    </div>
                                )}
                            </div>
                            <div className="featured-post-content">
                                <span className="featured-label">FEATURED POST</span>
                                <h2 className="featured-title">{featuredPost.title}</h2>
                                <p className="featured-excerpt">{featuredPost.excerpt}</p>
                                <div className="featured-meta">
                                    <div className="featured-author">
                                        <div className="author-avatar">
                                            {featuredPost.author?.name?.charAt(0) || 'S'}
                                        </div>
                                        <span>{featuredPost.author?.name || 'SARA Team'}</span>
                                    </div>
                                    <span className="read-more-link">
                                        READ MORE <span className="arrow">→</span>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div className="blog-categories">
                            <button
                                className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('all')}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => handleCategoryChange(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Posts Grid */}
                    {loading ? (
                        <div className="posts-grid">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="post-card skeleton">
                                    <div className="post-card-image skeleton-img"></div>
                                    <div className="post-card-body">
                                        <div className="skeleton-line short"></div>
                                        <div className="skeleton-line"></div>
                                        <div className="skeleton-line"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="blog-empty">
                            <span className="empty-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </span>
                            <h3>No posts found</h3>
                            <p>Check back soon for new articles on herbal wellness!</p>
                        </div>
                    ) : (
                        <div className="posts-grid">
                            {posts.map(post => (
                                <Link to={`/blog/${post.slug}`} key={post._id} className="post-card">
                                    <div className="post-card-image">
                                        {post.coverImage ? (
                                            <img src={getImageUrl(post.coverImage)} alt={post.title} />
                                        ) : (
                                            <div className="post-placeholder">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="post-card-body">
                                        <span className="post-category">{post.category}</span>
                                        <h3 className="post-title">{post.title}</h3>
                                        <p className="post-excerpt">{post.excerpt}</p>
                                        <div className="post-meta">
                                            <span>{post.author?.name || 'SARA Team'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                {post.readTime || 1} min read
                                            </span>
                                        </div>
                                        <div className="read-more-link" style={{ marginTop: '1rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Read More <span>→</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="blog-pagination">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                ← Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={currentPage === page ? 'active' : ''}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Blog;
