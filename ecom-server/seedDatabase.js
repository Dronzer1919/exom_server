const mongoose = require('mongoose');
const Product = require('./src/product/product.model');
const ProductCategory = require('./src/product/productCategory.model');
const Blog = require('./src/blog/blog.model');
const Promo = require('./src/promo/promo.model');
const Banner = require('./src/banner/banner.model');
const { mongoURI } = require('./config/config');

// Sample data for seeding
const sampleCategories = [
  {
    categoryName: 'Chairs',
    description: 'Comfortable and stylish chairs for modern homes',
    discount: 15,
    image: ['http://localhost:3000/uploads/category-chairs.jpg']
  },
  {
    categoryName: 'Lighting',
    description: 'Indoor and outdoor lighting solutions',
    discount: 20,
    image: ['http://localhost:3000/uploads/category-lighting.jpg']
  },
  {
    categoryName: 'Tables',
    description: 'Dining, coffee, and side tables',
    discount: 10,
    image: ['http://localhost:3000/uploads/category-tables.jpg']
  },
  {
    categoryName: 'Accessories',
    description: 'Home decor and furniture accessories',
    discount: 25,
    image: ['http://localhost:3000/uploads/category-accessories.jpg']
  }
];

const sampleProducts = [
  {
    title: 'The Signature Chair',
    subtitle: 'Premium comfort chair',
    description: 'A luxurious chair designed for ultimate comfort and style. Perfect for modern living spaces.',
    price: 499.00,
    originalPrice: 599.00,
    subcategory: 'Lounge Chairs',
    images: [
      { url: 'assets/furniture/chair-1.jpg', alt: 'Signature Chair', isPrimary: true }
    ],
    badge: 'featured',
    rating: { average: 5, count: 12 },
    inventory: { quantity: 25, sku: 'CHR-001', weight: 15.5 },
    tags: ['chair', 'luxury', 'comfort'],
    featured: true,
    topRated: true
  },
  {
    title: 'Normal Classic Chair',
    subtitle: 'Timeless design chair',
    description: 'Classic design meets modern comfort in this versatile chair.',
    price: 259.00,
    originalPrice: 299.00,
    subcategory: 'Dining Chairs',
    images: [
      { url: 'assets/furniture/chair-2.jpg', alt: 'Classic Chair', isPrimary: true }
    ],
    rating: { average: 4, count: 8 },
    inventory: { quantity: 40, sku: 'CHR-002', weight: 12.0 },
    tags: ['chair', 'classic', 'dining'],
    featured: true
  },
  {
    title: 'Blue Wing Chair',
    subtitle: 'Modern wing-back chair',
    description: 'Contemporary wing-back design in beautiful blue upholstery.',
    price: 319.00,
    subcategory: 'Accent Chairs',
    images: [
      { url: 'assets/furniture/chair-3.jpg', alt: 'Blue Wing Chair', isPrimary: true }
    ],
    badge: 'new',
    rating: { average: 4, count: 6 },
    inventory: { quantity: 15, sku: 'CHR-003', weight: 18.0 },
    tags: ['chair', 'wing-back', 'blue', 'accent'],
    featured: true
  },
  {
    title: 'Modern Red Chair',
    subtitle: 'Statement piece chair',
    description: 'Bold red chair that makes a statement in any room.',
    price: 289.00,
    originalPrice: 349.00,
    subcategory: 'Accent Chairs',
    images: [
      { url: 'assets/furniture/chair-4.jpg', alt: 'Modern Red Chair', isPrimary: true }
    ],
    badge: 'sale',
    rating: { average: 5, count: 10 },
    inventory: { quantity: 20, sku: 'CHR-004', weight: 14.5 },
    tags: ['chair', 'modern', 'red', 'accent'],
    featured: true,
    topRated: true
  },
  {
    title: 'Black Wood Chair',
    subtitle: 'Minimalist wooden chair',
    description: 'Simple and elegant wooden chair in black finish.',
    price: 199.00,
    subcategory: 'Dining Chairs',
    images: [
      { url: 'assets/furniture/chair-5.jpg', alt: 'Black Wood Chair', isPrimary: true }
    ],
    rating: { average: 3, count: 4 },
    inventory: { quantity: 35, sku: 'CHR-005', weight: 8.0 },
    tags: ['chair', 'wood', 'black', 'minimalist'],
    featured: true
  }
];

