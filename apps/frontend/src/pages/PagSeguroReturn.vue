<template>
  <section class="card">
    <h2>Processando pagamento…</h2>
    <p>Transaction ID: <code>{{ txid }}</code></p>
    <p class="hint">Vamos consultar o status e redirecionar automaticamente.</p>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
const txid = route.query.transaction_id || route.query.tid || '—';
</script>

<style scoped>
.card { max-width: 520px; margin: 24px auto; }
.hint { color: #666; }
</style>
