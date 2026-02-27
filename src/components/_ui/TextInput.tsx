import { ComponentProps } from "react";

interface TextInputProps extends ComponentProps<"input"> {}

export function TextInput({ ...props }: TextInputProps) {}
