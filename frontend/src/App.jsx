import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function App() {
    const [currentView, setCurrentView] = useState('chats') // 'chats' or 'conversation'
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' }
    ])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    // Mock chat list data
    const chatList = [
        {
            id: 1,
            name: 'AI Assistant',
            lastMessage: 'Hello! How can I help you today?',
            time: '12:35',
            unread: 0,
            avatar: '🤖'
        },
        {
            id: 2,
            name: 'Sara Sanders',
            lastMessage: 'Can you buy me dinner?',
            time: '12:35',
            unread: 100,
            avatar: '👩'
        },
        {
            id: 3,
            name: 'Doris Diaz',
            lastMessage: 'Read this article, it is so awesome...',
            time: '12:35',
            unread: 99,
            avatar: '👩‍🦱'
        },
        {
            id: 4,
            name: 'Kathy Gomez',
            lastMessage: 'Sounds like a good idea!',
            time: '12:35',
            unread: 3,
            avatar: '👩‍💼'
        }
    ]

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return

        const userMessage = { role: 'user', content: inputMessage.trim() }
        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsLoading(true)
        setIsTyping(true)

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                })
            })

            const data = await response.json()

            if (data.success) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
                    setIsTyping(false)
                }, 1000) // Simulate typing delay
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Sorry, I encountered an error: ${data.error || 'Unknown error'}`
                }])
                setIsTyping(false)
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I couldn\'t connect to the server. Please make sure the backend is running.'
            }])
            setIsTyping(false)
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const clearChat = () => {
        setMessages([{ role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' }])
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).toLowerCase()
    }

    const renderChatsList = () => (
        <div className="chats-view">
            {/* Header */}
            <div className="app-header">
                <div className="profile-section">
                    <div className="profile-avatar">👨</div>
                </div>
                <h1>Chats</h1>
                <button className="add-button">+</button>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search" />
                </div>
            </div>

            {/* Chat List */}
            <div className="chat-list">
                {chatList.map((chat) => (
                    <div
                        key={chat.id}
                        className={`chat-item ${chat.id === 1 ? 'active' : ''}`}
                        onClick={() => setCurrentView('conversation')}
                    >
                        <div className="chat-avatar">{chat.avatar}</div>
                        <div className="chat-content">
                            <div className="chat-name">{chat.name}</div>
                            <div className="chat-preview">{chat.lastMessage}</div>
                        </div>
                        <div className="chat-meta">
                            <div className="chat-time">{chat.time}</div>
                            {chat.unread > 0 && (
                                <div className="unread-badge">
                                    {chat.unread > 99 ? '99+' : chat.unread}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Navigation */}
            <div className="bottom-nav">
                <button className="nav-button active">🎙️</button>
                <button className="nav-button">📷</button>
                <button className="nav-button">⚏</button>
                <button className="nav-button">⚙️</button>
            </div>
        </div>
    )

    const renderConversation = () => (
        <div className="conversation-view">
            {/* Header */}
            <div className="conversation-header">
                <button
                    className="back-button"
                    onClick={() => setCurrentView('chats')}
                >
                    ←
                </button>
                <div className="contact-info">
                    <div className="contact-avatar">🤖</div>
                    <div className="contact-details">
                        <div className="contact-name">AI Assistant</div>
                        <div className="contact-status">
                            {isTyping ? 'Typing...' : 'Online'}
                        </div>
                    </div>
                </div>
                <button className="call-button">📞</button>
            </div>

            {/* Messages */}
            <div className="messages-container">
                <div className="date-separator">Today</div>

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                    >
                        <div className="message-bubble">
                            {message.content}
                        </div>
                        <div className="message-time">
                            {formatTime(new Date())}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message assistant-message">
                        <div className="message-bubble typing">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-area">
                <button className="emoji-button">😊</button>
                <div className="message-input-container">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message"
                        disabled={isLoading}
                        className="message-input"
                    />
                    <button className="attachment-button">📎</button>
                    <button className="camera-button">📷</button>
                </div>
                <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="send-button"
                >
                    🎙️
                </button>
            </div>
        </div>
    )

    return (
        <div className="app">
            <div className="status-bar">
                <span className="time">9:41</span>
                <div className="status-icons">
                    <span>📶</span>
                    <span>📶</span>
                    <span>🔋</span>
                </div>
            </div>

            {currentView === 'chats' ? renderChatsList() : renderConversation()}
        </div>
    )
}

export default App