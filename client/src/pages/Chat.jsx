import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlinePaperAirplane, HiOutlineChatAlt2, HiOutlineArrowLeft } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import './Chat.css';

export default function Chat() {
  const { id: chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (chatId) loadChat(chatId);
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat');
      setConversations(data);
    } catch { /* */ }
    setLoading(false);
  };

  const loadChat = async (id) => {
    try {
      const { data } = await api.get(`/chat/${id}`);
      setActiveChat(data);
      setMessages(data.messages || []);
      // Start polling
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const { data: updated } = await api.get(`/chat/${id}`);
          setMessages(updated.messages || []);
        } catch { /* */ }
      }, 5000);
    } catch {
      toast.error('Conversation not found');
    }
  };

  const selectChat = (conv) => {
    navigate(`/chat/${conv._id}`);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !chatId) return;
    setSending(true);
    try {
      const { data } = await api.post(`/chat/${chatId}/message`, { text: newMsg.trim() });
      setMessages(prev => [...prev, data]);
      setNewMsg('');
      // Update conversation list
      setConversations(prev => prev.map(c =>
        c._id === chatId ? { ...c, lastMessage: newMsg.trim(), updatedAt: new Date() } : c
      ));
    } catch {
      toast.error('Failed to send message');
    }
    setSending(false);
  };

  const getOtherUser = (conv) => {
    return conv.participants?.find(p => p._id !== user?._id);
  };

  const formatTime = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString('en-IN', { weekday: 'short' });
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) return <div className="page"><LoadingSpinner text="Loading conversations..." /></div>;

  return (
    <div className="page chat-page">
      <div className="container">
        <div className="chat-layout">
          {/* Conversations List */}
          <div className={`chat-sidebar ${chatId ? 'hide-mobile' : ''}`}>
            <div className="chat-sidebar-header">
              <h2>Messages</h2>
            </div>
            {conversations.length > 0 ? (
              <div className="conv-list">
                {conversations.map(conv => {
                  const other = getOtherUser(conv);
                  return (
                    <button key={conv._id}
                      className={`conv-item ${chatId === conv._id ? 'active' : ''}`}
                      onClick={() => selectChat(conv)}>
                      <div className="conv-avatar">
                        {other?.avatar ? <img src={other.avatar} alt="" /> : <span>{other?.name?.charAt(0)}</span>}
                      </div>
                      <div className="conv-info">
                        <div className="conv-top">
                          <span className="conv-name">{other?.name}</span>
                          <span className="conv-time">{formatTime(conv.updatedAt)}</span>
                        </div>
                        <p className="conv-preview">{conv.lastMessage || 'No messages yet'}</p>
                        {conv.property && (
                          <span className="conv-property">Re: {conv.property.title?.slice(0, 30)}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-2xl)' }}>
                <HiOutlineChatAlt2 size={36} />
                <p>No conversations yet</p>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className={`chat-main ${!chatId ? 'hide-mobile' : ''}`}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <button className="btn btn-ghost btn-sm chat-back" onClick={() => navigate('/chat')}>
                    <HiOutlineArrowLeft size={18} />
                  </button>
                  <div className="chat-header-user">
                    <div className="conv-avatar sm">
                      {getOtherUser(activeChat)?.avatar
                        ? <img src={getOtherUser(activeChat).avatar} alt="" />
                        : <span>{getOtherUser(activeChat)?.name?.charAt(0)}</span>}
                    </div>
                    <div>
                      <p className="chat-header-name">{getOtherUser(activeChat)?.name}</p>
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                        {getOtherUser(activeChat)?.role}
                      </span>
                    </div>
                  </div>
                  {activeChat.property && (
                    <span className="chat-header-prop">
                      {activeChat.property.title?.slice(0, 40)}
                    </span>
                  )}
                </div>

                {/* Messages */}
                <div className="chat-messages">
                  {messages.map((msg, i) => {
                    const isMine = (msg.sender?._id || msg.sender) === user?._id;
                    return (
                      <div key={i} className={`message ${isMine ? 'mine' : 'theirs'}`}>
                        <div className="message-bubble">
                          <p>{msg.text}</p>
                          <span className="message-time">{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chat-input-form" onSubmit={sendMessage} id="chat-send-form">
                  <input
                    type="text"
                    className="form-input chat-input"
                    placeholder="Type a message..."
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    id="chat-input"
                  />
                  <button type="submit" className="btn btn-primary chat-send-btn" disabled={sending || !newMsg.trim()}>
                    <HiOutlinePaperAirplane size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-empty">
                <HiOutlineChatAlt2 size={56} />
                <h3>Select a conversation</h3>
                <p>Choose from your existing conversations or start a new one from a property page</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
