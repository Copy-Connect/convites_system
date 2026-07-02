<template>
  <section class="auth-scene">
    <div class="auth-glow auth-glow-sky" />
    <div class="auth-glow auth-glow-sunset" />

    <div class="auth-shell">
      <aside class="story-panel">
        <span class="eyebrow">Convites Animados</span>
        <h1>Seu universo infantil começa com uma entrada de cinema.</h1>
        <p class="lede">
          Crie convites digitais com movimento, personagens encantadores e uma apresentação
          feita para surpreender crianças e famílias.
        </p>

        <div class="character-stage">
          <div class="moon" />
          <div class="hill hill-back" />
          <div class="hill hill-front" />
          <div class="castle">
            <span class="tower left" />
            <span class="tower right" />
            <span class="gate" />
          </div>
          <div class="friends">
            <span class="friend lion">
              <i class="head" />
              <i class="body" />
            </span>
            <span class="friend bunny">
              <i class="head" />
              <i class="body" />
            </span>
            <span class="friend star">
              <i class="core" />
            </span>
          </div>
        </div>

        <ul class="feature-list">
          <li>Animações delicadas para abrir o convite como um pequeno espetáculo.</li>
          <li>Personagens infantis com direção visual leve, elegante e memorável.</li>
          <li>Fluxo simples para aprovar arte, pagamento e entrega em poucos cliques.</li>
        </ul>
      </aside>

      <form class="auth-card" @submit.prevent="submit">
        <span class="mini-badge">Acesso do cliente</span>
        <h2>Entrar na sua vitrine de festas</h2>
        <p class="form-copy">
          Acompanhe pedidos, status de pagamento e a produção dos convites animados.
        </p>

        <label class="field">
          <span>E-mail</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>

        <label class="field">
          <span>Senha</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>

        <button class="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <p class="switch">
          Primeira vez aqui?
          <RouterLink to="/register">Crie sua conta</RouterLink>
        </p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </section>
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
.auth-scene {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 32px;
}

.auth-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  pointer-events: none;
}

.auth-glow-sky {
  top: -60px;
  right: -20px;
  width: 320px;
  height: 320px;
  background: rgba(94, 166, 214, 0.26);
}

.auth-glow-sunset {
  bottom: -80px;
  left: -40px;
  width: 360px;
  height: 360px;
  background: rgba(239, 109, 79, 0.18);
}

.auth-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(340px, 420px);
  gap: 28px;
  align-items: stretch;
  max-width: 1240px;
  margin: 0 auto;
}

.story-panel,
.auth-card {
  animation: rise 600ms ease both;
}

.story-panel {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 42px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 36px;
  color: #fff7f0;
  background:
    radial-gradient(circle at top right, rgba(255, 232, 165, 0.28), transparent 28%),
    linear-gradient(155deg, #173157 0%, #214a7a 42%, #123050 100%);
  box-shadow: var(--shadow);
}

.eyebrow,
.mini-badge {
  width: fit-content;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 700;
}

.eyebrow {
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  color: #173157;
  background: rgba(255, 240, 216, 0.95);
}

.story-panel h1,
.auth-card h2 {
  margin: 0;
  line-height: 1.02;
  font-family: Georgia, "Times New Roman", serif;
}

.story-panel h1 {
  max-width: 11ch;
  font-size: clamp(2.7rem, 5vw, 4.8rem);
}

.lede {
  max-width: 58ch;
  margin: 0;
  font-size: 1.04rem;
  line-height: 1.7;
  color: rgba(255, 247, 240, 0.82);
}

.character-stage {
  position: relative;
  min-height: 320px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 218, 169, 0.24) 0%, rgba(255, 255, 255, 0) 45%),
    linear-gradient(180deg, #2a5c93 0%, #173157 100%);
}

.moon {
  position: absolute;
  top: 34px;
  right: 48px;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fffef9 0%, #ffe8b0 55%, #ffd18f 100%);
  box-shadow: 0 0 40px rgba(255, 227, 154, 0.45);
}

.hill {
  position: absolute;
  left: -5%;
  right: -5%;
  border-radius: 50%;
}

.hill-back {
  bottom: 72px;
  height: 140px;
  background: #255b66;
}

.hill-front {
  bottom: -58px;
  height: 180px;
  background: #4a9b76;
}

