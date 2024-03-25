const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatAppSignUp'
    },

    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatAppSignUp'
    },

    text: String,
}, { timestamps: true });

const MessageModel = mongoose.models.ChatMessage || mongoose.model("ChatMessage", MessageSchema);

module.exports = MessageModel;