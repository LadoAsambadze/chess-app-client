import { Clock } from 'lucide-react';
import { Button } from '../ui/Button';

export function TimePresetButton({ preset, isSelected, onClick }: any) {
  return (
    <Button
      onClick={onClick}
      className={`h-10 rounded-md font-medium transition-colors ${
        isSelected
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border'
      }`}
    >
      <div className="flex flex-col items-center">
        <span className="text-xs">{preset.label}</span>
        <Clock className="h-2.5 w-2.5 mt-0.5 opacity-60" />
      </div>
    </Button>
  );
}
