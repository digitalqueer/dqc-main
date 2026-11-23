import { type ReactNode, useCallback, useId, useState } from "react";
import Dialog from "../_ui/Dialog";
import Button from "../_ui/Button";
import { ContactForm } from "../forms/ContactForm";
import { closeDialog } from "@/lib/utils";

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
        <div className="-mx-2 px-2 pb-2 border-b">
          <h2 className="font-mono text-2xl font-bold">Get In Touch</h2>
          <h3 className="font-mono text-neutral-400 text-sm">
            We'd love to hear from a future partner, ally, or member
          </h3>
        </div>

        <ContactForm
          id={formId}
          turnstileSiteKey={turnstileSiteKey}
          onSent={handleSent}
          className="px-2 pb-4 pt-2"
        />

        <div className="-mx-2 pt-2 px-2 border-t flex items-center justify-end">
          <Button form={formId} type="submit">
            Contact Us
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
