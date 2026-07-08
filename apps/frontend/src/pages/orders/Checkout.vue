<template>
  <section v-if="order" class="checkout-page">
    <header class="hero-card">
      <div>
        <p class="eyebrow">Pagamento do convite</p>
        <h1>{{ getOrderTitle(order) }}</h1>
        <p class="meta">
          Tema: <strong>{{ getOrderThemeLabel(order) }}</strong>
          <span class="separator">|</span>
          Status: <strong>{{ getOrderStatusLabel(order) }}</strong>
        </p>
      </div>

      <div class="price">{{ formatMoney(order.amountCents) }}</div>
    </header>

    <div class="content-grid">
      <article class="card">
        <h2>PIX</h2>
        <p>Gere o pagamento do pedido e acompanhe a confirmacao por aqui.</p>

        <button v-if="!payment" :disabled="busy" @click="createPix">
          {{ busy ? 'Gerando PIX...' : 'Gerar pagamento' }}
        </button>

        <div v-else class="payment-box">
          <p><strong>Transacao:</strong> {{ payment.transactionId || payment.id }}</p>
          <p><strong>Status:</strong> {{ paymentStatus }}</p>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
      </article>

      <article class="card">
        <h2>Convite</h2>
        <p>Visualize a prévia mobile quando quiser e gere o convite final depois do pagamento.</p>

        <RouterLink
          class="preview-link"
          :to="{ name: 'orders-invite-preview', params: { id: order.id } }"
        >
          Visualizar convite
        </RouterLink>

        <button :disabled="busy || paymentStatus !== 'PAID'" @click="generateInvite">
          Gerar convite final
        </button>

        <a v-if="invitePath" :href="apiBase + invitePath" target="_blank" rel="noopener">
          Abrir convite gerado
        </a>
      </article>
    </div>
  </section>

  <p v-else class="loading">Carregando pedido...</p>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Order } from '@/models/Order';
import { OrdersService } from '@/services/OrdersService';
import { PaymentsService } from '@/services/PaymentsService';
import {
  formatMoney,
  getOrderStatusLabel,
  getOrderThemeLabel,
  getOrderTitle,
} from '@/utils/orderPresentation';

const route = useRoute();
const orderId = String(route.params.id);
const apiBase =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin);

const order = ref<Order | null>(null);
const payment = ref<{ id: string; status: string; transactionId?: string | null } | null>(null);
const paymentStatus = ref('PENDING');
const invitePath = ref('');
const error = ref('');
const busy = ref(false);
let timer: number | undefined;

const loadOrder = async () => {
  order.value = await OrdersService.get(orderId);
  if (order.value.paymentStatus) {
    paymentStatus.value = order.value.paymentStatus;
  }
};

const clearTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
};

const pollStatus = async () => {
  try {
    const status = await PaymentsService.getStatusByOrder(orderId);
    if (status) {
      payment.value = status;
      paymentStatus.value = status.status;
    }

    await loadOrder();

    if (paymentStatus.value !== 'PENDING') {
      clearTimer();
    }
  } catch {}
};

async function createPix() {
  busy.value = true;
  error.value = '';

  try {
    payment.value = await PaymentsService.createPix(orderId, order.value?.amountCents ?? 1990);
    paymentStatus.value = payment.value.status;
    await loadOrder();
    clearTimer();
    timer = window.setInterval(pollStatus, 4000);
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Erro ao gerar pagamento.';
  } finally {
    busy.value = false;
  }
}

async function generateInvite() {
  busy.value = true;
  error.value = '';

  try {
    const invite = await OrdersService.generateInvite(orderId);
    invitePath.value = invite.path;
    await loadOrder();
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Erro ao gerar convite.';
  } finally {
    busy.value = false;
  }
}

onMounted(async () => {
  await loadOrder();

  if (order.value?.paymentStatus) {
    await pollStatus();
  }
});

onUnmounted(clearTimer);
</script>

<style scoped>
.checkout-page {
  display: grid;
  gap: 24px;
}

.hero-card,
.card {
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 28px;
  background: rgba(255, 251, 247, 0.78);
  box-shadow: 0 28px 60px rgba(31, 45, 82, 0.12);
  backdrop-filter: blur(16px);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 30px;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c25540;
}

.hero-card h1,
.card h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  color: #15274a;
}

.meta,
.card p,
.loading {
  margin: 12px 0 0;
  color: #62708b;
  line-height: 1.65;
}

.separator {
  margin: 0 8px;
}

.price {
  white-space: nowrap;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2rem;
  color: #15274a;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.card {
  display: grid;
  gap: 18px;
  padding: 24px;
}

.card h2 {
  font-size: 2rem;
}

.card button,
.card a,
.preview-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  width: fit-content;
  padding: 0 1.2rem;
  border-radius: 18px;
  font-weight: 800;
}

.card button {
  color: #fff9f4;
  background: linear-gradient(135deg, #f36f5d 0%, #c4473d 100%);
  box-shadow: 0 18px 30px rgba(196, 71, 61, 0.2);
}

.card button:disabled {
  opacity: 0.72;
  cursor: wait;
}

.card a,
.preview-link {
  color: #20345d;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 0 0 1px rgba(31, 47, 87, 0.08);
}

.payment-box {
  padding: 16px;
  border-radius: 20px;
  background: rgba(247, 239, 230, 0.88);
}

.payment-box p {
  margin: 0;
}

.payment-box p + p {
  margin-top: 8px;
}

.error {
  margin: 0;
  padding: 0.92rem 1rem;
  border-radius: 18px;
  color: #9a231b;
  background: rgba(216, 78, 56, 0.12);
}

@media (max-width: 860px) {
  .hero-card,
  .content-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
  }
}
</style>
