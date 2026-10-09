'use client';

import { Button } from '@/components/ui/button';

/** A submit button that asks before deleting. Put it inside a <form action>. */
export function DeleteButton({ what }: { what: string }) {
  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      className="text-rose-600 hover:text-rose-700"
      onClick={(e) => {
        if (!window.confirm(`Delete this ${what}? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      Delete
    </Button>
  );
}
