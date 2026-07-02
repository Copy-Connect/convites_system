<template>
  <section class="auth-scene">
    <div class="ribbon ribbon-left" />
    <div class="ribbon ribbon-right" />

    <div class="auth-shell">
      <form class="auth-card" @submit.prevent="submit">
        <span class="mini-badge">Novo ateliê</span>
        <h2>Cadastre-se para criar convites que parecem ganhar vida.</h2>
        <p class="form-copy">
          Organize pedidos, ajuste personagens, acompanhe pagamentos e entregue uma experiência
          visual encantadora para cada festa.
        </p>

        <label class="field">
          <span>Seu nome</span>
          <input v-model="name" autocomplete="name" required />
        </label>

        <label class="field">
          <span>E-mail</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>

        <label class="field">
          <span>Senha</span>
          <input v-model="password" type="password" autocomplete="new-password" required />
        </label>

        <button class="submit" :disabled="loading">
          {{ loading ? 'Criando conta...' : 'Criar conta' }}
        </button>

        <p class="switch">
          Já tem acesso?
          <RouterLink to="/login">Entrar agora</RouterLink>
        </p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <aside class="atelier-panel">
        <span class="eyebrow">Estúdio Encantado</span>
        <h1>Personagens delicados, movimento suave e festa com assinatura visual.</h1>
        <p class="lede">
          Monte um catálogo premium de convites infantis com atmosfera lúdica, narrativa visual
          clara e acabamento pensado para impressionar desde o primeiro clique.
        </p>

        <div class="moodboard">
          <article class="mood mood-coral">
            <span class="icon crown" />
            <h3>Reinos mágicos</h3>
            <p>Paletas quentes, castelos suaves e brilho de conto moderno.</p>
          </article>
          <article class="mood mood-sky">
            <span class="icon rocket" />
            <h3>Aventuras animadas</h3>
            <p>Cenários em camadas, sensação de movimento e personagens expressivos.</p>
          </article>
          <article class="mood mood-mint">
            <span class="icon balloon" />
            <h3>Festas memoráveis</h3>
            <p>Fluxo elegante para vender, aprovar e entregar sem ruído operacional.</p>
          </article>
        </div>
      </aside>
    </div>
  </section>
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
.auth-scene {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 32px;
}

.ribbon {
  position: absolute;
  width: 360px;
  height: 360px;
  border-radius: 36px;
  transform: rotate(18deg);
  filter: blur(2px);
  opacity: 0.45;
  pointer-events: none;
}

.ribbon-left {
  top: -140px;
  left: -120px;
  background: linear-gradient(180deg, rgba(255, 215, 173, 0.8), rgba(239, 109, 79, 0.14));
}

.ribbon-right {
  right: -120px;
  bottom: -150px;
  background: linear-gradient(180deg, rgba(135, 216, 182, 0.7), rgba(94, 166, 214, 0.16));
}

.auth-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(340px, 430px) minmax(0, 1fr);
  gap: 28px;
  align-items: center;
  max-width: 1240px;
  margin: 0 auto;
}

.auth-card,
.atelier-panel {
  animation: float-in 620ms ease both;
}

.auth-card {
  display: grid;
  gap: 18px;
  padding: 34px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  background: var(--surface-strong);
  box-shadow: var(--shadow);
}

.mini-badge,
.eyebrow {
  width: fit-content;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 700;
}

.mini-badge {
  color: var(--accent-strong);
  background: rgba(239, 109, 79, 0.1);
}

.auth-card h2,
.atelier-panel h1,
.mood h3 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
}

.auth-card h2 {
  font-size: clamp(2rem, 4vw, 2.9rem);
  line-height: 1.05;
}

.form-copy,
.lede,
.mood p {
  margin: 0;
  line-height: 1.65;
  color: var(--muted);
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
  margin-top: 4px;
  border-radius: 18px;
  font-weight: 700;
  color: #fff8f2;
  background: linear-gradient(135deg, #ef6d4f 0%, #d84e38 100%);
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

.atelier-panel {
  display: grid;
  gap: 18px;
  padding: 42px;
  border: 1px solid rgba(255, 255, 255, 0.44);
  border-radius: 36px;
  background:
    radial-gradient(circle at top left, rgba(255, 220, 180, 0.42), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 248, 239, 0.7));
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow);
}

.eyebrow {
  color: #1f4a73;
  background: rgba(94, 166, 214, 0.12);
}

.atelier-panel h1 {
  max-width: 13ch;
  font-size: clamp(2.6rem, 5vw, 4.6rem);
  line-height: 1;
}

.lede {
  max-width: 58ch;
}

.moodboard {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.mood {
  display: grid;
  gap: 12px;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(26, 36, 64, 0.08);
}

.mood h3 {
  font-size: 1.2rem;
}

.mood-coral {
  background: linear-gradient(180deg, rgba(255, 234, 221, 0.92), rgba(255, 245, 236, 0.9));
}

.mood-sky {
  background: linear-gradient(180deg, rgba(224, 242, 251, 0.95), rgba(244, 251, 255, 0.9));
}

.mood-mint {
  background: linear-gradient(180deg, rgba(230, 251, 241, 0.95), rgba(245, 255, 250, 0.9));
}

.icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: inline-block;
  position: relative;
}

.crown {
  background: linear-gradient(180deg, #ffd86e 0%, #f5b83f 100%);
  clip-path: polygon(0 100%, 12% 38%, 30% 60%, 50% 14%, 70% 60%, 88% 38%, 100% 100%);
}

.rocket {
  border-radius: 22px 22px 12px 12px;
  background: linear-gradient(180deg, #5ea6d6 0%, #325d92 100%);
}

.rocket::before {
  content: '';
  position: absolute;
  inset: 9px 14px auto;
  height: 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
}

.rocket::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -12px;
  width: 18px;
  height: 18px;
  transform: translateX(-50%) rotate(45deg);
  background: #ffb35f;
}

.balloon {
  background: linear-gradient(180deg, #87d8b6 0%, #4fa57f 100%);
  border-radius: 50% 50% 48% 48%;
}

.balloon::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -11px;
  width: 2px;
  height: 16px;
  transform: translateX(-50%);
  background: rgba(26, 36, 64, 0.32);
}

@keyframes float-in {
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

  .atelier-panel {
    order: -1;
  }

  .auth-card,
  .atelier-panel {
    padding: 28px;
  }

  .moodboard {
    grid-template-columns: 1fr;
  }
}
</style>
