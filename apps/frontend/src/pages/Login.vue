<template>
  <section class="login-scene">
    <div class="color-flow" aria-hidden="true" />
    <div class="backdrop backdrop-blue" />
    <div class="backdrop backdrop-pink" />
    <div class="backdrop backdrop-gold" />

    <div class="login-shell">
      <aside class="showcase-panel">
        <div class="showcase-copy">
          <span class="eyebrow">Convites tematicos</span>
          <h1>Personalize o convite da sua festa com temas que combinam</h1>
          <p class="lede">
            Convites com fontes e músicas temáticas para criar uma experiência completa para seus convidados.
          </p>

          <div class="theme-pills">
            <span>Super-herois</span>
            <span>Corrida</span>
            <span>Aventura</span>
            <span>Princesas</span>
          </div>
        </div>

        <div class="hero-gallery">
          <article class="hero-card hero-card-sonic">
            <div class="hero-copy">
              <strong>Energia</strong>
              <span>Temas intensos com impacto visual forte</span>
            </div>
            <img src="/login/sonic.png" alt="Personagem azul em corrida com raios" />
          </article>

          <article class="hero-card hero-card-ladybug">
            <div class="hero-copy">
              <strong>Encanto</strong>
              <span>Composicoes delicadas e cheias de personalidade</span>
            </div>
            <img src="/login/ladybug.png" alt="Heroina de roupa vermelha com bolinhas" />
          </article>

          <div class="mini-strip">
          </div>
        </div>
      </aside>

      <form class="auth-card" @submit.prevent="submit">
        <div class="card-top">
          <span class="mini-badge">Acesso do cliente</span>
          <div class="spotlight">
            <img src="/login/HomemAranha.png" alt="Homem Aranha na parede" />
          </div>
        </div>

        <h2>Entre para montar os seus convites</h2>
        <p class="form-copy">
         Crie você mesmo convites digitais com temas que combinam com a sua festa. Personalize fontes, cores e músicas para criar uma experiência completa para seus convidados.
         
        </p>

        <div class="feature-band">
          <span>Arte personalizada</span>
          <span>Pagamento rapido</span>
          <span>Segurança de dados</span>
          <span>Entrega digital</span>
        </div>

        <label class="field">
          <span>E-mail</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>

        <label class="field">
          <span>Senha</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>

        <button class="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar agora' }}
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

const miniThemes = [
  {
    title: 'Corrida',
    caption: 'McQueen para uma abertura vibrante',
    image: '/login/mcqueen.png',
    alt: 'Carro vermelho inspirado em corrida',
  },
  {
    title: 'Aventura',
    caption: 'Hot Wheels com tracao e contraste forte',
    image: '/login/hotwheels.png',
    alt: 'Carrinho off-road com tema Hot Wheels',
  },
  {
    title: 'Surpresa',
    caption: 'Stitch com clima divertido e fofo',
    image: '/login/stitch.png',
    alt: 'Mascote azul com orelhas grandes saindo de presente',
  },
  {
    title: 'Festa geek',
    caption: 'Super-herois com cores vibrantes e energia',
    image: '/login/spiderman-cake.png',
    alt: 'Heroi vermelho segurando bolo decorado',
  },
];

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(email.value, password.value);
    router.replace((route.query.redirect as string) || { name: 'dashboard' });
  } catch (e: any) {
    error.value = e.message || 'Falha ao entrar';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-scene {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  isolation: isolate;
  padding: 32px;
  background: linear-gradient(140deg, #fff5ea 0%, #ffe7dc 42%, #dfeeff 100%);
}

.color-flow {
  position: absolute;
  inset: -18%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 16% 20%, rgba(31, 117, 255, 0.46) 0%, transparent 23%),
    radial-gradient(circle at 84% 18%, rgba(255, 77, 125, 0.38) 0%, transparent 24%),
    radial-gradient(circle at 72% 76%, rgba(255, 196, 87, 0.34) 0%, transparent 22%),
    radial-gradient(circle at 28% 74%, rgba(99, 102, 241, 0.24) 0%, transparent 18%);
  filter: blur(28px) saturate(112%);
  transform-origin: center;
  animation: colorSweep 16s ease-in-out infinite alternate, colorSpin 28s linear infinite;
}

.color-flow::before,
.color-flow::after {
  content: '';
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  filter: blur(38px);
  opacity: 0.7;
}

.color-flow::before {
  background:
    radial-gradient(circle at 30% 32%, rgba(255, 255, 255, 0.48) 0%, transparent 26%),
    radial-gradient(circle at 68% 60%, rgba(255, 212, 138, 0.28) 0%, transparent 24%);
  animation: shimmerDrift 14s ease-in-out infinite alternate;
}

.color-flow::after {
  background:
    radial-gradient(circle at 72% 28%, rgba(113, 214, 255, 0.34) 0%, transparent 24%),
    radial-gradient(circle at 38% 74%, rgba(255, 133, 167, 0.26) 0%, transparent 21%);
  animation: shimmerDriftReverse 18s ease-in-out infinite alternate;
}

.login-scene::before,
.login-scene::after {
  content: '';
  position: absolute;
  inset: auto;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(24px);
  opacity: 0.45;
  z-index: 0;
}

.login-scene::before {
  top: 12%;
  left: 14%;
  width: 38vw;
  height: 38vw;
  min-width: 280px;
  min-height: 280px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.56) 0%, rgba(255, 255, 255, 0) 68%);
  animation: orbFloat 22s ease-in-out infinite;
}

