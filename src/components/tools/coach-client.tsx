'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Loader2, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  'Explain my lowest-scoring report in plain English.',
  'Which of my validated topics should I write first, and why?',
  'What would have to change for my last SKIP to become a GO?',
  'How should I price the ebook for my best-scoring topic?',
];

export function CoachClient({
  enabled,
  reportCount,
  disabledReason,
}: {
  enabled: boolean;
  reportCount: number;
  disabledReason?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setError(null);
    setInput('');
    const next: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setStreaming(true);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'The coach could not answer. Try again.');
      }

      setMessages([...next, { role: 'assistant', content: '' }]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((current) => {
          const copy = [...current];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch (err) {
      setMessages(next);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setStreaming(false);
    }
  }

  if (!enabled) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">The Publishing Coach is not available yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{disabledReason}</p>
          </div>
          <Button asChild>
            <Link href="/account">View plans</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-[calc(100vh-16rem)] min-h-[520px] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div>
              <Sparkles className="mx-auto h-8 w-8 text-primary" />
              <h2 className="mt-3 font-semibold">Ask about your numbers</h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                {reportCount > 0
                  ? `The coach can read your ${reportCount} saved report${reportCount === 1 ? '' : 's'} and explain any score in them.`
                  : 'Run a validation in Topic Explorer first, then the coach can talk you through the score.'}
              </p>
            </div>
            <div className="grid w-full max-w-lg gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => send(starter)}
                  className="rounded-lg border px-4 py-2.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, i) => (
          <div
            key={i}
            className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground',
              )}
            >
              {message.content ||
                (streaming && i === messages.length - 1 ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null)}
            </div>
          </div>
        ))}

        {error && (
          <div className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 border-t p-4"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask about a score, a competitor, or what to do next…"
          className="max-h-32 min-h-[44px] flex-1 resize-none"
          rows={1}
          disabled={streaming}
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={streaming || !input.trim()}>
          {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </Card>
  );
}
