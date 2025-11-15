import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const calloutVariants = cva(
  "relative rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-8",
  {
    variants: {
      variant: {
        default: "bg-muted border-border text-foreground",
        info: "bg-accent/10 border-accent text-accent-foreground [&>svg]:text-accent",
        warning: "bg-warning/10 border-warning text-foreground [&>svg]:text-warning",
        destructive: "bg-destructive/10 border-destructive text-foreground [&>svg]:text-destructive",
        success: "bg-score-excellent/10 border-score-excellent text-foreground [&>svg]:text-score-excellent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  icon?: React.ReactNode;
}

const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, variant, icon, children, ...props }, ref) => {
    const defaultIcons = {
      default: <Info className="h-5 w-5" />,
      info: <Info className="h-5 w-5" />,
      warning: <AlertTriangle className="h-5 w-5" />,
      destructive: <XCircle className="h-5 w-5" />,
      success: <CheckCircle2 className="h-5 w-5" />,
    };

    const IconComponent = icon || (variant ? defaultIcons[variant] : defaultIcons.default);

    return (
      <div
        ref={ref}
        className={cn(calloutVariants({ variant }), className)}
        {...props}
      >
        {IconComponent}
        <div className="text-sm [&_p]:leading-relaxed">{children}</div>
      </div>
    );
  }
);
Callout.displayName = "Callout";

export { Callout, calloutVariants };
