"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export default function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await subscribeToNewsletter(email, name || undefined);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setEmail("");
        setName("");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={`flex items-center gap-3 bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4 ${className}`}>
        <CheckCircle2 size={20} className="text-accent shrink-0" />
        <div>
          <p className="font-black text-foreground text-sm">¡Suscrito exitosamente!</p>
          <p className="text-xs text-muted font-medium mt-0.5">Recibirás nuestras recetas y novedades en tu correo.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <label htmlFor="newsletter-name" className="sr-only">Tu nombre (opcional)</label>
      <input
        id="newsletter-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre (opcional)"
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm font-medium text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      />
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">Tu email</label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          required
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm font-medium text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading || !email}
          aria-busy={loading}
          className="flex items-center gap-2 bg-accent-solid hover:bg-accent-solid-hover text-white font-black px-4 py-2.5 rounded-lg transition shrink-0 text-sm shadow-md shadow-accent-solid/30 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          <span>Suscribirse</span>
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs font-bold text-red-400">{error}</p>
      )}
      <p className="text-[11px] text-white/40 font-medium">
        Puedes cancelar tu suscripción en cualquier momento.
      </p>
    </form>
  );
}
