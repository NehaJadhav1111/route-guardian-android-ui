
import { cn } from "@/lib/utils";

interface RouteLegendProps {
  className?: string;
}

const RouteLegend = ({ className }: RouteLegendProps) => {
  return (
    <div className={cn("absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md", className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-safeRoute"></div>
          <span className="font-medium">: Safe</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-normalRoute"></div>
          <span className="font-medium">: Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-unsafeRoute"></div>
          <span className="font-medium">: Not Safe</span>
        </div>
      </div>
    </div>
  );
};

export default RouteLegend;
