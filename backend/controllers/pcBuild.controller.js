const prisma = require('../prismaClient');

// funcție helper – calculează prețul total al build-ului
function computeBuildTotal(components, includeService, servicePrice = 0) {
  const componentsTotal = components.reduce((sum, c) => {
    return sum + c.quantity * (c.product?.price ?? 0);
  }, 0);

  return componentsTotal + (includeService ? servicePrice : 0);
}

// GET /api/builds  – toate build-urile userului curent
async function getBuilds(req, res) {
  try {
    const builds = await prisma.pcBuild.findMany({
      where: { userId: req.user.id },
      include: {
        components: {
          include: { product: true }
        }
      }
    });

    // căutăm o singură dată produsul de tip "Service"
    const serviceProduct = await prisma.product.findFirst({
      where: { category: 'Service' }
    });

    const result = builds.map(b => {
      const total = computeBuildTotal(
        b.components,
        b.isAssembledByShop && !!serviceProduct,
        serviceProduct?.price ?? 0
      );

      return {
        ...b,
        totalPrice: total
      };
    });

    res.json(result);
  } catch (err) {
    console.error('getBuilds error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/builds/:id – build-ul userului curent
async function getBuildById(req, res) {
  try {
    const id = Number(req.params.id);

    const build = await prisma.pcBuild.findFirst({
      where: { id, userId: req.user.id },
      include: {
        components: {
          include: { product: true }
        }
      }
    });

    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    const serviceProduct = await prisma.product.findFirst({
      where: { category: 'Service' }
    });

    const totalPrice = computeBuildTotal(
      build.components,
      build.isAssembledByShop && !!serviceProduct,
      serviceProduct?.price ?? 0
    );

    res.json({
      ...build,
      totalPrice
    });
  } catch (err) {
    console.error('getBuildById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/builds
// body:
// {
//   "name": "PC Gaming RTX",
//   "isAssembledByShop": true,
//   "components": [
//      { "productId": 1, "roleInBuild": "CPU", "quantity": 1 },
//      { "productId": 2, "roleInBuild": "GPU", "quantity": 1 }
//   ]
// }
async function createBuild(req, res) {
  try {
    const { name, isAssembledByShop, components } = req.body;

    if (!name || !Array.isArray(components) || components.length === 0) {
      return res
        .status(400)
        .json({ message: 'Nume și cel puțin o componentă sunt necesare' });
    }

    // verificăm că produsele există
    const productIds = components.map(c => c.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    if (products.length !== productIds.length) {
      return res
        .status(400)
        .json({ message: 'Unele produse din build nu există' });
    }

    const build = await prisma.pcBuild.create({
      data: {
        name,
        isAssembledByShop: !!isAssembledByShop,
        userId: req.user.id,
        components: {
          create: components.map(c => ({
            productId: c.productId,
            roleInBuild: c.roleInBuild,
            quantity: c.quantity ?? 1
          }))
        }
      },
      include: {
        components: {
          include: { product: true }
        }
      }
    });

    res.status(201).json(build);
  } catch (err) {
    console.error('createBuild error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/builds/:id – actualizează nume / flag asamblare
async function updateBuild(req, res) {
  try {
    const id = Number(req.params.id);
    const { name, isAssembledByShop } = req.body;

    const build = await prisma.pcBuild.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    const updated = await prisma.pcBuild.update({
      where: { id },
      data: {
        name: name ?? build.name,
        isAssembledByShop:
          typeof isAssembledByShop === 'boolean'
            ? isAssembledByShop
            : build.isAssembledByShop
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('updateBuild error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/builds/:id
async function deleteBuild(req, res) {
  try {
    const id = Number(req.params.id);

    // ne asigurăm că build-ul e al userului curent
    const build = await prisma.pcBuild.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    await prisma.pcBuildComponent.deleteMany({
      where: { pcBuildId: id }
    });

    await prisma.pcBuild.delete({
      where: { id }
    });

    res.json({ message: 'Build șters' });
  } catch (err) {
    console.error('deleteBuild error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/builds/:id/add-to-cart
async function addBuildToCart(req, res) {
  try {
    const id = Number(req.params.id);

    const build = await prisma.pcBuild.findFirst({
      where: { id, userId: req.user.id },
      include: {
        components: true
      }
    });

    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    const components = await prisma.pcBuildComponent.findMany({
      where: { pcBuildId: build.id },
      include: { product: true }
    });

    if (components.length === 0) {
      return res
        .status(400)
        .json({ message: 'Build-ul nu are componente, nu poate fi adăugat în coș' });
    }

    const serviceProduct = build.isAssembledByShop
      ? await prisma.product.findFirst({ where: { category: 'Service' } })
      : null;

    if (build.isAssembledByShop && !serviceProduct) {
      return res.status(400).json({
        message:
          'Nu există produsul "Serviciu asamblare" în tabelul Product. Creează-l mai întâi.'
      });
    }

    // tranzacție: toate operațiile pe coș se fac împreună
    await prisma.$transaction(async tx => {
      // componente
      for (const comp of components) {
        const existing = await tx.cartItem.findFirst({
          where: { userId: req.user.id, productId: comp.productId }
        });

        if (existing) {
          await tx.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + comp.quantity }
          });
        } else {
          await tx.cartItem.create({
            data: {
              userId: req.user.id,
              productId: comp.productId,
              quantity: comp.quantity
            }
          });
        }
      }

      // serviciul de asamblare
      if (serviceProduct) {
        const existingService = await tx.cartItem.findFirst({
          where: { userId: req.user.id, productId: serviceProduct.id }
        });

        if (existingService) {
          await tx.cartItem.update({
            where: { id: existingService.id },
            data: { quantity: existingService.quantity + 1 }
          });
        } else {
          await tx.cartItem.create({
            data: {
              userId: req.user.id,
              productId: serviceProduct.id,
              quantity: 1
            }
          });
        }
      }
    });

    res.json({ message: 'Build adăugat în coș' });
  } catch (err) {
    console.error('addBuildToCart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getBuilds,
  getBuildById,
  createBuild,
  updateBuild,
  deleteBuild,
  addBuildToCart
};
