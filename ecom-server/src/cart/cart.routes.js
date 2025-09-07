const express = require('express');
const router = express.Router();
const Cart = require('./cart.model');

// Helper: get or create cart for user
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }
  return cart;
}

// Helper to generate a simple guest id (could be UUID in future)
function generateGuestId() {
  return 'guest_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
}

// Get cart for user
router.get('/:userId?', async (req, res, next) => {
  try {
    let { userId } = req.params;

    // Support anonymous guest cart via HttpOnly cookie if no userId provided or userId is 'guest'
    if (!userId || userId === 'guest') {
      let guestId = req.cookies && req.cookies.guestCartId;
      if (!guestId) {
        guestId = generateGuestId();
        // Set HttpOnly cookie for 30 days
        res.cookie('guestCartId', guestId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
      }
      userId = guestId;
    }

    const cart = await getOrCreateCart(userId);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// Add or update item in cart
router.post('/:userId?/items', async (req, res, next) => {
  try {
    let { userId } = req.params;
    const payload = req.body;

    if (!userId || userId === 'guest') {
      let guestId = req.cookies && req.cookies.guestCartId;
      if (!guestId) {
        guestId = generateGuestId();
        res.cookie('guestCartId', guestId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
      }
      userId = guestId;
    }

    const cart = await getOrCreateCart(userId);

    const existing = cart.items.find(i => i.productId === (payload.productId || payload.productId));
    if (existing) {
      // update quantity or replace
      existing.quantity = payload.quantity || existing.quantity;
      existing.price = payload.price || existing.price;
      existing.images = payload.images || existing.images;
    } else {
      cart.items.push({
        productId: payload.productId,
        productName: payload.productName,
        price: payload.price,
        originalPrice: payload.originalPrice,
        quantity: payload.quantity || 1,
        images: payload.images || [],
        category: payload.category,
        description: payload.description,
        weight: payload.weight,
        size: payload.size,
        color: payload.color,
        discount: payload.discount,
        inStock: payload.inStock !== undefined ? payload.inStock : true
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// Remove item from cart
router.delete('/:userId?/items/:productId', async (req, res, next) => {
  try {
    let { userId, productId } = req.params;

    if (!userId || userId === 'guest') {
      userId = req.cookies && req.cookies.guestCartId;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'No guest cart' });
      }
    }

    const cart = await getOrCreateCart(userId);
    cart.items = cart.items.filter(i => i.productId !== productId);
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// Clear cart for user
router.delete('/:userId?', async (req, res, next) => {
  try {
    let { userId } = req.params;
    if (!userId || userId === 'guest') {
      userId = req.cookies && req.cookies.guestCartId;
      if (!userId) return res.json({ success: true, message: 'Cart cleared' });
    }
    await Cart.findOneAndUpdate({ userId }, { items: [], updatedAt: Date.now() }, { upsert: true });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
});

// Bulk replace cart for user (replace entire items array)
router.post('/:userId?', async (req, res, next) => {
  try {
    let { userId } = req.params;
    if (!userId || userId === 'guest') {
      let guestId = req.cookies && req.cookies.guestCartId;
      if (!guestId) {
        guestId = generateGuestId();
        res.cookie('guestCartId', guestId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
      }
      userId = guestId;
    }

    const items = Array.isArray(req.body) ? req.body : (req.body.items || []);
    const normalized = (items || []).map(it => ({
      productId: it.productId,
      productName: it.productName,
      price: it.price,
      originalPrice: it.originalPrice,
      quantity: it.quantity || 1,
      images: it.images || [],
      category: it.category,
      description: it.description,
      weight: it.weight,
      size: it.size,
      color: it.color,
      discount: it.discount,
      inStock: it.inStock !== undefined ? it.inStock : true
    }));

    const cart = await Cart.findOneAndUpdate({ userId }, { items: normalized, updatedAt: Date.now() }, { upsert: true, new: true });
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
