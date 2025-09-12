<template>
  <main class="wrap">
    <section class="card">
      <h2>{{ title }}</h2>
      <p class="muted">Transação: <code>{{ txid || '—' }}</code></p>
      <p>{{ statusText }}</p>
      <div v-if="details" class="meta">
        <p><b>Pedido:</b> {{ details.orderId }}</p>
        <p v-if="details.amount"><b>Valor:</b> R$ {{ (details.amount/100).toFixed(2) }}</p>
        <p v-if="details.updatedAt"><b>Atualizado:</b> {{ new Date(details.updatedAt).toLocaleString() }}</p>
      </div>
      <p class="hint">Você pode fechar esta página; avisaremos dentro do app quando o pagamento confirmar.</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ApiClient } from '@/services/ApiClient'

const route = useRoute()
const api = new ApiClient()

const txid = (route.query.transaction_id as string) || (route.query.tid as string) || ''
const orderId = (route.query.orderId as string) || ''
const reference = (route.query.reference as string) || ''

const title = ref('Conferindo pagamento…')
const statusText = ref('Processando…')
const details = ref<any>(null)
let timer: number | undefined

async function poll() {
  try {
    const params: any = {}
    if (txid) params.transaction_id = txid
    if (orderId) params.orderId = orderId
    if (reference) params.reference = reference

    const data = await api.get<any>('/payments/status', params)
    details.value = data

    switch (data.status) {
      case 'PAYMENT_PAID':
        title.value = 'Pagamento aprovado ✔'
        statusText.value = 'Tudo certo! Seu convite será liberado em instantes.'
        clearTimer()
        break
      case 'PAYMENT_PENDING':
        title.value = 'Pagamento pendente ⏳'
        statusText.value = 'Ainda aguardando confirmação do PagSeguro.'
        break
      case 'PAYMENT_CANCELED':
        title.value = 'Pagamento cancelado ❌'
        statusText.value = 'Você pode tentar novamente pelo app.'
        clearTimer()
        break
      case 'PAYMENT_AUTHORIZED':
        title.value = 'Pagamento autorizado ✅'
        statusText.value = 'Aguardando captura/confirmação final.'
        break
      default:
        title.value = 'Status do pagamento'
        statusText.value = data.status || 'Desconhecido'
    }
  } catch (e) {
    statusText.value = 'Não foi possível consultar agora.'
  }
}

function clearTimer() { if (timer) clearInterval(timer) }

onMounted(() => {
  poll()
  timer = window.setInterval(poll, 5000)
})
onUnmounted(clearTimer)
</script>

<style scoped>
.wrap { min-height: 80vh; display: grid; place-items: center; padding: 24px; }
.card { width: 100%; max-width: 560px; border-radius: 16px; padding: 20px; box-shadow: 0 8px 30px rgba(0,0,0,.1); }
.muted { color: #666 }
.hint { color: #777; font-size: .9rem; margin-top: 8px; }
.meta { margin-top: 8px; font-size: .95rem; opacity: .9; }
</style>
