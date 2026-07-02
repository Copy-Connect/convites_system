<template>
  <div class="layout">
    <div class="glow glow-left" />
    <div class="glow glow-right" />

    <header class="app-header">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">C</span>
        <span class="brand-copy">
          <strong>Convites Premium</strong>
          <small>Pedido, pagamento e entrega no mesmo fluxo</small>
        </span>
      </RouterLink>

      <nav class="app-nav">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/orders/new">Pedido rapido</RouterLink>
      </nav>

      <div class="account">
        <div class="account-copy">
          <span>Conta ativa</span>
          <strong>{{ userLabel }}</strong>
        </div>
        <button class="logout" @click="logout">Sair</button>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const userLabel = computed(() => auth.user?.name || auth.user?.email || 'Cliente');

const logout = async () => {
  auth.logout();
  await router.replace({ name: 'login' });
};
</script>

<style scoped>
.layout {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 18px 18px 34px;
}

.glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(24px);
  opacity: 0.65;
  pointer-events: none;
}

.glow-left {
  top: -40px;
  left: -90px;
  width: 260px;
  height: 260px;
  background: rgba(255, 171, 120, 0.22);
}

.glow-right {
  top: 120px;
  right: -80px;
  width: 280px;
  height: 280px;
  background: rgba(83, 128, 255, 0.16);
}

.app-header,
.content {
  position: relative;
  z-index: 1;
  width: min(1380px, 100%);
  margin: 0 auto;
}

.app-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 14px 18px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 30px;
  background: rgba(255, 251, 246, 0.76);
  box-shadow: 0 24px 55px rgba(30, 44, 80, 0.12);
  backdrop-filter: blur(16px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: #fffaf5;
  background: linear-gradient(135deg, #ff7a66 0%, #d84752 52%, #3e74f2 100%);
  box-shadow: 0 16px 26px rgba(193, 74, 74, 0.24);
}

.brand-copy {
  display: grid;
  min-width: 0;
}

.brand-copy strong,
.account-copy strong {
  color: #1a2848;
}

.brand-copy strong {
  font-size: 1rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.brand-copy small,
.account-copy span {
  margin-top: 4px;
  color: #67748f;
}

.app-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.app-nav a,
.logout {
  min-height: 48px;
  padding: 0 1rem;
  border-radius: 16px;
  font-weight: 800;
}

.app-nav a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #22345b;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 0 0 1px rgba(31, 47, 87, 0.08);
}

.app-nav a.router-link-active {
  color: #fff8f3;
  background: linear-gradient(135deg, #ff7a66 0%, #d84752 52%, #3e74f2 100%);
  box-shadow: 0 18px 28px rgba(193, 74, 74, 0.18);
}

.account {
  display: flex;
  align-items: center;
  gap: 14px;
}

.account-copy {
  display: grid;
  text-align: right;
}

.logout {
  color: #20345b;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: inset 0 0 0 1px rgba(31, 47, 87, 0.08);
}

.content {
  margin-top: 18px;
}

@media (max-width: 980px) {
  .app-header {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .app-nav {
    justify-content: flex-start;
  }

  .account {
    justify-content: space-between;
  }

  .account-copy {
    text-align: left;
  }
}

@media (max-width: 640px) {
  .layout {
    padding: 14px 14px 24px;
  }

  .app-header {
    padding: 14px;
    border-radius: 24px;
  }

  .brand {
    align-items: flex-start;
  }

  .app-nav,
  .account {
    flex-direction: column;
    align-items: stretch;
  }

  .app-nav a,
  .logout {
    width: 100%;
  }
}
</style>
