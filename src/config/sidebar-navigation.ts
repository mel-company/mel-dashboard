import { type IconSvgElement } from '@hugeicons/react';
import { pages } from '@/utils/pages';

export type SidebarNavItem = {
  label: string;
  path: string;
  icon: {
    normal: IconSvgElement;
    active: IconSvgElement;
  };
  matchPaths?: string[];
};

export type SidebarSection = {
  title: string;
  items: SidebarNavItem[];
};

export const sidebarSections: SidebarSection[] = (() => {
  const grouped: Record<string, SidebarNavItem[]> = {};

  for (const page of pages) {
    if (!grouped[page.group]) {
      grouped[page.group] = [];
    }
    grouped[page.group].push({
      label: page.label,
      path: page.slug || '/',
      icon: page.icon,
    });
  }

  return Object.entries(grouped).map(([title, items]) => ({
    title,
    items,
  }));
})();

export function isNavItemActive(
  pathname: string,
  item: SidebarNavItem,
): boolean {
  if (item.path === "/") return pathname === "/";
  const paths = item.matchPaths ?? [item.path];
  return paths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
