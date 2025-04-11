
import { cn } from "@/lib/utils";

interface RouteLegendProps {
  className?: string;
}

const RouteLegend = ({ className }: RouteLegendProps) => {
  return (
    <div className={cn("bg-white p-3 rounded-lg shadow-md", className)}>
      <h3 className="font-semibold mb-2">Route Safety</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 border border-gray-300"></div>
          <span className="font-medium text-sm">Safe</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 border border-gray-300"></div>
          <span className="font-medium text-sm">Moderate Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 border border-gray-300"></div>
          <span className="font-medium text-sm">High Risk</span>
        </div>
      </div>
    </div>
  );
};

export default RouteLegend;
