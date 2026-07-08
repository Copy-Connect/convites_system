import type { OrderGuest } from '@/models/Order';

export function parseGiftIdeas(rawValue?: string | null) {
  if (!rawValue) {
    return [] as string[];
  }

  return rawValue
    .split(/\r?\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildMapEmbedUrl(address?: string | null) {
  const query = encodeURIComponent(address || '');
  return `https://www.google.com/maps?q=${query}&z=17&output=embed`;
}

export function buildStreetViewUrl(address?: string | null) {
  const query = encodeURIComponent(address || '');
  return `https://www.google.com/maps?q=${query}&layer=c&z=18`;
}

export function formatGuestLabel(guest: OrderGuest) {
  return `${guest.name} • ${guest.age} anos`;
}
