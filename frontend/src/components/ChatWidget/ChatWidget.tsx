"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatWidget.module.css';
import { Channel, Message } from '@/types';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/chat/channels`)
            .then(res => res.json())
            .then(data => {
                setChannels(data);
                if (data.length > 0) setActiveChannel(data[0]);
            });
    }, []);

    useEffect(() => {
        if (!activeChannel) return;
        const interval = setInterval(() => {
            fetch(`${API_BASE_URL}/chat/messages/${activeChannel.id}`)
                .then(res => res.json())
                .then(data => setMessages(data));
        }, 3000);
        return () => clearInterval(interval);
    }, [activeChannel]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || !activeChannel) return;

        const userStr = localStorage.getItem('sb_user');
        const user = userStr ? JSON.parse(userStr) : { email: "Guest Scout" };

        const body = {
            channel_id: activeChannel.id,
            sender: user.email,
            content: input
        };

        fetch(`${API_BASE_URL}/chat/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(newMsg => {
                setMessages([...messages, newMsg]);
                setInput('');
            });
    };

    return (
        <div className={`${styles.chatWrapper} ${isOpen ? styles.open : ''}`}>
            <button className={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '💬'}
                {!isOpen && messages.length > 0 && <span className={styles.badge}></span>}
            </button>

            {isOpen && (
                <div className={`glass ${styles.chatContainer}`}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>INTELLIGENCE NETWORK</h3>
                        <div className={styles.channelTabs}>
                            {channels.map(c => (
                                <button
                                    key={c.id}
                                    className={`${styles.tab} ${activeChannel?.id === c.id ? styles.active : ''}`}
                                    onClick={() => setActiveChannel(c)}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.messages}>
                        {messages.map((m, i) => {
                            const userStr = localStorage.getItem('sb_user');
                            const user = userStr ? JSON.parse(userStr) : { email: "" };
                            const isOwn = m.sender === user.email;

                            return (
                                <div key={i} className={`${styles.message} ${isOwn ? styles.own : ''}`}>
                                    <div className={styles.msgHeader}>
                                        <span className={styles.sender}>{m.sender}</span>
                                        <span className={styles.time}>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={styles.content}>
                                        {m.content}
                                        {m.player_id && (
                                            <Link href={`/players/${m.player_id}`} className={styles.playerTag}>
                                                🔎 VIEW TARGET PROFILE
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.footer}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="COMMUNICATE..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className={styles.sendBtn} onClick={handleSend}>➤</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
