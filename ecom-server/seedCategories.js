const mongoose = require('mongoose');
const ProductCategory = require('./src/product/productCategory.model');

// Database connection
const connectToDatabase = async () => {
  const { mongoURI } = require('./config/config');
  try {
    await mongoose.connect(mongoURI);
    console.log('DB connection established');
  } catch (error) {
    console.error('DB connection error:', error.message);
    process.exit(1);
  }
};

// Seed categories
const seedCategories = async () => {
  try {
    // Check if categories already exist
    const existingCategories = await ProductCategory.find();
    if (existingCategories.length > 0) {
      console.log('Categories already exist:', existingCategories.length);
      return;
    }

    const categories = [
      {
        categoryName: 'Furniture',
        description: 'Home and office furniture including chairs, tables, and storage solutions',
        discount: 10,
        image: []
      },
      {
        categoryName: 'Electronics',
        description: 'Electronic devices and gadgets including phones, laptops, and accessories',
        discount: 5,
        image: []
      },
      {
        categoryName: 'Clothing',
        description: 'Fashion and apparel for men, women, and children',
        discount: 15,
        image: []
      },
      {
        categoryName: 'Home & Garden',
        description: 'Home improvement and garden supplies including tools and decorations',
        discount: 8,
        image: []
      },
      {
        categoryName: 'Sports & Outdoors',
        description: 'Sports equipment and outdoor gear for active lifestyles',
        discount: 12,
        image: []
      },
      {
        categoryName: 'Books & Media',
        description: 'Books, movies, music, and educational materials',
        discount: 20,
        image: []
      },
      {
        categoryName: 'Health & Beauty',
        description: 'Health and beauty products including skincare and wellness items',
        discount: 18,
        image: []
      },
      {
        categoryName: 'Toys & Games',
        description: 'Toys and gaming products for all ages',
        discount: 25,
        image: []
      }
    ];

    await ProductCategory.insertMany(categories);
    console.log('Categories seeded successfully!');
    
    // Display created categories
    const createdCategories = await ProductCategory.find();
    console.log('Created categories:');
    createdCategories.forEach(cat => {
      console.log(`- ${cat.categoryName} (ID: ${cat._id})`);
    });
    
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

// Run the script
const run = async () => {
  await connectToDatabase();
  await seedCategories();
  process.exit(0);
};

run();
