<template>
  <section>
    <h2>Meus pedidos</h2>
    <p v-if="loading">Carregando…</p>
    <ul v-else class="list">
      <li v-for="o in orders" :key="o.id">
        <RouterLink :to="{name:'orders-show', params:{id:o.id}}">{{ o.name }}</RouterLink>
        <small> • {{ o.status }} • tema: {{ o.themeSlug }}</small>
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
  try { orders.value = await OrdersService.list(); }
  finally { loading.value = false; }
});
</script>

<style scoped>
.list { display:grid; gap:8px; padding-left: 18px; }
</style>
