<template>
  <section class="orders-page">
    <div class="topbar">
      <div class="topbar-spacer" />

      <label class="search-field">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="m21 21-4.4-4.4m1.4-5.1a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
          />
        </svg>
        <input v-model.trim="searchTerm" type="search" placeholder="Buscar pedido..." />
      </label>

      <button class="icon-button" type="button" @click="refreshOrders" aria-label="Atualizar pedidos">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
          />
        </svg>
      </button>

      <RouterLink class="icon-button" :to="{ name: 'orders-new' }" aria-label="Novo pedido">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 5v14m-7-7h14"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
          />
        </svg>
      </RouterLink>

      <span class="avatar">{{ userInitials }}</span>
    </div>

    <header class="page-header">
      <div>
        <h1>Gerenciamento de Pedidos</h1>
        <p>Acompanhe e administre as celebrações em andamento.</p>
      </div>
    </header>

    <div class="filter-bar">
      <span class="filter-label">Status:</span>
      <button
        v-for="filter in filters"
        :key="filter.value"
        type="button"
        class="filter-chip"
        :class="{ selected: selectedFilter === filter.value }"
        @click="selectFilter(filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>

    <p v-if="error" class="feedback error">{{ error }}</p>
    <p v-if="loading" class="state-card">Carregando pedidos...</p>
    <p v-else-if="!filteredOrders.length" class="state-card">
      Nenhum pedido encontrado com os filtros atuais.
    </p>

    <div v-else class="orders-grid">
      <article v-for="order in visibleOrders" :key="order.id" class="order-card">
        <div class="card-top">
          <span class="status-pill" :class="getOrderStatusClass(order)">
            {{ getOrderStatusLabel(order) }}
          </span>
          <span class="order-code">{{ getOrderCode(order) }}</span>
        </div>

        <h2>{{ getOrderTitle(order) }}</h2>

        <div class="details-list">
          <p>
            <strong>Criança:</strong>
            <span>{{ order.name }}</span>
          </p>
          <p>
            <strong>Tema:</strong>
            <span>{{ getOrderThemeLabel(order) }}</span>
          </p>
        </div>

        <div class="card-divider" />

        <div class="card-footer">
          <div class="card-meta">
            <strong>{{ getCardPrimaryLine(order) }}</strong>
            <span>{{ getCardSecondaryLine(order) }}</span>
          </div>

          <div class="card-actions">
            <RouterLink
              class="action-icon"
              :to="{ name: 'orders-show', params: { id: order.id } }"
              aria-label="Ver detalhes do pedido"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                />
              </svg>
            </RouterLink>

            <RouterLink
              class="action-icon"
              :to="{ name: 'orders-checkout', params: { id: order.id } }"
              aria-label="Abrir pagamento do pedido"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 7h16M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm2 9h6"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                />
              </svg>
            </RouterLink>

            <button
              class="action-icon is-disabled"
              type="button"
              disabled
              aria-label="Excluir pedido indisponível"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="m8 8 8 8m0-8-8 8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-if="canLoadMore" class="load-more-wrap">
      <button class="load-more" type="button" @click="loadMore">Carregar mais pedidos</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Order } from '@/models/Order';
import { OrdersService } from '@/services/OrdersService';
import { useAuthStore } from '@/stores/auth';
import {
  formatDate,
  formatMoney,
  getOrderCode,
  getOrderStatusClass,
  getOrderStatusLabel,
  getOrderThemeLabel,
  getOrderTitle,
  resolveOrderUiState,
} from '@/utils/orderPresentation';

type FilterValue = 'all' | 'in_progress' | 'pending_payment' | 'completed';

const auth = useAuthStore();

const filters: Array<{ label: string; value: FilterValue }> = [
  { label: 'Todos os Pedidos', value: 'all' },
  { label: 'Em andamento', value: 'in_progress' },
  { label: 'Aguardando PIX', value: 'pending_payment' },
  { label: 'Concluído', value: 'completed' },
];

const loading = ref(true);
const error = ref('');
const orders = ref<Order[]>([]);
const searchTerm = ref('');
const selectedFilter = ref<FilterValue>('all');
const visibleCount = ref(4);

