const mongoose = require('mongoose');
const Product = require('./src/product/product.model');
const ProductCategory = require('./src/product/productCategory.model');
const Blog = require('./src/blog/blog.model');
const Promo = require('./src/promo/promo.model');
const Newsletter = require('./src/newsletter/newsletter.model');
const Banner = require('./src/banner/banner.model');

// Database connection
const connectToDatabase = async () => {
  const { mongoURI } = require('./config/config');
  try {
    await mongoose.connect(mongoURI);
    console.log('DB connection established for seeding');
  } catch (error) {
    console.error('DB connection error:', error.message);
    process.exit(1);
  }
};

// Sample data
const sampleCategories = [
  {
    categoryName: 'Chairs',
    description: 'Comfortable and stylish seating solutions',
    discount: 10,
    image: ['http://localhost:3000/uploads/category-chairs.jpg']
  },
  {
    categoryName: 'Lighting',
    description: 'Modern and decorative lighting fixtures',
    discount: 15,
    image: ['http://localhost:3000/uploads/category-lighting.jpg']
  },
  {
    categoryName: 'Tables',
    description: 'Functional and beautiful tables',
    discount: 5,
    image: ['http://localhost:3000/uploads/category-tables.jpg']
  },
  {
    categoryName: 'Accessories',
    description: 'Home decor and accessories',
    discount: 20,
    image: ['http://localhost:3000/uploads/category-accessories.jpg']
  }
];

const sampleProducts = [
  {
    title: 'The Signature Chair',
    subtitle: 'Premium Comfort',
    description: 'A luxurious chair with premium materials and exceptional comfort. Perfect for modern living spaces.',
    price: 499.00,
    originalPrice: 599.00,
    subcategory: 'Dining Chairs',
    images: [
      { url: 'http://localhost:3000/uploads/chair-1.jpg', alt: 'The Signature Chair', isPrimary: true },
      { url: 'http://localhost:3000/uploads/chair-1-side.jpg', alt: 'The Signature Chair Side View', isPrimary: false }
    ],
    badge: 'new',
    rating: { average: 4.8, count: 24 },
    inventory: { quantity: 50, sku: 'CHAIR-001', weight: 15.5 },
    tags: ['chair', 'premium', 'modern', 'comfortable'],
    featured: true,
    topRated: true,
    seo: { slug: 'signature-chair', metaTitle: 'The Signature Chair - Premium Comfort', metaDescription: 'Luxurious chair with premium materials' }
  },
  {
    title: 'Normal Classic Chair',
    subtitle: 'Timeless Design',
    description: 'Classic design meets modern comfort. This chair is perfect for any traditional or contemporary setting.',
    price: 259.00,
    subcategory: 'Living Room Chairs',
    images: [
      { url: 'http://localhost:3000/uploads/chair-2.jpg', alt: 'Normal Classic Chair', isPrimary: true }
    ],
    rating: { average: 4.2, count: 18 },
    inventory: { quantity: 75, sku: 'CHAIR-002', weight: 12.0 },
    tags: ['chair', 'classic', 'traditional'],
    featured: true,
    seo: { slug: 'classic-chair', metaTitle: 'Normal Classic Chair - Timeless Design' }
  },
  {
    title: 'Blue Wing Chair',
    subtitle: 'Contemporary Style',
    description: 'Modern wing chair in beautiful blue upholstery. Adds a pop of color to any room.',
    price: 319.00,
    subcategory: 'Accent Chairs',
    images: [
      { url: 'http://localhost:3000/uploads/chair-3.jpg', alt: 'Blue Wing Chair', isPrimary: true }
    ],
    badge: 'sale',
    rating: { average: 4.5, count: 12 },
    inventory: { quantity: 30, sku: 'CHAIR-003', weight: 18.0 },
    tags: ['chair', 'modern', 'blue', 'wing'],
    featured: true,
    seo: { slug: 'blue-wing-chair', metaTitle: 'Blue Wing Chair - Contemporary Style' }
  },
  {
    title: 'Modern Red Chair',
    subtitle: 'Bold Statement',
    description: 'Make a bold statement with this striking red chair. Perfect for modern interiors.',
    price: 289.00,
    subcategory: 'Accent Chairs',
    images: [
      { url: 'http://localhost:3000/uploads/chair-4.jpg', alt: 'Modern Red Chair', isPrimary: true }
    ],
    badge: 'hot',
    rating: { average: 4.7, count: 15 },
    inventory: { quantity: 25, sku: 'CHAIR-004', weight: 14.5 },
    tags: ['chair', 'modern', 'red', 'statement'],
    featured: true,
    topRated: true,
    seo: { slug: 'modern-red-chair', metaTitle: 'Modern Red Chair - Bold Statement' }
  },
  {
    title: 'Black Wood Chair',
    subtitle: 'Minimalist Elegance',
    description: 'Sleek black wooden chair with minimalist design. Perfect for contemporary dining spaces.',
    price: 199.00,
    subcategory: 'Dining Chairs',
    images: [
      { url: 'http://localhost:3000/uploads/chair-5.jpg', alt: 'Black Wood Chair', isPrimary: true }
    ],
    rating: { average: 4.0, count: 22 },
    inventory: { quantity: 60, sku: 'CHAIR-005', weight: 8.5 },
    tags: ['chair', 'wood', 'black', 'minimalist'],
    topRated: true,
    seo: { slug: 'black-wood-chair', metaTitle: 'Black Wood Chair - Minimalist Elegance' }
  }
];

