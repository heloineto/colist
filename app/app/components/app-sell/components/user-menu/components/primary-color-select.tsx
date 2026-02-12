import { ColorSelect } from '@/deprecated/packages/mantine';
import { usePrimaryColor } from '@/app/contexts/primary-color-context';

export function PrimaryColorSelect() {
  const { primaryColor, setPrimaryColor } = usePrimaryColor();

  return (
    <ColorSelect
      className="px-md hover:dark:bg-dark-800 pt-0.5 hover:bg-gray-100"
      value={primaryColor}
      onChange={(value) => setPrimaryColor(value ?? 'blue')}
      allowDeselect={false}
      size="md"
      placeholder="Primary Color"
      variant="unstyled"
      leftSectionProps={{ className: '!justify-start' }}
    />
  );
}
