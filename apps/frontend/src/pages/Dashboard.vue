<template>
  <section class="dashboard-scene">
    <div class="halo halo-coral" />
    <div class="halo halo-blue" />
    <div class="halo halo-gold" />

    <div class="dashboard-shell">
      <header class="hero-panel">
        <div class="hero-copy">
          <span class="eyebrow">Atelier de convites</span>
          <h1>Pedido, PIX e liberacao do convite no mesmo painel.</h1>
          <p class="hero-lede">
            Escolha o tema, crie o pedido e acompanhe o pagamento sem sair do dashboard.
            O painel ficou mais bonito, mais direto e pronto para fechar a compra na mesma
            experiencia.
          </p>

          <div class="hero-actions">
            <a class="primary-action" href="#order-composer">Criar pedido agora</a>
            <button class="secondary-action" type="button" @click="focusLatestOrder">
              Ver pedido ativo
            </button>
          </div>

          <div class="hero-metrics">
            <article>
              <strong>{{ totalOrders }}</strong>
              <span>pedidos no painel</span>
            </article>
            <article>
              <strong>{{ paidOrders }}</strong>
              <span>pagamentos concluidos</span>
            </article>
            <article>
              <strong>{{ themeOptions.length }}</strong>
              <span>temas em destaque</span>
            </article>
          </div>
        </div>

        <div class="hero-showcase">
          <article
            v-for="theme in featuredThemes"
            :key="theme.slug"
            class="showcase-card"
            :style="{ '--theme-accent': theme.accent, '--theme-surface': theme.surface }"
          >
            <div class="showcase-copy">
              <span>{{ theme.kicker }}</span>
              <h2>{{ theme.title }}</h2>
              <p>{{ theme.note }}</p>
            </div>
            <img :src="theme.image" :alt="theme.alt" />
          </article>
        </div>
      </header>

      <div class="workspace-grid">
        <section id="order-composer" class="composer-card">
          <div class="section-heading">
            <div>
              <span class="mini-eyebrow">Novo pedido</span>
              <h2>Monte a experiencia da festa</h2>
            </div>
            <div class="price-badge">{{ formatMoney(currentAmountCents) }}</div>
          </div>

          <p class="section-copy">
            Selecione o tema, preencha os dados principais e o sistema ja prepara a etapa de
            pagamento via PIX no mesmo fluxo.
          </p>

          <div class="theme-grid">
            <button
              v-for="theme in themeOptions"
              :key="theme.slug"
              type="button"
              class="theme-card"
              :class="{ selected: form.themeSlug === theme.slug }"
              :style="{ '--theme-accent': theme.accent, '--theme-surface': theme.surface }"
              @click="form.themeSlug = theme.slug"
            >
              <span class="theme-badge">{{ theme.kicker }}</span>
              <img :src="theme.image" :alt="theme.alt" />
              <strong>{{ theme.title }}</strong>
              <span>{{ theme.tagline }}</span>
            </button>
          </div>

          <form class="order-form" @submit.prevent="submitOrder">
            <div class="field-grid">
              <label class="field">
                <span>Nome da crianca</span>
                <input v-model="form.name" placeholder="Ex.: Helena" required />
              </label>

              <label class="field">
                <span>Idade</span>
                <input v-model.number="form.age" type="number" min="0" max="15" required />
              </label>
            </div>

            <label class="field">
              <span>Endereco ou referencia</span>
              <textarea
                v-model="form.address"
                rows="4"
                placeholder="Rua, bairro, cidade ou uma referencia importante"
                required
              />
            </label>

            <div class="checkout-strip">
              <div>
                <strong>Pagamento via PIX</strong>
                <span>Depois de criar o pedido, a cobranca pode ser gerada imediatamente.</span>
              </div>
              <span class="checkout-chip">PIX imediato</span>
            </div>

            <button class="submit-order" :disabled="submittingOrder || paymentBusy">
              {{ submittingOrder ? 'Criando pedido...' : 'Criar pedido e iniciar pagamento' }}
            </button>

            <p v-if="formError" class="feedback error">{{ formError }}</p>
          </form>
        </section>

        <aside class="control-rail">
          <article
            class="summary-card"
            :style="{
              '--theme-accent': currentTheme.accent,
              '--theme-surface': currentTheme.surface,
            }"
          >
            <div class="summary-visual">
              <img :src="currentTheme.image" :alt="currentTheme.alt" />
            </div>
            <div>
              <span class="mini-eyebrow">Tema selecionado</span>
              <h3>{{ currentTheme.title }}</h3>
              <p>{{ currentTheme.note }}</p>
            </div>

            <div class="summary-points">
              <span>Recorte premium</span>
              <span>Visual de impacto</span>
              <span>Fluxo rapido de compra</span>
            </div>
          </article>

          <article class="payment-card">
            <div v-if="activeOrder" class="payment-head">
              <div>
                <span class="mini-eyebrow">Pedido ativo</span>
                <h3>{{ activeOrder.name }}</h3>
                <p>{{ activeThemeTitle }} • {{ formatDate(activeOrder.createdAt) }}</p>
              </div>
              <span class="status-pill" :class="statusClass(paymentStatus)">
                {{ labelStatus(paymentStatus) }}
              </span>
            </div>

            <div v-else class="payment-empty">
              <span class="mini-eyebrow">Pedido ativo</span>
              <h3>Nenhum pedido selecionado</h3>
              <p>Crie um pedido ou selecione um dos cards abaixo para abrir o pagamento.</p>
            </div>

            <div class="step-list">
              <div class="step" :class="{ done: !!activeOrder }">
                <strong>1</strong>
                <span>Pedido criado</span>
              </div>
              <div class="step" :class="{ done: !!payment }">
                <strong>2</strong>
                <span>PIX gerado</span>
              </div>
              <div class="step" :class="{ done: paymentStatus === 'PAID' }">
                <strong>3</strong>
                <span>Pagamento aprovado</span>
              </div>
            </div>

            <div v-if="activeOrder" class="payment-body">
              <div class="detail-line">
                <span>Total previsto</span>
                <strong>{{ formatMoney(activeOrder.amountCents) }}</strong>
              </div>
              <div class="detail-line">
                <span>Status do pedido</span>
                <strong>{{ labelStatus(activeOrder.status) }}</strong>
              </div>

              <button
                v-if="!payment"
                class="primary-panel-action"
                type="button"
                :disabled="paymentBusy"
                @click="createPixForActiveOrder"
              >
                {{ paymentBusy ? 'Gerando PIX...' : 'Gerar pagamento PIX' }}
              </button>

              <div v-else class="payment-box">
                <div class="detail-line">
                  <span>Transacao</span>
                  <strong>{{ payment.transactionId || payment.id }}</strong>
                </div>
                <div class="detail-line">
                  <span>Status PIX</span>
                  <strong>{{ labelStatus(payment.status) }}</strong>
                </div>

                <img
                  v-if="payment.qrCodeUrl"
                  class="qr-preview"
                  :src="payment.qrCodeUrl"
                  alt="QR Code do pagamento PIX"
                />

                <div class="payment-links">
                  <a
                    v-if="payment.checkoutUrl"
                    :href="payment.checkoutUrl"
                    target="_blank"
                    rel="noopener"
                  >
                    Abrir checkout
                  </a>
                  <a
                    v-if="payment.qrCodeUrl"
                    :href="payment.qrCodeUrl"
                    target="_blank"
                    rel="noopener"
                  >
                    Abrir QR Code
                  </a>
                </div>
              </div>
            </div>

            <p v-if="panelError" class="feedback error">{{ panelError }}</p>
          </article>

          <article class="invite-card">
            <div>
              <span class="mini-eyebrow">Entrega final</span>
              <h3>Liberacao do convite</h3>
              <p>
                Quando o pagamento estiver aprovado, a geracao final do convite pode ser feita
                daqui mesmo.
              </p>
            </div>

            <button
              class="secondary-panel-action"
              type="button"
              :disabled="!activeOrder || paymentStatus !== 'PAID' || inviteBusy"
              @click="generateInvite"
            >
              {{ inviteBusy ? 'Gerando convite...' : 'Gerar convite final' }}
            </button>

            <a
              v-if="invitePath"
              class="invite-link"
              :href="apiBase + invitePath"
              target="_blank"
              rel="noopener"
            >
              Abrir convite gerado
            </a>
          </article>
        </aside>
      </div>

      <section class="orders-panel">
        <div class="section-heading section-heading-inline">
          <div>
            <span class="mini-eyebrow">Pedidos recentes</span>
            <h2>Historico no mesmo painel</h2>
          </div>
          <RouterLink class="inline-link" to="/orders/new">Fluxo classico</RouterLink>
        </div>

        <p v-if="loadingOrders" class="panel-note">Carregando pedidos...</p>
        <p v-else-if="!orders.length" class="panel-note">
          Seu primeiro pedido vai aparecer aqui assim que for criado.
        </p>

        <div v-else class="orders-grid">
          <article
            v-for="order in orders"
            :key="order.id"
            class="order-card"
            :class="{ active: order.id === activeOrder?.id }"
          >
            <button class="order-select" type="button" @click="selectOrder(order.id!)">
              <div>
                <strong>{{ order.name }}</strong>
                <p>{{ resolveThemeLabel(order) }}</p>
              </div>
              <span>{{ formatMoney(order.amountCents) }}</span>
            </button>

            <div class="order-meta">
              <span>{{ formatDate(order.createdAt) }}</span>
              <span class="status-pill" :class="statusClass(order.paymentStatus || order.status)">
                {{ labelStatus(order.paymentStatus || order.status) }}
              </span>
            </div>

            <div class="order-links">
              <RouterLink :to="{ name: 'orders-show', params: { id: order.id } }">
                Ver detalhes
              </RouterLink>
              <button type="button" @click="selectOrder(order.id!)">Abrir no painel</button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import type { Order } from '@/models/Order';
