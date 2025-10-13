import React from 'react';
import { usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ForbiddenHandler() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState<string>('you are not authorised, contact your admin for assistance');
  const page = usePage<{ flash?: { error?: string } }>();

  // Removed router error listener; rely on flash error for consistent UX.

  // Also react to flash error shared by backend (e.g. redirect with flash on 403)
  React.useEffect(() => {
    const flashError = page.props?.flash?.error;
    if (flashError && typeof flashError === 'string') {
      setMessage(flashError);
      setOpen(true);
    }
  }, [page.props]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Not authorized</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
