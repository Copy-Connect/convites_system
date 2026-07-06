<template>
  <section class="dashboard-page">
    <header class="hero-card">
      <div class="hero-copy">
        <span class="eyebrow">Visão geral</span>
        <h1>Olá, bem-vindo ao seu painel</h1>
        <p>
          Acompanhe seus pedidos, gerencie temas e garanta que cada festa tenha um fluxo claro
          desde a criação até a entrega.
        </p>
      </div>

      <div class="hero-actions">
        <RouterLink class="primary-button" :to="{ name: 'orders-new' }">
          Criar novo pedido
        </RouterLink>
        <RouterLink class="secondary-button" :to="{ name: 'orders-index' }">
          Ver pedidos
        </RouterLink>
      </div>
    </header>

    <p v-if="error" class="feedback error">{{ error }}</p>

    <section class="metrics-grid">
      <article class="metric-card metric-card-sand">
        <span class="metric-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M8 7h8m-8 5h8m-8 5h5M7 3h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2Z"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            />
          </svg>
        </span>
        <div>
          <strong>{{ activeOrdersCount }}</strong>
          <span>Pedidos ativos</span>
          <small>Em produção após a confirmação do pagamento.</small>
        </div>
      </article>

      <article class="metric-card metric-card-rose">
        <span class="metric-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 3v18m-7-8h14M7 7h10a2 2 0 0 1 2 2v6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V9a2 2 0 0 1 2-2Z"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            />
          </svg>
        </span>
        <div>
          <strong>{{ pendingPaymentsCount }}</strong>
          <span>Pagamentos pendentes</span>
          <small>Aguardando PIX ou confirmação do gateway.</small>
        </div>
      </article>

      <article class="metric-card metric-card-blue">
        <span class="metric-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m7 12 3 3 7-7M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            />
          </svg>
        </span>
        <div>
          <strong>{{ completedOrdersCount }}</strong>
          <span>Total concluído</span>
          <small>Pedidos com convite já gerado no sistema.</small>
        </div>
      </article>
    </section>

    <section class="history-card">
      <div class="section-header">
        <div>
          <h2>Histórico no mesmo painel</h2>
          <p>Últimos pedidos criados no sistema.</p>
        </div>
        <RouterLink class="section-link" :to="{ name: 'orders-index' }">Ver todos</RouterLink>
      </div>

      <div v-if="loading" class="table-state">Carregando pedidos...</div>
      <div v-else-if="!recentOrders.length" class="table-state empty-state">
        Seu primeiro pedido aparecerá aqui assim que for criado.
      </div>

      <div v-else class="table-wrapper">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Criança / pedido</th>
              <th>Tema</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td>
                <RouterLink class="child-link" :to="{ name: 'orders-show', params: { id: order.id } }">
                  {{ order.name }}
                </RouterLink>
                <small>{{ getOrderCode(order) }}</small>
              </td>
              <td>
                <div class="theme-cell">
                  <span class="theme-badge">{{ getThemeInitial(order) }}</span>
                  <span>{{ getOrderThemeLabel(order) }}</span>
                </div>
              </td>
              <td>
                <span class="status-pill" :class="getOrderStatusClass(order)">
                  {{ getOrderStatusLabel(order) }}
                </span>
              </td>
              <td>{{ formatDate(order.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Order } from '@/models/Order';
import { OrdersService } from '@/services/OrdersService';
import {
  formatDate,
  getOrderCode,
  getOrderStatusClass,
  getOrderStatusLabel,
  getOrderThemeLabel,
  resolveOrderUiState,
} from '@/utils/orderPresentation';

const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref('');

const recentOrders = computed(() => orders.value.slice(0, 5));
const activeOrdersCount = computed(
  () => orders.value.filter((order) => resolveOrderUiState(order) === 'in_progress').length,
);
const pendingPaymentsCount = computed(
  () => orders.value.filter((order) => resolveOrderUiState(order) === 'pending_payment').length,
);
const completedOrdersCount = computed(
  () => orders.value.filter((order) => resolveOrderUiState(order) === 'completed').length,
);

function getThemeInitial(order: Order) {
  return getOrderThemeLabel(order).charAt(0).toUpperCase();
}

async function loadOrders() {
  loading.value = true;
  error.value = '';

  try {
    orders.value = await OrdersService.list();
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Não foi possível carregar os pedidos do painel.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadOrders();
});
</script>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 24px;
}

.hero-card,
.metric-card,
.history-card {
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 28px;
  background: rgba(255, 251, 247, 0.78);
  box-shadow: 0 28px 60px rgba(31, 45, 82, 0.12);
  backdrop-filter: blur(16px);
}

.hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 40px;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 0.56rem 0.88rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c25540;
  background: rgba(255, 118, 92, 0.12);
}