.login-scene::after {
  right: 10%;
  bottom: 8%;
  width: 30vw;
  height: 30vw;
  min-width: 240px;
  min-height: 240px;
  background: radial-gradient(circle, rgba(255, 225, 153, 0.36) 0%, rgba(255, 225, 153, 0) 70%);
  animation: orbFloatReverse 26s ease-in-out infinite;
}

.backdrop {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.85;
  pointer-events: none;
  animation: blobFloat 16s ease-in-out infinite;
}

.backdrop-blue {
  top: -80px;
  left: -60px;
  width: 280px;
  height: 280px;
  background: rgba(31, 117, 255, 0.24);
  animation-duration: 19s;
}

.backdrop-pink {
  right: -40px;
  top: 24%;
  width: 260px;
  height: 260px;
  background: rgba(255, 77, 125, 0.16);
  animation-duration: 23s;
  animation-delay: -6s;
}

.backdrop-gold {
  left: 42%;
  bottom: -90px;
  width: 320px;
  height: 320px;
  background: rgba(255, 196, 87, 0.18);
  animation-duration: 21s;
  animation-delay: -11s;
}

.login-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(350px, 430px);
  gap: 28px;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
}

.showcase-panel,
.auth-card {
  animation: rise 650ms ease both;
}

.showcase-panel {
  display: grid;
  gap: 24px;
}

.showcase-copy {
  max-width: 760px;
}

.eyebrow,
.mini-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.6rem 0.95rem;
  border-radius: 999px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 800;
}

.eyebrow {
  color: #173157;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 12px 28px rgba(32, 47, 95, 0.12);
}

.showcase-copy h1,
.auth-card h2 {
  margin: 16px 0 0;
  line-height: 0.97;
  font-family: Georgia, "Times New Roman", serif;
}

.showcase-copy h1 {
  max-width: 10ch;
  font-size: clamp(3rem, 5vw, 5.6rem);
  color: #192848;
}

.lede {
  max-width: 56ch;
  margin: 18px 0 0;
  font-size: 1.04rem;
  line-height: 1.7;
  color: #4f5b76;
}

.theme-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.theme-pills span,
.feature-band span {
  padding: 0.72rem 0.95rem;
  border: 1px solid rgba(25, 40, 72, 0.08);
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #253556;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 14px 30px rgba(39, 55, 94, 0.08);
}

.hero-gallery {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.72fr);
  gap: 18px;
  align-items: stretch;
}

.hero-card {
  position: relative;
  min-height: 430px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 36px;
  box-shadow: 0 28px 60px rgba(35, 49, 88, 0.18);
  isolation: isolate;
}

.hero-card::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 42%;
  background: linear-gradient(180deg, rgba(12, 19, 36, 0) 0%, rgba(12, 19, 36, 0.58) 100%);
  z-index: 0;
}

.hero-card img {
  position: absolute;
  inset: auto auto -10px 50%;
  max-width: none;
  transform: translateX(-50%);
  z-index: -1;
}

.hero-card-sonic {
  background:
    radial-gradient(circle at top center, rgba(96, 214, 255, 0.4), transparent 32%),
    linear-gradient(160deg, #173b7e 0%, #1d5fc0 48%, #53d8ff 100%);
}

.hero-card-sonic img {
  width: min(460px, 70%);

}

.hero-card-ladybug {
  background:
    radial-gradient(circle at top center, rgba(255, 202, 222, 0.24), transparent 30%),
    linear-gradient(180deg, #fff8fb 0%, #ffd9e4 100%);
}

.hero-card-ladybug img {
  bottom: -36px;
  width: min(420px, 95%);
}

.hero-copy {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 24px;
  z-index: 1;
  display: grid;
  gap: 6px;
  color: #fffdf9;
}

.hero-card-ladybug .hero-copy {
  color: #fffdf9;
}

.hero-copy strong {
  font-size: 1.15rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero-copy span {
  max-width: 22ch;
  line-height: 1.4;
}

.mini-strip {
  display: grid;
  gap: 16px;
}

.mini-card {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  min-height: 100px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.44);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.66);
  box-shadow: 0 18px 40px rgba(35, 49, 88, 0.12);
  backdrop-filter: blur(12px);
}

.mini-card img {
  width: 92px;
  height: 92px;
  object-fit: contain;
  filter: drop-shadow(0 12px 20px rgba(20, 36, 70, 0.18));
}

.mini-card strong,
.mini-card span {
  display: block;
}

.mini-card strong {
  color: #1c2d4b;
}

.mini-card span {
  margin-top: 4px;
  font-size: 0.92rem;
  line-height: 1.45;
  color: #5c6783;
}

.auth-card {
  display: grid;
  gap: 18px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.54);
  border-radius: 34px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 247, 242, 0.92) 100%);
  box-shadow: 0 28px 65px rgba(34, 50, 91, 0.18);
  backdrop-filter: blur(14px);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.mini-badge {
  color: #c84b42;
  background: rgba(255, 116, 90, 0.12);
}

