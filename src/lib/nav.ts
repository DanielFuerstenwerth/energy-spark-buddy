/**
 * Navigation data loading and building utilities
 * DO NOT MODIFY - This file is part of the fixed navigation system
 */

import { urlFor } from "./links";

export type Kriterium = { slug: string; title: string };
export type Unterkategorie = { slug: string; title: string; kriterien?: Kriterium[] };
export type Kategorie = { slug: string; title: string; unterkategorien?: Unterkategorie[] };
export type NavJson = { kategorien: Kategorie[] };

export async function loadNavJson(): Promise<NavJson> {
  const res = await fetch("/data/nav.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load nav.json: ${res.statusText}`);
  }
  return res.json();
}

export type NavSection = {
  label: string;
  href: string;
  items?: { label: string; href: string }[];
};

export type NavItem = {
  label: string;
  href?: string;
  sections?: NavSection[];
};

export async function buildNavItems(): Promise<NavItem[]> {
  const data = await loadNavJson();
  
  const catItems: NavItem[] = (data.kategorien || []).map((cat) => {
    const sections: NavSection[] = (cat.unterkategorien || []).map((sub) => ({
      label: sub.title,
      href: urlFor(cat.slug, sub.slug),
      items: (sub.kriterien || []).map((k) => ({
        label: k.title,
        href: urlFor(cat.slug, sub.slug, k.slug)
      }))
    }));
    
    return {
      label: cat.title || cat.slug,
      href: urlFor(cat.slug),
      sections
    };
  });

  return [
    { label: "News", href: "/news" },
    { label: "Methodik", href: "/methodik" },
    { label: "Über uns", href: "/about" },
    { label: "Kontakt", href: "/impressum" },
    ...catItems
  ];
}
