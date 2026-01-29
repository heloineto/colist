import { ColorSelect } from '@/deprecated/packages/mantine';
import { usePrimaryColor } from '@/contexts/primary-color-context';

export function PrimaryColorSelect() {
  const { primaryColor, setPrimaryColor } = usePrimaryColor();

  return (
    <ColorSelect
      className="px-md hover:bg-gray-1 hover:dark:bg-dark-8 pt-0.5"
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
