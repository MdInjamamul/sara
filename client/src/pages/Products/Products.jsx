import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './Products.css';

// Complete products data organized by categories
const products = [
    // ========== Medicinal Herbs (8 products) ==========
    {
        id: 1,
        name: 'Yarsagumba (Yarsha)',
        slug: 'yarsagumba-yarsha',
        price: 89.99,
        originalPrice: 119.99,
        image: '/assets/images/products/yarsagumba_yarsha.png',
        category: 'medicinal-herbs',
        isNew: true
    },
    {
        id: 2,
        name: 'Ginseng',
        slug: 'ginseng',
        price: 34.99,
        originalPrice: 44.99,
        image: '/assets/images/products/ginseng.png',
        category: 'medicinal-herbs',
        isNew: true
    },
    {
        id: 3,
        name: 'Shilajit',
        slug: 'shilajit',
        price: 49.99,
        originalPrice: null,
        image: '/assets/images/products/shilajit.png',
        category: 'medicinal-herbs',
        isNew: false
    },
    {
        id: 4,
        name: 'Ashwagandha',
        slug: 'ashwagandha',
        price: 24.99,
        originalPrice: 32.99,
        image: '/assets/images/products/ashwagandha.png',
        category: 'medicinal-herbs',
        isNew: true
    },
    {
        id: 5,
        name: 'Asparagus Powder',
        slug: 'asparagus-powder',
        price: 19.99,
        originalPrice: null,
        image: '/assets/images/products/asparagus_powder.png',
        category: 'medicinal-herbs',
        isNew: false
    },
    {
        id: 6,
        name: 'Mucuna',
        slug: 'mucuna',
        price: 27.99,
        originalPrice: 34.99,
        image: '/assets/images/products/mucuna.png',
        category: 'medicinal-herbs',
        isNew: true
    },
    {
        id: 7,
        name: 'Saw Palmetto',
        slug: 'saw-palmetto',
        price: 29.99,
        originalPrice: null,
        image: '/assets/images/products/saw_palmetto.png',
        category: 'medicinal-herbs',
        isNew: false
    },
    {
        id: 8,
        name: 'Brahmi',
        slug: 'brahmi',
        price: 22.99,
        originalPrice: 28.99,
        image: '/assets/images/products/brahmi.png',
        category: 'medicinal-herbs',
        isNew: true
    },

    // ========== Natural Essential Oils (8 products) ==========
    {
        id: 9,
        name: 'Rose Oil',
        slug: 'rose-oil',
        price: 24.50,
        originalPrice: 35.00,
        image: '/assets/images/products/rose_oil.png',
        category: 'essential-oils',
        isNew: true
    },
    {
        id: 10,
        name: 'Jasmine Oil',
        slug: 'jasmine-oil',
        price: 28.99,
        originalPrice: null,
        image: '/assets/images/products/jasmine_oil.png',
        category: 'essential-oils',
        isNew: true
    },
    {
        id: 11,
        name: 'Lavender Oil',
        slug: 'lavender-oil',
        price: 19.99,
        originalPrice: 24.99,
        image: '/assets/images/products/lavender_oil.png',
        category: 'essential-oils',
        isNew: false
    },
    {
        id: 12,
        name: 'Tea Tree Oil',
        slug: 'tea-tree-oil',
        price: 16.99,
        originalPrice: null,
        image: '/assets/images/products/tea_tree_oil.png',
        category: 'essential-oils',
        isNew: true
    },
    {
        id: 13,
        name: 'Orange Peel Oil',
        slug: 'orange-peel-oil',
        price: 14.99,
        originalPrice: 18.99,
        image: '/assets/images/products/orange_peel_oil.png',
        category: 'essential-oils',
        isNew: false
    },
    {
        id: 14,
        name: 'Basil Oil',
        slug: 'basil-oil',
        price: 17.99,
        originalPrice: null,
        image: '/assets/images/products/basil_oil.png',
        category: 'essential-oils',
        isNew: true
    },
    {
        id: 15,
        name: 'Mint Oil',
        slug: 'mint-oil',
        price: 15.99,
        originalPrice: 19.99,
        image: '/assets/images/products/mint_oil.png',
        category: 'essential-oils',
        isNew: false
    },
    {
        id: 16,
        name: 'Eucalyptus Oil',
        slug: 'eucalyptus-oil',
        price: 18.99,
        originalPrice: null,
        image: '/assets/images/products/eucalyptus_oil.png',
        category: 'essential-oils',
        isNew: true
    },

    // ========== Natural Herbal Oils (8 products) ==========
    {
        id: 17,
        name: 'Black Seed Oil',
        slug: 'black-seed-oil',
        price: 22.99,
        originalPrice: 28.99,
        image: '/assets/images/products/black_seed_oil.png',
        category: 'herbal-oils',
        isNew: true
    },
    {
        id: 18,
        name: 'Flax Seed Oil',
        slug: 'flax-seed-oil',
        price: 19.99,
        originalPrice: null,
        image: '/assets/images/products/flax_seed_oil.png',
        category: 'herbal-oils',
        isNew: false
    },
    {
        id: 19,
        name: 'Hemp Seed Oil',
        slug: 'hemp-seed-oil',
        price: 24.99,
        originalPrice: 32.99,
        image: '/assets/images/products/hemp_seed_oil.png',
        category: 'herbal-oils',
        isNew: true
    },
    {
        id: 20,
        name: 'Fenugreek Seed Oil',
        slug: 'fenugreek-seed-oil',
        price: 21.99,
        originalPrice: null,
        image: '/assets/images/products/flax_seed_oil.png',
        category: 'herbal-oils',
        isNew: false
    },
    {
        id: 21,
        name: 'Almond Oil',
        slug: 'almond-oil',
        price: 18.99,
        originalPrice: 24.99,
        image: '/assets/images/products/flax_seed_oil.png',
        category: 'herbal-oils',
        isNew: true
    },
    {
        id: 22,
        name: 'Castor Oil',
        slug: 'castor-oil',
        price: 14.99,
        originalPrice: null,
        image: '/assets/images/products/black_seed_oil.png',
        category: 'herbal-oils',
        isNew: false
    },
    {
        id: 23,
        name: 'Neem Oil',
        slug: 'neem-oil',
        price: 16.99,
        originalPrice: 21.99,
        image: '/assets/images/products/hemp_seed_oil.png',
        category: 'herbal-oils',
        isNew: true
    },
    {
        id: 24,
        name: 'Extra Virgin Coconut Oil',
        slug: 'extra-virgin-coconut-oil',
        price: 19.99,
        originalPrice: null,
        image: '/assets/images/products/flax_seed_oil.png',
        category: 'herbal-oils',
        isNew: false
    },

    // ========== Natural Organic Super Foods (8 products) ==========
    {
        id: 25,
        name: 'Chia Seeds',
        slug: 'chia-seeds',
        price: 12.99,
        originalPrice: 16.99,
        image: '/assets/images/products/chia_seeds.png',
        category: 'superfoods',
        isNew: true
    },
    {
        id: 26,
        name: 'Flax Seeds',
        slug: 'flax-seeds',
        price: 9.99,
        originalPrice: null,
        image: '/assets/images/products/chia_seeds.png',
        category: 'superfoods',
        isNew: false
    },
    {
        id: 27,
        name: 'Pumpkin Seeds',
        slug: 'pumpkin-seeds',
        price: 11.99,
        originalPrice: 14.99,
        image: '/assets/images/products/chia_seeds.png',
        category: 'superfoods',
        isNew: true
    },
    {
        id: 28,
        name: 'Quinoa',
        slug: 'quinoa',
        price: 14.99,
        originalPrice: null,
        image: '/assets/images/products/chia_seeds.png',
        category: 'superfoods',
        isNew: false
    },
    {
        id: 29,
        name: 'Hemp Seeds',
        slug: 'hemp-seeds',
        price: 15.99,
        originalPrice: 19.99,
        image: '/assets/images/products/chia_seeds.png',
        category: 'superfoods',
        isNew: true
    },
    {
        id: 30,
        name: 'Moringa Powder',
        slug: 'moringa-powder',
        price: 18.99,
        originalPrice: null,
        image: '/assets/images/products/asparagus_powder.png',
        category: 'superfoods',
        isNew: true
    },
    {
        id: 31,
        name: 'Hemp Powder',
        slug: 'hemp-powder',
        price: 21.99,
        originalPrice: 27.99,
        image: '/assets/images/products/asparagus_powder.png',
        category: 'superfoods',
        isNew: false
    },
    {
        id: 32,
        name: 'Protein Powder',
        slug: 'protein-powder',
        price: 34.99,
        originalPrice: null,
        image: '/assets/images/products/asparagus_powder.png',
        category: 'superfoods',
        isNew: true
    },

    // ========== Natural Cosmetics (8 products) ==========
    {
        id: 33,
        name: 'Natural Medicated Shampoo',
        slug: 'natural-medicated-shampoo',
        price: 15.99,
        originalPrice: 21.99,
        image: '/assets/images/products/natural_shampoo.png',
        category: 'cosmetics',
        isNew: true
    },
    {
        id: 34,
        name: 'Natural Soaps',
        slug: 'natural-soaps',
        price: 8.99,
        originalPrice: null,
        image: '/assets/images/products/basil_soap.png',
        category: 'cosmetics',
        isNew: false
    },
    {
        id: 35,
        name: 'Natural Face Wash',
        slug: 'natural-face-wash',
        price: 12.99,
        originalPrice: 16.99,
        image: '/assets/images/products/natural_shampoo.png',
        category: 'cosmetics',
        isNew: true
    },
    {
        id: 36,
        name: 'Natural Scrubs',
        slug: 'natural-scrubs',
        price: 14.99,
        originalPrice: null,
        image: '/assets/images/products/orange_peel_powder.png',
        category: 'cosmetics',
        isNew: false
    },
    {
        id: 37,
        name: 'Natural Hair Serum',
        slug: 'natural-hair-serum',
        price: 19.99,
        originalPrice: 24.99,
        image: '/assets/images/products/natural_shampoo.png',
        category: 'cosmetics',
        isNew: true
    },
    {
        id: 38,
        name: 'Natural Face Serum',
        slug: 'natural-face-serum',
        price: 24.99,
        originalPrice: null,
        image: '/assets/images/products/natural_shampoo.png',
        category: 'cosmetics',
        isNew: true
    },
    {
        id: 39,
        name: 'Orange Peel Powder',
        slug: 'orange-peel-powder',
        price: 9.99,
        originalPrice: 12.99,
        image: '/assets/images/products/orange_peel_powder.png',
        category: 'cosmetics',
        isNew: false
    },
    {
        id: 40,
        name: 'Henna Powder',
        slug: 'henna-powder',
        price: 11.99,
        originalPrice: null,
        image: '/assets/images/products/henna_powder.png',
        category: 'cosmetics',
        isNew: true
    },

    // ========== Natural Organic Spices (8 products) ==========
    {
        id: 41,
        name: 'Turmeric Powder',
        slug: 'turmeric-powder',
        price: 8.99,
        originalPrice: 11.99,
        image: '/assets/images/products/turmeric_powder.png',
        category: 'spices',
        isNew: true
    },
    {
        id: 42,
        name: 'Cinnamon Sticks',
        slug: 'cinnamon-sticks',
        price: 7.99,
        originalPrice: null,
        image: '/assets/images/products/cinnamon.png',
        category: 'spices',
        isNew: false
    },
    {
        id: 43,
        name: 'Black Pepper',
        slug: 'black-pepper',
        price: 6.99,
        originalPrice: 8.99,
        image: '/assets/images/products/cumin_seeds.png',
        category: 'spices',
        isNew: true
    },
    {
        id: 44,
        name: 'Cumin Seeds',
        slug: 'cumin-seeds',
        price: 5.99,
        originalPrice: null,
        image: '/assets/images/products/cumin_seeds.png',
        category: 'spices',
        isNew: false
    },
    {
        id: 45,
        name: 'Cardamom',
        slug: 'cardamom',
        price: 12.99,
        originalPrice: 16.99,
        image: '/assets/images/products/cinnamon_spices.png',
        category: 'spices',
        isNew: true
    },
    {
        id: 46,
        name: 'Cloves',
        slug: 'cloves',
        price: 9.99,
        originalPrice: null,
        image: '/assets/images/products/cinnamon.png',
        category: 'spices',
        isNew: false
    },
    {
        id: 47,
        name: 'Garam Masala',
        slug: 'garam-masala',
        price: 8.99,
        originalPrice: 11.99,
        image: '/assets/images/products/cinnamon_spices.png',
        category: 'spices',
        isNew: true
    },
    {
        id: 48,
        name: 'Saffron',
        slug: 'saffron',
        price: 29.99,
        originalPrice: null,
        image: '/assets/images/products/turmeric_powder.png',
        category: 'spices',
        isNew: true
    },

    // ========== Spiritual Items (8 products) ==========
    {
        id: 49,
        name: 'Incense Sticks',
        slug: 'incense-sticks',
        price: 6.99,
        originalPrice: 8.99,
        image: '/assets/images/products/incense_sticks.png',
        category: 'spiritual-items',
        isNew: true
    },
    {
        id: 50,
        name: 'Meditation Candles',
        slug: 'meditation-candles',
        price: 12.99,
        originalPrice: null,
        image: '/assets/images/products/candles.png',
        category: 'spiritual-items',
        isNew: false
    },
    {
        id: 51,
        name: 'Singing Bowl',
        slug: 'singing-bowl',
        price: 49.99,
        originalPrice: 64.99,
        image: '/assets/images/products/singing_bowl.png',
        category: 'spiritual-items',
        isNew: true
    },
    {
        id: 52,
        name: 'Prayer Beads',
        slug: 'prayer-beads',
        price: 14.99,
        originalPrice: null,
        image: '/assets/images/products/prayer_beeds.png',
        category: 'spiritual-items',
        isNew: true
    },
    {
        id: 53,
        name: 'Essential Oil Diffuser',
        slug: 'essential-oil-diffuser',
        price: 34.99,
        originalPrice: 44.99,
        image: '/assets/images/products/candles.png',
        category: 'spiritual-items',
        isNew: false
    },
    {
        id: 54,
        name: 'Sage Smudge Bundle',
        slug: 'sage-smudge-bundle',
        price: 9.99,
        originalPrice: null,
        image: '/assets/images/products/incense_sticks.png',
        category: 'spiritual-items',
        isNew: true
    },
    {
        id: 55,
        name: 'Crystal Set',
        slug: 'crystal-set',
        price: 39.99,
        originalPrice: 49.99,
        image: '/assets/images/products/singing_bowl.png',
        category: 'spiritual-items',
        isNew: false
    },
    {
        id: 56,
        name: 'Meditation Cushion',
        slug: 'meditation-cushion',
        price: 29.99,
        originalPrice: null,
        image: '/assets/images/products/prayer_beeds.png',
        category: 'spiritual-items',
        isNew: true
    },

    // ========== Sara Nursery (8 products) ==========
    {
        id: 57,
        name: 'Aloe Vera Plant',
        slug: 'aloe-vera-plant',
        price: 14.99,
        originalPrice: 19.99,
        image: '/assets/images/products/aloe_vera_plant.png',
        category: 'nursery',
        isNew: true
    },
    {
        id: 58,
        name: 'Tulsi Plant',
        slug: 'tulsi-plant',
        price: 9.99,
        originalPrice: null,
        image: '/assets/images/products/tulsi_plant.png',
        category: 'nursery',
        isNew: false
    },
    {
        id: 59,
        name: 'Lavender Plant',
        slug: 'lavender-plant',
        price: 12.99,
        originalPrice: 16.99,
        image: '/assets/images/products/tulsi_plant.png',
        category: 'nursery',
        isNew: true
    },
    {
        id: 60,
        name: 'Money Plant',
        slug: 'money-plant',
        price: 8.99,
        originalPrice: null,
        image: '/assets/images/products/peace_lily_plant.png',
        category: 'nursery',
        isNew: false
    },
    {
        id: 61,
        name: 'Snake Plant',
        slug: 'snake-plant',
        price: 16.99,
        originalPrice: 21.99,
        image: '/assets/images/products/aloe_vera_plant.png',
        category: 'nursery',
        isNew: true
    },
    {
        id: 62,
        name: 'Rosemary Plant',
        slug: 'rosemary-plant',
        price: 11.99,
        originalPrice: null,
        image: '/assets/images/products/tulsi_plant.png',
        category: 'nursery',
        isNew: false
    },
    {
        id: 63,
        name: 'Jade Plant',
        slug: 'jade-plant',
        price: 13.99,
        originalPrice: 17.99,
        image: '/assets/images/products/peace_lily_plant.png',
        category: 'nursery',
        isNew: true
    },
    {
        id: 64,
        name: 'Peace Lily',
        slug: 'peace-lily',
        price: 18.99,
        originalPrice: null,
        image: '/assets/images/products/peace_lily_plant.png',
        category: 'nursery',
        isNew: true
    }
];

