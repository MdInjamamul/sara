import { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './TrendingProducts.css';

// Sample data for initial display
const sampleProducts = [
    {
        _id: '1',
        name: 'Yarsagumba (Yarsha)',
        slug: 'yarsagumba-yarsha',
        shortDescription: 'Premium Himalayan Cordyceps for energy and vitality',
        price: 15000,
        discountPrice: 12999,
        categorySlug: 'medicinal-herbs',
        images: ['/assets/images/products/yarsagumba_yarsha.png'],
        isNew: false,
        isBestseller: true
    },
    {
        _id: '2',
        name: 'Rose Oil',
        slug: 'rose-oil',
        shortDescription: 'Premium rose essential oil for skin and aromatherapy',
        price: 2500,
        discountPrice: null,
        categorySlug: 'essential-oils',
        images: ['/assets/images/products/rose_oil.png'],
        isNew: false,
        isBestseller: true
    },
    {
        _id: '3',
        name: 'Ginseng',
        slug: 'ginseng',
        shortDescription: 'Natural energy booster and stress reliever',
        price: 2500,
        discountPrice: null,
        categorySlug: 'medicinal-herbs',
        images: ['/assets/images/products/ginseng.png'],
        isNew: true,
        isBestseller: false
    },
    {
        _id: '4',
        name: 'Black Seed Oil',
        slug: 'black-seed-oil',
        shortDescription: 'The blessed seed oil for immunity and wellness',
        price: 1800,
        discountPrice: 1499,
        categorySlug: 'herbal-oils',
        images: ['/assets/images/products/black_seed_oil.png'],
        isNew: false,
        isBestseller: true
    },
    {
        _id: '5',
        name: 'Lavender Oil',
        slug: 'lavender-oil',
        shortDescription: 'Calming lavender oil for sleep and relaxation',
        price: 1200,
        discountPrice: 999,
        categorySlug: 'essential-oils',
        images: ['/assets/images/products/lavender_oil.png'],
        isNew: false,
        isBestseller: true
    },
    {
        _id: '6',
        name: 'Shilajit',
        slug: 'shilajit',
        shortDescription: 'Himalayan mineral resin for strength and rejuvenation',
        price: 3500,
        discountPrice: 2999,
        categorySlug: 'medicinal-herbs',
        images: ['/assets/images/products/shilajit.png'],
        isNew: false,
        isBestseller: true
    }
];

const TrendingProducts = () => {
    const [products, setProducts] = useState(sampleProducts);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch trending products from API
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/products/trending');
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setProducts(data);
                    }
                }
            } catch (error) {
                console.log('Using sample products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <section className="trending-products">
            <div className="container">
                <div className="section-header">
                    <h2>Organic products that are currently trending</h2>
                    <p>Discover our most popular products loved by customers worldwide</p>
                </div>

                <div className="trending-products-grid">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>

                <div className="trending-products-footer">
                    <a href="/shop" className="btn btn-secondary">
                        View All Products
                    </a>
                </div>
            </div>
        </section>
    );
};

export default TrendingProducts;
