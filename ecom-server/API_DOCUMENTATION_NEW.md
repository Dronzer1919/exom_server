# E-Commerce API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints are public for now. Admin-only endpoints are marked accordingly.

---

## Homepage APIs

### Get Homepage Data
**GET** `/api/home/data`

Returns all data needed for the homepage in a single request.

**Response:**
```json
{
  "success": true,
  "data": {
    "hero": {
      "banner": "http://localhost:3000/uploads/banner.jpg",
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
        "id": "507f1f77bcf86cd799439011",
        "title": "2016 New Collection",
        "price": 520.00,
        "image": "http://localhost:3000/uploads/promo/promo-1.jpg",
        "link": "/collections/new"
      }
    ],
    "featuredProducts": [
      {
        "id": "507f1f77bcf86cd799439011",
        "title": "The Signature Chair",
        "price": 499.00,
        "image": "http://localhost:3000/uploads/chair-1.jpg",
        "rating": 5,
        "badge": "new"
      }
    ],
    "topRatedProducts": [...],
    "blogCards": [...],
    "testimonial": {
      "text": "We came to the very best in quality materials and premium goods.",
      "link": "/testimonials"
    },
    "features": [...],
    "navLinks": ["Home", "Products", "Accessories", "Lighting", "Blog", "Contact"]
  }
}
```

### Get Products by Category
**GET** `/api/home/products/category/:category`

**Parameters:**
- `category` (string): Category name (e.g., "chairs", "lighting", "all")
- `page` (query, number): Page number (default: 1)
- `limit` (query, number): Items per page (default: 20)

### Get Deal Products
**GET** `/api/home/deals`

Returns products with discounts.

---

## Product APIs

### Create Product
**POST** `/api/products/create`

**Content-Type:** `multipart/form-data`

**Body:**
```
title: "The Signature Chair"
subtitle: "Premium Quality"
description: "A beautiful chair..."
price: 499.00
originalPrice: 599.00
category: "507f1f77bcf86cd799439011"
subcategory: "Dining Chairs"
badge: "new"
quantity: 50
sku: "CHAIR-001"
weight: 15.5
featured: true
topRated: false
tags: "chair,furniture,modern"
images: [file1, file2, ...]
```

### Get All Products
**GET** `/api/products/all`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Filter by category ID
- `featured` (boolean): Filter featured products
- `topRated` (boolean): Filter top-rated products
- `badge` (string): Filter by badge type
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sortBy` (string): Sort field (price, rating, createdAt)
- `sortOrder` (string): Sort order (asc, desc)

### Get Featured Products
**GET** `/api/products/featured`

**Query Parameters:**
- `limit` (number): Number of products (default: 5)

### Get Top Rated Products
**GET** `/api/products/top-rated`

**Query Parameters:**
- `limit` (number): Number of products (default: 4)

### Get Product by ID
**GET** `/api/products/:id`

### Update Product
**PUT** `/api/products/:id`

**Content-Type:** `multipart/form-data`

### Delete Product
**DELETE** `/api/products/:id`

### Search Products
**GET** `/api/products/search`

**Query Parameters:**
- `q` (string, required): Search query
- `category` (string): Filter by category
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `page` (number): Page number
- `limit` (number): Items per page

---

## Blog APIs

### Create Blog Post
**POST** `/api/blogs/create`

**Content-Type:** `multipart/form-data`

**Body:**
```
title: "Underground Apartment in Barcelona"
excerpt: "Minimal aesthetics with natural wood tones..."
content: "Full blog content here..."
authorName: "John Doe"
authorEmail: "john@example.com"
category: "design"
featured: true
status: "published"
tags: "design,interior,minimal"
image: [file]
```

### Get All Blogs
**GET** `/api/blogs/all`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status (draft, published, archived)
- `featured` (boolean): Filter featured blogs
- `category` (string): Filter by category

### Get Featured Blogs
**GET** `/api/blogs/featured`

### Get Latest Blogs
**GET** `/api/blogs/latest`

### Get Blog by ID/Slug
**GET** `/api/blogs/:id`

### Update Blog
**PUT** `/api/blogs/:id`

### Delete Blog
**DELETE** `/api/blogs/:id`

---

## Promo APIs

### Create Promo
**POST** `/api/promos/create`

**Content-Type:** `multipart/form-data`

**Body:**
```
title: "2016 New Collection"
description: "Latest furniture collection"
price: 520.00
originalPrice: 650.00
link: "/collections/new"
type: "collection"
displayOrder: 1
isActive: true
validFrom: "2025-01-01"
validUntil: "2025-12-31"
image: [file]
```

### Get All Promos
**GET** `/api/promos/all`

**Query Parameters:**
- `isActive` (boolean): Filter by active status
- `type` (string): Filter by type
- `valid` (boolean): Filter by validity period

### Get Active Promos
**GET** `/api/promos/active`

**Query Parameters:**
- `limit` (number): Number of promos (default: 3)

### Get Promo by ID
**GET** `/api/promos/:id`

### Update Promo
**PUT** `/api/promos/:id`

### Delete Promo
**DELETE** `/api/promos/:id`

---

## Newsletter APIs

### Subscribe to Newsletter
**POST** `/api/newsletter/subscribe`

**Body:**
```json
{
  "email": "user@example.com",
  "source": "homepage"
}
```

### Unsubscribe from Newsletter
**POST** `/api/newsletter/unsubscribe`

**Body:**
```json
{
  "email": "user@example.com"
}
```

### Get All Subscribers (Admin)
**GET** `/api/newsletter/subscribers`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `isActive` (boolean): Filter by active status

### Get Subscription Stats (Admin)
**GET** `/api/newsletter/stats`

---

## Banner APIs (Legacy)

### Create Banner
**POST** `/create-banner`

### Get All Banners
**GET** `/getAllBanners`

### Get Latest Banner
**GET** `/getLatestBanner`

---

## Legacy Product APIs

### Create Product (Legacy)
**POST** `/products/create-products`

### Add Product Types (Legacy)
**POST** `/products/addtypes`

### Get All Products (Legacy)
**GET** `/products/getAllProduct`

### Delete Product (Legacy)
**DELETE** `/products/deleteProduct/:id`

### Edit Product (Legacy)
**PUT** `/products/editProduct/:id`

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## File Upload Guidelines

**Supported Formats:** JPG, JPEG, PNG, WEBP, AVIF
**Maximum File Size:** 5MB per file
**Multiple Files:** Up to 5 images per product

**Upload Paths:**
- Products: `/uploads/filename.jpg`
- Blog: `/uploads/blog/filename.jpg`
- Promo: `/uploads/promo/filename.jpg`
- Banner: `/uploads/filename.jpg`

---

## Integration with Frontend

### Angular Service Example

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getHomepageData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/home/data`);
  }

  getFeaturedProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/featured`);
  }

  subscribeNewsletter(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/newsletter/subscribe`, { email });
  }
}
```

### Usage in Component

```typescript
ngOnInit() {
  this.homeService.getHomepageData().subscribe(response => {
    if (response.success) {
      this.promoCards = response.data.promoCards;
      this.featuredProducts = response.data.featuredProducts;
      this.topRated = response.data.topRatedProducts;
      this.blogCards = response.data.blogCards;
    }
  });
}
```
