import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [sentencesCount, setSentencesCount] = useState(3);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requestData = {
      text: text.trim() !== "" ? text : undefined,
      url: url.trim() !== "" ? url : undefined,
      sentences_count: sentencesCount,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }
      const data = await response.json();
      setSummary(data.summary);

      setText("");
      setUrl("");
    } catch (error) {
      console.error(error);
      alert("Error fetching summary. Check console for details.");
    }
  };

  const handleFetchHistory = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/history");
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error(error);
      alert("Error fetching history. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold my-4">Text Summarizer</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-4 rounded shadow-md space-y-4"
      >
        <div>
          <label className="block font-bold mb-2">Text</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here..."
          />
        </div>
        <div>
          <label className="block font-bold mb-2">OR URL</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter a URL..."
          />
        </div>
        <div>
          <label className="block font-bold mb-2">
            Number of Summary Sentences
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            min={1}
            max={10}
            value={sentencesCount}
            onChange={(e) => setSentencesCount(parseInt(e.target.value))}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Summarize
        </button>
      </form>

      {summary && (
        <div className="w-full max-w-md bg-white p-4 rounded shadow-md mt-4">
          <h2 className="text-xl font-bold mb-2">Summary</h2>
          <p>{summary}</p>
        </div>
      )}

      <button
        onClick={handleFetchHistory}
        className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700"
      >
        Load History
      </button>

      {history.length > 0 && (
        <div className="w-full max-w-md bg-white p-4 rounded shadow-md mt-4">
          <h2 className="text-xl font-bold mb-2">History</h2>
          <ul>
            {history.map((record) => (
              <li key={record.id} className="border-b py-2">
                <strong>ID: {record.id}</strong> <br />
                {record.summary_text} <br />
                <small>
                  Created: {new Date(record.created_at).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
