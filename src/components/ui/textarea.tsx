import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = true, onChange, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

    const setRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref]
    );

    const resize = React.useCallback(() => {
      const el = internalRef.current;
      if (!el || !autoResize) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
    }, [autoResize]);

    React.useEffect(() => {
      resize();
    }, [props.value, resize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      if (autoResize) {
        requestAnimationFrame(resize);
      }
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          autoResize && "overflow-hidden",
          className,
        )}
        ref={setRef}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