.spotlight {
  display: grid;
  place-items: center;
  width: 112px;
  height: 112px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top, rgba(103, 220, 255, 0.42), transparent 52%),
    linear-gradient(160deg, #e8f5ff 0%, #fff3fb 100%);
}

.spotlight img {
  width: 92px;
  height: 92px;
  object-fit: contain;
  filter: drop-shadow(0 12px 18px rgba(49, 77, 131, 0.2));
}

.auth-card h2 {
  font-size: clamp(2rem, 3vw, 2.8rem);
  color: #1b2646;
}

.form-copy {
  margin: -4px 0 4px;
  line-height: 1.65;
  color: #66728d;
}

.feature-band {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
  min-height: 58px;
  margin-top: 4px;
  border-radius: 18px;
  font-weight: 800;
  color: #fff9f4;
  background: linear-gradient(135deg, #ff6f5d 0%, #d83d51 52%, #3f79ff 100%);
  box-shadow: 0 18px 28px rgba(186, 73, 75, 0.28);
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 22px 34px rgba(186, 73, 75, 0.32);
}

.submit:disabled {
  opacity: 0.72;
  cursor: wait;
}

.switch {
  margin: 0;
  color: #67748f;
}

.switch a {
  margin-left: 6px;
  font-weight: 800;
  color: #d84e38;
}

.error {
  margin: 0;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  color: #9a1e17;
  background: rgba(216, 78, 56, 0.12);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradientDrift {
  0% {
    background-position: 0% 0%, 100% 50%, 50% 50%;
  }
  50% {
    background-position: 18% 12%, 84% 44%, 54% 50%;
  }
  100% {
    background-position: 10% 24%, 100% 62%, 46% 52%;
  }
}

@keyframes colorSweep {
  0% {
    transform: translate3d(-5%, -3%, 0) scale(1.02);
  }
  50% {
    transform: translate3d(4%, 5%, 0) scale(1.12);
  }
  100% {
    transform: translate3d(7%, -4%, 0) scale(1.05);
  }
}

@keyframes colorSpin {
  from {
    rotate: 0deg;
  }
  to {
    rotate: 360deg;
  }
}

@keyframes blobFloat {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(24px, -18px, 0) scale(1.08);
  }
  100% {
    transform: translate3d(-18px, 20px, 0) scale(0.96);
  }
}

@keyframes orbFloat {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(36px, -24px, 0) scale(1.06);
  }
  100% {
    transform: translate3d(-20px, 28px, 0) scale(0.94);
  }
}

@keyframes orbFloatReverse {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-32px, 22px, 0) scale(1.1);
  }
  100% {
    transform: translate3d(26px, -18px, 0) scale(0.92);
  }
}

@keyframes shimmerDrift {
  0% {
    transform: translate3d(-3%, 0, 0) scale(0.98);
  }
  100% {
    transform: translate3d(5%, -4%, 0) scale(1.08);
  }
}

@keyframes shimmerDriftReverse {
  0% {
    transform: translate3d(3%, 2%, 0) scale(1.02);
  }
  100% {
    transform: translate3d(-4%, 5%, 0) scale(0.94);
  }
}

@media (prefers-reduced-motion: reduce) {
  .color-flow,
  .color-flow::before,
  .color-flow::after,
  .login-scene::before,
  .login-scene::after,
  .backdrop,
  .showcase-panel,
  .auth-card {
    animation: none !important;
  }
}

@media (max-width: 1180px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .auth-card {
    order: -1;
    max-width: 520px;
  }
}

@media (max-width: 860px) {
  .login-scene {
    padding: 18px;
  }

  .showcase-copy h1 {
    max-width: 100%;
    font-size: clamp(2.5rem, 12vw, 4rem);
  }

  .hero-gallery {
    grid-template-columns: 1fr;
  }

  .hero-card {
    min-height: 360px;
  }

  .mini-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .auth-card,
  .hero-card,
  .mini-card {
    border-radius: 24px;
  }

  .auth-card {
    padding: 24px;
  }

  .card-top {
    align-items: flex-start;
  }

  .spotlight {
    width: 88px;
    height: 88px;
    border-radius: 22px;
  }

  .spotlight img {
    width: 72px;
    height: 72px;
  }

  .mini-card {
    grid-template-columns: 78px minmax(0, 1fr);
  }

  .mini-card img {
    width: 78px;
    height: 78px;
  }
}
</style>
