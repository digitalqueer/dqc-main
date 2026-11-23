import {
  createFormHook,
  createFormHookContexts,
} from "@tanstack/react-form-start";
import { Form } from "@/components/_ui/Form";
import { FormActions } from "@/components/_ui/FormActions";
import { SelectField } from "@/components/_ui/SelectField";
import { TextAreaField } from "@/components/_ui/TextAreaField";
import { TextField } from "@/components/_ui/TextField";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

/** `useForm` with dqc's field and footer components, e.g. `<field.TextField>`. */
export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    TextAreaField,
    SelectField,
  },
  formComponents: {
    Form,
    FormActions,
  },
  fieldContext,
  formContext,
});
