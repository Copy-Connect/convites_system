<template>
  <div class="layout">
    <div class="glow glow-left" />
    <div class="glow glow-right" />

    <header class="app-header">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">CP</span>
        <span class="brand-copy">
          <strong>Convites Premium</strong>
          <small>Painel de pedidos, pagamento e entrega</small>
        </span>
      </RouterLink>

      <nav class="app-nav">
        <RouterLink :class="{ 'is-current': route.name === 'dashboard' }" to="/">
          Dashboard
        </RouterLink>
        <RouterLink
          :class="{ 'is-current': String(route.name || '').startsWith('orders-') }"
          :to="{ name: 'orders-index' }"
        >
          Pedidos
        </RouterLink>
        <span aria-disabled="true">Temas</span>
        <span aria-disabled="true">Histórico</span>
      </nav>

      <div class="header-actions">
        <RouterLink class="new-order" :to="{ name: 'orders-new' }">+ Novo Pedido</RouterLink>

        <div class="divider" />

        <div class="account-copy">
          <span>Conta ativa</span>
          <strong>{{ userLabel }}</strong>
        </div>
        <span class="avatar">{{ userInitials }}</span>
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
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const userLabel = computed(() => auth.user?.name || auth.user?.email || 'Administrador');
const userInitials = computed(() => {
  const value = auth.user?.name || auth.user?.email || 'CP';
  const initials = value
    .split(/[ .@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'CP';
});

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
  width: 54px;
  height: 48px;
  border-radius: 16px;
  font-size: 0.92rem;
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
  gap: 8px;
}

.app-nav a,
.app-nav span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 1rem;
  border-radius: 16px;
  font-weight: 800;
  color: #22345b;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 0 0 1px rgba(31, 47, 87, 0.08);
}

.app-nav span {
  opacity: 0.56;
  cursor: default;
}

.app-nav a.is-current {
  color: #fff8f3;
  background: linear-gradient(135deg, #ff7a66 0%, #d84752 52%, #3e74f2 100%);
  box-shadow: 0 18px 28px rgba(193, 74, 74, 0.18);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.new-order,
.logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 1.1rem;
  border-radius: 16px;
  font-weight: 800;
}

.new-order {
  color: #fff8f3;
  background: linear-gradient(135deg, #f3705f 0%, #d1494c 100%);
  box-shadow: 0 16px 28px rgba(209, 73, 76, 0.2);
}

.divider {
  width: 1px;
  height: 38px;
  background: rgba(31, 47, 87, 0.12);
}

.account-copy {
  display: grid;
  text-align: right;
}

.avatar {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 800;
  color: #5a2e22;
  background: linear-gradient(180deg, #fff3ed 0%, #f4d7c8 100%);
  box-shadow: inset 0 0 0 1px rgba(187, 122, 101, 0.16);
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

  .header-actions {
    justify-content: space-between;
    flex-wrap: wrap;
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
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .app-nav a,
  .app-nav span,
  .new-order,
  .logout {
    width: 100%;
  }

  .divider {
    display: none;
  }

  .avatar {
    align-self: center;
  }
}
</style>
