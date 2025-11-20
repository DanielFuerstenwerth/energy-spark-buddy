/**
 * URL generation utilities for navigation
 * DO NOT MODIFY - This file is part of the fixed navigation system
 */

export function urlFor(cat: string, sub?: string, crit?: string): string {
  if (cat && sub && crit) {
    return `/${cat}/${sub}/${encodeURIComponent(crit)}`;
  }
  if (cat && sub) {
    return `/${cat}/${sub}`;
  }
  if (cat) {
    return `/${cat}`;
  }
  return "/";
}
