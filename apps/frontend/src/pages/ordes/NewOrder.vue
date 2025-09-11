<template>
  <form class="card" @submit.prevent="submit">
    <h2>Novo pedido</h2>

    <label>Nome da criança <input v-model="name" required /></label>
    <label>Idade <input v-model.number="age" type="number" min="0" required /></label>
    <label>Endereço <input v-model="address" required /></label>

    <label>Tema
      <select v-model="themeSlug" required>
        <option disabled value="">-- selecione --</option>
        <option value="mario">Super Mario</option>
        <option value="futebol">Futebol</option>
        <option value="unicórnio">Unicórnio</option>
      </select>
    </label>

    <button :disabled="loading">Salvar e pagar</button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { OrdersService } from '@/services/OrdersService';
import { useRouter } from 'vue-router';

const name = ref(''); const age = ref<number|undefined>(); const address = ref('');
const themeSlug = ref(''); const loading = ref(false); const error = ref('');
const router = useRouter();

async function submit() {
  loading.value = true; error.value = '';
  try {
    const order = await OrdersService.create({ name: name.value, age: age.value!, address: address.value, themeSlug: themeSlug.value });
    router.push({ name: 'orders-show', params: { id: order.id } });
  } catch (e:any) { error.value = e.message || 'Erro ao criar pedido'; }
  finally { loading.value = false; }
}
</script>

<style scoped>
.card { max-width: 520px; margin: 24px auto; display:grid; gap:10px; }
label { display:grid; gap:4px; }
.error { color:#c00; }
</style>
