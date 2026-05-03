const express = require('express');
const { getConversation, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:userId', protect, getConversation);
router.post('/', protect, sendMessage);

module.exports = router;
