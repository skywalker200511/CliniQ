/**
 * Message Service — Internal messaging between Doctor and Receptionist.
 */
import { ACTIONS } from '../data/store';

/** Send a new message */
export function sendMessage(dispatch, { senderId, senderRole, senderName, receiverId, receiverRole, content }) {
  const message = {
    id: `msg-${Date.now()}`,
    senderId,
    senderRole,
    senderName,
    receiverId,
    receiverRole,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };
  dispatch({ type: ACTIONS.ADD_MESSAGE, payload: message });
  return message;
}

/** Get all messages for a user */
export function getMessages(state, userId) {
  return state.messages.filter(m => m.senderId === userId || m.receiverId === userId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/** Get conversation between two users */
export function getConversation(state, user1Id, user2Id) {
  return state.messages.filter(m =>
    (m.senderId === user1Id && m.receiverId === user2Id) ||
    (m.senderId === user2Id && m.receiverId === user1Id)
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/** Mark a message as read */
export function markAsRead(dispatch, messageId) {
  dispatch({ type: ACTIONS.MARK_MESSAGE_READ, payload: messageId });
}

/** Get unread message count for a user */
export function getUnreadCount(state, userId) {
  return state.messages.filter(m => m.receiverId === userId && !m.read).length;
}

/** Format timestamp for display */
export function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
