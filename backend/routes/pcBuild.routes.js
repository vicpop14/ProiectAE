const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth.middleware');
const {
  getBuilds,
  getBuildById,
  createBuild,
  updateBuild,
  deleteBuild,
  addBuildToCart
} = require('../controllers/pcBuild.controller');

router.get('/', requireAuth, getBuilds);
router.get('/:id', requireAuth, getBuildById);
router.post('/', requireAuth, createBuild);
router.put('/:id', requireAuth, updateBuild);
router.delete('/:id', requireAuth, deleteBuild);
router.post('/:id/add-to-cart', requireAuth, addBuildToCart);

module.exports = router;
