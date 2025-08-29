import type { HTMLAttributes } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LoadingProps extends HTMLAttributes<HTMLDivElement> {}

export function Loading({ className, ...rest }: LoadingProps) {
  const baseClass =
    "animate-spin border border-3 border-primary border-t-transparent rounded-full";

  return <div className={`${baseClass} ${className}`} {...rest} />;
}
