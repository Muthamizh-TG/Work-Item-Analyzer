import React, { useState } from "react";

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .analyzer-container * {
    box-sizing: border-box;
  }

  .analyzer-container textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }

  .analyzer-button:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .analyzer-answer {
    animation: fadeIn 0.4s ease-out;
  }

  @media (max-width: 768px) {
    .analyzer-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

function AnalyzerPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setAnswer(data.answer);

      if (question.trim()) {
        setHistory([{ question, answer: data.answer }, ...history.slice(0, 4)]);
      }
      setQuestion(""); // auto-clear after response
    } catch (err) {
      setError("Couldn't connect to the analysis service");
      if (question.trim()) {
        setHistory([{ question, answer: null, error: true }, ...history.slice(0, 4)]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "#0f172a",
        }}
        className="analyzer-container"
      >
        {/* Header */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "1.5rem 1rem",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>
            Work Item Analyzer
          </h1>
          <p style={{ margin: "0.375rem 0 0", color: "#64748b", fontSize: "0.95rem" }}>
            Ask anything about your projects | Powered by <span style={{color: "#000", fontWeight: "600"}}>Technology Garage</span>
          </p>
        </header>

        <main
          style={{
            maxWidth: "1200px",
            margin: "2rem auto",
            padding: "0 1rem",
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "1.75rem",
          }}
          className="analyzer-grid"
        >
          {/* Main Question Area */}
          <section
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.5rem", fontWeight: 600 }}>
              Ask a Question
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={6}
                placeholder="Example: Which developer has the most open bugs this month?"
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  resize: "vertical",
                  minHeight: "120px",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                  background: "#ffffff",
                }}
                required
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  alignSelf: "flex-start",
                  padding: "0.75rem 1.75rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "none",
                  background: loading ? "linear-gradient(135deg, #94a3b8ff 0%, #94a3b8ff 100%)" : "linear-gradient(135deg, #060030ff 0%, #000000ff 100%)",
                  color: loading ? "#000000" : "#ffffff",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
                className="analyzer-button"
              >
                {loading ? "Analyzing..." : "Ask Question"}
              </button>
            </form>

            {error && (
              <div
                style={{
                  marginTop: "1.25rem",
                  padding: "1rem",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}

            {answer && (
              <div
                style={{
                  marginTop: "2rem",
                  padding: "1.5rem",
                  background: "#00d9ff0e",
                  borderRadius: "10px",
                  border: "1px solid #00000070",
                  animation: "fadeIn 0.4s ease-out",
                }}
                className="analyzer-answer"
              >
                <div style={{ fontWeight: 700, color: "#230052", marginBottom: "0.75rem", fontSize: "1rem" }}>
                  Answer
                </div>
                <div style={{ whiteSpace: "pre-line", lineHeight: 1.6, color: "#1e293b" }}>
                  {answer}
                </div>
              </div>
            )}
          </section>

          {/* History Sidebar */}
          {history.length > 0 && (
            <aside
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0",
                height: "fit-content",
                position: "sticky",
                top: "2rem",
              }}
            >
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: 600 }}>
                Recent Questions
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestion(item.question)}
                    style={{
                      padding: "0.85rem 1rem",
                      textAlign: "left",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div style={{ fontWeight: 500, color: "#0f172a", marginBottom: "0.25rem" }}>
                      {item.question}
                    </div>
                    {item.answer && (
                      <div style={{ color: "#64748b", fontSize: "0.82rem" }}>
                        {item.answer.substring(0, 70)}
                        {item.answer.length > 70 ? "..." : ""}
                      </div>
                    )}
                    {item.error && (
                      <div style={{ color: "#ef4444", fontSize: "0.82rem" }}>Error occurred</div>
                    )}
                  </button>
                ))}
              </div>
            </aside>
          )}
        </main>
      </div>
    </>
  );
}

export default AnalyzerPage;