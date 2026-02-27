import { useForm } from "@tanstack/react-form-start";
import FieldInfo from "../_ui/FieldInfo";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { ClientOnly } from "@tanstack/react-router";
import Turnstile from "react-turnstile";
import { clientEnv } from "@/env";
import {
  CONTACT_TURNSTILE_ACTION,
  NewContactRequestSchema,
} from "@/schemas/contactRequest.schema";
import { createContactRequestServerFn } from "@/server/contact/contact.functions";
import { useToast } from "../_ui/Toast";
import {
  InvalidContactRequestReponse,
  ValidContactRequestResponse,
} from "@/server/contact/contact.server";

interface ContactFormProps
  extends Omit<ComponentProps<"form">, "id" | "onSubmit"> {
  id: string;
  onValidResponse?: (response: ValidContactRequestResponse) => void;
  onInvalidResponse?: (response: InvalidContactRequestReponse) => void;
}

export function ContactForm({
  id,
  onValidResponse,
  onInvalidResponse,
  ...props
}: ContactFormProps) {
  const toast = useToast();
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      comment: "",
      communicationsConsent: false,
      turnstileToken: "",
    },
    validators: { onSubmit: NewContactRequestSchema },
    onSubmit: async ({ value }) => {
      const requestContactResponse = await createContactRequestServerFn({
        data: value,
      });
      if (requestContactResponse.success) {
        toast.success({ title: "Thanks for reaching out!" });
        if (onValidResponse) onValidResponse(requestContactResponse);
      } else {
        console.error(
          `Failed to submit contact request form - ${requestContactResponse.errors.join(", ")}`,
        );
        toast.danger({ title: "Something went wrong" });
        if (onInvalidResponse) onInvalidResponse(requestContactResponse);
      }
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
      <ClientOnly>
        <form.Field
          name="turnstileToken"
          children={(field) => (
            <Turnstile
              className="mt-2"
              action={CONTACT_TURNSTILE_ACTION}
              fixedSize
              refreshExpired="auto"
              size="normal"
              sitekey={clientEnv.VITE_CLOUDFLARE_SITEKEY}
              onVerify={(token) => field.handleChange(token)}
            />
          )}
        />
      </ClientOnly>
    </form>
  );
}
