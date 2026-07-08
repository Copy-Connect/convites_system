import type { Order, OrderGuest } from '@/models/Order';

type AddressLike = Partial<
  Pick<
    Order,
    | 'address'
    | 'zipCode'
    | 'street'
    | 'addressNumber'
    | 'neighborhood'
    | 'city'
    | 'stateCode'
    | 'complement'
    | 'referencePoint'
  >
>;

export function parseGiftIdeas(rawValue?: string | null) {
  if (!rawValue) {
    return [] as string[];
  }

  return rawValue
    .split(/\r?\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatZipCode(value?: string | null) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function buildAddressSearchQuery(address?: AddressLike | null) {
  if (!address) {
    return '';
  }

  if (address.street || address.city || address.stateCode) {
    return [
      address.street,
      address.addressNumber,
      address.neighborhood,
      address.city,
      address.stateCode,
      formatZipCode(address.zipCode),
      address.referencePoint,
    ]
      .filter(Boolean)
      .join(', ');
  }

  return address.address || '';
}

export function formatOrderAddress(address?: AddressLike | null) {
  if (!address) {
    return '';
  }

  if (address.street || address.city || address.stateCode) {
    const mainLine = [address.street, address.addressNumber].filter(Boolean).join(', ');
    const secondaryLine = [address.neighborhood, [address.city, address.stateCode].filter(Boolean).join(' - ')]
      .filter(Boolean)
      .join(' • ');
    const extras = [
      address.complement ? `Complemento: ${address.complement}` : '',
      address.referencePoint ? `Referência: ${address.referencePoint}` : '',
      address.zipCode ? `CEP: ${formatZipCode(address.zipCode)}` : '',
    ].filter(Boolean);

    return [mainLine, secondaryLine, ...extras].filter(Boolean).join('\n');
  }

  return address.address || '';
}

export function buildMapEmbedUrl(address?: AddressLike | null) {
  const query = encodeURIComponent(buildAddressSearchQuery(address));
  return `https://www.google.com/maps?q=${query}&z=17&output=embed`;
}

export function buildStreetViewUrl(address?: AddressLike | null) {
  const query = encodeURIComponent(buildAddressSearchQuery(address));
  return `https://www.google.com/maps?q=${query}&layer=c&z=18`;
}

export function formatGuestLabel(guest: OrderGuest) {
  return `${guest.name} • ${guest.age} anos`;
}