import { OrdersService } from '@/services/OrdersService';
import { PaymentsService } from '@/services/PaymentsService';

type ThemeOption = {
  slug: string;
  title: string;
  kicker: string;
  tagline: string;
  note: string;
  alt: string;
  image: string;
  accent: string;
  surface: string;
};

type PaymentState = {
  id: string;
  status: string;
  transactionId?: string | null;
  qrCodeUrl?: string | null;
  checkoutUrl?: string | null;
};

const apiBase =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin);

const themeOptions: ThemeOption[] = [
  {
    slug: 'snow-white-cake',
    title: 'Princesa com bolo cenico',
    kicker: 'Encanto',
    tagline: 'Leveza romantica com foco no bolo tematico.',
    note: 'Ideal para festas delicadas com clima premium e acabamento doce.',
    alt: 'Princesa com lacinho vermelho segurando um bolo com morangos',
    image: '/dashboard/snow-white-cake.png',
    accent: '#d84d4b',
    surface: 'linear-gradient(180deg, rgba(255, 247, 247, 0.98) 0%, rgba(255, 232, 228, 0.92) 100%)',
  },
  {
    slug: 'spider-hero',
    title: 'Heroi urbano',
    kicker: 'Impacto',
    tagline: 'Visual dinamico para aniversarios cheios de energia.',
    note: 'Uma direcao mais vibrante para familias que querem cor e movimento.',
    alt: 'Heroi vermelho e azul em pose de salto',
    image: '/dashboard/spider-hero.png',
    accent: '#2a5bdf',
    surface: 'linear-gradient(180deg, rgba(239, 246, 255, 0.98) 0%, rgba(220, 233, 255, 0.92) 100%)',
  },
  {
    slug: 'inside-out-trio',
    title: 'Emocoes divertidas',
    kicker: 'Narrativa',
    tagline: 'Composicao colorida para festas com humor e expressao.',
    note: 'Funciona muito bem para uma identidade visual mais moderna e ludica.',
    alt: 'Tres personagens coloridos em composicao divertida',
    image: '/dashboard/inside-out-trio.png',
    accent: '#ee8d2d',
    surface: 'linear-gradient(180deg, rgba(255, 250, 236, 0.98) 0%, rgba(255, 239, 209, 0.92) 100%)',
  },
  {
    slug: 'shrek-donkey',
    title: 'Aventura irreverente',
    kicker: 'Humor',
    tagline: 'Tema marcante para quem quer uma festa divertida e memoravel.',
    note: 'Boa escolha para um painel com energia, carisma e personalidade forte.',
    alt: 'Personagem verde montado em um burro correndo',
    image: '/dashboard/shrek-donkey.png',
    accent: '#5b9646',
    surface: 'linear-gradient(180deg, rgba(244, 252, 236, 0.98) 0%, rgba(223, 244, 212, 0.92) 100%)',
  },
];

