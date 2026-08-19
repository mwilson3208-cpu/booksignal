'use client';

import { useState, useTransition } from 'react';
import { Check, FolderPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { assignValidationToProject } from '@/lib/actions/validation';

export function SaveToProject({
  validationId,
  projectId,
  projects,
}: {
  validationId: string;
  projectId: string | null;
  projects: { id: string; name: string }[];
}) {
  const [current, setCurrent] = useState(projectId);
  const [pending, startTransition] = useTransition();

  const currentName = projects.find((p) => p.id === current)?.name;

  function assign(id: string | null) {
    setCurrent(id);
    startTransition(() => assignValidationToProject(validationId, id));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
          {currentName ? `In ${currentName}` : 'Save to project'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.length === 0 && (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No projects yet
          </DropdownMenuItem>
        )}
        {projects.map((project) => (
          <DropdownMenuItem key={project.id} onSelect={() => assign(project.id)}>
            <span className="flex-1 truncate">{project.name}</span>
            {current === project.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        {current && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => assign(null)}>Remove from project</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
