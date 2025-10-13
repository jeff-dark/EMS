import React from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ForbiddenHandler() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (event: any) => {
      // Inertia emits errors with different shapes depending on adapter/transport
      const status = event?.detail?.status
        ?? event?.detail?.response?.status
        ?? event?.response?.status
        ?? event?.status;
      if (status === 403) {
        setOpen(true);
      }
    };
    // Subscribe
    // @ts-ignore - Inertia router has on/off at runtime
    router.on('error', handler);
    return () => {
      // Unsubscribe
      // @ts-ignore
      router.off?.('error', handler);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Not authorized</DialogTitle>
          <DialogDescription>
            you are not authorised, contact your admin for assistance
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
