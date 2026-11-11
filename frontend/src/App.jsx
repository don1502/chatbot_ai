import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const API_BASE_URL = 'http://localhost:8000'

const WELCOME_MESSAGE = {
    role: 'assistant',
    content: "Hello! I'm your AI assistant. How can I help you today?",
    timestamp: new Date(),
}

function App() {
    const [messages, setMessages] = useState([WELCOME_MESSAGE])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    // Auto-grow the textarea as the user types.
    useEffect(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 140)}px`
    }, [inputMessage])

    const sendMessage = async () => {
        const trimmed = inputMessage.trim()
        if (!trimmed || isLoading) return

        const userMessage = { role: 'user', content: trimmed, timestamp: new Date() }
        const outgoing = [...messages, userMessage]
        setMessages(outgoing)
        setInputMessage('')
        setIsLoading(true)
        setIsTyping(true)

        try {
            const response = await fetch(`${API_BASE_URL}/chat/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: outgoing.map(({ role, content }) => ({ role, content })),
                }),
            })

            if (!response.ok || !response.body) {
                throw new Error(`Server responded with ${response.status}`)
            }

            // Prepare a placeholder assistant message that we fill as tokens stream in.
            const assistantMessage = { role: 'assistant', content: '', timestamp: new Date() }
            setMessages(prev => [...prev, assistantMessage])
            setIsTyping(false)

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            let streamError = null

            while (true) {
                const { value, done } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const events = buffer.split('\n\n')
                buffer = events.pop() ?? ''

                for (const event of events) {
                    const line = event.trim()
                    if (!line.startsWith('data:')) continue

                    const payload = line.slice(5).trim()
                    if (!payload) continue

                    let data
                    try {
                        data = JSON.parse(payload)
                    } catch {
                        continue
                    }

                    if (data.error) {
                        streamError = data.error
                        continue
                    }
                    if (data.done) continue

                    if (data.content) {
                        setMessages(prev => {
                            const next = [...prev]
                            const last = next[next.length - 1]
                            next[next.length - 1] = { ...last, content: last.content + data.content }
                            return next
                        })
                    }
                }
            }

            if (streamError) {
                setMessages(prev => {
                    const next = [...prev]
                    next[next.length - 1] = {
                        role: 'assistant',
                        content: `Sorry, I encountered an error: ${streamError}`,
                        timestamp: new Date(),
                    }
                    return next
                })
            }
        } catch {
            setIsTyping(false)
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content:
                        "Sorry, I couldn't connect to the server. Please make sure the backend is running.",
                    timestamp: new Date(),
                },
            ])
        } finally {
            setIsLoading(false)
            setIsTyping(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const clearChat = () => {
        setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }])
    }

    const formatTime = (date) =>
        new Date(date)
            .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            .toLowerCase()

    const renderConversation = () => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-neumorphic-bg border-b border-neumorphic-surface">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neumorphic-surface flex items-center justify-center text-lg shadow-neumorphic-outer-small">
                        🤖
                    </div>
                    <div className="flex flex-col">
                        <div className="text-base font-semibold text-neumorphic-text-primary">
                            AI Assistant
                        </div>
                        <div className="text-xs text-neumorphic-text">
                            {isLoading ? 'Typing…' : 'Online'}
                        </div>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    disabled={isLoading}
                    title="Clear conversation"
                    className="w-10 h-10 rounded-full bg-neumorphic-surface border-none text-white text-lg cursor-pointer shadow-neumorphic-outer-small transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    🗑️
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin">
                <div className="text-center text-neumorphic-text text-xs mb-2">Today</div>

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex flex-col max-w-[80%] animate-fade-in-up ${
                            message.role === 'user' ? 'self-end' : 'self-start'
                        }`}
                    >
                        <div
                            className={`px-4 py-3 rounded-[18px] text-base leading-[1.5] break-words mb-1 ${
                                message.role === 'user'
                                    ? 'bg-neumorphic-accent text-white rounded-br-md whitespace-pre-wrap'
                                    : 'bg-neumorphic-surface text-white rounded-bl-md shadow-neumorphic-inner'
                            }`}
                        >
                            {message.role === 'user' ? (
                                message.content
                            ) : message.content ? (
                                <div className="markdown-body">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <span className="text-neumorphic-text">…</span>
                            )}
                        </div>
                        <div
                            className={`text-xs text-neumorphic-text mt-1 ${
                                message.role === 'user' ? 'text-right' : 'text-left'
                            }`}
                        >
                            {formatTime(message.timestamp)}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex flex-col max-w-[80%] self-start animate-fade-in-up">
                        <div className="bg-neumorphic-surface text-white rounded-[18px] px-4 py-3 rounded-bl-md shadow-neumorphic-inner">
                            <div className="flex items-center gap-1 py-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-neumorphic-text animate-typing"></span>
                                <span
                                    className="w-1.5 h-1.5 rounded-full bg-neumorphic-text animate-typing"
                                    style={{ animationDelay: '-0.16s' }}
                                ></span>
                                <span
                                    className="w-1.5 h-1.5 rounded-full bg-neumorphic-text animate-typing"
                                    style={{ animationDelay: '-0.32s' }}
                                ></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex items-end gap-3 p-4 bg-neumorphic-bg border-t border-neumorphic-surface">
                <div className="flex-1 relative">
                    <div className="flex items-center bg-neumorphic-surface rounded-[24px] px-4 py-2 shadow-neumorphic-inner-large min-h-[48px]">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message…"
                            disabled={isLoading}
                            className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-gray-400 leading-6 resize-none max-h-[140px] scrollbar-thin disabled:opacity-60"
                        />
                    </div>
                </div>
                <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    title="Send message"
                    className="w-12 h-12 rounded-full bg-neumorphic-accent border-none text-white text-xl cursor-pointer shadow-neumorphic-outer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-neumorphic-outer-large disabled:bg-neumorphic-surface disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        '➤'
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
