import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../Layout/SocketContext.jsx';

const AUTO_SCROLL_THRESHOLD = 120;

export default function ChatRoom() {
    const { id: receiverId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { socket, onlineUsers } = useSocket();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatUser, setChatUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    const scrollContainerRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isNearBottomRef = useRef(true);

    const backendUrl = import.meta.env.VITE_backendUrl || '';
    const isOnline = onlineUsers.includes(receiverId);

    // Lock background scroll
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    const scrollToBottom = useCallback((behavior = 'smooth') => {
        const el = scrollContainerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    }, []);

    const checkIfNearBottom = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return true;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        return distanceFromBottom < AUTO_SCROLL_THRESHOLD;
    }, []);

    const handleScroll = useCallback(() => {
        const nearBottom = checkIfNearBottom();
        isNearBottomRef.current = nearBottom;
        setShowScrollToBottom(!nearBottom);
    }, [checkIfNearBottom]);

    // ---------- 1. Fetch messages & Mark as Read ----------
    useEffect(() => {
        let isCancelled = false;

        const fetchChatData = async () => {
            setIsLoading(true);
            setLoadError(null);
            setMessages([]);
            setChatUser(null);

            try {
                const [msgRes, userRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/messages/${receiverId}`, { withCredentials: true }),
                    axios.get(`${backendUrl}/api/user/${receiverId}`, { withCredentials: true }),
                ]);

                if (isCancelled) return;

                if (msgRes.data.success) {
                    const fetchedMessages = msgRes.data.messages;
                    setMessages(fetchedMessages);

                    // 👇 FIX 1: Immediately mark all historical messages from this user as read!
                    if (socket) {
                        fetchedMessages.forEach((msg) => {
                            if (msg.senderId === receiverId && msg.status !== 'read') {
                                socket.emit('markAsRead', { messageId: msg._id, senderId: msg.senderId });
                            }
                        });
                    }
                }

                if (userRes.data.success || userRes.data) {
                    setChatUser(userRes.data.user || userRes.data);
                }
            } catch (error) {
                if (isCancelled) return;
                console.error('Failed to fetch chat data', error.message);
                setLoadError("Couldn't load this conversation. Check your connection and try again.");
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        fetchChatData();

        return () => {
            isCancelled = true;
        };
    }, [receiverId, backendUrl, socket]); // added socket to dependencies

    useEffect(() => {
        if (!isLoading) {
            isNearBottomRef.current = true;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowScrollToBottom(false);
            requestAnimationFrame(() => scrollToBottom('auto'));
        }
    }, [isLoading, receiverId, scrollToBottom]);

    // ---------- 2. Real-time socket events ----------
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            if (message.senderId === receiverId) {
                setMessages((prev) => [...prev, message]);
                // This marks NEW incoming messages as read instantly
                socket.emit('markAsRead', { messageId: message._id, senderId: message.senderId });
            }
        };

        const handleTypingStart = ({ senderId }) => {
            if (senderId === receiverId) setIsTyping(true);
        };

        const handleTypingStop = ({ senderId }) => {
            if (senderId === receiverId) setIsTyping(false);
        };

        const handleMessageRead = ({ messageId }) => {
            setMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? { ...msg, status: 'read' } : msg))
            );
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('userTyping', handleTypingStart);
        socket.on('userStoppedTyping', handleTypingStop);
        socket.on('messageRead', handleMessageRead);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('userTyping', handleTypingStart);
            socket.off('userStoppedTyping', handleTypingStop);
            socket.off('messageRead', handleMessageRead);
        };
    }, [socket, receiverId]);

    useEffect(() => {
        if (isNearBottomRef.current) {
            scrollToBottom('smooth');
        } else if (messages.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowScrollToBottom(true);
        }
    }, [messages, isTyping, scrollToBottom]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [receiverId]);

    // ---------- 3. Sending ----------
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const messageToSend = newMessage.trim();
        if (!messageToSend) return;

        socket?.emit('stopTyping', { receiverId });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        const tempId = `temp-${Date.now()}`;
        const optimisticMsg = {
            _id: tempId,
            senderId: user._id,
            receiverId,
            text: messageToSend,
            status: 'sending',
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setNewMessage('');
        isNearBottomRef.current = true;

        try {
            const res = await axios.post(
                `${backendUrl}/api/messages/send/${receiverId}`,
                { text: messageToSend },
                { withCredentials: true }
            );

            if (res.data.success) {
                setMessages((prev) => prev.map((msg) => (msg._id === tempId ? res.data.message : msg)));
            } else {
                throw new Error('Send failed');
            }
        } catch (error) {
            console.error('Failed to send message', error.message);
            setMessages((prev) =>
                prev.map((msg) => (msg._id === tempId ? { ...msg, status: 'failed' } : msg))
            );
        }
    };

    const handleRetry = async (failedMsg) => {
        setMessages((prev) =>
            prev.map((msg) => (msg._id === failedMsg._id ? { ...msg, status: 'sending' } : msg))
        );
        try {
            const res = await axios.post(
                `${backendUrl}/api/messages/send/${receiverId}`,
                { text: failedMsg.text },
                { withCredentials: true }
            );
            if (res.data.success) {
                setMessages((prev) => prev.map((msg) => (msg._id === failedMsg._id ? res.data.message : msg)));
            } else {
                throw new Error('Send failed');
            }
        } catch (error) {
            console.error('Retry failed', error.message);
            setMessages((prev) =>
                prev.map((msg) => (msg._id === failedMsg._id ? { ...msg, status: 'failed' } : msg))
            );
        }
    };

    // ---------- 4. Typing indicator ----------
    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        socket?.emit('typing', { receiverId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket?.emit('stopTyping', { receiverId });
        }, 2000);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateLabel = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isSameDay = (a, b) =>
            a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

        if (isSameDay(date, today)) return 'Today';
        if (isSameDay(date, yesterday)) return 'Yesterday';
        return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const groupedMessages = messages.reduce((acc, msg, index) => {
        const prev = messages[index - 1];
        const showDateSeparator = !prev || formatDateLabel(msg.createdAt) !== formatDateLabel(prev.createdAt);
        const isSameSenderAsPrev = prev && prev.senderId === msg.senderId && !showDateSeparator;
        const next = messages[index + 1];
        const isSameSenderAsNext =
            next && next.senderId === msg.senderId && formatDateLabel(next.createdAt) === formatDateLabel(msg.createdAt);

        acc.push({
            msg,
            showDateSeparator,
            isGroupStart: !isSameSenderAsPrev,
            isGroupEnd: !isSameSenderAsNext,
        });
        return acc;
    }, []);

    return (
        // 1. OUTER WRAPPER: Locks to the exact visual viewport (100dvh) so the keyboard pushes the bottom up, not the whole page.
        <div
            className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm sm:p-6 lg:p-10"
            style={{ height: '100dvh' }} 
            onClick={() => navigate(-1)}
        >
            {/* 2. INNER MODAL: Stretches to fill the 100dvh container */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex flex-col flex-1 w-full max-w-4xl mx-auto bg-surface sm:border border-white/10 sm:rounded-3xl overflow-hidden shadow-2xl"
            >

                {/* --- 3. THE HEADER: Pinned securely to the top --- */}
                <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-white/10 bg-surface/90 backdrop-blur-md z-20 shrink-0">
                    <button
                        onClick={() => navigate(-1)}
                        aria-label="Back"
                        className="p-2 -ml-2 text-text hover:bg-white/10 rounded-full transition-colors active:scale-95"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>

                    <div className="relative w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/5 flex items-center justify-center font-bold text-lg">
                        {chatUser?.profileImg ? (
                            <img src={chatUser.profileImg} className="w-full h-full object-cover" alt={chatUser?.username || 'avatar'} />
                        ) : (
                            chatUser?.username?.charAt(0).toUpperCase() || (isLoading ? '' : '?')
                        )}
                        {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
                        )}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                        {isLoading && !chatUser ? (
                            <>
                                <div className="h-4 w-32 bg-white/10 rounded animate-pulse mb-1.5" />
                                <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                            </>
                        ) : (
                            <>
                                <h3 className="font-bold text-text text-base truncate leading-tight">
                                    {chatUser?.fullname || chatUser?.username || 'Unknown user'}
                                </h3>
                                <p className={`text-xs font-medium transition-colors ${isOnline ? 'text-primary' : 'text-muted'}`}>
                                    {isTyping ? 'typing…' : isOnline ? 'Online' : 'Offline'}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* ... Leave your load error banner and messages area exactly as they are below this point ... */}

            {/* --- Load error banner --- */}
            {loadError && (
                <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 text-red-200 text-sm z-10">
                    <span>{loadError}</span>
                    <button
                        onClick={() => navigate(0)}
                        className="font-semibold underline underline-offset-2 shrink-0 hover:text-red-100"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* --- Messages area --- */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1 relative custom-scrollbar flex flex-col"
            >
                {isLoading ? (
                    <div className="flex-1 flex flex-col justify-end gap-3 animate-pulse">
                        <div className="h-10 w-2/5 bg-white/5 rounded-2xl rounded-tl-sm" />
                        <div className="h-10 w-1/3 bg-white/5 rounded-2xl rounded-tl-sm" />
                        <div className="h-10 w-2/5 bg-primary/10 rounded-2xl rounded-tr-sm self-end" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted text-sm flex-col gap-2 opacity-50">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <p>Say hello to start the conversation</p>
                    </div>
                ) : (
                    groupedMessages.map(({ msg, showDateSeparator, isGroupStart, isGroupEnd }, index) => {
                        const isMe = msg.senderId === user._id;
                        const isFailed = msg.status === 'failed';

                        return (
                            <div key={msg._id || index}>
                                {showDateSeparator && (
                                    <div className="flex items-center justify-center my-3">
                                        <span className="text-[11px] font-medium text-muted bg-white/5 px-3 py-1 rounded-full">
                                            {formatDateLabel(msg.createdAt)}
                                        </span>
                                    </div>
                                )}
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isGroupStart ? 'mt-2' : 'mt-0.5'}`}>
                                    <div
                                        className={`group relative max-w-[80%] sm:max-w-[70%] flex flex-col p-2.5 sm:p-3 rounded-2xl shadow-sm ${
                                            isMe
                                                ? `bg-primary text-bg ${isGroupEnd ? 'rounded-tr-sm' : 'rounded-tr-2xl'}`
                                                : `bg-white/10 text-text border border-white/5 ${isGroupEnd ? 'rounded-tl-sm' : 'rounded-tl-2xl'}`
                                        } ${isFailed ? 'opacity-60' : ''}`}
                                    >
                                        <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap">{msg.text}</p>

                                        <div className={`flex items-center justify-end mt-1 min-w-12.5 ${isMe ? 'text-bg/80' : 'text-muted'}`}>
                                            <span className="text-[10px] font-medium leading-none">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {isFailed && (
                                        <button
                                            onClick={() => handleRetry(msg)}
                                            className="text-[11px] text-red-300 hover:text-red-200 mt-1 font-medium underline underline-offset-2"
                                        >
                                            Failed to send · Tap to retry
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {isTyping && (
                    <div className="flex items-start mt-2 animate-fade-in-up">
                        <div className="bg-white/10 text-text rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5 flex gap-1.5 items-center w-fit">
                            <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Scroll-to-bottom button --- */}
            {showScrollToBottom && (
                <button
                    onClick={() => {
                        isNearBottomRef.current = true;
                        setShowScrollToBottom(false);
                        scrollToBottom('smooth');
                    }}
                    aria-label="Scroll to latest messages"
                    className="absolute bottom-24 sm:bottom-28 right-4 sm:right-6 z-20 w-10 h-10 rounded-full bg-surface border border-white/10 shadow-lg flex items-center justify-center text-text hover:bg-white/10 transition-colors active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                </button>
            )}

            {/* --- Input area --- */}
            <div className="bg-surface/90 backdrop-blur-md p-3 sm:p-4 border-t border-white/10 z-20 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                    <div className="flex-1 bg-black/20 border border-white/10 hover:border-white/20 focus-within:border-primary/50 transition-colors rounded-3xl flex items-center min-h-11 sm:min-h-12 px-4">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={handleTyping}
                            placeholder="Message..."
                            disabled={isLoading}
                            className="w-full bg-transparent border-none outline-none text-[15px] text-text placeholder-muted py-2.5 sm:py-3 focus:ring-0 disabled:opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isLoading}
                        aria-label="Send message"
                        className="w-11 h-11 sm:w-12 sm:h-12 bg-primary text-bg rounded-full flex items-center justify-center disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0"
                    >
                        <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                        </svg>
                    </button>
                </form>
            </div>
            </div>
        </div>
    );
}