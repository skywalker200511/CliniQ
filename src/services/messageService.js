import { supabase } from '../lib/supabase';
import { ACTIONS } from '../data/store';

export async function sendMessage(dispatch, { senderId, senderRole, senderName, receiverId, receiverRole, content }) {
  const localMessage = {
    id: 'msg-' + Date.now(),
    senderId,
    senderRole,
    senderName,
    receiverId,
    receiverRole,
    content,
    timestamp: new Date().toISOString(),
    read: false
  };

  // Optimistically dispatch the message to local state
  dispatch({ type: ACTIONS.ADD_MESSAGE, payload: localMessage });

  try {
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
      console.warn('Supabase messaging error (falling back to local state):', error.message);
      return localMessage;
    }
    return data;
  } catch (err) {
    console.warn('Supabase messaging exception (falling back to local state):', err);
    return localMessage;
  }
}

export function getMessages(state, userId) {
  return state.messages
    .filter(m => m.senderId === userId || m.receiverId === userId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export async function markAsRead(dispatch, messageId) {
  // Optimistically update local state
  dispatch({ type: ACTIONS.MARK_MESSAGE_READ, payload: messageId });

  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);
      
    if (error) console.warn('Supabase mark as read error (falling back to local):', error.message);
  } catch (err) {
    console.warn('Supabase mark as read exception:', err);
  }
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
