import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './BlogPost.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL.replace('/api', '')}${path}`;
};

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPost();
        window.scrollTo(0, 0);
    }, [slug]);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/blog/${slug}`);
            const data = await res.json();
            if (data.success) {
                setPost(data.data);
                setRelatedPosts(data.relatedPosts || []);
            }
        } catch (err) {
            console.error('Failed to fetch post', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="blogpost-page">
                <Navbar />
                <main>
                    <div className="blogpost-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading article...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="blogpost-page">
                <Navbar />
                <main>
                    <div className="blogpost-not-found">
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></span>
                        <h2>Post not found</h2>
                        <p>The article you're looking for doesn't exist or has been removed.</p>
                        <Link to="/blog" className="back-link">← Back to Blog</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="blogpost-page">
            <Navbar />
            <main>
                {/* Breadcrumb */}
                <section className="blogpost-hero">
                    <div className="container">
                        <div className="breadcrumb">
                            <Link to="/">Home</Link> / <Link to="/blog">Blog</Link> / <span>{post.title}</span>
                        </div>
                    </div>
                </section>

                {/* Cover Image */}
                {post.coverImage && (
                    <div className="blogpost-cover">
                        <img src={getImageUrl(post.coverImage)} alt={post.title} />
                    </div>
                )}

                {/* Content */}
                <article className="blogpost-container">
                    <span className="blogpost-category">{post.category}</span>
                    <h1 className="blogpost-title">{post.title}</h1>

                    <div className="blogpost-meta">
                        <div className="blogpost-author-info">
                            <div className="blogpost-avatar">
                                {post.author?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                                <span className="author-name">{post.author?.name || 'SARA Team'}</span>
                                <span className="post-date">{formatDate(post.createdAt)}</span>
                            </div>
                        </div>
                        <span className="blogpost-readtime" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {post.readTime || 1} min read
                        </span>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="blogpost-tags">
                            {post.tags.map((tag, i) => (
                                <span key={i} className="tag-pill">{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Article Body */}
                    <div
                        className="blogpost-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Author Card */}
                    <div className="author-card">
                        <div className="author-card-avatar">
                            {post.author?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <span className="author-card-label">Written by</span>
                            <span className="author-card-name">{post.author?.name || 'SARA Team'}</span>
                        </div>
                    </div>

                    <Link to="/blog" className="back-to-blog">← Back to Blog</Link>
                </article>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="related-posts">
                        <div className="container">
                            <h2>Related Posts</h2>
                            <div className="related-grid">
                                {relatedPosts.map(rp => (
                                    <Link to={`/blog/${rp.slug}`} key={rp._id} className="related-card">
                                        <div className="related-card-image">
                                            {rp.coverImage ? (
                                                <img src={getImageUrl(rp.coverImage)} alt={rp.title} />
                                            ) : (
                                                <div className="related-placeholder">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="related-card-body">
                                            <span className="related-category">{rp.category}</span>
                                            <h3>{rp.title}</h3>
                                            <span className="related-meta">{rp.readTime || 1} min read</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default BlogPost;
