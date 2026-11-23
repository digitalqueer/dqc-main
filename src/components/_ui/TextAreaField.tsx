import type { ComponentProps } from "react";
import { useFieldContext } from "@/forms/context.form";
import { useFormFieldId } from "@/hooks/useFormFieldId";
import { cn } from "@/lib/utils";
import FieldInfo from "./FieldInfo";
import { CONTROL_CLASSES, LABEL_CLASSES } from "./InputField";

interface TextAreaFieldProps extends ComponentProps<"fieldset"> {
  label: string;
  placeholder?: string;
  rows?: number;
}

export function TextAreaField({
  label,
  placeholder,
  rows = 4,
  ...props
}: TextAreaFieldProps) {
  const field = useFieldContext<string>();
  const field_id = useFormFieldId(field);

  return (
    <fieldset name={`fieldset__${field_id}`} {...props}>
      <label className={LABEL_CLASSES} htmlFor={field_id}>
        {label}
      </label>
      <textarea
        className={cn(CONTROL_CLASSES, "resize-y")}
        id={field_id}
        rows={rows}
        placeholder={placeholder}
        value={field.state.value}
        onBlur={() => field.handleBlur()}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldInfo field={field} />
    </fieldset>
  );
}
