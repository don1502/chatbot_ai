import { useState, useRef, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:8000'

function App() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' }
    ])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

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

    const renderConversation = () => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-center p-4 bg-neumorphic-bg border-b border-neumorphic-surface">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neumorphic-surface flex items-center justify-center text-lg shadow-neumorphic-outer-small">
                        🤖
                    </div>
                    <div className="flex flex-col">
                        <div className="text-base font-semibold text-neumorphic-text-primary">
                            AI Assistant
                        </div>
                        <div className="text-xs text-neumorphic-text">
                            {isTyping ? 'Typing...' : 'Online'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin">
                <div className="text-center text-neumorphic-text text-xs mb-2">
                    Today
                </div>

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex flex-col max-w-[80%] animate-fade-in-up ${
                            message.role === 'user' ? 'self-end' : 'self-start'
                        }`}
                    >
                        <div className={`px-4 py-3 rounded-[18px] text-base leading-[1.4] break-words whitespace-pre-wrap mb-1 ${
                            message.role === 'user' 
                                ? 'bg-neumorphic-accent text-white rounded-br-md' 
                                : 'bg-neumorphic-surface text-white rounded-bl-md shadow-neumorphic-inner'
                        }`}>
                            {message.content}
                        </div>
                        <div className={`text-xs text-neumorphic-text mt-1 ${
                            message.role === 'user' ? 'text-right' : 'text-left'
                        }`}>
                            {formatTime(new Date())}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex flex-col max-w-[80%] self-start animate-fade-in-up">
                        <div className="bg-neumorphic-surface text-white rounded-[18px] px-4 py-3 rounded-bl-md shadow-neumorphic-inner">
                            <div className="flex items-center gap-1 py-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-neumorphic-text animate-typing"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-neumorphic-text animate-typing" style={{animationDelay: '-0.16s'}}></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-neumorphic-text animate-typing" style={{animationDelay: '-0.32s'}}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex items-end gap-3 p-4 bg-neumorphic-bg border-t border-neumorphic-surface">
                <button className="w-10 h-10 rounded-full bg-neumorphic-surface border-none text-white text-lg cursor-pointer shadow-neumorphic-outer-small transition-all duration-200 hover:transform hover:-translate-y-0.5 flex items-center justify-center">
                    😊
                </button>
                <div className="flex-1 relative">
                    <div className="flex items-center bg-neumorphic-surface rounded-[24px] px-4 py-3 shadow-neumorphic-inner-large min-h-[48px]">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            disabled={isLoading}
                            className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-gray-400 leading-5"
                        />
                        <div className="flex items-center gap-2 ml-2">
                            <button className="w-7 h-7 rounded-lg border-none bg-transparent text-gray-400 text-sm cursor-pointer hover:text-white transition-colors duration-200 flex items-center justify-center">
                                📎
                            </button>
                            <button className="w-7 h-7 rounded-lg border-none bg-transparent text-gray-400 text-sm cursor-pointer hover:text-white transition-colors duration-200 flex items-center justify-center">
                                📷
                            </button>
                        </div>
                    </div>
                </div>
                <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="w-12 h-12 rounded-full bg-neumorphic-accent border-none text-white text-xl cursor-pointer shadow-neumorphic-outer transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-neumorphic-outer-large disabled:bg-neumorphic-surface disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        '🎙️'
                    )}
                </button>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col h-screen w-full bg-neumorphic-bg overflow-hidden">
            {renderConversation()}
        </div>
    )
}

export default App