import { cn } from "@/lib/utils";
import { Avatar as BaseAvatar } from "@base-ui-components/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { useMemo, type ComponentProps } from "react";

const AvatarVariants = cva(
  "inline-flex select-none items-center justify-center overflow-hidden bg-gray-100 align-middle font-medium text-base text-neutral-700",
  {
    variants: {
      size: {
        sm: "size-6",
        default: "size-8",
        lg: "size-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface AvatarProps
  extends VariantProps<typeof AvatarVariants>,
    ComponentProps<"span"> {
  name: string;
  imageSrc: string;
}

export default function Avatar({
  className,
  name,
  imageSrc,
  size,
  ...props
}: AvatarProps) {
  const fallbackInitials = useMemo(() => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n.charAt(0).toUpperCase())
      .join("");
  }, [name]);

  const imageDimensions = useMemo(() => {
    switch (size) {
      case "sm":
        return { width: 24, height: 24 };
      case "lg":
        return {
          width: 48,
          height: 48,
        };
      default:
        return {
          width: 32,
          height: 32,
        };
    }
  }, [size]);

  return (
    <BaseAvatar.Root
      className={cn(AvatarVariants({ size }), className)}
      title={name}
      {...props}
    >
      <BaseAvatar.Image
        src={imageSrc}
        width={imageDimensions.width}
        height={imageDimensions.height}
        className="size-full object-cover"
      />
      <BaseAvatar.Fallback className="flex size-full items-center justify-center text-base">
        {fallbackInitials}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
