import React, { useState, useEffect, useRef } from "react";
import "./ChatWidget.css";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const suggestions = ["Show routes to Eldoret", "Book a seat", "What's the price?"];

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    // Generate or retrieve session ID
    if (!localStorage.getItem("chat_session_id")) {
      localStorage.setItem("chat_session_id", Math.random().toString(36).substring(7));
    }
    
    // Initial greeting
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          text: "Hi! I'm ShuttleBot. How can I help you book your trip today?",
          sender: "bot"
        }
      ]);
    }
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user"
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const sessionId = localStorage.getItem("chat_session_id");

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId
        })
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botResponseText = "";
      const botMsgId = (Date.now() + 1).toString();

      // Add placeholder bot message
      setMessages(prev => [...prev, { id: botMsgId, text: "", sender: "bot" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.token) {
                botResponseText += data.token;
                setMessages(prev => 
                  prev.map(m => m.id === botMsgId ? { ...m, text: botResponseText } : m)
                );
              }
              if (data.done) {
                setIsTyping(false);
              }
            } catch (e) {
              console.error("Error parsing SSE chunk", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: "error-" + Date.now(),
        text: "Sorry, I encountered an error. Please try again later.",
        sender: "bot"
      }]);
    }
  };

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>ShuttleBot</h3>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>
          
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div className="typing-indicator">ShuttleBot is typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} className="suggestion-btn" onClick={() => handleSend(s)}>
                {s}
              </button>
            ))}
          </div>

          <form 
            className="chat-input-area" 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
          >
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Type a message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="chat-send-btn" disabled={isTyping || !input.trim()}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <div className="chat-bubble" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
      </div>
    </div>
  );
};
