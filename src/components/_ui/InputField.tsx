import type { AnyFieldApi } from "@tanstack/react-form-start";
import type { ComponentProps } from "react";
import { useFormFieldId } from "@/hooks/useFormFieldId";
import { cn } from "@/lib/utils";

/**
 * Height for one-line controls: a line of text + py-1 + the 1px borders, i.e.
 * the height an input gets on its own. Set explicitly because native <select>s
 * ignore line-height and would otherwise render shorter than inputs.
 */
export const SINGLE_LINE_CONTROL_HEIGHT = "h-[calc(1lh+0.5rem+2px)]";

/** Shared look for inputs, selects and textareas. */
export const CONTROL_CLASSES =
  "w-full border bg-neutral-950 outline-offset-2 px-2 py-1 focus:outline-1 focus:outline-white disabled:opacity-60";

/** A field's label, set a little apart from its control. */
export const LABEL_CLASSES = "block mb-0.5 ml-0.5";

interface InputFieldProps extends ComponentProps<"input"> {
  field: AnyFieldApi;
}

function InputField({ field, className, ...props }: InputFieldProps) {
  const id = useFormFieldId(field);

  return (
    <input
      {...props}
      className={cn(CONTROL_CLASSES, SINGLE_LINE_CONTROL_HEIGHT, className)}
      id={id}
      value={field.state.value}
      onBlur={() => field.handleBlur()}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  );
}

export { InputField, useFormFieldId };
