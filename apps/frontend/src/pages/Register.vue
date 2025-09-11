<template>
  <form class="card" @submit.prevent="submit">
    <h2>Criar conta</h2>
    <label>Nome <input v-model="name" required /></label>
    <label>E-mail <input v-model="email" type="email" required /></label>
    <label>Senha <input v-model="password" type="password" required /></label>
    <button :disabled="loading">Cadastrar</button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AuthService } from '@/services/AuthService';
import { useRouter } from 'vue-router';
const name = ref(''), email = ref(''), password = ref(''), loading = ref(false), error = ref('');
const router = useRouter();

async function submit() {
  loading.value = true; error.value = '';
  try {
    await AuthService.register(name.value, email.value, password.value);
    router.push({ name: 'login' });
  } catch (e:any) { error.value = e.message || 'Erro ao cadastrar'; }
  finally { loading.value = false; }
}
</script>

<style scoped>
.card { max-width: 360px; margin: 48px auto; display:grid; gap:10px; }
.error { color:#c00; }
</style>
