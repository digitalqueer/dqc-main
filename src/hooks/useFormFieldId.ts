import type { AnyFieldApi } from "@tanstack/react-form-start";

/** A field's element id, unique per form: `{formId}__{name}`. */
export function useFormFieldId(field: AnyFieldApi) {
  return `${field.form.formId}__${field.name}`;
}
