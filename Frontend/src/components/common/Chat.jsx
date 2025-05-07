import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api/chat';

const Chat = ({ requestId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const disconnectRef = useRef(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/${requestId}/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch chat history');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [requestId, token]);

  useEffect(() => {
    if (!token) return;
    disconnectRef.current = false;
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
    });
    setSocket(socketInstance);
    socketInstance.emit('join', { requestId, token });
    socketInstance.on('chatMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socketInstance.on('error', (msg) => setError(msg));
    socketInstance.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      if (!disconnectRef.current) {
        setError('Socket.IO disconnected');
      }
    });
    return () => {
      disconnectRef.current = true;
      socketInstance.disconnect();
    };
  }, [requestId, token]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('chatMessage', { requestId, content: input });
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto flex flex-col h-[80vh]">
        <div className="flex items-center justify-between px-4 py-3 bg-black rounded-t-lg">
          <h2 className="font-bold text-lg text-white">Chat</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {loading ? (
            <div>Loading chat...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((msg) => {
                const isMe = msg.role === user.role;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl shadow text-sm relative
                        ${isMe ? 'bg-black text-white rounded-br-none' : 'bg-white text-black rounded-bl-none border border-black'}`}
                    >
                      <span className="block font-semibold text-xs mb-1 opacity-80">
                        {msg.sender?.username || msg.role}
                      </span>
                      <span>{msg.content}</span>
                      <span className="block text-[10px] text-right opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t bg-white sticky bottom-0 rounded-b-lg">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-black rounded-full focus:outline-none"
          />
          <button type="submit" className="px-4 py-2 bg-black text-white rounded-full font-semibold" disabled={!input.trim() || !socket}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 