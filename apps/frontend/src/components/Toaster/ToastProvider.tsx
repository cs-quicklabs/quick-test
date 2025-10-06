import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "flowbite-react";
import { bindToastApi } from "./toast";

type ToastVariant = "success" | "error" | "warning" | "info";

interface QueuedToast {
    id: number;
    message: string;
    variant: ToastVariant;
}

interface ToastContextValue {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return ctx;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [queue, setQueue] = useState<QueuedToast[]>([]);
    const timeoutsRef = useRef<Map<number, number>>(new Map());
    const [closingIds, setClosingIds] = useState<Set<number>>(new Set());

    const enqueue = useCallback((message: string, variant: ToastVariant) => {
        if (!message) return;
        const id = Date.now() + Math.random();
        setQueue((prev) => [
            ...prev,
            { id, message, variant },
        ]);
        const duration = 5000;
        const timeoutId = window.setTimeout(() => {
            setClosingIds((prev) => new Set(prev).add(id));
        }, duration);
        timeoutsRef.current.set(id, timeoutId);
    }, []);

    const dismiss = useCallback((id: number) => {
        const map = timeoutsRef.current;
        if (map.has(id)) {
            window.clearTimeout(map.get(id));
            map.delete(id);
        }
        setClosingIds((prev) => new Set(prev).add(id));
    }, []);

    const handleExited = useCallback((id: number) => {
        setQueue((prev) => prev.filter((t) => t.id !== id));
        setClosingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const value = useMemo<ToastContextValue>(() => createToastApi(enqueue), [enqueue]);

    useEffect(() => {
        // Expose context methods to legacy function API
        bindToastApi(value);
    }, [value]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast container */}
            <div className="fixed top-5 inset-x-0 z-50 grid place-items-center px-4">
                <div className="w-full max-w-lg items-center flex flex-col gap-2">
                    {queue.map((item) => (
                        <ToastItem
                            key={item.id}
                            id={item.id}
                            closing={closingIds.has(item.id)}
                            onExited={handleExited}
                        >
                            <ToastIcon variant={item.variant} />
                            <div className="ml-3 text-sm font-normal">{item.message}</div>
                            <button
                                type="button"
                                onClick={() => dismiss(item.id)}
                                className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300"
                                aria-label="Close"
                            >
                                <span className="sr-only">Close</span>
                                <CloseIcon />
                            </button>
                        </ToastItem>
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
};

function createToastApi(enqueue: (message: string, variant: ToastVariant) => void): ToastContextValue {
    return {
        showSuccess: (m) => enqueue(m, "success"),
        showError: (m) => enqueue(m, "error"),
        showWarning: (m) => enqueue(m, "warning"),
        showInfo: (m) => enqueue(m, "info"),
    };
}

const CloseIcon = () => (
    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
    </svg>
);

const ToastIcon = ({ variant }: { variant: ToastVariant }) => (
    <div
        className={
            "inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg " +
            (variant === "success"
                ? "text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200"
                : variant === "error"
                    ? "text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200"
                    : variant === "warning"
                        ? "text-yellow-500 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-200"
                        : "text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200")
        }
    >
        {variant === "success" && (
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
        )}
        {variant === "error" && (
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3 12.5a1 1 0 0 1-1.414 1.414L10 11.414 7.414 14.5A1 1 0 0 1 6 13.086L8.586 10.5 6 7.914A1 1 0 1 1 7.414 6.5L10 9.086 12.586 6.5A1 1 0 1 1 14 7.914L11.414 10.5 14 13.086Z" />
            </svg>
        )}
        {variant === "warning" && (
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.592c.75 1.335-.213 2.986-1.743 2.986H3.482c-1.53 0-2.492-1.651-1.743-2.986L8.257 3.1ZM11 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-1-2a1 1 0 0 0 1-1V8a1 1 0 1 0-2 0v3a1 1 0 0 0 1 1Z" />
            </svg>
        )}
        {variant === "info" && (
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7v6m0-10a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 0v2" />
            </svg>
        )}
    </div>
);

const ToastItem = ({ id, closing, onExited, children }: { id: number; closing: boolean; onExited: (id: number) => void; children: React.ReactNode; }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const enter = window.setTimeout(() => setVisible(true), 10);
        return () => window.clearTimeout(enter);
    }, []);
    useEffect(() => {
        if (closing) {
            setVisible(false);
            const exit = window.setTimeout(() => onExited(id), 200);
            return () => window.clearTimeout(exit);
        }
    }, [closing, id, onExited]);
    return (
        <div className={"transition-all duration-200 ease-out transform " + (visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2")}>
            <Toast className="w-full">{children}</Toast>
        </div>
    );
};


