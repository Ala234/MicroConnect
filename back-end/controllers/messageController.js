const mongoose = require('mongoose');
const Message = require('../models/Message');

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

exports.getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    if (!isObjectId(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const me = req.user._id;
    const messages = await Message.find({
      $or: [
        { sender: me, recipient: otherUserId },
        { sender: otherUserId, recipient: me },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;

    if (!isObjectId(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipient id' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }
    if (String(recipientId) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot send a message to yourself' });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      text: text.trim(),
    });

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
