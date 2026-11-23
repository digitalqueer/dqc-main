import { revalidateLogic, useForm } from "@tanstack/react-form-start";
import { useServerFn } from "@tanstack/react-start";
import { type ComponentProps, useRef, useState } from "react";
import { Turnstile, type TurnstileHandle } from "@/components/Turnstile";
import {
  CONTACT_TURNSTILE_ACTION,
  type ContactRequestInput,
  contactRequestInputSchema,
} from "@/lib/contact";
import { cn } from "@/lib/utils";
import { submitContactRequest } from "@/server/functions/contact.functions";
import FieldInfo from "../_ui/FieldInfo";
import { useToast } from "../_ui/Toast";

const EMPTY: ContactRequestInput = {
  firstName: "",
  lastName: "",
  email: "",
  comment: "",
  communicationsConsent: false,
};

interface ContactFormProps
  extends Omit<ComponentProps<"form">, "id" | "onSubmit"> {
  id: string;
  /** From getContactForm; null while Turnstile isn't configured. */
  turnstileSiteKey: string | null;
  /** Called once the message is saved, e.g. to close the dialog. */
  onSent?: () => void;
}

/** The public contact form, behind a Turnstile check. */
export function ContactForm({
  id,
  turnstileSiteKey,
  onSent,
  ...props
}: ContactFormProps) {
  const toast = useToast();
  const submit = useServerFn(submitContactRequest);
  const turnstile_ref = useRef<TurnstileHandle>(null);
  const [token, set_token] = useState<string | null>(null);

  const form = useForm({
    defaultValues: EMPTY,
    // Quiet until the first send, then re-checks as they fix things.
    validationLogic: revalidateLogic(),
    validators: { onDynamic: contactRequestInputSchema },
    onSubmit: async ({ value, formApi }) => {
      if (!token) {
        toast.danger({
          title: "Wait for the check that you're human to finish, then send.",
        });
        return;
      }
      try {
        await submit({ data: { ...value, turnstileToken: token } });
      } catch (reason) {
        toast.danger({
          title: "Your message wasn't sent",
          description:
            reason instanceof Error && reason.message
              ? reason.message
              : "Please try again.",
        });
        return;
      } finally {
        // A token passes once, sent or not, so ask for a new one.
        turnstile_ref.current?.reset();
      }
      toast.success({ title: "Thanks for reaching out!" });
      formApi.reset(EMPTY);
      onSent?.();
    },
  });

  return (
    <form
      {...props}
      id={id}
      method="dialog"
      className={cn("flex flex-col gap-2", props.className)}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex gap-4">
        <form.Field
          name="firstName"
          children={(field) => (
            <fieldset className="w-full">
              <label
                className="block mb-0.5 ml-0.5"
                htmlFor={`${id}__${field.name}`}
              >
                First Name
              </label>
              <input
                className="w-full border focus:border-opacity-50 focus:outline-white focus:outline-1 outline-offset-2 px-2 py-1"
                autoComplete="given-name"
                placeholder="Jane"
                id={`${id}__${field.name}`}
                value={field.state.value}
                onBlur={() => field.handleBlur()}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </fieldset>
          )}
        />
        <form.Field
          name="lastName"
          children={(field) => (
            <fieldset className="w-full">
              <label
                className="block mb-0.5 ml-0.5"
                htmlFor={`${id}__${field.name}`}
              >
                Last Name
              </label>
              <input
                className="w-full border focus:border-opacity-50 focus:outline-white focus:outline-1 outline-offset-2 px-2 py-1"
                autoComplete="family-name"
                placeholder="Doe"
                id={`${id}__${field.name}`}
                value={field.state.value}
                onBlur={() => field.handleBlur()}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </fieldset>
          )}
        />
      </div>
      <form.Field
        name="email"
        children={(field) => (
          <fieldset className="w-full">
            <label
              className="block mb-0.5 ml-0.5"
              htmlFor={`${id}__${field.name}`}
            >
              Email
            </label>
            <input
              aria-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
              className="w-full aria-[invalid=true]:border-rose-300 border focus:border-opacity-50 focus:outline-white focus:outline-1 outline-offset-2 px-2 py-1"
              autoComplete="email"
              type="email"
              placeholder="jane.doe@email.com"
              id={`${id}__${field.name}`}
              value={field.state.value}
              onBlur={() => field.handleBlur()}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </fieldset>
        )}
      />
      <form.Field
        name="comment"
        children={(field) => (
          <fieldset className="w-full">
            <label
              className="block mb-0.5 ml-0.5"
              htmlFor={`${id}__${field.name}`}
            >
              Question/Comment
            </label>
            <textarea
              className="w-full border focus:border-opacity-50 focus:outline-white focus:outline-1 outline-offset-2 px-2 py-1"
              autoComplete="off"
              id={`${id}__${field.name}`}
              value={field.state.value}
              onBlur={() => field.handleBlur()}
              onChange={(e) => field.handleChange(e.target.value)}
            ></textarea>
            <FieldInfo field={field} />
          </fieldset>
        )}
      />
      <form.Field
        name="communicationsConsent"
        children={(field) => (
          <fieldset className="w-full">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                className="size-5 mt-0.5 border accent-white rounded-none focus:outline-white outline-offset-2 focus:outline-1"
                autoComplete="off"
                id={`${id}__${field.name}`}
                checked={field.state.value}
                onBlur={() => field.handleBlur()}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              <label className="block" htmlFor={`${id}__${field.name}`}>
                Sign up to join DQC's newsletters and future communications
              </label>
            </div>
            <FieldInfo field={field} />
          </fieldset>
        )}
      />
      {turnstileSiteKey ? (
        <Turnstile
          ref={turnstile_ref}
          className="mt-2"
          site_key={turnstileSiteKey}
          action={CONTACT_TURNSTILE_ACTION}
          on_token={set_token}
        />
      ) : (
        <p className="mt-2 text-neutral-400 text-sm">
          The contact form isn't available right now. Please try again later.
        </p>
      )}
    </form>
  );
}
