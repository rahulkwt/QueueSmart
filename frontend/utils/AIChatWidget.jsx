import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./AIChatWidget.css";

const API_URL = "http://localhost:3000/api/ai/chat";
const MESSAGE_LIMIT = 15;
const LIMIT_MESSAGE =
  "You have reached the message limit, please open a new chat for further help.";

function welcomeMessage(isAdmin) {
  return {
    role: "assistant",
    text: isAdmin
      ? "Ask me about queue status, which service needs attention, or how to manage the system."
      : "Ask me about your queue status or how to use the system.",
    system: true, 
  };
}

const AIChatWidget = ({ isAdmin }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [welcomeMessage(isAdmin)]);
  const [loading, setLoading] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  const resetChat = () => {
    setMessages([welcomeMessage(isAdmin)]);
    setExchangeCount(0);
    setInput("");
  };

  const limitReached = exchangeCount >= MESSAGE_LIMIT;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);

    if (limitReached) {
      setMessages((prev) => [...prev, { role: "assistant", text: LIMIT_MESSAGE }]);
      return;
    }

    setLoading(true);

    // Filter out system messages — they are hardcoded, not real AI turns
    const history = messages
      .filter((m) => !m.system)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      const reply = res.ok
        ? data.reply
        : data.error || "Something went wrong. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      if (res.ok) setExchangeCount((c) => c + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-widget">
      {open && (
        <div className="ai-window">
          <div className="ai-header">
            <div className="ai-header-title">
              <span className="ai-header-dot" />
              QueueSmart AI
            </div>
            <div className="ai-header-actions">
              <button onClick={resetChat} className="ai-btn-icon" title="New chat">
                ↺
              </button>
              <button onClick={() => setOpen(false)} className="ai-btn-icon" title="Close">
                ✕
              </button>
            </div>
          </div>

          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ai-msg--${m.role}`}>
                {m.role === "assistant" ? (
                  <span dangerouslySetInnerHTML={{ __html: m.text }} />
                ) : (
                  m.text
                )}
              </div>
            ))}
            {loading && (
              <div className="ai-msg ai-msg--assistant ai-typing">
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="ai-input-area">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={limitReached ? "Message limit reached" : "Ask a question…"}
              rows={2}
              disabled={loading}
              className="ai-textarea"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="ai-send-btn"
              title="Send"
            >
              ➤
            </button>
          </div>

          <div className="ai-footer">
            {exchangeCount} / {MESSAGE_LIMIT} messages
          </div>
        </div>
      )}

      <button
        className={`ai-toggle ${open ? "ai-toggle--open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        title="AI Assistant"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
};

export default AIChatWidget;
