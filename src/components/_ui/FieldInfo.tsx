import type { AnyFieldApi } from "@tanstack/react-form-start";
import { type ComponentProps, useMemo } from "react";
import { cn } from "@/lib/utils";

interface FieldInfoProps extends ComponentProps<"span"> {
  field: AnyFieldApi;
}

export default function FieldInfo({ field, ...props }: FieldInfoProps) {
  const errorMessages = useMemo(() => {
    if (field.state.meta.errors.length) {
      return field.state.meta.errors.reduce((acc, curr) => {
        if (curr && typeof curr === "object" && "message" in curr) {
          acc.push(curr.message);
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
    }
    return [];
  }, [field.state.meta.errors]);

  if (field.state.meta.isTouched && !field.state.meta.isValid) {
    return (
      <span
        {...props}
        className={cn("block text-sm text-rose-300 italic", props.className)}
      >
        {errorMessages.join(", ")}
      </span>
    );
  }
  return null;
}
