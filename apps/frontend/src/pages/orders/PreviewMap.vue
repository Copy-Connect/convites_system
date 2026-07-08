<template>
  <section class="map-preview" :style="pageStyle">
    <div class="overlay" />

    <div v-if="loading" class="state-card">Carregando mapa...</div>
    <div v-else-if="error" class="state-card is-error">{{ error }}</div>

    <main v-else-if="order" class="map-shell">
      <RouterLink class="back-link" :to="{ name: 'orders-invite-preview', params: { id: order.id } }">
        Voltar ao convite
      </RouterLink>

      <header class="card hero-card">
        <span class="eyebrow">Mapa da festa</span>
        <h1>{{ order.name }}</h1>
        <p class="address-copy">{{ formattedAddress }}</p>
      </header>

      <section class="card frame-card">
        <iframe
          class="map-frame"
          :src="mapEmbedUrl"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </section>

      <div class="actions">
        <a class="primary-button" :href="streetViewUrl" target="_blank" rel="noopener">
          Abrir rua no Street View
        </a>
      </div>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Order } from '@/models/Order';
import { OrdersService } from '@/services/OrdersService';
import { buildMapEmbedUrl, buildStreetViewUrl, formatOrderAddress } from '@/utils/orderInvite';
import spiderBackground from '@/assets/images/Mobile/Super Heróis/Homem-Aranha/bg1.png';

const route = useRoute();
const order = ref<Order | null>(null);
const loading = ref(true);
const error = ref('');

const pageStyle = computed(() => ({
  '--invite-bg': `url('${spiderBackground}')`,
}));

const formattedAddress = computed(() => formatOrderAddress(order.value));
const mapEmbedUrl = computed(() => buildMapEmbedUrl(order.value));
const streetViewUrl = computed(() => buildStreetViewUrl(order.value));

onMounted(async () => {
  try {
    order.value = await OrdersService.get(String(route.params.id));
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Não foi possível carregar o mapa.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.map-preview {
  position: relative;
  min-height: 100vh;
  background-image: var(--invite-bg);
  background-position: center;
  background-size: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(7, 8, 15, 0.84));
}

.state-card,
.map-shell {
  position: relative;
  z-index: 1;
}

.state-card {
  width: min(440px, calc(100% - 32px));
  margin: 120px auto 0;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  color: #ffffff;
  background: rgba(11, 13, 20, 0.78);
  backdrop-filter: blur(18px);
}

.state-card.is-error {
  color: #ffd7d7;
}

.map-shell {
  width: min(460px, 100%);
  margin: 0 auto;
  padding: 22px 18px 32px;
  display: grid;
  gap: 16px;
}

.back-link,
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 50px;
  padding: 0 1rem;
  border-radius: 16px;
  font-weight: 800;
}

.back-link {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.card {
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  color: #ffffff;
  background: rgba(9, 11, 20, 0.74);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.26);
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 0.52rem 0.84rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.hero-card {
  display: grid;
  gap: 12px;
}

.hero-card h1 {
  margin: 0;
  font-family: 'Spider-Man Invite', 'Trebuchet MS', sans-serif;
  font-size: clamp(2.6rem, 10vw, 4.2rem);
  letter-spacing: 0.08em;
}

.address-copy {
  margin: 0;
  line-height: 1.7;
  white-space: pre-line;
  color: rgba(255, 255, 255, 0.78);
}

.frame-card {
  padding: 12px;
}

.map-frame {
  width: 100%;
  min-height: 58vh;
  border: 0;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
}

.actions {
  display: flex;
  justify-content: center;
}

.primary-button {
  color: #ffffff;
  background: linear-gradient(135deg, #f22d3e 0%, #8d0a16 100%);
  box-shadow: 0 16px 28px rgba(73, 0, 6, 0.38);
}

@media (max-width: 420px) {
  .map-shell {
    padding-inline: 14px;
  }

  .card {
    padding: 18px;
    border-radius: 24px;
  }

  .actions,
  .primary-button {
    width: 100%;
  }
}
</style>
