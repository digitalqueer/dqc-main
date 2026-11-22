import {
  ComponentProps,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Button, { ButtonProps } from "@/components/_ui/Button";
import { ClientOnly } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// The Invoker Commands API (`<button command="show-modal" commandfor="id">`)
// opens and closes the <dialog> without JavaScript. React passes the
// attributes through to the DOM, but its types don't list them yet.
declare module "react" {
  interface ButtonHTMLAttributes<T> {
    command?: string;
    commandfor?: string;
  }
}

interface DialogContextValue {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogContext must be used within a Dialog.Root");
  }
  return context;
};

interface DialogRootProps {
  children: ReactNode;
  idSetter?: (id: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Root({ children, idSetter, open, onOpenChange }: DialogRootProps) {
  const id = useId();

  useEffect(() => {
    if (idSetter) idSetter(id);
  }, [id, idSetter]);

  const [localOpenState, setLocalOpenState] = useState(false);

  const handleOpenChange = useCallback(
    (val: boolean) => {
      if (onOpenChange) onOpenChange(val);
      else setLocalOpenState(() => val);
    },
    [onOpenChange],
  );

  const resolvedOpenState = useMemo(() => {
    if (typeof open !== "undefined") return open;
    else return localOpenState;
  }, [open, localOpenState]);

  return (
    <DialogContext.Provider
      value={{
        id,
        open: resolvedOpenState,
        onOpenChange: handleOpenChange,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

interface DialogActionProps extends ButtonProps {
  command: "show-modal" | "close";
}

function Action({ children, command, ...props }: DialogActionProps) {
  const context = useDialogContext();
  return (
    <Button {...props} command={command} commandfor={context.id}>
      {children}
    </Button>
  );
}

interface ContentProps
  extends Omit<ComponentProps<"dialog">, "open" | "onClose"> {}

function Content({ children, className, ...props }: ContentProps) {
  const context = useDialogContext();

  return (
    <ClientOnly>
      {createPortal(
        <dialog
          {...props}
          id={context.id}
          onCancel={() => context.onOpenChange(false)}
          onClose={() => context.onOpenChange(false)}
          className={cn(
            "fixed left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 group text-neutral-100 backdrop:bg-neutral-900/75 hidden open:flex flex-col overflow-y-auto max-h-[100vh-4rem)] border bg-neutral-950 p-2 container max-w-4xl",
            className,
          )}
        >
          {children}
          <Button
            variant="default"
            size="icon"
            className="absolute top-1 right-1"
            command="close"
            commandfor={context.id}
          >
            <XIcon className="size-4" />
          </Button>
        </dialog>,
        document.body,
        context.id,
      )}
    </ClientOnly>
  );
}

export default {
  Action,
  Root,
  Content,
};
