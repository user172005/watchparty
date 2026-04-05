const express = require('express');
const { createRoomHandler, getRoomHandler, validateRoomHandler } = require('../controllers/roomController');
const { verifyToken } = require('../controllers/authController');
const router = express.Router();

router.post('/create', verifyToken, createRoomHandler);
router.get('/:roomId', verifyToken, getRoomHandler);
router.get('/:roomId/validate', verifyToken, validateRoomHandler);

module.exports = router;
