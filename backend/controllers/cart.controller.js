const prisma = require('../prismaClient');

// GET /api/cart
async function getCart(req, res) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });

    const total = items.reduce((sum, item) => {
      return sum + item.quantity * (item.product?.price ?? 0);
    }, 0);

    res.json({
      items,
      total
    });
  } catch (err) {
    console.error('getCart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/cart
async function addToCart(req, res) {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Product ID și quantity necesare' });
    }

    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      return res.status(404).json({ message: 'Produsul nu există' });
    }

   
    const existing = await prisma.cartItem.findFirst({
      where: { userId: req.user.id, productId }
    });

    let item;

    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
    } else {
      item = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity
        }
      });
    }

    res.status(201).json(item);
  } catch (err) {
    console.error('addToCart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/cart/:id
async function updateCartItem(req, res) {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity invalidă' });
    }

    const existing = await prisma.cartItem.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Item-ul nu există în coșul tău' });
    }

    const item = await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    res.json(item);
  } catch (err) {
    console.error('updateCartItem error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/cart/:id
async function deleteCartItem(req, res) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.cartItem.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Item-ul nu există în coșul tău' });
    }

    await prisma.cartItem.delete({
      where: { id }
    });

    res.json({ message: 'Șters din coș' });
  } catch (err) {
    console.error('deleteCartItem error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/cart  – golește coșul utilizatorului curent
async function clearCart(req, res) {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({ message: 'Coș golit' });
  } catch (err) {
    console.error('clearCart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
};
