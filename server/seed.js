require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const TrendingConfig = require('./models/TrendingConfig');
const HeroConfig = require('./models/HeroConfig');
const { categories, products } = require('./data/seedData');

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});

        console.log('Cleared existing data...');

        // Insert categories
        const createdCategories = await Category.insertMany(categories);
        console.log(`Inserted ${createdCategories.length} categories`);

        // Create a map of category slugs to ObjectIds
        const categoryMap = {};
        createdCategories.forEach(cat => {
            categoryMap[cat.slug] = cat._id;
        });

        // Add category ObjectId to each product
        const productsWithCategory = products.map(product => ({
            ...product,
            category: categoryMap[product.categorySlug]
        }));

        // Insert products
        const createdProducts = await Product.insertMany(productsWithCategory);
        console.log(`Inserted ${createdProducts.length} products`);

        // Update product count for each category
        for (const cat of createdCategories) {
            const count = await Product.countDocuments({ category: cat._id });
            await Category.findByIdAndUpdate(cat._id, { productCount: count });
        }
        console.log('Updated product counts for categories');
        
        // Seed TrendingConfig
        await TrendingConfig.deleteMany({});
        let trendingProducts = [];
        const categoriesSlugs = ['medicinal-herbs', 'cosmetics', 'essential-oils', 'herbal-oils', 'spices', 'superfoods', 'nursery', 'spiritual-items'];
        for (const slug of categoriesSlugs) {
            const prod = await Product.findOne({ categorySlug: slug });
            if (prod) trendingProducts.push(prod._id);
        }
        const additional = await Product.findOne({ categorySlug: 'medicinal-herbs', _id: { $nin: trendingProducts } });
        if (additional) trendingProducts.push(additional._id);

        if (trendingProducts.length > 0) {
            await TrendingConfig.create({ products: trendingProducts });
            console.log('Seeded Trending Config');
        }

        // Seed admin user
        const existingAdmin = await User.findOne({ email: 'admin123@gmail.com' });
        if (!existingAdmin) {
            const adminUser = new User({
                name: 'Admin',
                email: 'admin123@gmail.com',
                password: 'Admin@123',
                role: 'admin'
            });
            await adminUser.save();
            console.log('Admin user seeded successfully');
        } else {
            console.log('Admin user already exists');
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
