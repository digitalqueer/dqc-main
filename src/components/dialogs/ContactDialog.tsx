import { type ReactNode, useCallback, useId, useState } from "react";
import { closeDialog } from "@/lib/utils";
import Button from "../_ui/Button";
import Dialog from "../_ui/Dialog";
import { ContactForm } from "../forms/ContactForm";

interface ContactDialogProps {
  children: ReactNode;
  /** From getContactForm; null while Turnstile isn't configured. */
  turnstileSiteKey: string | null;
}

export default function ContactDialog({
  children,
  turnstileSiteKey,
}: ContactDialogProps) {
  const formId = useId();
  const [dialogId, setDialogId] = useState<string | null>(null);

  const handleSent = useCallback(() => {
    if (dialogId) closeDialog(dialogId);
  }, [dialogId]);

  return (
    <Dialog.Root idSetter={setDialogId}>
      {children}
      <Dialog.Content className="max-w-2xl">
        <div className="-mx-2 border-b px-2 pb-2">
          <h2 className="font-mono text-2xl font-bold">Get In Touch</h2>
          <h3 className="font-mono text-sm text-neutral-400">
            We'd love to hear from a future partner, ally, or member
          </h3>
        </div>

        <ContactForm
          id={formId}
          turnstileSiteKey={turnstileSiteKey}
          onSent={handleSent}
          className="px-2 pt-2 pb-4"
        />

        <div className="-mx-2 flex items-center justify-end border-t px-2 pt-2">
          <Button form={formId} type="submit">
            Contact Us
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
