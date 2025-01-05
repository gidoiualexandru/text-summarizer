import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [sentencesCount, setSentencesCount] = useState(3);
  const [history, setHistory] = useState([]);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const limit = 5;

  const handleSummarize = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        text: text.trim() || undefined,
        url: url.trim() || undefined,
        sentences_count: sentencesCount,
      };
      const res = await fetch("http://127.0.0.1:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSummary(data.summary);
      setText("");
      setUrl("");
    } catch {}
    setLoading(false);
  };

  const loadHistory = async (reset = false) => {
    setLoading(true);
    try {
      const newOffset = reset ? 0 : offset;
      const params = new URLSearchParams({ limit, offset: newOffset });
      if (search.trim()) params.append("search", search.trim());
      const res = await fetch(
        "http://127.0.0.1:8000/history?" + params.toString()
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (reset) {
        setHistory(data);
        setOffset(limit);
      } else {
        setHistory((prev) => [...prev, ...data]);
        setOffset((prev) => prev + limit);
      }
      setShowHistory(true);
    } catch {}
    setLoading(false);
  };

  const handleDeleteOne = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/history/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {}
    setLoading(false);
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/history", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setHistory([]);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="bg-black min-h-screen text-blue-300">
      <div className="w-full h-16 flex items-center justify-center pt-12 pb-6">
        <h1 className="text-4xl font-bold text-white">Text Summarizer</h1>
      </div>
      <div className="max-w-6xl mx-auto py-8 px-4 md:grid md:grid-cols-2 md:gap-8">
        <div className="flex flex-col space-y-6">
          <form
            onSubmit={handleSummarize}
            className="bg-gray-800 p-4 rounded shadow-lg space-y-4"
          >
            <textarea
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none"
              rows={4}
              placeholder="Text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <input
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <input
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none"
              type="number"
              min="1"
              max="10"
              value={sentencesCount}
              onChange={(e) => setSentencesCount(parseInt(e.target.value))}
            />
            <button className="w-full p-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500">
              Summarize
            </button>
          </form>
          {loading && (
            <div className="mt-2 animate-spin rounded-full h-8 w-8 border-4 border-blue-400 border-t-transparent mx-auto"></div>
          )}
          {!loading && summary && (
            <div className="bg-gray-800 p-4 rounded shadow-lg">
              <h2 className="font-bold mb-2 text-white">Summary</h2>
              <p className="text-blue-300">{summary}</p>
            </div>
          )}
        </div>
        <div className="mt-8 md:mt-0 flex flex-col space-y-4">
          {!showHistory && (
            <button
              onClick={() => loadHistory(true)}
              className="p-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
            >
              Load History
            </button>
          )}
          {showHistory && (
            <div className="bg-gray-800 p-4 rounded shadow-lg space-y-4">
              <div className="flex space-x-2">
                <input
                  className="flex-1 p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  onClick={() => {
                    setHistory([]);
                    loadHistory(true);
                  }}
                  className="p-3 rounded bg-green-600 text-white font-semibold hover:bg-green-500"
                >
                  Search
                </button>
              </div>
              <button
                onClick={handleDeleteAll}
                className="w-full p-3 rounded bg-red-600 text-white font-semibold hover:bg-red-500"
              >
                Clear All
              </button>
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-gray-600 pb-2 text-white"
                >
                  <div className="font-bold">ID {item.id}</div>
                  <div className="text-blue-300">{item.summary_text}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleDeleteOne(item.id)}
                    className="mt-1 p-2 rounded bg-red-500 text-white font-semibold hover:bg-red-400"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {history.length > 0 && (
                <button
                  onClick={() => loadHistory(false)}
                  className="w-full p-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
