const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

// PUT /api/users/me
// body: { email?, currentPassword?, newPassword? }
async function updateMe(req, res) {
  try {
    const userId = req.user.id;
    const { email, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const dataToUpdate = {};

    // schimbare email
    if (email && email !== user.email) {
      // verificăm să nu fie deja folosit
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: 'Emailul este deja folosit' });
      }
      dataToUpdate.email = email;
    }

    // schimbare parolă
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: 'Trebuie să introduci parola curentă' });
      }

      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) {
        return res.status(400).json({ message: 'Parola curentă este greșită' });
      }

      const hash = await bcrypt.hash(newPassword, 10);
      dataToUpdate.passwordHash = hash;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res
        .status(400)
        .json({ message: 'Nu ai trimis niciun câmp de actualizat' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, email: true, role: true }
    });

    res.json({
      message: 'Profil actualizat cu succes',
      user: updated
    });
  } catch (err) {
    console.error('updateMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/users/me
async function deleteMe(req, res) {
  try {
    const userId = req.user.id;

    await prisma.$transaction(async tx => {
      
      await tx.orderItem.deleteMany({
        where: { order: { userId } }
      });

      await tx.order.deleteMany({
        where: { userId }
      });

      await tx.pcBuildComponent.deleteMany({
        where: { pcBuild: { userId } }
      });

      await tx.pcBuild.deleteMany({
        where: { userId }
      });

      await tx.cartItem.deleteMany({
        where: { userId }
      });

      await tx.user.delete({
        where: { id: userId }
      });
    });

    res.json({ message: 'Cont șters cu succes' });
  } catch (err) {
    console.error('deleteMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { updateMe, deleteMe };