const form = reactive({
  name: '',
  age: 6,
  address: '',
  themeSlug: themeOptions[0].slug,
});

const orders = ref<Order[]>([]);
const activeOrder = ref<Order | null>(null);
const payment = ref<PaymentState | null>(null);
const paymentStatus = ref('PENDING');
const loadingOrders = ref(true);
const submittingOrder = ref(false);
const paymentBusy = ref(false);
const inviteBusy = ref(false);
const formError = ref('');
const panelError = ref('');
const invitePath = ref('');
let timer: number | undefined;

const featuredThemes = computed(() => themeOptions.slice(0, 3));
const currentTheme = computed(
  () => themeOptions.find((theme) => theme.slug === form.themeSlug) || themeOptions[0],
);
const currentAmountCents = computed(() => activeOrder.value?.amountCents ?? 1990);
const totalOrders = computed(() => orders.value.length);
const paidOrders = computed(
  () => orders.value.filter((order) => order.paymentStatus === 'PAID' || order.status === 'PAID').length,
);
const activeThemeTitle = computed(() => {
  if (!activeOrder.value) {
    return currentTheme.value.title;
  }

  return resolveThemeLabel(activeOrder.value);
});

function sortOrders(list: Order[]) {
  return [...list].sort((left, right) => {
    const rightTime = new Date(right.createdAt || right.updatedAt || 0).getTime();
    const leftTime = new Date(left.createdAt || left.updatedAt || 0).getTime();
    return rightTime - leftTime;
  });
}

