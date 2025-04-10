
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("bg-secondary p-4 flex items-center justify-center", className)}>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-secondary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-secondary"></div>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-white font-bold italic text-xl">Safe Route</h1>
          <p className="text-white text-xs">Recommendation System</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
