import { useState } from "react"

function App() {
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [summary, setSummary] = useState("")
  const [sentencesCount, setSentencesCount] = useState(3)
  const [history, setHistory] = useState([])
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [summaryError, setSummaryError] = useState("")
  const [historyError, setHistoryError] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const limit = 5

  const handleSummarize = async (e) => {
    e.preventDefault()
    if (!text.trim() && !url.trim()) {
      setSummaryError("Please provide either text or a valid URL.")
      return
    }
    if (url.trim() && !isValidUrl(url.trim())) {
      setSummaryError("Invalid URL format. Please provide a valid URL.")
      return
    }
    setSummaryError("")
    setLoading(true)
    try {
      const body = { text: text.trim() || undefined, url: url.trim() || undefined, sentences_count: sentencesCount }
      const res = await fetch("http://127.0.0.1:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error("An error occurred while summarizing.")
      const data = await res.json()
      setSummary(data.summary)
      setText("")
      setUrl("")
    } catch (err) {
      setSummaryError(err.message)
    }
    setLoading(false)
  }

  const loadHistory = async (reset = false) => {
    setHistoryError("")
    setLoading(true)
    try {
      const newOffset = reset ? 0 : offset
      const params = new URLSearchParams({ limit, offset: newOffset })
      if (search.trim()) params.append("search", search.trim())
      const res = await fetch("http://127.0.0.1:8000/history?" + params.toString())
      if (!res.ok) throw new Error("An error occurred while loading history.")
      const data = await res.json()
      if (reset && data.length === 0) {
        setHistoryError("No history available.")
        setLoading(false)
        return
      }
      if (reset) {
        setHistory(data)
        setOffset(limit)
      } else {
        setHistory((prev) => [...prev, ...data])
        setOffset((prev) => prev + limit)
      }
      setShowHistory(true)
    } catch (err) {
      setHistoryError(err.message)
    }
    setLoading(false)
  }

  const handleDeleteOne = async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/history/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("An error occurred while deleting the record.")
      setHistory((prev) => prev.filter((h) => h.id !== id))
    } catch (err) {
      setHistoryError(err.message)
    }
    setLoading(false)
  }

  const handleDeleteAll = async () => {
    if (history.length === 0) {
      setHistoryError("No history to delete.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/history", { method: "DELETE" })
      if (!res.ok) throw new Error("An error occurred while clearing history.")
      setHistory([])
    } catch (err) {
      setHistoryError(err.message)
    }
    setLoading(false)
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="bg-black min-h-screen text-blue-300">
      <div className="w-full h-16 flex items-center justify-center pt-12 pb-8">
        <h1 className="text-4xl font-bold text-white">Text Summarizer</h1>
      </div>
      <div className="max-w-6xl mx-auto py-8 px-4 md:grid md:grid-cols-2 md:gap-8">
        <div className="flex flex-col space-y-6">
          {summaryError && (
            <div className="bg-red-500 text-white p-3 rounded shadow-md text-center font-semibold">
              {summaryError}
            </div>
          )}
          <form onSubmit={handleSummarize} className="bg-gray-800 p-4 rounded shadow-lg space-y-4">
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
            <button
              type="submit"
              className="w-full p-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
              disabled={loading}
            >
              {loading ? "Summarizing..." : "Summarize"}
            </button>
          </form>
          {summary && (
            <div className="bg-gray-800 p-4 rounded shadow-lg">
              <h2 className="font-bold mb-2 text-white">Summary</h2>
              <p className="text-blue-300">{summary}</p>
            </div>
          )}
        </div>
        <div className="mt-8 md:mt-0 flex flex-col space-y-4">
          {historyError && (
            <div className="bg-red-500 text-white p-3 rounded shadow-md text-center font-semibold">
              {historyError}
            </div>
          )}
          <button
            onClick={() => loadHistory(true)}
            className="p-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
          >
            Load History
          </button>
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
                  onClick={() => { setHistory([]); loadHistory(true) }}
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
                <div key={item.id} className="border-b border-gray-600 pb-2 text-white">
                  <div className="font-bold">ID {item.id}</div>
                  <div className="text-blue-300">{item.summary_text}</div>
                  <div className="text-sm text-gray-400">{new Date(item.created_at).toLocaleString()}</div>
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
  )
}

export default App
