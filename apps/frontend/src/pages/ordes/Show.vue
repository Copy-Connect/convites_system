<template>
  <section v-if="order">
    <h2>{{ order.name }} ({{ order.themeSlug }})</h2>
    <p>Status: <strong>{{ order.status }}</strong></p>
    <p>Endereço: {{ order.address }}</p>
    <p v-if="order.createdAt">Criado em: {{ new Date(order.createdAt).toLocaleString() }}</p>
  </section>
  <p v-else>Carregando…</p>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { OrdersService } from '@/services/OrderServices';
import type { Order } from '@/models/Order';

const route = useRoute();
const order = ref<Order | null>(null);

onMounted(async () => {
  order.value = await OrdersService.get(Number(route.params.id));
});
</script>

