<template>
  <section>
    <h2>Meus pedidos</h2>
    <p v-if="loading">Carregando…</p>
    <p v-else-if="!orders.length" class="empty">Você ainda não criou nenhum pedido.</p>
    <ul v-else class="list">
      <li v-for="o in orders" :key="o.id">
        <RouterLink :to="{ name: 'orders-show', params: { id: o.id } }">{{ o.name }}</RouterLink>
        <small> • {{ o.status }} • tema: {{ o.themeName || o.themeSlug || 'sem tema' }}</small>
        <RouterLink class="pay-link" :to="{ name: 'orders-checkout', params: { id: o.id } }">
          pagar
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { OrdersService } from '@/services/OrdersService';
import type { Order } from '@/models/Order';

const orders = ref<Order[]>([]);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  try {
    orders.value = await OrdersService.list();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.list { display:grid; gap:8px; padding-left: 18px; }
.empty { color:#6f738f; }
.pay-link { margin-left: 10px; font-weight: 700; }
</style>
