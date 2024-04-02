import { Tab } from './ui/VerticalTabs';

type DrawerItemProps = {
  label: string;
  icon: string;
  onClick: () => void;
};

export default function DrawerItem({ label, icon, onClick }: DrawerItemProps) {
  return (
    <Tab
      label={label}
      showLabel={true}
      icon={icon}
      isSelected={false}
      onClick={onClick}
      onClose={() => {}}
      onTabDrop={() => {}}
      id=""
    />
  );
}
