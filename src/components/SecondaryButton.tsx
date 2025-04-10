
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const SecondaryButton = ({ children, className, ...props }: SecondaryButtonProps) => {
  return (
    <button
      className={cn(
        "bg-muted text-secondary py-3 px-8 rounded-md font-medium hover:bg-opacity-90 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
