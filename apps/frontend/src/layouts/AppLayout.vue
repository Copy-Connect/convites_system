<template>
  <div class="layout">
    <header class="bar">
      <strong>Convites</strong>
      <div class="spacer" />
      <button @click="logout">Sair</button>
    </header>

    <nav class="nav">
      <RouterLink to="/">Dashboard</RouterLink>
      <RouterLink to="/orders/new">Novo Pedido</RouterLink>
    </nav>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const logout = async () => {
  auth.logout();
  await router.replace({ name: 'login' });
};
</script>

<style scoped>
.layout { min-height: 100vh; display: grid; grid-template-rows: 56px 40px 1fr; }
.bar { display:flex; align-items:center; padding:0 16px; background:#111; color:#fff; }
.spacer{ flex:1 }
.nav { display:flex; gap:12px; padding:8px 16px; background:#f5f5f5; }
.content { padding:16px; }
</style>
