# E-Commerce Backend API Documentation

## Overview
This backend is designed to support a modern furniture e-commerce website with features for products, blogs, promos, newsletters, and comprehensive homepage data management.

## Base URL
```
http://localhost:3000
```

## API Endpoints

### 🏠 Homepage Data
Get all data needed for the homepage in a single request.

#### Get Homepage Data
```http
GET /api/home/data
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hero": {
      "banner": "/uploads/hero-banner.jpg",
      "title": "Indoor Lighting",
      "subtitle": "Decorative",
      "description": "Huge site-wide sale up to 50% off all interior lamps.",
      "ctaButtons": [
        { "text": "Shop Now", "link": "/products", "type": "primary" },
        { "text": "View Deals", "link": "/deals", "type": "secondary" }
      ]
    },
    "promoCards": [
      {
        "id": "...",
        "title": "2016 New Collection",
        "price": 520.00,
        "image": "assets/furniture/promo-1.jpg",
        "link": "/products/category/new-collection"
      }
    ],
    "featuredProducts": [
      {
        "id": "...",
        "title": "The Signature Chair",
        "price": 499.00,
        "image": "assets/furniture/chair-1.jpg",
        "rating": 5,
        "badge": "featured"
      }
    ],
    "topRatedProducts": [...],
    "blogCards": [...],
    "testimonial": {...},
    "features": [...],
    "navLinks": [...]
  }
}
```

#### Get Products by Category
```http
GET /api/home/products/category/:category
```

**Parameters:**
- `category` (string): Category name or 'all' for all products
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)

#### Get Deal Products
```http
GET /api/home/deals
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

---

### 🛍️ Products

#### Create Product
```http
POST /api/products/create
```

**Content-Type:** `multipart/form-data`

**Form Data:**
```
title: string (required)
subtitle: string (optional)
description: string (required)
price: number (required)
originalPrice: number (optional)
category: ObjectId (required)
subcategory: string (optional)
images: File[] (up to 5 files)
badge: enum['new', 'sale', 'hot', 'featured', 'limited']
quantity: number (required)
sku: string (optional)
weight: number (optional)
length: number (optional)
width: number (optional)
height: number (optional)
tags: string (comma-separated)
featured: boolean
topRated: boolean
metaTitle: string (optional)
metaDescription: string (optional)
slug: string (optional)
```

#### Get All Products
```http
GET /api/products/all
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Filter by category ID
- `featured`: Filter featured products (true/false)
- `topRated`: Filter top-rated products (true/false)
- `badge`: Filter by badge type
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `sortBy`: Sort field (price, rating.average, createdAt)
- `sortOrder`: Sort order (asc/desc)

#### Get Featured Products
```http
GET /api/products/featured
```

#### Get Top Rated Products
```http
GET /api/products/top-rated
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Update Product
```http
PUT /api/products/:id
```

#### Delete Product
```http
DELETE /api/products/:id
```

#### Search Products
```http
GET /api/products/search?q=search-term
```

---

### 📝 Blog

#### Create Blog Post
```http
POST /api/blogs/create
```

**Content-Type:** `multipart/form-data`

**Form Data:**
```
title: string (required)
excerpt: string (required, max 200 chars)
content: string (required)
authorName: string (required)
authorEmail: string (optional)
authorAvatar: string (optional)
image: File (required)
imageAlt: string (optional)
tags: string (comma-separated)
category: enum['design', 'tips', 'trends', 'reviews', 'lifestyle']
featured: boolean
status: enum['draft', 'published', 'archived']
metaTitle: string (optional)
metaDescription: string (optional)
slug: string (optional)
```

#### Get All Blog Posts
```http
GET /api/blogs/all
```

#### Get Featured Blogs
```http
GET /api/blogs/featured
```

#### Get Latest Blogs
```http
GET /api/blogs/latest
```

#### Get Single Blog Post
```http
GET /api/blogs/:id
```

#### Update Blog Post
```http
PUT /api/blogs/:id
```

#### Delete Blog Post
```http
DELETE /api/blogs/:id
```

---

### 🎯 Promos

#### Create Promo
```http
POST /api/promos/create
```

**Content-Type:** `multipart/form-data`

**Form Data:**
```
title: string (required)
description: string (optional)
price: number (required)
originalPrice: number (optional)
image: File (required)
imageAlt: string (optional)
link: string (required)
type: enum['collection', 'category', 'product', 'deal']
displayOrder: number (default: 0)
isActive: boolean (default: true)
validFrom: date (optional)
validUntil: date (optional)
```

#### Get All Promos
```http
GET /api/promos/all
```

#### Get Active Promos
```http
GET /api/promos/active
```

#### Get Single Promo
```http
GET /api/promos/:id
```

#### Update Promo
```http
PUT /api/promos/:id
```

#### Delete Promo
```http
DELETE /api/promos/:id
```

---

### 📧 Newsletter

#### Subscribe to Newsletter
```http
POST /api/newsletter/subscribe
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "source": "homepage"
}
```

#### Unsubscribe from Newsletter
```http
POST /api/newsletter/unsubscribe
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### Get All Subscribers (Admin)
```http
GET /api/newsletter/subscribers
```