const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'medicinal-herbs', label: 'Medicinal Herbs' },
    { value: 'essential-oils', label: 'Natural Essential Oils' },
    { value: 'herbal-oils', label: 'Natural Herbal Oils' },
    { value: 'superfoods', label: 'Natural Organic Super Foods' },
    { value: 'cosmetics', label: 'Natural Cosmetics' },
    { value: 'spices', label: 'Natural Organic Spices' },
    { value: 'spiritual-items', label: 'Spiritual Items' },
    { value: 'nursery', label: 'Sara Nursery' }
];

const Products = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const selectedCategoryLabel = categories.find(c => c.value === selectedCategory)?.label || 'All Products';

    return (
        <div className="products-page">
            <Navbar />

            <main className="products-main">
                <div className="container">
                    <h1 className="products-title">{selectedCategoryLabel}</h1>

                    <div className="products-header">
                        <p className="products-count">Showing {filteredProducts.length} Results</p>

                        <div className="products-filter">
                            <div
                                className={`filter-dropdown ${isDropdownOpen ? 'open' : ''}`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span>{selectedCategoryLabel}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>

                                {isDropdownOpen && (
                                    <ul className="dropdown-menu">
                                        {categories.map(cat => (
                                            <li
                                                key={cat.value}
                                                className={selectedCategory === cat.value ? 'active' : ''}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCategory(cat.value);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {cat.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="product-image">
                                    {product.isNew && <span className="product-badge">New</span>}
                                    <img src={product.image} alt={product.name} />
                                    <button className="product-buy-btn">Buy now</button>
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{product.name}</h3>
                                    <div className="product-price">
                                        <span className="current-price">$ {product.price.toFixed(2)} USD</span>
                                        {product.originalPrice && (
                                            <span className="original-price">$ {product.originalPrice.toFixed(2)} USD</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Products;
