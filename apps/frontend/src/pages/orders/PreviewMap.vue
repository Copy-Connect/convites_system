<template>
  <section class="map-preview" :class="`theme-${theme.visual}`" :style="pageStyle">
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
          title="Mapa do endereço da festa"
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
import { getSuperheroTheme } from '@/invites/superheroes/themes';
import type { Order } from '@/models/Order';
import { OrdersService } from '@/services/OrdersService';
import { buildMapEmbedUrl, buildStreetViewUrl, formatOrderAddress } from '@/utils/orderInvite';
import '@/invites/superheroes/superhero-fonts.css';

const route = useRoute();
const order = ref<Order | null>(null);
const loading = ref(true);
const error = ref('');

const theme = computed(() => getSuperheroTheme(order.value?.themeSlug));
const pageStyle = computed(() => ({
  '--invite-bg-mobile': `url('${theme.value.backgroundUrl}')`,
  '--invite-bg-desktop': `url('${theme.value.desktopBackgroundUrl}')`,
  '--theme-font': theme.value.fontFamily,
  '--theme-primary': theme.value.primary,
  '--theme-secondary': theme.value.secondary,
  '--theme-highlight': theme.value.highlight,
  '--theme-panel': theme.value.panel,
  '--theme-panel-strong': theme.value.panelStrong,
  '--theme-line': theme.value.line,
  '--theme-overlay': theme.value.overlay,
  '--theme-glow': theme.value.glow,
  '--theme-card-radius': theme.value.cardRadius,
  '--theme-bg-position': theme.value.backgroundPosition,
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
  color: #ffffff;
  background-image: var(--invite-bg-mobile);
  background-position: var(--theme-bg-position);
  background-size: cover;
  background-attachment: fixed;
  isolation: isolate;
}

@media (min-width: 768px) {
  .map-preview {
    background-image: var(--invite-bg-desktop);
  }
}

.overlay {
  position: fixed;
  z-index: -1;
  inset: 0;
  background: var(--theme-overlay);
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
  border: 1px solid var(--theme-line);
  border-radius: var(--theme-card-radius);
  color: #ffffff;
  background: var(--theme-panel);
  backdrop-filter: blur(18px);
}

.state-card.is-error {
  color: #ffd7d7;
}

.map-shell {
  width: min(460px, 100%);
  margin: 0 auto;
  padding: max(22px, env(safe-area-inset-top)) 18px max(34px, env(safe-area-inset-bottom));
  display: grid;
  gap: 16px;
}

.back-link,
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 0 1rem;
  border-radius: 16px;
  font-weight: 800;
}

.back-link {
  width: fit-content;
  border: 1px solid var(--theme-line);
  color: #ffffff;
  background: var(--theme-panel);
  backdrop-filter: blur(12px);
}

.card {
  padding: 20px;
  border: 1px solid var(--theme-line);
  border-radius: var(--theme-card-radius);
  color: #ffffff;
  background: var(--theme-panel);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3), 0 0 28px var(--theme-glow);
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 0.52rem 0.84rem;
  border: 1px solid var(--theme-line);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--theme-highlight);
  background: var(--theme-panel-strong);
}

.hero-card {
  display: grid;
  gap: 12px;
}

.hero-card h1 {
  margin: 0;
  font-family: var(--theme-font);
  font-size: clamp(2.6rem, 10vw, 4.2rem);
  letter-spacing: 0.06em;
  line-height: 1;
  text-shadow: 0 6px 24px rgba(0, 0, 0, 0.55), 0 0 20px var(--theme-glow);
}

.address-copy {
  margin: 0;
  line-height: 1.7;
  white-space: pre-line;
  color: rgba(255, 255, 255, 0.8);
}

.frame-card {
  padding: 12px;
}

.map-frame {
  width: 100%;
  min-height: 58vh;
  border: 0;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
}

.actions,
.primary-button {
  width: 100%;
}

.primary-button {
  color: #ffffff;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  box-shadow: 0 16px 28px var(--theme-glow);
}

@media (max-width: 420px) {
  .map-shell {
    padding-inline: 14px;
  }

  .card {
    padding: 18px;
  }
}
</style>
