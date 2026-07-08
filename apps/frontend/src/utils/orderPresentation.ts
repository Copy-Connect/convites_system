import type { Order } from '@/models/Order';

export type OrderUiState = 'pending_payment' | 'in_progress' | 'completed' | 'canceled';

function normalizeStatus(value?: string | null) {
  return (value || '').toUpperCase();
}

export function resolveOrderUiState(order: Order): OrderUiState {
  const orderStatus = normalizeStatus(order.status);
  const paymentStatus = normalizeStatus(order.paymentStatus);

  if (orderStatus === 'CANCELED' || paymentStatus === 'FAILED') {
    return 'canceled';
  }

  if (orderStatus === 'GENERATED') {
    return 'completed';
  }

  if (paymentStatus === 'PAID' || orderStatus === 'PAID') {
    return 'in_progress';
  }

  return 'pending_payment';
}

export function getOrderStatusLabel(order: Order) {
  switch (resolveOrderUiState(order)) {
    case 'completed':
      return 'Concluido';
    case 'in_progress':
      return 'Em andamento';
    case 'canceled':
      return 'Cancelado';
    default:
      return 'Aguardando PIX';
  }
}

export function getOrderStatusClass(order: Order) {
  switch (resolveOrderUiState(order)) {
    case 'completed':
      return 'is-completed';
    case 'in_progress':
      return 'is-progress';
    case 'canceled':
      return 'is-canceled';
    default:
      return 'is-pending';
  }
}

export function getOrderThemeLabel(order: Order) {
  const themeSlug = (order.themeSlug || '').trim().toLowerCase();
  const themeLabels: Record<string, string> = {
    'homem-aranha': 'Homem-Aranha',
  };

  return order.themeName || themeLabels[themeSlug] || order.themeSlug || 'Tema nao informado';
}

export function getOrderCode(order: Order) {
  const value = order.slug || order.id;
  return value ? `#${String(value).toUpperCase()}` : '#PENDENTE';
}

export function getOrderTitle(order: Order) {
  return `Convite de ${order.name}`;
}

export function formatMoney(amountCents?: number | null) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format((amountCents ?? 0) / 100);
}

export function formatDate(value?: string, withTime = false) {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    withTime
      ? {
          dateStyle: 'short',
          timeStyle: 'short',
        }
      : {
          dateStyle: 'short',
        },
  ).format(new Date(value));
}
