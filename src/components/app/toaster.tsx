"use client";
import { useUI } from "@/lib/store";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export function Toaster() {
  const { toasts, dismissToast } = useUI();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-3 rounded-lg border bg-card p-3 shadow-lg animate-in slide-in-from-right-5 fade-in"
        >
          {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
          {t.type === "error" && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
          {t.type === "info" && <Info className="h-5 w-5 text-primary shrink-0" />}
          <p className="text-sm flex-1">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
