const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth.middleware');
const { checkout, getMyOrders } = require('../controllers/order.controller');

router.post('/checkout', requireAuth, checkout);
router.get('/', requireAuth, getMyOrders);

module.exports = router;
