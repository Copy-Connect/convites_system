<template>
  <section v-if="order" class="checkout">
    <header class="hero">
      <div>
        <p class="eyebrow">Pagamento do convite</p>
        <h1>{{ order.name }}</h1>
        <p class="meta">
          Tema: <strong>{{ order.themeName || order.themeSlug || 'Sem tema' }}</strong>
          • Status: <strong>{{ order.status }}</strong>
        </p>
      </div>
      <div class="price">R$ {{ ((order.amountCents ?? 1990) / 100).toFixed(2) }}</div>
    </header>

    <div class="grid">
      <article class="card">
        <h2>PIX</h2>
        <p>Gere o pagamento do pedido e acompanhe a confirmação por aqui.</p>

        <button v-if="!payment" :disabled="busy" @click="createPix">
          {{ busy ? 'Gerando...' : 'Gerar pagamento' }}
        </button>

        <div v-else class="payment-box">
          <p><strong>Transação:</strong> {{ payment.transactionId || payment.id }}</p>
          <p><strong>Status:</strong> {{ paymentStatus }}</p>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
      </article>

      <article class="card">
        <h2>Convite</h2>
        <p>Quando o pagamento estiver aprovado, gere o convite final.</p>
        <button :disabled="busy || paymentStatus !== 'PAID'" @click="generateInvite">
          Gerar convite
        </button>
        <a v-if="invitePath" :href="apiBase + invitePath" target="_blank" rel="noopener">
          Abrir convite gerado
        </a>
      </article>
    </div>
  </section>

  <p v-else class="loading">Carregando pedido…</p>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Order } from '@/models/Order';
import { OrdersService } from '@/services/OrdersService';
import { PaymentsService } from '@/services/PaymentsService';

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

const pollStatus = async () => {
  try {
    const status = await PaymentsService.getStatusByOrder(orderId);
    if (status) {
      payment.value = status;
      paymentStatus.value = status.status;
    }
    await loadOrder();
  } catch {}
};

async function createPix() {
  busy.value = true;
  error.value = '';
  try {
    payment.value = await PaymentsService.createPix(orderId, order.value?.amountCents ?? 1990);
    paymentStatus.value = payment.value.status;
    await loadOrder();
    timer = window.setInterval(pollStatus, 4000);
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Erro ao gerar pagamento';
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
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Erro ao gerar convite';
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

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.checkout { display:grid; gap:24px; }
.hero, .card { padding:24px; border:1px solid rgba(26,36,64,.12); border-radius:24px; background:rgba(255,255,255,.92); }
.hero { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; }
.eyebrow { margin:0 0 8px; font-size:.75rem; text-transform:uppercase; letter-spacing:.12em; color:#6f738f; }
.hero h1 { margin:0 0 8px; }
.meta { margin:0; color:#44506b; }
.price { font-size:2rem; font-weight:700; white-space:nowrap; }
.grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; }
.card h2 { margin-top:0; }
.payment-box { padding:12px 14px; border-radius:16px; background:#f6efe6; }
.error { color:#9a1e17; }
.loading { color:#6f738f; }
@media (max-width: 860px) {
  .grid { grid-template-columns:1fr; }
  .hero { flex-direction:column; }
}
</style>
