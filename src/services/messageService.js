import { supabase } from '../lib/supabase';
import { ACTIONS } from '../data/store';

export async function sendMessage(dispatch, { senderId, senderRole, senderName, receiverId, receiverRole, content }) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      sender_id: senderId,
      sender_role: senderRole,
      sender_name: senderName,
      receiver_id: receiverId,
      receiver_role: receiverRole,
      content,
      read: false
    }])
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }
  return data;
}

export function getMessages(state, userId) {
  return state.messages
    .filter(m => m.senderId === userId || m.receiverId === userId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export async function markAsRead(dispatch, messageId) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);
    
  if (error) console.error('Error marking as read:', error);
}

export function getUnreadCount(state, userId) {
  return state.messages.filter(m => m.receiverId === userId && !m.read).length;
}

export function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
