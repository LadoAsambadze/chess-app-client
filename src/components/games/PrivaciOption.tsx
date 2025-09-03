import { Globe, Shield, Lock, Users } from 'lucide-react';

export function PrivacyOption({
  isPrivate: optionIsPrivate,
  isSelected,
  onClick,
}: any) {
  const config = optionIsPrivate
    ? {
        title: 'Private',
        description: 'Password protected',
        icon: Shield,
        secondaryIcon: Lock,
      }
    : {
        title: 'Public',
        description: 'Open to all',
        icon: Globe,
        secondaryIcon: Users,
      };

  const MainIcon = config.icon;
  const SecondaryIcon = config.secondaryIcon;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-3 rounded-lg border transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative p-1.5 bg-blue-500 rounded-md">
            <MainIcon className="h-3 w-3 text-white" />
            <div className="absolute -top-0.5 -right-0.5 p-0.5 bg-white rounded">
              <SecondaryIcon className="h-1.5 w-1.5 text-gray-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-900">
              {config.title}
            </h3>
            <p className="text-xs text-gray-500">{config.description}</p>
          </div>
        </div>
        <div
          className={`w-3 h-3 rounded-full border-2 ${
            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
          }`}
        >
          {isSelected && (
            <div className="w-1 h-1 bg-white rounded-full mx-auto mt-0.5"></div>
          )}
        </div>
      </div>
    </div>
  );
}
