import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    const removeToast = useCallback((id) => {
        // Mark as exiting for animation
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        // Actually remove after animation
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
            if (timersRef.current[id]) {
                clearTimeout(timersRef.current[id]);
                delete timersRef.current[id];
            }
        }, 300);
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++toastId;
        const toast = { id, message, type, exiting: false };

        setToasts(prev => {
            // Max 5 toasts visible at once
            const updated = [...prev, toast];
            if (updated.length > 5) {
                const oldest = updated[0];
                removeToast(oldest.id);
                return updated.slice(1);
            }
            return updated;
        });

        if (duration > 0) {
            timersRef.current[id] = setTimeout(() => removeToast(id), duration);
        }

        return id;
    }, [removeToast]);

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration || 6000),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

/* ── Toast Container & Item ── */

const ICONS = {
    success: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    error: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    warning: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    info: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
};

const ToastContainer = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`toast-item toast-${t.type} ${t.exiting ? 'toast-exit' : 'toast-enter'}`}
                    role="alert"
                >
                    <span className="toast-icon">{ICONS[t.type]}</span>
                    <span className="toast-message">{t.message}</span>
                    <button
                        className="toast-close"
                        onClick={() => onRemove(t.id)}
                        aria-label="Dismiss notification"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
};
