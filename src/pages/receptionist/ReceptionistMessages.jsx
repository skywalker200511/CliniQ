import { useState } from 'react';
import { useAppContext } from '../../data/store';
import { getMessages, formatMessageTime, sendMessage } from '../../services/messageService';
import './ReceptionistMessages.css';

export default function ReceptionistMessages() {
  const { state, dispatch } = useAppContext();
  const [newMessage, setNewMessage] = useState('');
  
  const currentUser = state.currentUser;
  const messages = getMessages(state, currentUser?.id || 'rec-001');

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(dispatch, {
      senderId: currentUser?.id || 'rec-001',
      senderRole: 'receptionist',
      senderName: currentUser?.fullName || 'Receptionist',
      receiverId: 'doc-001', // Sending to doctor 1 for demo
      receiverRole: 'doctor',
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  return (
    <div className="receptionist-messages">
      <div className="page-header">
        <div>
          <h1 className="text-display">Internal Communications</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Direct messaging with consultation rooms.
          </p>
        </div>
      </div>

      <div className="messages-container">
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-recipient">
              <div className="recipient-avatar">
                <span className="material-symbols-outlined">stethoscope</span>
              </div>
              <div className="recipient-info">
                <div className="text-label-md">Doctor</div>
                <div className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>Room 102</div>
              </div>
            </div>
          </div>

          <div className="chat-history">
            {messages.map(msg => {
              const isMine = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                  {!isMine && <div className="message-sender">{msg.senderName}</div>}
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">{formatMessageTime(msg.timestamp)}</div>
                </div>
              );
            })}
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Type a message to the doctor..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
              <span className="material-symbols-outlined">send</span> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
