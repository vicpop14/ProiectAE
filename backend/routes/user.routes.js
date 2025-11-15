const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth.middleware');
const { updateMe, deleteMe } = require('../controllers/user.controller');

router.put('/me', requireAuth, updateMe);
router.delete('/me', requireAuth, deleteMe);

module.exports = router;
