import '../../ChatComponent.css';
import type { Course } from '../../../ChatPage'
import type { ConvMode } from '../../ProfessorChatComponent';
import { getErrorMessage } from '../../../../../utils/error';
import { useEffect, useState, type ReactNode } from 'react';
import { CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

interface SourceChunk {
    content: string;
    page?:number | null;
    filename?: string | null;
    chunk_index?: number | null;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    sources?: SourceChunk[];
}

interface ConversationHistoryResponse {
    conversation_id: string | null;
    messages: {
        sender: string;
        content: string;
        sources?: SourceChunk[];
    }[];
}

interface ConversationAnswerResponse {
    conversation_id: string;
    answer: string;
    sources?: SourceChunk[];
}

interface CourseConversationChatProps {
    selectedCourse?: Course;
    conversationMode: ConvMode;
    emptyConversationState: ReactNode;
    inputPlaceholder: string;
    showSources: boolean;

    renderHeader?: (
        handleStartNewConversation: () => Promise<void>,
        isSending: boolean
    ) => React.ReactNode
}

// useful for rendering the list of messages in UI
const createMessageId = () => {
    return crypto.randomUUID();
};

export default function CourseConversationChat({
    selectedCourse,
    conversationMode,
    emptyConversationState,
    inputPlaceholder,
    showSources,
    renderHeader
}: CourseConversationChatProps) {
    // store messages shown in UI
    const [messagesByCourse, setMessagesByCourse] = useState<Record<string, ChatMessage[]>>({})
    // store backend conversation id
    const [conversationIdByCourse, setConversationIdByCourse] = useState<Record<string, string | null>>({});

    const [question, setQuestion] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    
    const courseId = selectedCourse?.id;

    const conversationKey = courseId ? `${conversationMode}:${courseId}` : null;
    const messages = conversationKey ? messagesByCourse[conversationKey] ?? [] : [];
    const conversationId = conversationKey ? conversationIdByCourse[conversationKey] ?? null : null;

    const conversationEndpoint = courseId ? conversationMode === 'professor'
                                    ? `${API_BASE_URL}/courses/${courseId}/conversation/feedback`
                                    : `${API_BASE_URL}/courses/${courseId}/conversation`
                                : '';

    const askEndpoint = courseId ? conversationMode === 'professor'
                                    ? `${API_BASE_URL}/courses/${courseId}/ask/feedback`
                                    : `${API_BASE_URL}/courses/${courseId}/ask`
                                : '';

    useEffect(() => {
        setQuestion('');
        setError(null);

        if(!courseId || !conversationKey) {
            return;
        }

        const loadConversation = async () => {
            try {
                const response = await fetch(conversationEndpoint,
                    {
                        method: 'GET',
                        credentials: 'include'
                    }
                );
    
                if(!response.ok) {
                    const errorData = await response.json();
                    setError(getErrorMessage(errorData));
                    return;
                }
    
                const data = await response.json() as ConversationHistoryResponse;
    
                // set the backend id for the selected course conversation
                setConversationIdByCourse((previous) => ({
                    ...previous,
                    [conversationKey]: data.conversation_id
                }));
    
                const loadedMessages: ChatMessage[] = data.messages.map((message) => ({
                    id: createMessageId(),
                    sender: message.sender === 'assistant' ? 'assistant' : 'user',
                    text: message.content,
                    sources: message.sources ?? []
                }));            
    
                // save messages for selected course
                setMessagesByCourse((previous) => ({
                    ...previous,
                    [conversationKey]: loadedMessages
                }));
            } catch {
                setError('Something went wrong while loading the conversation.')
            }
        };

        loadConversation();
    }, [conversationKey]);

    const addMessage = (message: ChatMessage) => {
        if(!conversationKey) {
            return;
        }

        setMessagesByCourse((previous) => ({
            ...previous,
            [conversationKey]: [
                ...(previous[conversationKey] ?? []),
                message
            ]
        }));
    };

    const handleStartNewConversation = async () => {
        if(!conversationKey || !conversationEndpoint || isSending) {
            return;
        }

        try {
            const response = await fetch(conversationEndpoint,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                setError(getErrorMessage(errorData));
                return;
            }

            // clear conversation after successfully deleting it
            setMessagesByCourse((previous) => ({
                ...previous,
                [conversationKey]: []
            }));

            // remove backend id 
            setConversationIdByCourse((previous) => ({
                ...previous,
                [conversationKey]: null
            }));

            setQuestion('');
            setError(null);
        } catch {
            setError('Something went wrong while strating a new conversation.');
        }
    };

     const handleSendQuestion = async () => {
        const trimmedQuestion = question.trim();

        if(!courseId || !conversationKey || !trimmedQuestion) {
            return;
        }

        // not able to send another message until the response is received for another one
        if(isSending) {
            return;
        }

        const userMessage: ChatMessage = {
            id: createMessageId(),
            sender: 'user',
            text: trimmedQuestion
        }

        addMessage(userMessage)

        setQuestion('');
        setError(null);
        setIsSending(true);

        try {
            const response = await fetch(askEndpoint,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        question: trimmedQuestion,
                        conversation_id: conversationId
                    })
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                setError(getErrorMessage(errorData));
                return;
            }

            const data = await response.json() as ConversationAnswerResponse;

            // save conversation id so future questions continue on the same conversation
            setConversationIdByCourse((previous) => ({
                ...previous,
                [conversationKey]: data.conversation_id
            }))

            const assistantMessage: ChatMessage = {
                id: createMessageId(),
                sender: 'assistant',
                text: data.answer,
                sources: data.sources ?? []
            };

            addMessage(assistantMessage);
        } catch {
            setError('Something went wrong while sending the question.');
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

    //no course selected - welcome message (student mode)
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
            {renderHeader?.(
                handleStartNewConversation,
                isSending
            )}

            {messages.length === 0 ? (
                <div className="chat-description">
                    {emptyConversationState}
                </div>
            ) : (
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

                            {showSources && message.sender === 'assistant' &&
                                message.sources && message.sources.length > 0 && (
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
                        placeholder={inputPlaceholder}
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