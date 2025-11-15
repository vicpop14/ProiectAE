const prisma = require('../prismaClient');

// GET /api/products
async function getAllProducts(req, res) {
  try {
    const { category, q } = req.query;

    const where = {};
    if (category) where.category = category;
    if (q) {
      where.name = { contains: q, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { id: 'asc' }
    });

    res.json(products);
  } catch (err) {
    console.error('getAllProducts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/products/:id
async function getProductById(req, res) {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    console.error('getProductById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/products  (ADMIN)
async function createProduct(req, res) {
  try {
    const { name, description, category, price, imageUrl, stock } = req.body;

    if (!name || !category || price == null) {
      return res
        .status(400)
        .json({ message: 'Nume, categorie și preț sunt obligatorii' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price,
        imageUrl,
        stock: stock ?? 0
      }
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/products/:id  (ADMIN)
async function updateProduct(req, res) {
  try {
    const id = Number(req.params.id);
    const { name, description, category, price, imageUrl, stock } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        description: description ?? existing.description,
        category: category ?? existing.category,
        price: price ?? existing.price,
        imageUrl: imageUrl ?? existing.imageUrl,
        stock: stock ?? existing.stock
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('updateProduct error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/products/:id  (ADMIN)
async function deleteProduct(req, res) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('deleteProduct error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