function syncOrder(order: Order) {
  const index = orders.value.findIndex((item) => item.id === order.id);
  if (index >= 0) {
    orders.value[index] = order;
    orders.value = sortOrders(orders.value);
    return;
  }

  orders.value = sortOrders([order, ...orders.value]);
}

function resolveThemeLabel(order: Order) {
  const theme = themeOptions.find((item) => item.slug === order.themeSlug);
  return order.themeName || theme?.title || order.themeSlug || 'Tema personalizado';
}

function labelStatus(status?: string | null) {
  switch (status) {
    case 'PAID':
      return 'Pago';
    case 'GENERATED':
      return 'Convite pronto';
    case 'FAILED':
      return 'Falha no pagamento';
    case 'CANCELED':
      return 'Cancelado';
    default:
      return 'Em andamento';
  }
}

function statusClass(status?: string | null) {
  if (status === 'PAID' || status === 'GENERATED') {
    return 'is-paid';
  }

  if (status === 'FAILED' || status === 'CANCELED') {
    return 'is-failed';
  }

  return 'is-pending';
}

function formatMoney(amountCents?: number | null) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format((amountCents ?? 1990) / 100);
}

function formatDate(value?: string) {
  if (!value) {
    return 'Agora';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function stopPolling() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

function startPolling() {
  if (timer || paymentStatus.value !== 'PENDING' || !activeOrder.value?.id) {
    return;
  }

  timer = window.setInterval(async () => {
    if (paymentBusy.value || inviteBusy.value || submittingOrder.value) {
      return;
    }

    await refreshPaymentState(false);
    if (paymentStatus.value !== 'PENDING') {
      stopPolling();
    }
  }, 4000);
}

async function refreshOrders() {
  loadingOrders.value = true;
  try {
    orders.value = sortOrders(await OrdersService.list());
  } finally {
    loadingOrders.value = false;
  }
}

async function refreshActiveOrder(id = activeOrder.value?.id) {
  if (!id) {
    return;
  }

  const fresh = await OrdersService.get(id);
  activeOrder.value = fresh;
  syncOrder(fresh);

  if (fresh.paymentStatus) {
    paymentStatus.value = fresh.paymentStatus;
    if (!payment.value) {
      payment.value = {
        id,
        status: fresh.paymentStatus,
      };
    }
  }
}

async function refreshPaymentState(allowStart = true) {
  if (!activeOrder.value?.id) {
    return;
  }

  try {
    const status = await PaymentsService.getStatusByOrder(activeOrder.value.id);
    if (status) {
      payment.value = {
        ...(payment.value || {}),
        id: status.id,
        status: status.status,
        transactionId: status.transactionId,
      };
      paymentStatus.value = status.status;
    }
  } catch {}

  await refreshActiveOrder(activeOrder.value.id);

  if (allowStart && paymentStatus.value === 'PENDING' && payment.value) {
    startPolling();
  }
}

async function selectOrder(id: string) {
  stopPolling();
  panelError.value = '';
  invitePath.value = '';

  try {
    payment.value = null;
    activeOrder.value = await OrdersService.get(id);
    paymentStatus.value = activeOrder.value.paymentStatus || 'PENDING';
    syncOrder(activeOrder.value);
    await refreshPaymentState();
  } catch (error: any) {
    panelError.value =
      error?.response?.data?.message || error?.message || 'Nao foi possivel carregar o pedido';
  }
}

async function createPixForOrder(orderId: string, amountCents?: number | null) {
  paymentBusy.value = true;
  panelError.value = '';

  try {
    payment.value = await PaymentsService.createPix(orderId, amountCents ?? 1990);
    paymentStatus.value = payment.value.status;
    await refreshActiveOrder(orderId);
    startPolling();
  } catch (error: any) {
    panelError.value =
      error?.response?.data?.message || error?.message || 'Erro ao gerar o pagamento PIX';
  } finally {
    paymentBusy.value = false;
  }
}

async function createPixForActiveOrder() {
  if (!activeOrder.value?.id) {
    return;
  }

  await createPixForOrder(activeOrder.value.id, activeOrder.value.amountCents);
}

async function submitOrder() {
  submittingOrder.value = true;
  formError.value = '';
  invitePath.value = '';

  try {
    const order = await OrdersService.create({
      name: form.name,
      age: Number(form.age),
      address: form.address,
      themeSlug: form.themeSlug,
    });

    syncOrder(order);
    await selectOrder(String(order.id));
    await createPixForOrder(String(order.id), order.amountCents);

    form.name = '';
    form.age = 6;
    form.address = '';
  } catch (error: any) {
    formError.value =
      error?.response?.data?.message || error?.message || 'Erro ao criar o pedido';
  } finally {
    submittingOrder.value = false;
  }
}

async function generateInvite() {
  if (!activeOrder.value?.id) {
    return;
  }

  inviteBusy.value = true;
  panelError.value = '';

  try {
    const invite = await OrdersService.generateInvite(activeOrder.value.id);
    invitePath.value = invite.path;
    await refreshActiveOrder(activeOrder.value.id);
  } catch (error: any) {
    panelError.value =
      error?.response?.data?.message || error?.message || 'Erro ao gerar o convite';
  } finally {
    inviteBusy.value = false;
  }
}

function focusLatestOrder() {
  const latestOrderId = orders.value[0]?.id;
  if (latestOrderId) {
    void selectOrder(String(latestOrderId));
    return;
  }

  document.getElementById('order-composer')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

onMounted(async () => {
  await refreshOrders();
  if (orders.value[0]?.id) {
    await selectOrder(String(orders.value[0].id));
  }
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.dashboard-scene {
  position: relative;
  overflow: hidden;
  padding: 20px 0 36px;
}

.halo {
  position: absolute;
  border-radius: 999px;
  filter: blur(28px);
  opacity: 0.7;
  pointer-events: none;
}

.halo-coral {
  top: 18px;
  right: -60px;
  width: 240px;
  height: 240px;
  background: rgba(255, 120, 106, 0.22);
}

.halo-blue {
  left: -80px;
  top: 280px;
  width: 260px;
  height: 260px;
  background: rgba(74, 126, 255, 0.18);
}

.halo-gold {
  right: 14%;
  bottom: 10px;
  width: 280px;
  height: 280px;
  background: rgba(255, 196, 86, 0.18);
}

.dashboard-shell {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 24px;
}

.hero-panel,
.composer-card,
.summary-card,
.payment-card,
.invite-card,
.orders-panel {
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 32px;
  background: rgba(255, 251, 247, 0.74);
  box-shadow: 0 28px 60px rgba(31, 45, 82, 0.14);
  backdrop-filter: blur(18px);
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.95fr);
  gap: 22px;
  padding: 30px;
}

.eyebrow,
.mini-eyebrow,
.theme-badge,
.checkout-chip,
.status-pill {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.eyebrow,
.mini-eyebrow {
  padding: 0.62rem 0.92rem;
}

.eyebrow {
  color: #20375e;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 24px rgba(32, 47, 95, 0.12);
}

.hero-copy h1,
.section-heading h2,
.payment-head h3,
.payment-empty h3,
.invite-card h3,
.summary-card h3,
.showcase-card h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 0.98;
  color: #1a2848;
}

.hero-copy {
  display: grid;
  gap: 18px;
  align-content: center;
}

.hero-copy h1 {
  max-width: 11ch;
  font-size: clamp(3.1rem, 5vw, 5.3rem);
}

.hero-lede,
.section-copy,
.payment-head p,
.payment-empty p,
.invite-card p,
.summary-card p,
.showcase-card p,
.panel-note,
.field span,
.checkout-strip span {
  color: #5b6883;
}

.hero-lede {
  max-width: 58ch;
  margin: 0;
  font-size: 1.04rem;
  line-height: 1.72;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-action,
.secondary-action,
.submit-order,
.primary-panel-action,
.secondary-panel-action,
.order-links button {
  min-height: 54px;
  padding: 0 1.3rem;
  border-radius: 18px;
  font-weight: 800;
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.primary-action,
.submit-order,
.primary-panel-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fffaf6;
  background: linear-gradient(135deg, #ff7a66 0%, #d84752 52%, #3e74f2 100%);
  box-shadow: 0 20px 34px rgba(193, 74, 74, 0.26);
}

.secondary-action,
.secondary-panel-action,
.order-links button {
  color: #23345a;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 0 0 1px rgba(33, 50, 90, 0.08);
}

.primary-action:hover,
.secondary-action:hover,
.submit-order:hover,
.primary-panel-action:hover,
.secondary-panel-action:hover,
.order-links button:hover {
  transform: translateY(-2px);
}

.secondary-action,
.primary-action {
  text-decoration: none;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.hero-metrics article {
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 0 0 1px rgba(24, 41, 78, 0.06);
}

.hero-metrics strong,
.price-badge,
.detail-line strong,
.order-select span {
  display: block;
  color: #1a2848;
}

.hero-metrics strong {
  font-size: 1.55rem;
}

.hero-metrics span {
  margin-top: 4px;
  color: #61708d;
}

.hero-showcase {
  display: grid;
  gap: 16px;
}

.showcase-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 152px;
  gap: 14px;
  align-items: center;
  min-height: 182px;
  padding: 18px;
  overflow: hidden;
  border-radius: 28px;
  background: var(--theme-surface);
}

.showcase-card::after,
.summary-card::after {
  content: '';
  position: absolute;
  inset: auto -30px -30px auto;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--theme-accent) 18%, transparent);
  pointer-events: none;
}

.showcase-copy {
  position: relative;
  z-index: 1;
}

.showcase-copy span {
  color: var(--theme-accent);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.showcase-copy h2 {
  margin-top: 10px;
  font-size: 1.8rem;
}

.showcase-copy p {
  margin: 10px 0 0;
  line-height: 1.55;
}

.showcase-card img,
.summary-visual img,
.theme-card img {
  width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 16px 24px rgba(20, 34, 68, 0.16));
}

.showcase-card img {
  align-self: end;
  max-height: 170px;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.78fr);
  gap: 24px;
  align-items: start;
}

.composer-card,
.orders-panel {
  padding: 28px;
}

.section-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.section-heading h2 {
  margin-top: 10px;
  font-size: clamp(2rem, 3.2vw, 2.85rem);
}

.price-badge {
  padding: 0.95rem 1.15rem;
  border-radius: 20px;
  font-size: 1.05rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: inset 0 0 0 1px rgba(31, 46, 84, 0.06);
}

.section-copy {
  max-width: 62ch;
  margin: 14px 0 0;
  line-height: 1.7;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.theme-card {
  position: relative;
  display: grid;
  gap: 10px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 28px;
  text-align: left;
  background: var(--theme-surface);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(31, 45, 82, 0.12);
}

.theme-card.selected {
  border-color: color-mix(in srgb, var(--theme-accent) 44%, white);
  box-shadow:
    0 24px 42px rgba(31, 45, 82, 0.14),
    inset 0 0 0 1px color-mix(in srgb, var(--theme-accent) 24%, transparent);
}

.theme-badge {
  padding: 0.52rem 0.8rem;
  color: var(--theme-accent);
  background: rgba(255, 255, 255, 0.82);
}

.theme-card img {
  height: 170px;
}

.theme-card strong {
  color: #1c2b49;
  font-size: 1.08rem;
}

.theme-card span:last-child {
  line-height: 1.55;
  color: #5c6782;
}

.order-form {
  display: grid;
  gap: 18px;
  margin-top: 26px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-size: 0.92rem;
  font-weight: 800;
  color: #334261;
}

textarea {
  resize: vertical;
  min-height: 118px;
}

.checkout-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 244, 234, 0.88);
  box-shadow: inset 0 0 0 1px rgba(219, 103, 74, 0.08);
}

.checkout-strip strong {
  display: block;
  color: #23345a;
}

.checkout-strip span {
  display: block;
  margin-top: 4px;
}

.checkout-chip {
  padding: 0.58rem 0.82rem;
  color: #d65a3f;
  background: rgba(255, 255, 255, 0.82);
}

.submit-order:disabled,
.primary-panel-action:disabled,
.secondary-panel-action:disabled {
  opacity: 0.68;
  cursor: wait;
}

.control-rail {
  display: grid;
  gap: 18px;
}

.summary-card,
.payment-card,
.invite-card {
  position: relative;
  padding: 24px;
  overflow: hidden;
}

.summary-card {
  display: grid;
  gap: 18px;
  background: var(--theme-surface);
}

.summary-visual {
  display: grid;
  place-items: center;
  min-height: 220px;
  padding: 16px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.6);
}

.summary-visual img {
  max-width: 260px;
  max-height: 240px;
}

.summary-card h3,
.payment-head h3,
.payment-empty h3,
.invite-card h3 {
  margin-top: 10px;
  font-size: 1.9rem;
}

.summary-card p,
.payment-head p,
.payment-empty p,
.invite-card p {
  margin: 10px 0 0;
  line-height: 1.65;
}

.summary-points {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.summary-points span,
.payment-links a,
.invite-link,
.inline-link,
.order-links a {
  color: #20355d;
}

.summary-points span {
  padding: 0.72rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: inset 0 0 0 1px rgba(27, 42, 75, 0.06);
}

.payment-card {
  display: grid;
  gap: 18px;
}

.payment-head,
.payment-empty {
  display: grid;
  gap: 12px;
}

.mini-eyebrow {
  color: #d55d45;
  background: rgba(255, 118, 92, 0.12);
}

.status-pill {
  padding: 0.6rem 0.8rem;
  letter-spacing: 0.08em;
}

.is-paid {
  color: #1d6d43;
  background: rgba(113, 214, 155, 0.18);
}

.is-pending {
  color: #8a5a16;
  background: rgba(255, 202, 96, 0.18);
}

.is-failed {
  color: #a42f2b;
  background: rgba(255, 118, 106, 0.16);
}

.step-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.step {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: inset 0 0 0 1px rgba(26, 36, 64, 0.06);
}

.step strong {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  color: #20355d;
  background: rgba(242, 231, 214, 0.95);
}

.step span {
  color: #5a6682;
  line-height: 1.45;
}

.step.done strong {
  color: #fff9f4;
  background: linear-gradient(135deg, #ff7a66 0%, #3e74f2 100%);
}

.payment-body {
  display: grid;
  gap: 14px;
}

.detail-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #5b6883;
}

.payment-box {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 24px;
  background: rgba(246, 238, 229, 0.92);
}

.qr-preview {
  width: 100%;
  max-width: 220px;
  padding: 12px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.88);
}

.payment-links,
.order-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.payment-links a,
.invite-link,
.inline-link,
.order-links a,
.order-links button {
  font-weight: 800;
  text-decoration: none;
}

.invite-card {
  display: grid;
  gap: 18px;
}

.feedback {
  margin: 0;
  padding: 0.92rem 1rem;
  border-radius: 18px;
}

.error {
  color: #9a231b;
  background: rgba(216, 78, 56, 0.12);
}

.orders-panel {
  display: grid;
  gap: 18px;
}

.section-heading-inline {
  align-items: center;
}

.panel-note {
  margin: 0;
  line-height: 1.6;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.order-card {
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 0 0 1px rgba(28, 42, 77, 0.08);
}

.order-card.active {
  box-shadow:
    0 24px 42px rgba(31, 45, 82, 0.14),
    inset 0 0 0 1px rgba(62, 116, 242, 0.18);
}

.order-select {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  padding: 0;
  color: inherit;
  text-align: left;
  background: transparent;
}

.order-select strong {
  display: block;
  color: #1a2848;
  font-size: 1.1rem;
}

.order-select p {
  margin: 6px 0 0;
  color: #5f6b86;
  line-height: 1.5;
}

.order-select span {
  font-size: 1rem;
  font-weight: 800;
}

.order-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #67738c;
}

@media (max-width: 1180px) {
  .hero-panel,
  .workspace-grid,
  .orders-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy h1 {
    max-width: 13ch;
  }
}

@media (max-width: 860px) {
  .dashboard-scene {
    padding: 8px 0 24px;
  }

  .hero-panel,
  .composer-card,
  .orders-panel,
  .summary-card,
  .payment-card,
  .invite-card {
    padding: 22px;
    border-radius: 26px;
  }

  .hero-metrics,
  .theme-grid,
  .field-grid,
  .step-list {
    grid-template-columns: 1fr;
  }

  .showcase-card {
    grid-template-columns: 1fr;
  }

  .showcase-card img {
    max-height: 220px;
  }
}

@media (max-width: 640px) {
  .hero-copy h1 {
    font-size: clamp(2.4rem, 13vw, 3.4rem);
  }

  .hero-actions,
  .checkout-strip,
  .order-meta,
  .payment-links,
  .order-links {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-metrics article,
  .theme-card,
  .order-card {
    border-radius: 22px;
  }

  .showcase-card,
  .summary-visual,
  .payment-box {
    border-radius: 22px;
  }
}
</style>
