const mongoose = require('mongoose');
const Category = require('./src/product/category.model');
const Product = require('./src/product/product.model');
const ProductVariant = require('./src/product/productVariant.model');
const { mongoURI } = require('./config/config');

// Sample categories data
const categoriesData = [
  // Electronics
  {
    name: "Electronics",
    description: "Electronic devices and gadgets",
    level: 0,
    sortOrder: 1,
    subcategories: [
      {
        name: "Smartphones",
        description: "Mobile phones and smartphones",
        level: 1,
        sortOrder: 1
      },
      {
        name: "Laptops",
        description: "Laptops and notebooks",
        level: 1,
        sortOrder: 2
      },
      {
        name: "Tablets",
        description: "Tablets and iPads",
        level: 1,
        sortOrder: 3
      },
      {
        name: "Audio",
        description: "Headphones, speakers, and audio devices",
        level: 1,
        sortOrder: 4
      }
    ]
  },
  
  // Clothing
  {
    name: "Clothing",
    description: "Fashion and apparel",
    level: 0,
    sortOrder: 2,
    subcategories: [
      {
        name: "Men's Clothing",
        description: "Clothing for men",
        level: 1,
        sortOrder: 1
      },
      {
        name: "Women's Clothing",
        description: "Clothing for women",
        level: 1,
        sortOrder: 2
      },
      {
        name: "Kids Clothing",
        description: "Clothing for children",
        level: 1,
        sortOrder: 3
      }
    ]
  },

  // Home & Kitchen
  {
    name: "Home & Kitchen",
    description: "Home improvement and kitchen essentials",
    level: 0,
    sortOrder: 3,
    subcategories: [
      {
        name: "Kitchen Appliances",
        description: "Kitchen tools and appliances",
        level: 1,
        sortOrder: 1
      },
      {
        name: "Home Decor",
        description: "Decorative items for home",
        level: 1,
        sortOrder: 2
      },
      {
        name: "Furniture",
        description: "Home and office furniture",
        level: 1,
        sortOrder: 3
      }
    ]
  },

  // Books
  {
    name: "Books",
    description: "Books and educational materials",
    level: 0,
    sortOrder: 4,
    subcategories: [
      {
        name: "Fiction",
        description: "Fiction books and novels",
        level: 1,
        sortOrder: 1
      },
      {
        name: "Non-Fiction",
        description: "Non-fiction books",
        level: 1,
        sortOrder: 2
      },
      {
        name: "Educational",
        description: "Educational and academic books",
        level: 1,
        sortOrder: 3
      }
    ]
  }
];

