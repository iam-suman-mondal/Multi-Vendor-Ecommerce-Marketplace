import { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!question.trim()) return;

    const userQuestion = question;

    // Show user's question
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: userQuestion,
      },
    ]);

    setQuestion("");

    try {
      const response = await fetch("http://localhost:9099/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
        }),
      });

      const data = await response.json();

      // Show only answer + required product details
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          answer: data.answer,
          products: data.combined_data || [],
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          answer: "Sorry, something went wrong. Please try again.",
          products: [],
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          className="btn btn-primary rounded-circle shadow position-fixed"
          style={{
            right: "25px",
            bottom: "25px",
            width: "60px",
            height: "60px",
            zIndex: 9999,
          }}
          onClick={() => setOpen(true)}
        >
          💬
        </button>
      )}

      {/* Chatbot */}
      {open && (
        <div
          className="card shadow position-fixed"
          style={{
            width: "400px",
            height: "600px",
            right: "25px",
            bottom: "25px",
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <strong>Shopping Assistant</strong>

            <button
              className="btn btn-sm text-white"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            className="card-body overflow-auto"
            style={{ backgroundColor: "#f5f5f5" }}
          >
            {messages.length === 0 && (
              <div className="text-center text-muted mt-5">
                👋
                <br />
                Hi! What are you looking for?
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className="mb-3">

                {/* User */}
                {message.type === "user" && (
                  <div className="text-end">
                    <span className="badge bg-primary p-2">
                      {message.text}
                    </span>
                  </div>
                )}

                {/* Bot */}
                {message.type === "bot" && (
                  <div>
                    {/* LLM answer */}
                    <div className="bg-white rounded p-3 shadow-sm mb-2">
                      {message.answer}
                    </div>

                    {/* Product details */}
                    {message.products.map((item) => {
                      const product = item.live_data;

                      return (
                        <div
                          key={item.productId}
                          className="bg-white rounded p-3 mb-2 shadow-sm"
                        >
                          <div className="fw-bold">
                            {product.name}
                          </div>

                          <div className="text-muted">
                            Brand: {product.brand}
                          </div>

                          <div>
                            Price: ₹{product.price}
                          </div>

                          <div className="text-success">
                            Stock: {product.availableQuantity} pcs
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="card-footer">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Ask about products..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                className="btn btn-primary"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}