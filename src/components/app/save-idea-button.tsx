'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Bookmark, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { saveIdea } from '@/lib/actions/competitors';

/**
 * Files a niche, a book idea or a series plan into a project. Shared by the three
 * generator tools so they all save the same way and land in the same place.
 */
export function SaveIdeaButton({
  kind,
  title,
  payload,
  projects,
  label = 'Save to project',
  size = 'sm',
}: {
  kind: 'niche' | 'book_idea' | 'series';
  title: string;
  payload: Record<string, unknown>;
  projects: { id: string; name: string }[];
  label?: string;
  size?: 'sm' | 'default';
}) {
  const [savedTo, setSavedTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (projects.length === 0) {
    return (
      <Button asChild variant="outline" size={size}>
        <Link href="/projects">
          <Bookmark className="h-4 w-4" />
          Create a project to save
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : savedTo ? (
            <Check className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {savedTo ? `Saved to ${savedTo}` : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Save to</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onSelect={() =>
              startTransition(async () => {
                await saveIdea({ kind, title, payload, projectId: project.id });
                setSavedTo(project.name);
              })
            }
          >
            <span className="flex-1 truncate">{project.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
