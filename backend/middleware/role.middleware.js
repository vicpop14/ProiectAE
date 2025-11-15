function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Neautentificat' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Ai nevoie de rolul admin pentru această acțiune' });
  }

  next();
}

module.exports = { requireAdmin };
