<template>
  <section class="new-order-page">
    <header class="intro-card">
      <div>
        <span class="eyebrow">Novo pedido</span>
        <h1>Criar um novo convite</h1>
        <p>
          Preencha os dados principais do pedido. O fluxo já fica pronto para seguir para o
          pagamento assim que o pedido for salvo.
        </p>
      </div>
    </header>

    <form class="form-card" @submit.prevent="submit">
      <div class="field-grid">
        <label class="field">
          <span>Nome da criança</span>
          <input v-model="name" required />
        </label>

        <label class="field">
          <span>Idade</span>
          <input v-model.number="age" type="number" min="1" required />
        </label>
      </div>

      <label class="field">
        <span>Endereço</span>
        <input v-model="address" required />
      </label>

      <label class="field">
        <span>Tema do convite</span>
        <input v-model.trim="themeSlug" placeholder="Ex.: super-mario" />
        <small>Informe o identificador do tema cadastrado na API.</small>
      </label>

      <button class="submit" :disabled="loading">
        {{ loading ? 'Criando pedido...' : 'Salvar e seguir para o pagamento' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { OrdersService } from '@/services/OrdersService';
import { useRouter } from 'vue-router';

const name = ref('');
const age = ref<number | undefined>();
const address = ref('');
const themeSlug = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();

async function submit() {
  loading.value = true;
  error.value = '';

  try {
    const order = await OrdersService.create({
      name: name.value,
      age: age.value!,
      address: address.value,
      themeSlug: themeSlug.value,
    });

    await router.push({ name: 'orders-checkout', params: { id: order.id } });
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Erro ao criar pedido.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.new-order-page {
  display: grid;
  gap: 22px;
}

.intro-card,
.form-card {
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 28px;
  background: rgba(255, 251, 247, 0.78);
  box-shadow: 0 28px 60px rgba(31, 45, 82, 0.12);
  backdrop-filter: blur(16px);
}

.intro-card {
  padding: 34px;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 0.56rem 0.88rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c25540;
  background: rgba(255, 118, 92, 0.12);
}

.intro-card h1 {
  margin: 16px 0 12px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.6rem, 4vw, 3.4rem);
  line-height: 1;
  color: #15274a;
}

.intro-card p,
.field small {
  margin: 0;
  line-height: 1.7;
  color: #62708b;
}

.form-card {
  display: grid;
  gap: 18px;
  padding: 30px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-size: 0.92rem;
  font-weight: 800;
  color: #30405e;
}

.submit {
  min-height: 56px;
  border-radius: 18px;
  font-weight: 800;
  color: #fff9f4;
  background: linear-gradient(135deg, #f36f5d 0%, #c4473d 100%);
  box-shadow: 0 18px 30px rgba(196, 71, 61, 0.2);
}

.submit:disabled {
  opacity: 0.72;
  cursor: wait;
}

.error {
  margin: 0;
  padding: 0.92rem 1rem;
  border-radius: 18px;
  color: #9a231b;
  background: rgba(216, 78, 56, 0.12);
}

@media (max-width: 720px) {
  .intro-card,
  .form-card {
    padding: 22px;
    border-radius: 24px;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
