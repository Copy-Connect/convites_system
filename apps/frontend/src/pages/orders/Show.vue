<template>
  <section v-if="order" class="details-page">
    <header class="hero-card">
      <div>
        <span class="eyebrow">Detalhes do pedido</span>
        <h1>{{ getOrderTitle(order) }}</h1>
        <p>{{ getOrderThemeLabel(order) }}</p>
      </div>

      <span class="status-pill" :class="getOrderStatusClass(order)">
        {{ getOrderStatusLabel(order) }}
      </span>
    </header>

    <section class="content-grid">
      <article class="info-card">
        <h2>Informações principais</h2>
        <dl>
          <div>
            <dt>Código</dt>
            <dd>{{ getOrderCode(order) }}</dd>
          </div>
          <div>
            <dt>Aniversariante</dt>
            <dd>{{ order.name }}</dd>
          </div>
          <div>
            <dt>Idade</dt>
            <dd>{{ order.age || '--' }}</dd>
          </div>
          <div>
            <dt>Tema</dt>
            <dd>{{ getOrderThemeLabel(order) }}</dd>
          </div>
          <div class="span-all">
            <dt>Endereço</dt>
            <dd class="multiline">{{ formattedAddress }}</dd>
          </div>
          <div class="span-all">
            <dt>Ideias de presentes</dt>
            <dd>{{ giftIdeasLabel }}</dd>
          </div>
          <div class="span-all">
            <dt>Convidados sugeridos</dt>
            <dd>{{ possibleGuestsLabel }}</dd>
          </div>
          <div>
            <dt>Criado em</dt>
            <dd>{{ formatDate(order.createdAt, true) }}</dd>
          </div>
        </dl>
      </article>

      <aside class="action-card">
        <h2>Próximos passos</h2>
        <p>Abra a prévia mobile do convite ou siga para o checkout para liberar a entrega final.</p>

        <RouterLink
          class="secondary-link"
          :to="{ name: 'orders-invite-preview', params: { id: order.id } }"
        >
          Visualizar convite
        </RouterLink>

        <RouterLink class="primary-link" :to="{ name: 'orders-checkout', params: { id: order.id } }">
          Ir para pagamento
        </RouterLink>
      </aside>
    </section>
  </section>

  <p v-else class="loading">Carregando pedido...</p>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { OrdersService } from '@/services/OrdersService';
import type { Order } from '@/models/Order';
import {
  formatDate,
  getOrderCode,
  getOrderStatusClass,
  getOrderStatusLabel,
  getOrderThemeLabel,
  getOrderTitle,
} from '@/utils/orderPresentation';
import { formatGuestLabel, formatOrderAddress, parseGiftIdeas } from '@/utils/orderInvite';

const route = useRoute();
const order = ref<Order | null>(null);

const formattedAddress = computed(() => formatOrderAddress(order.value));
const giftIdeasLabel = computed(() => {
  const items = parseGiftIdeas(order.value?.giftIdeas);
  return items.length ? items.join(' • ') : 'Nenhuma sugestão cadastrada.';
});

const possibleGuestsLabel = computed(() => {
  const guests = order.value?.possibleGuests ?? [];
  return guests.length ? guests.map(formatGuestLabel).join(' • ') : 'Nenhum convidado sugerido.';
});

onMounted(async () => {
  order.value = await OrdersService.get(String(route.params.id));
});
</script>

<style scoped>
.details-page {
  display: grid;
  gap: 22px;
}

.hero-card,
.info-card,
.action-card {
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 28px;
  background: rgba(255, 251, 247, 0.78);
  box-shadow: 0 28px 60px rgba(31, 45, 82, 0.12);
  backdrop-filter: blur(16px);
}

.hero-card {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  padding: 30px;
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

.hero-card h1,
.info-card h2,
.action-card h2 {
  margin: 16px 0 8px;
  font-family: Georgia, 'Times New Roman', serif;
  color: #15274a;
}

.hero-card p,
.action-card p,
.loading {
  margin: 0;
  line-height: 1.7;
  color: #62708b;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 22px;
}

.info-card,
.action-card {
  padding: 28px;
}

.info-card dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin: 0;
}

.span-all {
  grid-column: 1 / -1;
}

.info-card dt {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #68748c;
}

.info-card dd {
  margin: 8px 0 0;
  line-height: 1.65;
  color: #1c2e51;
}

.multiline {
  white-space: pre-line;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.56rem 0.84rem;
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

.secondary-link,
.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  margin-top: 18px;
  padding: 0 1.2rem;
  border-radius: 18px;
  font-weight: 800;
}

.secondary-link {
  color: #20345d;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 0 0 1px rgba(31, 47, 87, 0.08);
}

.primary-link {
  color: #fff9f4;
  background: linear-gradient(135deg, #f36f5d 0%, #c4473d 100%);
  box-shadow: 0 18px 30px rgba(196, 71, 61, 0.2);
}

@media (max-width: 860px) {
  .hero-card,
  .content-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .info-card dl {
    grid-template-columns: 1fr;
  }

  .span-all {
    grid-column: auto;
  }
}
</style>