.hero-copy {
  display: grid;
  gap: 16px;
  max-width: 720px;
}

.hero-copy h1,
.section-header h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  color: #17284a;
}

.hero-copy h1 {
  font-size: clamp(2.8rem, 5vw, 4rem);
  line-height: 0.98;
}

.hero-copy p,
.section-header p,
.table-state,
.metric-card small {
  margin: 0;
  line-height: 1.7;
  color: #62708b;
}

.hero-actions {
  display: grid;
  gap: 12px;
  min-width: 250px;
}

.primary-button,
.secondary-button,
.section-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 1.2rem;
  border-radius: 18px;
  font-weight: 800;
  text-decoration: none;
}

.primary-button {
  color: #fff9f4;
  background: linear-gradient(135deg, #f36f5d 0%, #c4473d 100%);
  box-shadow: 0 18px 30px rgba(196, 71, 61, 0.2);
}

.secondary-button {
  color: #20345d;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 0 0 1px rgba(31, 47, 87, 0.08);
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  position: relative;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
  overflow: hidden;
}

.metric-card::after {
  content: '';
  position: absolute;
  top: -22px;
  right: -18px;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  opacity: 0.8;
}

.metric-card-sand::after {
  background: rgba(246, 228, 195, 0.7);
}

.metric-card-rose::after {
  background: rgba(248, 205, 204, 0.82);
}

.metric-card-blue::after {
  background: rgba(223, 231, 255, 0.88);
}

.metric-icon {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  color: #26385e;
  background: rgba(255, 255, 255, 0.82);
}

.metric-icon svg {
  width: 20px;
  height: 20px;
}

.metric-card div {
  position: relative;
  z-index: 1;
}

.metric-card strong {
  display: block;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2rem;
  color: #142649;
}

.metric-card span {
  display: block;
  margin-top: 2px;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #374a70;
}

.metric-card small {
  display: block;
  margin-top: 10px;
}

.history-card {
  padding: 28px;
}

.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-header h2 {
  font-size: clamp(2rem, 3vw, 2.65rem);
}

.section-link {
  min-height: auto;
  padding: 0;
  color: #c25540;
  background: transparent;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid rgba(31, 47, 87, 0.08);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 20px;
  text-align: left;
}

.orders-table th {
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5f6b86;
  background: rgba(232, 237, 252, 0.62);
}

.orders-table tbody tr + tr td {
  border-top: 1px solid rgba(31, 47, 87, 0.08);
}

.child-link {
  display: inline-flex;
  font-weight: 800;
  color: #122547;
}

.orders-table td small {
  display: block;
  margin-top: 6px;
  color: #6d7890;
}

.theme-cell {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.theme-badge {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 800;
  color: #8c5d15;
  background: rgba(243, 226, 195, 0.88);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.52rem 0.82rem;
  border-radius: 999px;
  font-size: 0.76rem;
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

.table-state {
  padding: 26px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.68);
}

.empty-state {
  text-align: center;
}

@media (max-width: 980px) {
  .hero-card,
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions {
    min-width: 0;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero-card,
  .history-card {
    padding: 22px;
    border-radius: 24px;
  }

  .orders-table th,
  .orders-table td {
    padding: 16px;
  }
}
</style>
