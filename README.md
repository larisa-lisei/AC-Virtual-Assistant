# AC Virtual Assistant

AI-powered educational virtual assistant web application developed as a Bachelor's Thesis project for the Faculty of Automatic Control and Computer Engineering.

## Overview

AC Virtual Assistant is designed to support both students and professors in the learning process.

The application uses **Retrieval-Augmented Generation (RAG)** to generate answers based on course materials uploaded by professors. Instead of relying only on the general knowledge of a Large Language Model (LLM), relevant information is retrieved from the uploaded documents and provided as context for answer generation.

The application provides three user roles:

- **Students** can interact with a course-specific virtual assistant and receive answers based on the materials provided by their professors.
- **Professors** can manage course documents, test the student assistant, enable a hints-only mode, and use a feedback assistant to analyze student questions.
- **Administrators** can manage user accounts and courses.

## Main Features

- Course-specific AI assistant
- PDF course material upload and processing
- Retrieval-Augmented Generation (RAG)
- Semantic search using vector embeddings
- Conversation history
- Source tracking for generated answers
- Hints-only mode for step-by-step guidance
- Analysis of student questions and feedback for professors
- Role-based access control
- Account activation and authentication

## Technologies

### Frontend
- **React**
- **TypeScript**
- **Material UI**

### Backend
- **Python**
- **FastAPI**

### AI & RAG
- **Google Gemini** – Large Language Model used for answer generation
- **LangChain** – document processing and RAG integration
- **Hugging Face Embeddings** – generation of semantic vector representations
- **ChromaDB** – vector database used for semantic retrieval
- **Cosine distance** – used to retrieve semantically relevant document chunks

### Data & Security
- **MongoDB** – users, courses, conversations and application data
- **JWT (JSON Web Tokens)** – authentication
- **HttpOnly cookies** – secure storage and transmission of authentication tokens

## RAG Workflow

```text
PDF Documents
     ↓
Text Extraction
     ↓
Text Chunking
     ↓
Embeddings
     ↓
ChromaDB

User Question
     ↓
Question Embedding
     ↓
Semantic Retrieval
     ↓
Relevant Document Chunks
     ↓
Gemini LLM
     ↓
Generated Answer
```

## Architecture

The application follows a layered backend architecture:

```text
Routes → Services → Repositories → Databases / External Services
```

The frontend communicates with the FastAPI backend through a REST API.

## Running the Application

### Backend

Create and activate a Python virtual environment, install the dependencies:

```bash
pip install -r requirements.txt
```

Then start the FastAPI application:

```bash
uvicorn main:app --reload
```

### Frontend

Install the dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```
