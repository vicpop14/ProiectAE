const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth.middleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
} = require('../controllers/cart.controller');

router.get('/', requireAuth, getCart);
router.post('/', requireAuth, addToCart);
router.put('/:id', requireAuth, updateCartItem);
router.delete('/:id', requireAuth, deleteCartItem);

// golește coșul utilizatorului curent
router.delete('/', requireAuth, clearCart);

module.exports = router;
