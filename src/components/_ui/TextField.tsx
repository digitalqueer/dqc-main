import type { ComponentProps, HTMLInputTypeAttribute } from "react";
import { useFieldContext } from "@/forms/context.form";
import FieldInfo from "./FieldInfo";
import { InputField, LABEL_CLASSES, useFormFieldId } from "./InputField";

interface TextFieldProps extends ComponentProps<"fieldset"> {
  label: string;
  placeholder?: string;
  /** e.g. "email" or "url", for the right keyboard on phones. */
  type?: HTMLInputTypeAttribute;
  /** Lets browsers fill it in, e.g. "name" or "email". */
  autoComplete?: string;
  /** Shown under the label, e.g. what the value is used for. */
  description?: string;
  disabled?: boolean;
}

export function TextField({
  label,
  placeholder,
  type,
  autoComplete,
  description,
  disabled,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const field_id = useFormFieldId(field);
  const description_id = `${field_id}__description`;

  return (
    <fieldset name={`fieldset__${field_id}`} {...props}>
      <label className={LABEL_CLASSES} htmlFor={field_id}>
        {label}
      </label>
      {description && (
        <p id={description_id} className="mb-1 ml-0.5 text-sm opacity-80">
          {description}
        </p>
      )}
      <InputField
        field={field}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-describedby={description ? description_id : undefined}
      />
      <FieldInfo field={field} />
    </fieldset>
  );
}
