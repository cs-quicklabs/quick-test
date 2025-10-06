import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Toast } from "flowbite-react";
import { bindToastApi } from "./ToasterFun";

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

    const enqueue = useCallback((message: string, variant: ToastVariant) => {
        if (!message) return;
        setQueue((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), message, variant },
        ]);
    }, []);

    const dismiss = useCallback((id: number) => {
        setQueue((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value = useMemo<ToastContextValue>(
        () => ({
            showSuccess: (m) => enqueue(m, "success"),
            showError: (m) => enqueue(m, "error"),
            showWarning: (m) => enqueue(m, "warning"),
            showInfo: (m) => enqueue(m, "info"),
        }),
        [enqueue]
    );

    useEffect(() => {
        // Expose context methods to legacy function API
        bindToastApi(value);
    }, [value]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast container */}
            <div className="fixed inset-x-0 top-4 z-50 mx-auto flex w-full max-w-lg flex-col gap-2 px-4">
                {queue.map((item) => (
                    <Toast key={item.id} className="w-full">
                        <div className="ml-3 text-sm font-normal">
                            {item.message}
                        </div>
                        <Toast.Toggle onDismiss={() => dismiss(item.id)} />
                    </Toast>
                ))}
            </div>
        </ToastContext.Provider>
    );
};


