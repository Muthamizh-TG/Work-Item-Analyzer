
import csv
import os
from pathlib import Path
import dotenv
from colorama import init, Fore, Style
from ollama import chat

init(autoreset=True)

# Load environment variables
dotenv.load_dotenv()

# ----------------------------
# Configuration
# ----------------------------
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

PROJECT_CSV = DATA_DIR / "projects_workitems.csv"
DEVELOPER_CSV = DATA_DIR / "developers_workitems.csv"

# Ollama model name (e.g., "llama2", "mistral", etc.)
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")


# ----------------------------
# Data setup
# ----------------------------
def _ensure_data_files() -> None:
    DATA_DIR.mkdir(exist_ok=True)

    if not PROJECT_CSV.exists():
        with PROJECT_CSV.open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(
                [
                    "project_name",
                    "work_item_id",
                    "work_item_title",
                    "work_item_type",
                    "status",
                    "assigned_to",
                ]
            )

    if not DEVELOPER_CSV.exists():
        with DEVELOPER_CSV.open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(
                [
                    "developer_name",
                    "work_item_id",
                    "work_item_title",
                    "project_name",
                    "status",
                ]
            )


# ----------------------------
# Build knowledge base
# ----------------------------
def _rows_to_sentences() -> str:
    sentences: list[str] = []

    if PROJECT_CSV.exists():
        with PROJECT_CSV.open("r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                project = (row.get("project_name") or "").strip()
                wid = (row.get("work_item_id") or "").strip()
                title = (row.get("work_item_title") or "").strip()
                wtype = (row.get("work_item_type") or "").strip()
                status = (row.get("status") or "").strip()
                assigned = (row.get("assigned_to") or "").strip()

                if not project and not wid and not title:
                    continue

                sentences.append(
                    f"Project '{project}' has work item {wid} titled '{title}' "
                    f"of type '{wtype}' with status '{status}' assigned to '{assigned}'."
                )

    if DEVELOPER_CSV.exists():
        with DEVELOPER_CSV.open("r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                dev = (row.get("developer_name") or "").strip()
                wid = (row.get("work_item_id") or "").strip()
                title = (row.get("work_item_title") or "").strip()
                project = (row.get("project_name") or "").strip()
                status = (row.get("status") or "").strip()

                if not dev and not wid and not title:
                    continue

                sentences.append(
                    f"Developer '{dev}' works on work item {wid} titled '{title}' "
                    f"in project '{project}' with status '{status}'."
                )

    return "\n".join(sentences)


# ----------------------------
# Query answering
# ----------------------------
def answer_query(question: str) -> str:
    # Detect greetings/small talk and respond simply
    greetings = {"hi", "hello", "hey", "howdy", "good morning", "good afternoon", "good evening", "greetings", "thanks", "thank you", "yo", "sup"}
    q_lower = question.strip().lower()
    if any(greet in q_lower for greet in greetings) and len(q_lower.split()) <= 4:
        if "thank" in q_lower:
            return "You're welcome! If you have any questions about your work items or projects, just ask."
        return "Hello! How can I help you with your work items or projects today?"

    _ensure_data_files()
    knowledge = _rows_to_sentences()

    if not knowledge.strip():
        return (
            "I do not have any project or work item data yet. "
            "Please fill the CSV files and try again."
        )

    prompt = (
        "You are a human-like project assistant. "
        "Structure answers in three parts unless unnecessary: "
        "(1) a short introductory paragraph summarizing the answer, "
        "(2) a concise bullet list highlighting key points or items, "
        "(3) a short concluding paragraph with insight or context. "
        "Do NOT sound like a database or CSV export. "
        "Use ONLY the information from the knowledge base. "
        "Do not invent data. "
        "Keep bullets short and meaningful.\n"
        f"Knowledge base:\n{knowledge}\n"
        f"User question: {question}"
    )

    try:
        response = chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.message.content
    except Exception as e:
        return f"Ollama error: {e}"


# ----------------------------
# CLI
# ----------------------------
def main() -> None:
    print(Fore.CYAN + "Work Item Analyzer Bot (type 'exit' to quit)" + Style.RESET_ALL)
    _ensure_data_files()

    while True:
        try:
            user_input = input(Fore.YELLOW + "You: " + Style.RESET_ALL).strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not user_input:
            continue

        if user_input.lower() in {"exit", "quit"}:
            break

        try:
            answer = answer_query(user_input)
        except Exception as exc:
            answer = f"Error: {exc}"

        print(Fore.GREEN + Style.BRIGHT + "Analyzer" + Style.RESET_ALL + ": " + Style.BRIGHT + answer + Style.RESET_ALL)


if __name__ == "__main__":
    main()