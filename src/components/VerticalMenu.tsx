// components/VerticalMenu.tsx

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

interface MenuItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ href, icon: Icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} passHref>
      <div className={`flex items-center px-4 py-2 text-sm font-medium rounded-md cursor-pointer ${
        isActive
          ? 'bg-gray-900 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}>
        <Icon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
        {label}
      </div>
    </Link>
  );
};

const VerticalMenu: React.FC = () => {
  return (
    <nav className="space-y-1 px-2">
      <MenuItem href="/dashboard" icon={HomeIcon} label="Dashboard" />
      <MenuItem href="/artiste" icon={MusicalNoteIcon} label="Artiste" />
    </nav>
  );
};

export default VerticalMenu;