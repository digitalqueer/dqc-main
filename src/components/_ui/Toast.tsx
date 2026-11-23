import { Prettify } from "@/lib/utils";
import { ClientOnly } from "@tanstack/react-router";
import { Placement } from "@floating-ui/react";
import {
  AlertTriangleIcon,
  CheckIcon,
  LucideIcon,
  OctagonXIcon,
  XIcon,
} from "lucide-react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { v7 as uuidv7 } from "uuid";
import Button from "./Button";

type ToastType = "basic" | "success" | "warning" | "danger";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  ttl?: number;
}

const ToastIconMap: Record<ToastType, LucideIcon | null> = {
  basic: null,
  success: CheckIcon,
  warning: AlertTriangleIcon,
  danger: OctagonXIcon,
};

interface ToastProps {
  toast: Toast;
  onDismiss: () => void;
}

function Toast({ onDismiss, toast }: ToastProps) {
  const Icon = useMemo(() => {
    return ToastIconMap[toast.type];
  }, [toast.type]);

  return (
    <output
      role="status"
      className="block pointer-events-none border bg-neutral-950 p-2 w-full"
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="size-4 shrink-0" />}
        <span className="grow">{toast.title}</span>
        <Button
          size="icon"
          className="pointer-events-auto"
          onClick={() => onDismiss()}
        >
          <XIcon strokeWidth={1.5} size={16} />
        </Button>
      </div>
      {toast.description && (
        <p className="text-sm text-neutral-300 mt-2">{toast.description}</p>
      )}
    </output>
  );
}

interface ToastContainerProps {
  onDismiss: (id: string) => void;
  placement: Placement;
  toasts: Toast[];
}

/**
 * The open modal <dialog>, if any. While one is open, the rest of the page is
 * inert: nothing outside the dialog can be clicked or is read out by screen
 * readers, even if it's drawn on top.
 */
function useOpenModalDialog() {
  const [dialog, set_dialog] = useState<HTMLDialogElement | null>(null);

  useEffect(() => {
    const update = () => {
      const open = document.querySelectorAll<HTMLDialogElement>("dialog:modal");
      set_dialog(open.length > 0 ? open[open.length - 1] : null);
    };
    update();
    // showModal() and close() add and remove the `open` attribute.
    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    return () => observer.disconnect();
  }, []);

  return dialog;
}

/** Browser only: render inside <ClientOnly>. */
function ToastContainer({ onDismiss, toasts }: ToastContainerProps) {
  const ref = useRef<HTMLElement>(null);
  const modal = useOpenModalDialog();

  // A manual popover sits in the browser's top layer, so the toasts are drawn
  // above a modal <dialog> and its backdrop. Putting them inside the open
  // modal keeps them clickable and announced too (see useOpenModalDialog).
  // Showing the popover again moves it above anything opened since.
  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    if (container.matches(":popover-open")) container.hidePopover();
    if (toasts.length > 0) container.showPopover();
  }, [toasts.length, modal]);

  return createPortal(
    <section
      ref={ref}
      popover="manual"
      aria-label="Notifications"
      // Undoes the popover's default look (centered, bordered, Canvas colors).
      className="hidden open:flex fixed inset-x-0 top-0 bottom-auto mx-auto h-fit w-full max-w-sm flex-col gap-2 overflow-visible bg-transparent p-2 text-neutral-100 pointer-events-none"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          onDismiss={() => onDismiss(toast.id)}
          toast={toast}
        />
      ))}
    </section>,
    modal ?? document.body,
  );
}

type NewToastArgument = Omit<Toast, "id" | "type">;

type NewToastFn = (t: Prettify<NewToastArgument>) => void;

type ToastContextValue = Record<ToastType, NewToastFn>;

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastAction =
  | {
      type: "add-toast";
      data: Toast;
    }
  | {
      type: "dismiss-toast";
      data: { id: string };
    };

function toastReducer(state: Toast[], action: ToastAction) {
  switch (action.type) {
    case "add-toast":
      return [...state, action.data];
    case "dismiss-toast":
      return state.filter((toast) => toast.id !== action.data.id);
    default:
      break;
  }
  return state;
}

interface ToastProviderProps {
  children: ReactNode;
  placement: Placement;
}

function ToastProvider({ children, placement }: ToastProviderProps) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const handleNewToast = useCallback(
    (type: ToastType, data: NewToastArgument) => {
      const toast = { id: uuidv7(), type, ...data };
      dispatch({ type: "add-toast", data: toast });
      setTimeout(() => {
        handleDismissToast(toast.id);
      }, toast.ttl ?? 10_000);
    },
    [],
  );

  const handleDismissToast = useCallback((id: string) => {
    dispatch({ type: "dismiss-toast", data: { id } });
  }, []);

  return (
    <ToastContext.Provider
      value={{
        basic: (toast: NewToastArgument) => handleNewToast("basic", toast),
        success: (toast: NewToastArgument) => handleNewToast("success", toast),
        warning: (toast: NewToastArgument) => handleNewToast("warning", toast),
        danger: (toast: NewToastArgument) => handleNewToast("danger", toast),
      }}
    >
      {children}
      <ClientOnly>
        <ToastContainer
          placement={placement}
          toasts={toasts}
          onDismiss={handleDismissToast}
        />
      </ClientOnly>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

export { ToastProvider, useToast };
