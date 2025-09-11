<template>
  <form class="card" @submit.prevent="submit">
    <h2>Entrar</h2>
    <label>E-mail <input v-model="email" type="email" required /></label>
    <label>Senha <input v-model="password" type="password" required /></label>
    <button :disabled="loading">Entrar</button>
    <p class="hint">Sem conta? <RouterLink to="/register">Cadastre-se</RouterLink></p>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const email = ref(''); const password = ref(''); const loading = ref(false); const error = ref('');
const router = useRouter(); const route = useRoute();
const auth = useAuthStore();

async function submit() {
  loading.value = true; error.value = '';
  try {
    await auth.login(email.value, password.value);
    router.replace((route.query.redirect as string) || { name: 'dashboard' });
  } catch (e:any) {
    error.value = e.message || 'Falha ao entrar';
  } finally { loading.value = false; }
}
</script>

<style scoped>
.card { max-width: 360px; margin: 48px auto; display:grid; gap:10px; }
label { display:grid; gap:4px; }
.error { color:#c00; }
.hint { font-size: 0.9rem; }
</style>
