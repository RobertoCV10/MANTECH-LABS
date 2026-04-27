//src/renderer/src/components/sidebar/sidebarConfig.tsx
import { Home, Cpu, LayoutDashboard, HardDrive, Zap, Wrench, Settings } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeMode } from '../../theme/ThemeContext';
import type { SidebarItem } from './Sidebar.types';

export const useSidebarItems = (): SidebarItem[] => {
  const { t } = useLanguage();
  const { colors } = useThemeMode();

  return [
    { id: 'home',     label: t('sidebar.home'),        icon: <Home size={18} />,           color: colors.cyan },
    { id: 'cpu',      label: t('sidebar.cpu'),          icon: <Cpu size={18} />,            color: colors.cyan },
    { id: 'ram',      label: t('sidebar.ram'),          icon: <LayoutDashboard size={18} />,color: colors.cyan },
    { id: 'disk',     label: t('sidebar.disk'),         icon: <HardDrive size={18} />,      color: colors.cyan },
    { id: 'opti',     label: t('sidebar.optimize'),     icon: <Zap size={18} />,            color: colors.cyan },
    { id: 'mant',     label: t('sidebar.maintenance'),  icon: <Wrench size={18} />,         color: colors.cyan },
    { id: 'settings', label: t('sidebar.settings'),     icon: <Settings size={18} />,       color: colors.textSubtle },
  ];
};

export const SIDEBAR_WIDTH = 240;