#### Get Subscription Stats (Admin)
```http
GET /api/newsletter/stats
```

---

### 🎨 Banners (Legacy)

#### Create Banner
```http
POST /create-banner
```

#### Get All Banners
```http
GET /getAllBanners
```

#### Get Latest Banner
```http
GET /getLatestBanner
```

---

## Data Models

### Product Model
```javascript
{
  title: String,
  subtitle: String,
  description: String,
  price: Number,
  originalPrice: Number,
  category: ObjectId (ref: ProductCategory),
  subcategory: String,
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  badge: enum,
  rating: {
    average: Number,
    count: Number
  },
  inventory: {
    quantity: Number,
    sku: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  tags: [String],
  featured: Boolean,
  topRated: Boolean,
  status: enum,
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: String
  }
}
```

### Blog Model
```javascript
{
  title: String,
  excerpt: String,
  content: String,
  author: {
    name: String,
    email: String,
    avatar: String
  },
  image: {
    url: String,
    alt: String
  },
  tags: [String],
  category: enum,
  status: enum,
  featured: Boolean,
  publishedAt: Date,
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: String
  }
}
```

### Promo Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  originalPrice: Number,
  image: {
    url: String,
    alt: String
  },
  link: String,
  type: enum,
  displayOrder: Number,
  isActive: Boolean,
  validFrom: Date,
  validUntil: Date
}
```

### Newsletter Model
```javascript
{
  email: String,
  isActive: Boolean,
  subscribedAt: Date,
  unsubscribedAt: Date,
  source: enum
}
```

---

## Setup Instructions

### 1. Install Dependencies
```bash
cd exom_server/ecom-server
npm install
```

### 2. Environment Variables
Create a `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/ecom_db
PORT=3000
```

### 3. Start the Server
```bash
npm start
```

### 4. Seed Sample Data (Optional)
```bash
node seedDatabase.js
```

### 5. Test the API
Use tools like Postman or Thunder Client to test the endpoints.

---

## Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "pagination": {...} // For paginated responses
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## File Upload

- **Product Images**: Saved to `uploads/`
- **Blog Images**: Saved to `uploads/blog/`
- **Promo Images**: Saved to `uploads/promo/`
- **Banner Images**: Saved to `uploads/`

**File Restrictions:**
- File types: Images only (jpg, jpeg, png, gif, webp)
- File size: Maximum 5MB
- Multiple files: Up to 5 images for products

---

## Authentication

Currently, the API doesn't implement authentication for most endpoints. For production, consider adding:

1. JWT authentication for admin routes
2. API key authentication for public routes
3. Rate limiting for all endpoints
4. Input validation and sanitization

---

## Frontend Integration

Your Angular frontend can consume these APIs by creating services:

```typescript
// Example service
@Injectable()
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  getHomepageData() {
    return this.http.get(`${this.baseUrl}/home/data`);
  }

  subscribeNewsletter(email: string) {
    return this.http.post(`${this.baseUrl}/newsletter/subscribe`, { email });
  }
}
```
