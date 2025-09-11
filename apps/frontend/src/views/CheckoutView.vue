<template>
  <section class="checkout">
    <h1>Pagamento #{{id}}</h1>
    <div v-if="!pix">
      <button @click="createPix">Gerar PIX</button>
    </div>
    <div v-else class="pix">
      <img v-if="pix.qrCodeBase64" :src="`data:image/png;base64,${pix.qrCodeBase64}`" alt="QR" />
      <pre>{{pix.qrCode}}</pre>
    </div>

    <p>Status: {{status}}</p>
    <button v-if="status==='paid'" @click="generate">Gerar Convite</button>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/ApiClient';
const route = useRoute();
const id = Number(route.params.id);
const pix = ref<any>(null); const status = ref('pending');
async function poll(){ const { data } = await api.getOrder(id); if (data) status.value = data.status; }
async function createPix(){ pix.value = (await api.createPix({ referenceId: String(id), description: `Convite #${id}`, amount: 1990 })).data; poll(); const t = setInterval(poll, 4000); setTimeout(()=>clearInterval(t), 5*60*1000); }
async function generate(){ await api.generateInvite(id); alert('Convite gerado! Abra /i/<slug>.html'); }
onMounted(poll);
</script>
<style scoped>.checkout{max-width:720px;margin:40px auto;display:grid;gap:16px}.pix{display:grid;gap:8px}</style>