const userInitials = computed(() => {
  const value = auth.user?.name || auth.user?.email || 'CP';
  const initials = value
    .split(/[ .@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'CP';
});

const filteredOrders = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();

  return orders.value.filter((order) => {
    const matchesFilter =
      selectedFilter.value === 'all' || resolveOrderUiState(order) === selectedFilter.value;

    if (!matchesFilter) {
      return false;
    }

    if (!term) {
      return true;
    }

    const content = [
      order.name,
      order.slug,
      order.id,
      getOrderThemeLabel(order),
      getOrderCode(order),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return content.includes(term);
  });
});

const visibleOrders = computed(() => filteredOrders.value.slice(0, visibleCount.value));
const canLoadMore = computed(() => filteredOrders.value.length > visibleCount.value);

function selectFilter(value: FilterValue) {
  selectedFilter.value = value;
  visibleCount.value = 4;
}

function loadMore() {
  visibleCount.value += 4;
}

function getCardPrimaryLine(order: Order) {
  const state = resolveOrderUiState(order);

  if (state === 'pending_payment') {
    return formatMoney(order.amountCents);
  }

  if (state === 'completed') {
    return 'Entregue';
  }

  return formatDate(order.updatedAt || order.createdAt);
}

function getCardSecondaryLine(order: Order) {
  const state = resolveOrderUiState(order);

  if (state === 'pending_payment') {
    return 'Valor pendente';
  }

  if (state === 'completed') {
    return formatDate(order.updatedAt || order.createdAt);
  }

  if (state === 'in_progress') {
    return 'Fase: produção';
  }

  return 'Pedido cancelado';
}

async function refreshOrders() {
  loading.value = true;
  error.value = '';

  try {
    orders.value = await OrdersService.list();
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Não foi possível carregar os pedidos.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void refreshOrders();
});
</script>

<style scoped>
.orders-page {
  display: grid;
  gap: 26px;
}

.topbar,
.page-header,
.state-card,
.order-card {
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: rgba(255, 251, 247, 0.78);
  box-shadow: 0 28px 60px rgba(31, 45, 82, 0.12);
  backdrop-filter: blur(16px);
}

.topbar {
  display: grid;
  grid-template-columns: 1fr minmax(260px, 320px) auto auto auto;
  gap: 12px;
  align-items: center;
  padding: 14px 18px;
  border-radius: 24px;
}

.topbar-spacer {
  min-height: 1px;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid rgba(31, 47, 87, 0.08);
  border-radius: 999px;
  background: rgba(240, 243, 251, 0.88);
  color: #6b7290;
}

.search-field svg,
.icon-button svg {
  width: 18px;
  height: 18px;
}

.search-field input {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.search-field input:focus {
  box-shadow: none;
}

.icon-button,
.avatar {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
}

.icon-button {
  color: #6b5f6a;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: inset 0 0 0 1px rgba(31, 47, 87, 0.08);
}

.avatar {
  font-size: 0.84rem;
  font-weight: 800;
  color: #5c3024;
  background: linear-gradient(180deg, #fff3ec 0%, #f2d8cb 100%);
  box-shadow: inset 0 0 0 1px rgba(187, 122, 101, 0.16);
}

.page-header {
  padding: 40px 34px 34px;
  border-radius: 28px;
}

.page-header h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.8rem, 5vw, 4rem);
  line-height: 1;
  color: #142649;
}

.page-header p,
.state-card,
.card-meta span {
  margin: 14px 0 0;
  color: #62708b;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-label {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b5f6a;
}

.filter-chip {
  min-height: 42px;
  padding: 0 1rem;
  border-radius: 999px;
  font-weight: 800;
  color: #22345b;
  background: rgba(223, 231, 249, 0.88);
}

.filter-chip.selected {
  color: #fff8f3;
  background: #162849;
}

.feedback {
  margin: 0;
  padding: 0.95rem 1rem;
  border-radius: 18px;
}

.error {
  color: #9a231b;
  background: rgba(216, 78, 56, 0.12);
}

.state-card {
  padding: 26px;
  border-radius: 24px;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.order-card {
  display: grid;
  gap: 18px;
  padding: 20px;
  border-radius: 24px;
}

.card-top,
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.48rem 0.8rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.is-progress {
  color: #8b5f18;
  background: rgba(248, 226, 178, 0.72);
}

.is-pending {
  color: #b6423e;
  background: rgba(252, 215, 213, 0.82);
}

.is-completed {
  color: #4a63cb;
  background: rgba(219, 225, 255, 0.88);
}

.is-canceled {
  color: #92302d;
  background: rgba(245, 216, 211, 0.88);
}

.order-code {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 800;
  color: #8f8c97;
}

.order-card h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2rem;
  line-height: 1.02;
  color: #4a4f59;
}

.details-list {
  display: grid;
  gap: 8px;
}

.details-list p {
  display: flex;
  gap: 6px;
  margin: 0;
  line-height: 1.5;
  color: #635967;
}

.details-list strong {
  font-weight: 800;
}

.card-divider {
  height: 1px;
  background: rgba(31, 47, 87, 0.12);
}

.card-meta {
  display: grid;
  gap: 4px;
}

.card-meta strong {
  color: #4a4f59;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  color: #6357e8;
}

.action-icon svg {
  width: 18px;
  height: 18px;
}

.action-icon.is-disabled {
  color: #d85755;
  opacity: 0.5;
  cursor: not-allowed;
  background: transparent;
}

.load-more-wrap {
  display: flex;
  justify-content: center;
}

.load-more {
  min-height: 54px;
  padding: 0 1.5rem;
  border-radius: 999px;
  color: #8f4a3b;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.68);
  box-shadow: inset 0 0 0 1px rgba(102, 135, 232, 0.22);
}

@media (max-width: 1180px) {
  .orders-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .topbar {
    grid-template-columns: 1fr;
  }

  .topbar-spacer {
    display: none;
  }

  .search-field,
  .icon-button,
  .avatar {
    width: 100%;
  }

  .page-header {
    padding: 28px 22px;
    border-radius: 24px;
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }
}
</style>
