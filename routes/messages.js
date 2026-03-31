const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messages');
const { CheckLogin } = require('../utils/authHandler');
const { uploadAll } = require('../utils/uploadHandler');

// GET all conversations (Last message from each user)
router.get('/', CheckLogin, async (req, res) => {
    try {
        const currentUserID = req.user._id;
        const result = await messageController.GetLatestMessagesForEachConversation(currentUserID);
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// GET messages between current user and a target ID
router.get('/:userID', CheckLogin, async (req, res) => {
    try {
        const userID = req.params.userID;
        const currentUserID = req.user._id;

        const messages = await messageController.GetMessagesBetweenUsers(currentUserID, userID);
        res.status(200).send(messages);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// POST send a message (text or file)
router.post('/', CheckLogin, uploadAll.single('file'), async (req, res) => {
    try {
        const { to, text } = req.body;
        const from = req.user._id;
        let finalType = 'text';
        let finalText = text;

        if (req.file) {
            finalType = 'file';
            finalText = req.file.path;
        }

        if (!finalText && !req.file) {
            return res.status(400).send({ message: "No message content or file provided" });
        }

        const message = await messageController.CreateMessage(from, to, finalType, finalText);
        res.status(201).send(message);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
