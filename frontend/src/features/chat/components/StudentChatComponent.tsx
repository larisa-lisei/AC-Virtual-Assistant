import './chatComponent.css';
import type { Course } from '../ChatPage';
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../utils/error';
import { CircularProgress } from '@mui/material';
import ReactMarkdown from 'react-markdown';

interface StudentChatComponentProps {
    selectedCourse?: Course;
}

interface SourceChunk {
    content: string;
    page?:number | null;
    filename?: string | null;
    chunk_index?: number | null;
}

interface ChatMessage {
    id: string;
    sender: 'student' | 'assistant';
    text: string;
    sources?: SourceChunk[];
}

export default function StudentChatComponent({ selectedCourse }: StudentChatComponentProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [question, setQuestion] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

    useEffect(() => {
        setMessages([]);
        setQuestion('');
        setError(null);
    }, [selectedCourse?.id]);

    const createMessageId = () => {
        return crypto.randomUUID();
    };

    const handleSendQuestion = async () => {
        const trimmedQuestion = question.trim();

        if(!selectedCourse) {
            return;
        }

        if(!trimmedQuestion) {
            return;
        }

        const studentMessage: ChatMessage = {
            id: createMessageId(),
            sender: 'student',
            text: trimmedQuestion
        };

        setMessages((prevMsgs) => [
            ...prevMsgs,
            studentMessage
        ]);

        setQuestion('');
        setError(null);

        const onErrorInChat = (message: string) => {
            setError(message);
        };

        try {
            setIsSending(true);

            const response = await fetch(
                `${API_BASE_URL}/courses/${selectedCourse.id}/ask`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        question: trimmedQuestion
                    })
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                onErrorInChat(getErrorMessage(errorData));
                return;
            }

            const data = await response.json();

            const assistantMessage: ChatMessage = {
                id: createMessageId(),
                sender: 'assistant',
                text: data.answer,
                sources: data.sources
            };

            setMessages((prevMsgs) => [
                ...prevMsgs,
                assistantMessage
            ]);
        } catch {
            onErrorInChat('Something went wrong while sending the question.');
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if(event.key === 'Enter') {
            event.preventDefault();
            handleSendQuestion();
        }
    };

    //no course selected - welcome message
    if (!selectedCourse) {
        return (
            <div className="chat-component-container">
                <div className="chat-description">
                    <h2>Welcome to AC Virtual Assistant!</h2>
                    <p>Pick a virtual assistant and let's get started!</p>
                </div>
            </div>
        )
    }

    return (
        <div className="chat-component-container">
            <div className="course-title">
                <h3>{selectedCourse.name}</h3>
            </div>

            {messages.length === 0 ? (
                <div className="chat-description">
                    <h2>Ask me anything about this course!</h2>
                </div>
            ): (
                <div className='chat-message-list'>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`chat-message ${message.sender}`}
                        >
                            <div className="message-markdown">
                                <ReactMarkdown>
                                    {message.text}
                                </ReactMarkdown>
                            </div>

                            {message.sender === 'assistant' &&
                                message.sources &&
                                message.sources.length > 0 && (
                                    <div className="chat-sources">
                                        <strong>Analyzed course fragments:</strong>

                                        {message.sources.map((source, index) => (
                                            <div
                                                key={`${message.id}-source-${index}`}
                                                className='chat-source'
                                            >
                                                {source.filename && (
                                                    <span>{source.filename}</span>
                                                )}

                                                {source.page !== null &&
                                                    source.page !== undefined && (
                                                        <span>
                                                            {' '}- page {source.page}
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                        </div>
                    ))}

                    {isSending && (
                        <div className="chat-message assistant loading-message">
                            <CircularProgress size={18} />
                            <span>Thinking...</span>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className='chat-error'>
                    {error}
                </p>
            )}

            <div className="input-text">
                <div className="input-wrapper">
                    <input 
                        type="text" 
                        placeholder="Type here..."
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSending}
                    />
                    <button
                        type="button"
                        className='send-button'
                        onClick={handleSendQuestion}
                        disabled={isSending || !question.trim()}
                    >
                        <SendIcon className="input-icon"/>
                    </button>
                </div>
            </div>
        </div>
    )
}
