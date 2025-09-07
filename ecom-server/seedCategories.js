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
        categoryName: 'Living Room',
        description: 'Complete living room furniture including sofas, coffee tables, and entertainment units',
        discount: 15,
        image: []
      },
      {
        categoryName: 'Bedroom',
        description: 'Bedroom furniture including beds, wardrobes, nightstands, and dressers',
        discount: 20,
        image: []
      },
      {
        categoryName: 'Dining Room',
        description: 'Dining furniture including tables, chairs, and storage cabinets',
        discount: 12,
        image: []
      },
      {
        categoryName: 'Office Furniture',
        description: 'Professional office furniture including desks, chairs, and filing cabinets',
        discount: 18,
        image: []
      },
      {
        categoryName: 'Storage & Organization',
        description: 'Storage solutions including wardrobes, shelving units, and organizers',
        discount: 10,
        image: []
      },
      {
        categoryName: 'Lighting',
        description: 'Indoor and outdoor lighting solutions including lamps and chandeliers',
        discount: 15,
        image: []
      },
      {
        categoryName: 'Decor & Accessories',
        description: 'Home decor items including rugs, cushions, and decorative pieces',
        discount: 25,
        image: []
      },
      {
        categoryName: 'Outdoor Furniture',
        description: 'Garden and patio furniture for outdoor living spaces',
        discount: 20,
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