const sampleBlogs = [
  {
    title: 'Underground Apartment in Barcelona',
    excerpt: 'Minimal aesthetics with natural wood tones and soft textiles.',
    content: 'Discover how this underground apartment in Barcelona showcases the perfect balance of minimal aesthetics with natural wood tones and soft textiles. The design emphasizes functionality while maintaining a warm, inviting atmosphere that maximizes the unique underground space.',
    author: {
      name: 'Sarah Johnson',
      email: 'sarah@umbrafurniture.com',
      avatar: 'http://localhost:3000/uploads/authors/sarah.jpg'
    },
    image: {
      url: 'assets/furniture/blog-1.jpg',
      alt: 'Underground Apartment Barcelona'
    },
    tags: ['apartment', 'minimal', 'barcelona', 'design'],
    category: 'design',
    status: 'published',
    featured: true,
    publishedAt: new Date('2025-07-12'),
    seo: {
      metaTitle: 'Underground Apartment Design in Barcelona',
      metaDescription: 'Explore minimal design aesthetics in this Barcelona underground apartment',
      slug: 'underground-apartment-barcelona'
    }
  },
  {
    title: 'Nordic Living Room Essentials',
    excerpt: 'Muted palette, functional forms and cozy lighting.',
    content: 'Learn about the essential elements that make Nordic living room design so appealing. From muted color palettes to functional furniture forms and the importance of cozy lighting in creating the perfect hygge atmosphere.',
    author: {
      name: 'Erik Larsson',
      email: 'erik@umbrafurniture.com',
      avatar: 'http://localhost:3000/uploads/authors/erik.jpg'
    },
    image: {
      url: 'assets/furniture/blog-2.jpg',
      alt: 'Nordic Living Room'
    },
    tags: ['nordic', 'living room', 'hygge', 'lighting'],
    category: 'lifestyle',
    status: 'published',
    featured: true,
    publishedAt: new Date('2025-08-01'),
    seo: {
      metaTitle: 'Nordic Living Room Design Essentials',
      metaDescription: 'Discover the key elements of Nordic living room design',
      slug: 'nordic-living-room-essentials'
    }
  }
];

const samplePromos = [
  {
    title: '2016 New Collection',
    description: 'Discover our latest furniture collection featuring contemporary designs',
    price: 520.00,
    originalPrice: 650.00,
    image: {
      url: 'assets/furniture/promo-1.jpg',
      alt: '2016 New Collection'
    },
    link: '/products/category/new-collection',
    type: 'collection',
    displayOrder: 1,
    isActive: true
  },
  {
    title: 'Modern Home Decor',
    description: 'Transform your space with modern home decor accessories',
    price: 86.00,
    originalPrice: 120.00,
    image: {
      url: 'assets/furniture/promo-2.jpg',
      alt: 'Modern Home Decor'
    },
    link: '/products/category/accessories',
    type: 'category',
    displayOrder: 2,
    isActive: true
  },
  {
    title: 'Concept Floor Lamp',
    description: 'Unique lighting solutions for contemporary homes',
    price: 119.90,
    originalPrice: 159.90,
    image: {
      url: 'assets/furniture/promo-3.jpg',
      alt: 'Concept Floor Lamp'
    },
    link: '/products/category/lighting',
    type: 'category',
    displayOrder: 3,
    isActive: true
  }
];

const sampleBanner = {
  imageUrl: '/uploads/hero-banner.jpg'
};

// Seeding function
async function seedDatabase() {
  try {
    // Connect to database
    await mongoose.connect(mongoURI);
    console.log('Connected to database for seeding...');

    // Clear existing data (optional - uncomment if you want to start fresh)
    // await Product.deleteMany({});
    // await ProductCategory.deleteMany({});
    // await Blog.deleteMany({});
    // await Promo.deleteMany({});
    // await Banner.deleteMany({});
    
    // Seed categories first
    console.log('Seeding categories...');
    const createdCategories = await ProductCategory.insertMany(sampleCategories);
    console.log(`Created ${createdCategories.length} categories`);

    // Add category references to products
    const chairCategory = createdCategories.find(cat => cat.categoryName === 'Chairs');
    sampleProducts.forEach(product => {
      product.category = chairCategory._id;
    });

    // Seed products
    console.log('Seeding products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Created ${createdProducts.length} products`);

    // Seed blogs
    console.log('Seeding blogs...');
    const createdBlogs = await Blog.insertMany(sampleBlogs);
    console.log(`Created ${createdBlogs.length} blog posts`);

    // Seed promos
    console.log('Seeding promos...');
    const createdPromos = await Promo.insertMany(samplePromos);
    console.log(`Created ${createdPromos.length} promos`);

    // Seed banner
    console.log('Seeding banner...');
    const createdBanner = await Banner.create(sampleBanner);
    console.log('Created banner');

    console.log('Database seeding completed successfully!');
    console.log('\nAPI Endpoints you can test:');
    console.log('- GET /api/home/data (Homepage data)');
    console.log('- GET /api/products/all (All products)');
    console.log('- GET /api/products/featured (Featured products)');
    console.log('- GET /api/products/top-rated (Top rated products)');
    console.log('- GET /api/blogs/latest (Latest blogs)');
    console.log('- GET /api/promos/active (Active promos)');
    console.log('- POST /api/newsletter/subscribe (Newsletter signup)');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
