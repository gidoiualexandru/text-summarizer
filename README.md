# 📝 Text Summarizer Project

Welcome to the Text Summarizer! This project provides a simple and efficient way to summarize content from either a URL or plain text. Specify the number of sentences (up to 10), and get concise summaries in seconds. Designed with ease of use in mind, this tool is perfect for quickly extracting key points from any text.

✨ Features

    🔍 Summarize Text or URLs: Input plain text or a URL to generate concise summaries using advanced NLP algorithms.
    🗂️ History Management: View, search, and delete previously generated summaries.
    🔄 Pagination: Load summaries incrementally for large datasets.
    🚦 Rate Limiting: Prevent abuse with a simple rate limiter.
    🎨 Beautiful UI: Modern, responsive, and accessible design with dark mode and smooth animations.

🛠️ Tech Stack
Backend

    Python 🐍: Core programming language for server-side logic.
    FastAPI ⚡: Modern, fast (high-performance) web framework for building APIs.
    SQLAlchemy 🗄️: ORM for managing the SQLite database.
    Sumy 🧠: NLP library for generating summaries.
    Newspaper3k 📰: Library for extracting text from URLs.
    SQLite 💾: Lightweight database for storing summaries.
    SwaggerUI: API Documentation

Frontend

    React ⚛️: For building the interactive user interface.
    Tailwind CSS 🎨: Utility-first CSS framework for styling.
    JavaScript (ES6): Powering frontend logic and API communication.

🚀 Getting Started
Prerequisites

    Python 3.10+ 🐍
    Node.js 18+ (with npm or Yarn) 🌐

1️⃣ Backend Setup

Navigate to the backend folder:

    cd backend

Create a virtual environment:

    python -m venv venv

Activate the virtual environment:

On macOS/Linux:

    source venv/bin/activate

On Windows:

    venv\Scripts\activate

Install dependencies:

    pip install -r requirements.txt

Run the FastAPI server:

    uvicorn main:app --reload

Access the API at:

        API Docs: http://127.0.0.1:8000/docs
        API Base URL: http://127.0.0.1:8000

2️⃣ Frontend Setup

Navigate to the frontend folder:

    cd ../frontend

Install dependencies:

    npm install

Start the development server:

    npm start

Open your browser and visit: http://localhost:3000

🧪 Usage

    Enter text or a URL in the input fields on the homepage.
    Click Summarize to generate a summary.
    View the result and access previous summaries in the History section.
    Search, paginate, or delete summaries as needed.

🛡️ Rate Limiting

    Each IP is limited to 15 requests per minute to prevent abuse.
    If exceeded, a 429 Too Many Requests error is returned.

🎨 Customization

    Modify styles in frontend/src/index.css or tailwind.config.js.
    Backend configuration (e.g., database URL or rate limits) can be updated in main.py.
