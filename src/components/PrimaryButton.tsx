
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const PrimaryButton = ({ children, className, ...props }: PrimaryButtonProps) => {
  return (
    <button
      className={cn(
        "bg-primary text-white py-3 px-8 rounded-md font-medium hover:bg-opacity-90 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
