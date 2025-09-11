<template>
  <section class="dash">
    <h1>Meus Convites</h1>
    <form @submit.prevent="create">
      <select v-model="form.theme" required>
        <option value="mario">Mario</option>
        <option value="festa">Festa</option>
        <option value="princesa">Princesa</option>
      </select>
      <input v-model="form.name" placeholder="Nome" required />
      <input v-model.number="form.age" type="number" placeholder="Idade" required />
      <input v-model="form.address" placeholder="Endereço" required />
      <button>Criar pedido</button>
    </form>
    <ul>
      <li v-for="o in orders" :key="o.id">
        <strong>#{{o.id}}</strong> — {{o.name}} ({{o.age}}) — <em>{{o.status}}</em>
        <router-link :to="`/checkout/${o.id}`">pagar</router-link>
      </li>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import api from '@/services/ApiClient';
const orders = ref<any[]>([]);
const form = reactive({ theme: 'mario', name: '', age: 1, address: '' });
async function load(){ const { data } = await api.listOrders(); orders.value = data; }
async function create(){ const { data } = await api.createOrder(form as any); orders.value.unshift(data); }
onMounted(load);
</script>
<style scoped>.dash{max-width:720px;margin:40px auto;display:grid;gap:16px}</style>
