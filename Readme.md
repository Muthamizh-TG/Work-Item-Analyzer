# Work Item Analyzer (CSV-Based AI Bot)

Lightweight CLI-based AI assistant that answers natural-language questions about projects, work items, and developers using **CSV files** as the single source of truth.

Behaves like a helpful teammate — gives meaningful summaries instead of raw data dumps.

---

## Features

- Uses plain CSV files (no database needed)
- Natural, human-friendly answers
- Strict grounding — answers **only** from provided data (no hallucination)
- Supports queries about projects, developers, status, workload, etc.
- Structured & readable response style
- Easy to extend (API / dashboard / embeddings / ...)

---

## Project Structure

```
Work_Item_Analyzer/
├── backend/
│   ├── analyzer.py           ← main CLI version
│   ├── analyzer_online.py    ← FastAPI version (optional)
│   ├── .env
│   └── data/
│       ├── projects_workitems.csv
│       └── developers_workitems.csv
└── frontend/                 ← (optional) modern web UI
    ├── src/
    ├── package.json
    └── ...
```

---

## Requirements

- Python 3.9+
- OpenAI API key

### Python dependencies

```bash
pip install openai python-dotenv colorama
# Optional (for API version):
# pip install fastapi uvicorn
```

---

## Environment Setup

Create `.env` file in `backend/` folder:

```ini
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini          # or gpt-4o, gpt-4-turbo, etc.
```

⚠️ Never commit `.env` to version control!

---

## CSV File Formats

### projects_workitems.csv

```csv
project_name,work_item_id,work_item_title,work_item_type,status,assigned_to
Website Revamp,101,Design login UI,Feature,In Progress,Tamizh
Mobile App,203,Implement dark mode,Feature,To Do,Arun
```

### developers_workitems.csv

```csv
developer_name,work_item_id,work_item_title,project_name,status
Tamizh,101,Design login UI,Website Revamp,In Progress
Arun,203,Implement dark mode,Mobile App,To Do
```

Both files are read and combined internally.

---

## Running the Application

### CLI Version

```bash
cd backend
python analyzer.py
```

You should see:

```
Work Item Analyzer Bot (type 'exit' to quit)
You:
```

### API + Frontend Version

**Backend (FastAPI):**

```bash
cd backend
python analyzer_online.py
```

**Frontend (if you have one):**

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173` (Vite default)

---

## Example Questions to Try

### Easy

- Who is assigned to work item 101?
- What is the status of work item 102?
- Which project does work item 401 belong to?
- Is work item 302 completed or in progress?

### Medium

- List all work items assigned to Tamizh
- Which project has the highest number of open items?
- Are there any completed tasks in QA Automation?
- What is the status of tasks handled by Divya?
- Which work items are Bugs in Website Revamp?

### Advanced

- Which developer is working on the most tasks?
- Which projects have multiple developers involved?
- Are there developers handling both Feature and Bug items?
- List all In Progress work items in Mobile App
- Which developers are working on more than one project?

### Insight / Summary Style

- Give a summary of ongoing work in the Website Revamp project
- Which project seems the most workload-heavy right now?
- Is any developer overloaded with too many active tasks?
- Give a summary of all work items in Backend Service

---

## Example Output Style

```
The Website Revamp project currently has the highest number of open work items,
indicating it is a key focus area right now.

Key ongoing tasks include:
• Design login UI
• Optimize page load performance
• Refactor CSS structure

Other projects also have active work, but none currently match
the workload level of Website Revamp.
```

---

## Limitations

- Does not guess or invent information
- Answers only from CSV data
- If information is missing → clearly says "I don't have that information"

---

## Possible Future Enhancements

- Semantic search (embeddings + vector similarity)
- REST API (already partially supported via `analyzer_online.py`)
- Daily stand-up style auto-summaries
- Workload balancing & risk highlighting
- Nice frontend dashboard (React/Vue/Svelte/...)
- Export summaries to Slack/Teams/Email

---

## License

MIT License