.castle {
  position: absolute;
  left: 50%;
  bottom: 112px;
  width: 156px;
  height: 118px;
  transform: translateX(-50%);
  border-radius: 18px 18px 8px 8px;
  background: linear-gradient(180deg, #fff5e4 0%, #f0d8b4 100%);
}

.tower {
  position: absolute;
  bottom: 68px;
  width: 34px;
  height: 82px;
  border-radius: 14px 14px 0 0;
  background: linear-gradient(180deg, #fff7ea 0%, #f0d9b2 100%);
}

.tower.left {
  left: 14px;
}

.tower.right {
  right: 14px;
}

.gate {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 38px;
  height: 56px;
  transform: translateX(-50%);
  border-radius: 22px 22px 0 0;
  background: #d2784e;
}

.friends {
  position: absolute;
  right: 52px;
  bottom: 52px;
  display: flex;
  gap: 18px;
  align-items: end;
}

.friend {
  position: relative;
  display: inline-block;
}

.friend .head,
.friend .body,
.friend .core {
  position: absolute;
  display: block;
}

.lion,
.bunny {
  width: 54px;
  height: 96px;
}

.lion .head {
  top: 8px;
  left: 7px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background:
    radial-gradient(circle, #ffdca9 0 45%, #cf7f34 47% 100%);
}

.lion .body {
  left: 15px;
  bottom: 10px;
  width: 25px;
  height: 44px;
  border-radius: 20px;
  background: #ffbe61;
}

.bunny .head {
  top: 10px;
  left: 10px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff8f1;
  box-shadow:
    -8px -16px 0 -7px #ffd5de,
    8px -16px 0 -7px #ffd5de;
}

.bunny .body {
  left: 13px;
  bottom: 8px;
  width: 28px;
  height: 46px;
  border-radius: 22px;
  background: #fff2df;
}

.star {
  width: 46px;
  height: 46px;
  margin-bottom: 22px;
}

.star .core {
  inset: 0;
  clip-path: polygon(50% 0%, 61% 34%, 98% 35%, 69% 57%, 79% 93%, 50% 72%, 21% 93%, 31% 57%, 2% 35%, 39% 34%);
  background: linear-gradient(180deg, #fff1a8 0%, #ffc758 100%);
}

.feature-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature-list li {
  position: relative;
  padding-left: 22px;
  color: rgba(255, 247, 240, 0.86);
  line-height: 1.5;
}

.feature-list li::before {
  content: '';
  position: absolute;
  top: 0.65rem;
  left: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffd26d;
  box-shadow: 0 0 18px rgba(255, 210, 109, 0.4);
}

.auth-card {
  align-self: center;
  display: grid;
  gap: 18px;
  padding: 34px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 30px;
  background: var(--surface);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow);
}

.mini-badge {
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  color: var(--accent-strong);
  background: rgba(239, 109, 79, 0.1);
}

.auth-card h2 {
  font-size: clamp(2rem, 4vw, 2.8rem);
}

.form-copy {
  margin: -4px 0 4px;
  color: var(--muted);
  line-height: 1.6;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-size: 0.92rem;
  font-weight: 700;
  color: #314060;
}

.submit {
  min-height: 56px;
  margin-top: 6px;
  border-radius: 18px;
  font-weight: 700;
  color: #fff8f2;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  box-shadow: 0 16px 24px rgba(216, 78, 56, 0.2);
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 28px rgba(216, 78, 56, 0.25);
}

.submit:disabled {
  opacity: 0.72;
  cursor: wait;
}

.switch {
  margin: 0;
  color: var(--muted);
}

.switch a {
  margin-left: 6px;
  font-weight: 700;
  color: var(--accent-strong);
}

.error {
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 16px;
  color: #9a1e17;
  background: rgba(216, 78, 56, 0.12);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 980px) {
  .auth-scene {
    padding: 18px;
  }

  .auth-shell {
    grid-template-columns: 1fr;
  }

  .story-panel,
  .auth-card {
    padding: 28px;
  }

  .story-panel h1 {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .character-stage {
    min-height: 260px;
  }

  .friends {
    right: 24px;
    bottom: 42px;
    transform: scale(0.9);
    transform-origin: bottom right;
  }
}
</style>
