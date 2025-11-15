const prisma = require('../prismaClient');

// POST /api/orders/checkout
async function checkout(req, res) {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Coșul este gol' });
    }

    const total = cartItems.reduce((sum, item) => {
      return sum + item.quantity * (item.product?.price ?? 0);
    }, 0);

    const order = await prisma.$transaction(async tx => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          total,
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtOrder: item.product?.price ?? 0
            }))
          }
        },
        include: {
          items: {
            include: { product: true }
          }
        }
      });

      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return createdOrder;
    });

    res.json({
      message: 'Comanda a fost plasată cu succes!',
      order
    });
  } catch (err) {
    console.error('checkout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/orders  – comenzile utilizatorului curent
async function getMyOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    res.json(orders);
  } catch (err) {
    console.error('getMyOrders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { checkout, getMyOrders };