// Sample products data
const sampleProducts = [
  {
    title: "iPhone 15 Pro",
    subtitle: "Pro. Beyond.",
    description: "iPhone 15 Pro. Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action Button, and the most powerful iPhone camera system ever.",
    shortDescription: "The most advanced iPhone with titanium design and A17 Pro chip.",
    price: 134900,
    originalPrice: 139900,
    brand: "Apple",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009279896",
        alt: "iPhone 15 Pro Natural Titanium",
        isPrimary: true
      }
    ],
    specifications: [
      { name: "Display", value: "6.1-inch Super Retina XDR", category: "Display" },
      { name: "Chip", value: "A17 Pro", category: "Performance" },
      { name: "Storage", value: "128GB", category: "Storage" },
      { name: "Camera", value: "48MP Main", category: "Camera" },
      { name: "Battery", value: "Up to 23 hours video playback", category: "Battery" }
    ],
    features: [
      "Titanium design",
      "A17 Pro chip with 6-core GPU", 
      "Pro camera system",
      "Action Button",
      "USB-C connector"
    ],
    technicalSpecs: [
      {
        category: "Display",
        specs: [
          { name: "Size", value: "6.1", unit: "inches" },
          { name: "Technology", value: "Super Retina XDR OLED" },
          { name: "Resolution", value: "2556 x 1179", unit: "pixels" }
        ]
      }
    ],
    badge: "new",
    inventory: {
      quantity: 50,
      sku: "IPHONE15PRO-128-NT",
      weight: 0.187,
      dimensions: {
        length: 14.67,
        width: 7.09,
        height: 0.83,
        unit: "cm"
      },
      lowStockAlert: 5
    },
    tags: ["smartphone", "apple", "iphone", "premium", "titanium"],
    featured: true,
    topRated: true,
    status: "active",
    hasVariants: true
  },

  {
    title: "MacBook Air M2",
    subtitle: "Supercharged by M2",
    description: "MacBook Air with M2 chip brings incredible performance and up to 18 hours of battery life. Redesigned around the next-generation M2 chip.",
    shortDescription: "Incredibly thin and light laptop with M2 chip performance.",
    price: 114900,
    originalPrice: 119900,
    brand: "Apple",
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653084303665",
        alt: "MacBook Air M2 Midnight",
        isPrimary: true
      }
    ],
    specifications: [
      { name: "Processor", value: "Apple M2 chip", category: "Performance" },
      { name: "Memory", value: "8GB", category: "Memory" },
      { name: "Storage", value: "256GB SSD", category: "Storage" },
      { name: "Display", value: "13.6-inch Liquid Retina", category: "Display" },
      { name: "Battery", value: "Up to 18 hours", category: "Battery" }
    ],
    features: [
      "M2 chip with 8-core CPU",
      "13.6-inch Liquid Retina display",
      "1080p FaceTime HD camera",
      "MagSafe 3 charging",
      "Two Thunderbolt ports"
    ],
    badge: "featured",
    inventory: {
      quantity: 25,
      sku: "MBA-M2-256-MN",
      weight: 1.24,
      dimensions: {
        length: 30.41,
        width: 21.5,
        height: 1.13,
        unit: "cm"
      },
      lowStockAlert: 3
    },
    tags: ["laptop", "apple", "macbook", "m2", "thin"],
    featured: true,
    status: "active",
    hasVariants: true
  },

  {
    title: "Nike Air Max 270",
    subtitle: "Just Do It",
    description: "Nike's Air Max 270 delivers visible cushioning under every step. The design draws inspiration from Air Max icons, showcasing Nike's greatest innovation.",
    shortDescription: "Iconic Nike sneakers with Air Max cushioning technology.",
    price: 12995,
    originalPrice: 14995,
    brand: "Nike",
    images: [
      {
        url: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/awjogtdnqxniqqk0wpgf/air-max-270-shoes-KkLcGR.png",
        alt: "Nike Air Max 270",
        isPrimary: true
      }
    ],
    specifications: [
      { name: "Upper Material", value: "Synthetic and Textile", category: "Materials" },
      { name: "Sole Material", value: "Rubber", category: "Materials" },
      { name: "Closure", value: "Lace-up", category: "Design" },
      { name: "Heel Height", value: "3.2", unit: "cm", category: "Dimensions" }
    ],
    features: [
      "Air Max cushioning",
      "Lightweight design",
      "Breathable upper",
      "Durable rubber outsole",
      "Iconic Nike styling"
    ],
    badge: "sale",
    inventory: {
      quantity: 100,
      sku: "NIKE-AM270",
      weight: 0.6,
      dimensions: {
        length: 30,
        width: 11,
        height: 12,
        unit: "cm"
      },
      lowStockAlert: 10
    },
    tags: ["shoes", "nike", "sneakers", "air max", "sports"],
    featured: false,
    topRated: true,
    status: "active",
    hasVariants: true
  }
];

// Sample variants for iPhone 15 Pro
const iphoneVariants = [
  {
    name: "iPhone 15 Pro 128GB Natural Titanium",
    sku: "IPHONE15PRO-128-NT",
    price: 134900,
    originalPrice: 139900,
    inventory: { quantity: 20, lowStockAlert: 5 },
    attributes: [
      { name: "Storage", value: "128GB" },
      { name: "Color", value: "Natural Titanium" }
    ],
    isDefault: true
  },
  {
    name: "iPhone 15 Pro 256GB Natural Titanium", 
    sku: "IPHONE15PRO-256-NT",
    price: 144900,
    originalPrice: 149900,
    inventory: { quantity: 15, lowStockAlert: 5 },
    attributes: [
      { name: "Storage", value: "256GB" },
      { name: "Color", value: "Natural Titanium" }
    ]
  },
  {
    name: "iPhone 15 Pro 128GB Blue Titanium",
    sku: "IPHONE15PRO-128-BT", 
    price: 134900,
    originalPrice: 139900,
    inventory: { quantity: 18, lowStockAlert: 5 },
    attributes: [
      { name: "Storage", value: "128GB" },
      { name: "Color", value: "Blue Titanium" }
    ]
  }
];

// MacBook variants
const macbookVariants = [
  {
    name: "MacBook Air M2 256GB Midnight",
    sku: "MBA-M2-256-MN",
    price: 114900,
    originalPrice: 119900,
    inventory: { quantity: 12, lowStockAlert: 3 },
    attributes: [
      { name: "Storage", value: "256GB" },
      { name: "Color", value: "Midnight" }
    ],
    isDefault: true
  },
  {
    name: "MacBook Air M2 512GB Midnight",
    sku: "MBA-M2-512-MN",
    price: 134900,
    originalPrice: 139900,
    inventory: { quantity: 8, lowStockAlert: 3 },
    attributes: [
      { name: "Storage", value: "512GB" },
      { name: "Color", value: "Midnight" }
    ]
  },
  {
    name: "MacBook Air M2 256GB Silver",
    sku: "MBA-M2-256-SL",
    price: 114900,
    originalPrice: 119900,
    inventory: { quantity: 10, lowStockAlert: 3 },
    attributes: [
      { name: "Storage", value: "256GB" },
      { name: "Color", value: "Silver" }
    ]
  }
];

