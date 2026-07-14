<template>
  <section v-if="loading || error" class="preview-state-page">
    <div v-if="loading" class="state-card">Carregando prévia do convite...</div>
    <div v-else class="state-card is-error">{{ error }}</div>
  </section>

  <SuperheroInvite v-else-if="order" :order="order" :theme="theme" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SuperheroInvite from '@/invites/superheroes/SuperheroInvite.vue';
import { getSuperheroTheme } from '@/invites/superheroes/themes';
import type { Order } from '@/models/Order';
import { OrdersService } from '@/services/OrdersService';

const route = useRoute();
const order = ref<Order | null>(null);
const loading = ref(true);
const error = ref('');

const theme = computed(() => getSuperheroTheme(order.value?.themeSlug));

onMounted(async () => {
  try {
    order.value = await OrdersService.get(String(route.params.id));
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Não foi possível carregar a prévia do convite.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.preview-state-page {
  min-height: 100vh;
  display: grid;
  place-items: start center;
  padding: 120px 16px 32px;
  color: #ffffff;
  background: linear-gradient(160deg, #111827, #020408);
}

.state-card {
  width: min(440px, 100%);
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  background: rgba(11, 13, 20, 0.78);
  backdrop-filter: blur(18px);
}

.state-card.is-error {
  color: #ffd7d7;
}
</style>
