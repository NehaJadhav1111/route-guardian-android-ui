
import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
  icon?: React.ReactNode;
}

const InputField = ({ label, className, icon, ...props }: InputFieldProps) => {
  return (
    <div className={cn("mb-4", className)}>
      <label className="block text-lg font-medium mb-2">{label}</label>
      <div className="relative">
        <input
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          {...props}
        />
        {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{icon}</div>}
      </div>
    </div>
  );
};

export default InputField;