const sampleBlogs = [
  {
    title: 'Underground Apartment in Barcelona',
    excerpt: 'Minimal aesthetics with natural wood tones and soft textiles create a cozy underground retreat.',
    content: 'This stunning underground apartment showcases minimal design principles...',
    author: {
      name: 'Sarah Johnson',
      email: 'sarah@umbrafurniture.com'
    },
    image: {
      url: 'http://localhost:3000/uploads/blog-1.jpg',
      alt: 'Underground Apartment in Barcelona'
    },
    tags: ['interior design', 'minimal', 'apartment'],
    category: 'design',
    status: 'published',
    featured: true,
    publishedAt: new Date('2025-07-12'),
    seo: { slug: 'underground-apartment-barcelona' }
  },
  {
    title: 'Nordic Living Room Essentials',
    excerpt: 'Muted palette, functional forms and cozy lighting define the perfect Nordic living space.',
    content: 'Nordic design has captured hearts worldwide with its emphasis on functionality...',
    author: {
      name: 'Erik Larsson',
      email: 'erik@umbrafurniture.com'
    },
    image: {
      url: 'http://localhost:3000/uploads/blog-2.jpg',
      alt: 'Nordic Living Room Essentials'
    },
    tags: ['nordic design', 'living room', 'scandinavian'],
    category: 'lifestyle',
    status: 'published',
    featured: true,
    publishedAt: new Date('2025-08-01'),
    seo: { slug: 'nordic-living-room-essentials' }
  }
];

const samplePromos = [
  {
    title: '2016 New Collection',
    description: 'Discover our latest furniture collection',
    price: 520.00,
    image: { url: 'http://localhost:3000/uploads/promo-1.jpg', alt: '2016 New Collection' },
    link: '/collections/new-2016',
    type: 'collection',
    displayOrder: 1,
    isActive: true
  },
  {
    title: 'Modern Home Decor',
    description: 'Transform your space with our curated pieces',
    price: 86.00,
    image: { url: 'http://localhost:3000/uploads/promo-2.jpg', alt: 'Modern Home Decor' },
    link: '/categories/accessories',
    type: 'category',
    displayOrder: 2,
    isActive: true
  },
  {
    title: 'Concept Floor Lamp',
    description: 'Designer lighting collection',
    price: 119.90,
    image: { url: 'http://localhost:3000/uploads/promo-3.jpg', alt: 'Concept Floor Lamp' },
    link: '/categories/lighting',
    type: 'product',
    displayOrder: 3,
    isActive: true
  }
];

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectToDatabase();
    
    console.log('🌱 Starting database seeding...\n');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      Product.deleteMany({}),
      ProductCategory.deleteMany({}),
      Blog.deleteMany({}),
      Promo.deleteMany({}),
      Newsletter.deleteMany({})
    ]);
    
    // Seed categories
    console.log('Seeding categories...');
    const categories = await ProductCategory.insertMany(sampleCategories);
    console.log(`✓ Created ${categories.length} categories`);
    
    // Seed products with category references
    console.log('Seeding products...');
    const productsWithCategories = sampleProducts.map((product, index) => ({
      ...product,
      category: categories[index % categories.length]._id
    }));
    const products = await Product.insertMany(productsWithCategories);
    console.log(`✓ Created ${products.length} products`);
    
    // Seed blogs
    console.log('Seeding blogs...');
    const blogs = await Blog.insertMany(sampleBlogs);
    console.log(`✓ Created ${blogs.length} blog posts`);
    
    // Seed promos
    console.log('Seeding promos...');
    const promos = await Promo.insertMany(samplePromos);
    console.log(`✓ Created ${promos.length} promo cards`);
    
    // Seed banner
    console.log('Seeding banner...');
    const banner = await Banner.create({ imageUrl: '/uploads/hero-banner.jpg' });
    console.log('✓ Created hero banner');
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nTest these endpoints:');
    console.log('- Homepage data: GET http://localhost:3000/api/home/data');
    console.log('- Products: GET http://localhost:3000/api/products/featured');
    console.log('- Blogs: GET http://localhost:3000/api/blogs/latest');
    console.log('- Promos: GET http://localhost:3000/api/promos/active');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
