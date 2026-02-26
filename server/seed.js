const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');
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

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
