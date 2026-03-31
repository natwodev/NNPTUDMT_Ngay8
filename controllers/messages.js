const MessageModel = require('../schemas/messages');
const mongoose = require('mongoose');

module.exports = {
    GetMessagesBetweenUsers: async (user1, user2) => {
        try {
            return await MessageModel.find({
                $or: [
                    { from: user1, to: user2 },
                    { from: user2, to: user1 }
                ]
            }).sort({ createdAt: 1 });
        } catch (error) {
            throw error;
        }
    },
    CreateMessage: async (from, to, type, text) => {
        try {
            const newMessage = new MessageModel({
                from: from,
                to: to,
                messageContent: {
                    type: type,
                    text: text
                }
            });
            return await newMessage.save();
        } catch (error) {
            throw error;
        }
    },
    GetLatestMessagesForEachConversation: async (currentUserID) => {
        try {
            // Lấy toàn bộ tin nhắn liên quan đến user hiện tại, sắp xếp mới nhất trước
            const allMessages = await MessageModel.find({
                $or: [
                    { from: currentUserID },
                    { to: currentUserID }
                ]
            })
                .sort({ createdAt: -1 })
                .populate('from', 'username fullName avatarUrl')
                .populate('to', 'username fullName avatarUrl');

            // Nhóm theo người chat cùng, chỉ giữ tin nhắn mới nhất
            const conversationMap = new Map();

            for (const msg of allMessages) {
                // Xác định người chat cùng (không phải user hiện tại)
                const otherUserID = msg.from._id.toString() === currentUserID.toString()
                    ? msg.to._id.toString()
                    : msg.from._id.toString();

                // Chỉ lưu tin nhắn đầu tiên (mới nhất) cho mỗi người
                if (!conversationMap.has(otherUserID)) {
                    conversationMap.set(otherUserID, {
                        _id: otherUserID,
                        lastMessage: msg
                    });
                }
            }

            return Array.from(conversationMap.values());
        } catch (error) {
            throw error;
        }
    }
};
