<template>
  <main class="auth">
    <h1>Criar conta</h1>
    <form @submit.prevent="submit">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Senha" required />
      <button>Criar</button>
    </form>
    <router-link to="/login">Entrar</router-link>
  </main>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/stores/auth.store';
const email = ref(''); const password = ref(''); const auth = useAuth(); const router = useRouter();
async function submit(){ await auth.register(email.value, password.value); router.push('/dashboard'); }
</script>
<style scoped>.auth{max-width:360px;margin:40px auto;display:grid;gap:8px}</style>
