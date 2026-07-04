import { type IconSvgElement } from '@hugeicons/react';
import { pages, type PageType } from '@/utils/pages';

export type SidebarNavItem = {
  label: string;
  path: string;
  icon: {
    normal: IconSvgElement;
    active: IconSvgElement;
  };
  matchPaths?: string[];
  requiresPhysicalStore?: boolean;
};

export type SidebarSection = {
  title: string;
  items: SidebarNavItem[];
};

function pageToNavItem(page: PageType): SidebarNavItem {
  return {
    label: page.label,
    path: page.slug || '/',
    icon: page.icon,
    requiresPhysicalStore: page.requiresPhysicalStore,
  };
}

export function getSidebarSections(isPhysicalStore = true): SidebarSection[] {
  const grouped: Record<string, SidebarNavItem[]> = {};

  for (const page of pages) {
    if (page.requiresPhysicalStore && !isPhysicalStore) continue;

    if (!grouped[page.group]) {
      grouped[page.group] = [];
    }
    grouped[page.group].push(pageToNavItem(page));
  }

  return Object.entries(grouped).map(([title, items]) => ({
    title,
    items,
  }));
}

/** @deprecated use getSidebarSections(isPhysicalStore) */
export const sidebarSections: SidebarSection[] = getSidebarSections(true);

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