// Nike Air Max variants
const nikeVariants = [
  {
    name: "Nike Air Max 270 Size 8 Black/White",
    sku: "NIKE-AM270-8-BW",
    price: 12995,
    originalPrice: 14995,
    inventory: { quantity: 15, lowStockAlert: 5 },
    attributes: [
      { name: "Size", value: "8" },
      { name: "Color", value: "Black/White" }
    ],
    isDefault: true
  },
  {
    name: "Nike Air Max 270 Size 9 Black/White",
    sku: "NIKE-AM270-9-BW",
    price: 12995,
    originalPrice: 14995,
    inventory: { quantity: 12, lowStockAlert: 5 },
    attributes: [
      { name: "Size", value: "9" },
      { name: "Color", value: "Black/White" }
    ]
  },
  {
    name: "Nike Air Max 270 Size 10 Black/White",
    sku: "NIKE-AM270-10-BW",
    price: 12995,
    originalPrice: 14995,
    inventory: { quantity: 18, lowStockAlert: 5 },
    attributes: [
      { name: "Size", value: "10" },
      { name: "Color", value: "Black/White" }
    ]
  },
  {
    name: "Nike Air Max 270 Size 8 Red/Black",
    sku: "NIKE-AM270-8-RB",
    price: 12995,
    originalPrice: 14995,
    inventory: { quantity: 10, lowStockAlert: 5 },
    attributes: [
      { name: "Size", value: "8" },
      { name: "Color", value: "Red/Black" }
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await ProductVariant.deleteMany({});

    // Create categories and subcategories
    console.log('Creating categories...');
    const createdCategories = {};
    
    for (const categoryData of categoriesData) {
      const category = new Category({
        name: categoryData.name,
        description: categoryData.description,
        level: categoryData.level,
        sortOrder: categoryData.sortOrder,
        isActive: true
      });
      
      const savedCategory = await category.save();
      createdCategories[categoryData.name] = savedCategory;
      
      // Create subcategories
      if (categoryData.subcategories) {
        for (const subCatData of categoryData.subcategories) {
          const subcategory = new Category({
            name: subCatData.name,
            description: subCatData.description,
            parentCategory: savedCategory._id,
            level: subCatData.level,
            sortOrder: subCatData.sortOrder,
            isActive: true
          });
          
          const savedSubcategory = await subcategory.save();
          createdCategories[subCatData.name] = savedSubcategory;
        }
      }
    }

    // Create products
    console.log('Creating products...');
    const createdProducts = [];
    
    // iPhone 15 Pro
    const iphone = new Product({
      ...sampleProducts[0],
      category: createdCategories['Electronics']._id,
      subcategory: createdCategories['Smartphones']._id,
      rating: { average: 4.8, count: 156 }
    });
    const savedIphone = await iphone.save();
    createdProducts.push(savedIphone);

    // MacBook Air
    const macbook = new Product({
      ...sampleProducts[1],
      category: createdCategories['Electronics']._id,
      subcategory: createdCategories['Laptops']._id,
      rating: { average: 4.7, count: 89 }
    });
    const savedMacbook = await macbook.save();
    createdProducts.push(savedMacbook);

    // Nike Air Max
    const nike = new Product({
      ...sampleProducts[2],
      category: createdCategories['Clothing']._id,
      subcategory: createdCategories["Men's Clothing"]._id,
      rating: { average: 4.5, count: 234 }
    });
    const savedNike = await nike.save();
    createdProducts.push(savedNike);

    // Create product variants
    console.log('Creating product variants...');
    
    // iPhone variants
    for (const variantData of iphoneVariants) {
      const variant = new ProductVariant({
        ...variantData,
        product: savedIphone._id,
        isActive: true
      });
      const savedVariant = await variant.save();
      
      // Add variant to product
      await Product.findByIdAndUpdate(savedIphone._id, {
        $addToSet: { variants: savedVariant._id }
      });
    }

    // MacBook variants
    for (const variantData of macbookVariants) {
      const variant = new ProductVariant({
        ...variantData,
        product: savedMacbook._id,
        isActive: true
      });
      const savedVariant = await variant.save();
      
      await Product.findByIdAndUpdate(savedMacbook._id, {
        $addToSet: { variants: savedVariant._id }
      });
    }

    // Nike variants
    for (const variantData of nikeVariants) {
      const variant = new ProductVariant({
        ...variantData,
        product: savedNike._id,
        isActive: true
      });
      const savedVariant = await variant.save();
      
      await Product.findByIdAndUpdate(savedNike._id, {
        $addToSet: { variants: savedVariant._id }
      });
    }

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${Object.keys(createdCategories).length} categories`);
    console.log(`Created ${createdProducts.length} products`);
    console.log(`Created ${iphoneVariants.length + macbookVariants.length + nikeVariants.length} product variants`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  console.log('Starting database seeding...');
  seedDatabase().then(() => {
    console.log('Seeding completed successfully!');
    process.exit(0);
  }).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = seedDatabase;
