import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CommandIcon } from "lucide-react";

interface GlobalCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

export const GlobalCommandBar = ({ isOpen, onClose, onCommand }: GlobalCommandBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onCommand(query);
      setQuery("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-center space-x-2 p-4">
          <CommandIcon className="w-4 h-4" />
          <form onSubmit={handleSubmit} className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command..."
              className="border-0 focus-visible:ring-0"
              autoFocus
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
