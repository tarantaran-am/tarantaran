"use client";

import * as React from "react";
import { cn } from "cn";
import { Input } from "@/shared/components/ui/input";

// Desktop browsers draw "dd/mm/yyyy" inside an empty date field themselves; on touch screens (iOS) the empty
// field is blank, so a hint is laid over it there.
function DateInput({ className, onChange, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [typed, setTyped] = React.useState(String(props.defaultValue ?? ""));
  const empty = (props.value !== undefined ? String(props.value) : typed) === "";

  return (
    <div className={cn("relative", className)}>
      <Input
        {...props}
        type="date"
        onChange={(event) => {
          setTyped(event.target.value);
          onChange?.(event);
        }}
      />
      {empty && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-3 hidden items-center text-base text-muted-foreground md:text-sm [@media(hover:none)]:flex"
        >
          dd.mm.yyyy
        </span>
      )}
    </div>
  );
}

export { DateInput };
