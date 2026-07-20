<template>
  <section
    class="invite-preview"
    :class="[`theme-${theme.visual}`, { 'background-ready': backgroundReady }]"
    :style="pageStyle"
  >
    <div class="overlay" />
    <div class="theme-atmosphere" aria-hidden="true" />

    <audio ref="musicRef" :src="theme.musicUrl" preload="auto" loop />
    <audio ref="clickRef" :src="theme.clickSoundUrl" preload="auto" />

    <div v-if="!inviteOpen" class="entry-screen">
      <div class="entry-copy reveal reveal-copy">
        <span class="entry-eyebrow">{{ theme.copy.entryEyebrow }}</span>
        <h1>{{ order.name }}</h1>
        <p>{{ theme.copy.entry }}</p>
      </div>

      <div v-if="order.inviteImageUrl" class="entry-photo-wrap reveal reveal-photo">
        <img class="entry-photo" :src="order.inviteImageUrl" alt="Imagem do aniversariante" />
      </div>

      <button class="entry-button reveal reveal-button" type="button" @click="openInvite">
        <img class="entry-button-art" :src="theme.buttonUrl" alt="Abrir convite" />
      </button>
    </div>

    <main v-else class="invite-shell">
      <RouterLink class="back-link" :to="{ name: 'orders-show', params: { id: order.id } }">
        Voltar ao pedido
      </RouterLink>

      <header class="card hero-card invite-reveal">
        <span class="eyebrow">{{ theme.copy.heroEyebrow }}</span>
        <h1>{{ order.name }}</h1>
        <p>{{ theme.copy.age(order.age) }}</p>
      </header>

      <section class="card invite-reveal invite-reveal-2">
        <div class="section-head">
          <span class="section-index">01</span>
          <div>
            <h2>Confirmação de convidados</h2>
            <p>Preencha o nome e a idade dos convidados que virão à minha festa.</p>
          </div>
        </div>

        <form class="incremental-form" @submit.prevent="advanceForm">
          <label v-if="currentStep === 'name'" class="field">
            <span>Nome do convidado</span>
            <input v-model.trim="guestName" placeholder="Digite o nome" />
          </label>

          <label v-else-if="currentStep === 'age'" class="field">
            <span>Idade do convidado</span>
            <input
              v-model="guestAge"
              type="number"
              min="1"
              inputmode="numeric"
              placeholder="Digite a idade"
            />
          </label>

          <div v-if="confirmedGuests.length" class="confirmed-list">
            <article
              v-for="confirmedGuest in confirmedGuests"
              :key="confirmedGuest.id"
              class="confirmed-card"
            >
              <div class="confirmed-card-head">
                <strong>{{ confirmedGuest.name }}</strong>
                <button
                  class="delete-guest-button"
                  type="button"
                  aria-label="Apagar convidado cadastrado"
                  @click="removeConfirmedGuest(confirmedGuest.id)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M9 3h6m-9 4h12m-1 0-.7 11.1a2 2 0 0 1-2 1.9h-4.6a2 2 0 0 1-2-1.9L6 7m4 4v5m4-5v5"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                  </svg>
                </button>
              </div>
              <p>{{ theme.copy.confirmation(order.name) }}</p>
            </article>
          </div>

          <div class="form-actions">
            <button
              v-if="currentStep !== 'done'"
              class="primary-button"
              type="submit"
              :disabled="!canAdvance"
            >
              {{ currentStep === 'name' ? 'Continuar' : 'Confirmar idade' }}
            </button>

            <button
              v-if="currentStep === 'done'"
              class="ghost-button"
              type="button"
              @click="resetForm"
            >
              Preencher outro convidado
            </button>
          </div>

          <div v-if="confirmedGuests.length" class="confirm-actions">
            <button class="confirm-guests-button" type="button" @click="confirmGuests">
              Confirmar convidados
            </button>
          </div>
        </form>
      </section>

      <section class="card invite-reveal invite-reveal-3">
        <div class="section-head">
          <span class="section-index">02</span>
          <div>
            <h2>Onde será a festa</h2>
            <p class="address-copy">{{ formattedAddress }}</p>
          </div>
        </div>

        <div class="address-actions">
          <RouterLink
            class="primary-button link-button"
            :to="{ name: 'orders-invite-map', params: { id: order.id } }"
          >
            Clique aqui para abrir o mapa
          </RouterLink>

          <a class="ghost-button link-button" :href="streetViewUrl" target="_blank" rel="noopener">
            Abrir Street View
          </a>
        </div>
      </section>

      <section class="card invite-reveal invite-reveal-4">
        <div class="section-head">
          <span class="section-index">03</span>
          <div>
            <h2>Ideias de presentes</h2>
            <p>Sugestões cadastradas no pedido para ajudar os convidados.</p>
          </div>
        </div>

        <div v-if="giftIdeas.length" class="gift-grid">
          <span v-for="gift in giftIdeas" :key="gift" class="gift-chip">{{ gift }}</span>
        </div>

        <p v-else class="empty-copy">Nenhuma ideia de presente cadastrada ainda.</p>
      </section>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import type { Order } from '@/models/Order';
import { buildStreetViewUrl, formatOrderAddress, parseGiftIdeas } from '@/utils/orderInvite';
import type { SuperheroTheme } from './themes';
import './superhero-fonts.css';

type ConfirmedGuest = {
  id: string;
  name: string;
  age: number;
};

const props = defineProps<{
  order: Order;
  theme: SuperheroTheme;
}>();

const inviteOpen = ref(false);
const currentStep = ref<'name' | 'age' | 'done'>('name');
const guestName = ref('');
const guestAge = ref('');
const confirmedGuests = ref<ConfirmedGuest[]>([]);
const musicRef = ref<HTMLAudioElement | null>(null);
const clickRef = ref<HTMLAudioElement | null>(null);
const backgroundReady = ref(false);

const pageStyle = computed(() => ({
  '--invite-bg-mobile': `url('${props.theme.backgroundUrl}')`,
  '--invite-bg-desktop': `url('${props.theme.desktopBackgroundUrl}')`,
  '--theme-font': props.theme.fontFamily,
  '--theme-primary': props.theme.primary,
  '--theme-secondary': props.theme.secondary,
  '--theme-highlight': props.theme.highlight,
  '--theme-panel': props.theme.panel,
  '--theme-panel-strong': props.theme.panelStrong,
  '--theme-line': props.theme.line,
  '--theme-overlay': props.theme.overlay,
  '--theme-glow': props.theme.glow,
  '--theme-card-radius': props.theme.cardRadius,
  '--theme-photo-radius': props.theme.photoRadius,
  '--theme-heading-tracking': props.theme.headingTracking,
  '--theme-bg-position': props.theme.backgroundPosition,
}));

const giftIdeas = computed(() => parseGiftIdeas(props.order.giftIdeas));
const streetViewUrl = computed(() => buildStreetViewUrl(props.order));
const formattedAddress = computed(() => formatOrderAddress(props.order));
const canAdvance = computed(() => {
  if (currentStep.value === 'name') {
    return guestName.value.trim().length > 1;
  }

  if (currentStep.value === 'age') {
    const ageValue = Number(guestAge.value);
    return Number.isInteger(ageValue) && ageValue > 0;
  }

  return true;
});

function confirmGuest(name: string, age: number) {
  confirmedGuests.value.unshift({
    id: `${name}-${age}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    age,
  });
  currentStep.value = 'done';
}

function resetForm() {
  guestName.value = '';
  guestAge.value = '';
  currentStep.value = 'name';
}

function removeConfirmedGuest(guestId: string) {
  confirmedGuests.value = confirmedGuests.value.filter((guest) => guest.id !== guestId);
}

function confirmGuests() {
  confirmedGuests.value = [];
  resetForm();
}

function advanceForm() {
  if (currentStep.value === 'name' && canAdvance.value) {
    currentStep.value = 'age';
    return;
  }

  if (currentStep.value === 'age' && canAdvance.value) {
    confirmGuest(guestName.value.trim(), Number(guestAge.value));
  }
}

async function ensureMusicPlayback() {
  if (!musicRef.value || !inviteOpen.value) {
    return;
  }

  musicRef.value.volume = 0.42;

  try {
    await musicRef.value.play();
  } catch {}
}

async function playClickSound() {
  if (!clickRef.value) {
    return;
  }

  clickRef.value.currentTime = 0;

  try {
    await clickRef.value.play();
  } catch {}
}

async function openInvite() {
  await playClickSound();
  inviteOpen.value = true;
  await nextTick();
  window.setTimeout(() => void ensureMusicPlayback(), 120);
}

function handleUserGesture() {
  if (inviteOpen.value) {
    void ensureMusicPlayback();
  }
}

function handleVisibilityChange() {
  if (!document.hidden) {
    void ensureMusicPlayback();
  }
}

onMounted(() => {
  const backgroundImage = new Image();
  const revealBackground = () => {
    backgroundReady.value = true;
  };

  backgroundImage.addEventListener('load', revealBackground, { once: true });
  backgroundImage.addEventListener('error', revealBackground, { once: true });
  backgroundImage.src = window.matchMedia('(min-width: 768px)').matches
    ? props.theme.desktopBackgroundUrl
    : props.theme.backgroundUrl;

  if (backgroundImage.complete) {
    revealBackground();
  }

  window.addEventListener('pointerdown', handleUserGesture);
  window.addEventListener('keydown', handleUserGesture);
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  window.removeEventListener('pointerdown', handleUserGesture);
  window.removeEventListener('keydown', handleUserGesture);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  musicRef.value?.pause();
  clickRef.value?.pause();
});
</script>

<style scoped>
.invite-preview {
  --theme-text: #ffffff;
  --theme-muted: rgba(255, 255, 255, 0.78);
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--theme-text);
  background: #030607;
  overflow: hidden;
  isolation: isolate;
}

.invite-preview::before,
.invite-preview::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.invite-preview::before {
  z-index: -3;
  opacity: 0;
  background-image: var(--invite-bg-mobile);
  background-position: var(--theme-bg-position);
  background-size: cover;
  transform: scale(1.3);
  filter: brightness(2.1) saturate(0.55) blur(10px);
  will-change: opacity, transform, filter;
}

.invite-preview::after {
  z-index: 0;
  opacity: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.88) 0,
    color-mix(in srgb, var(--theme-highlight) 58%, transparent) 12%,
    transparent 48%
  );
  mix-blend-mode: screen;
  will-change: opacity, transform;
}

.invite-preview.background-ready::before {
  animation: background-impact 1.2s cubic-bezier(.16, .8, .24, 1) forwards;
}

.invite-preview.background-ready::after {
  animation: background-flash 900ms cubic-bezier(.16, .8, .24, 1) forwards;
}

.overlay,
.theme-atmosphere {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.overlay {
  z-index: -2;
  background: var(--theme-overlay);
}

.theme-atmosphere {
  z-index: -1;
  opacity: 0;
  background:
    radial-gradient(circle at 14% 18%, var(--theme-primary) 0 2px, transparent 3px),
    radial-gradient(circle at 84% 22%, var(--theme-highlight) 0 1px, transparent 2px),
    linear-gradient(125deg, transparent 0 48%, var(--theme-line) 49% 50%, transparent 51% 100%);
  background-size: 84px 84px, 112px 112px, 190px 190px;
  mask-image: linear-gradient(to bottom, black, transparent 82%);
}

.background-ready .theme-atmosphere {
  animation: atmosphere-arrival 1.15s 240ms ease-out forwards;
}

.entry-screen {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  justify-items: center;
  align-items: center;
  gap: 24px;
  padding: max(30px, env(safe-area-inset-top)) 26px max(34px, env(safe-area-inset-bottom));
  text-align: center;
}

.entry-copy {
  align-self: end;
  display: grid;
  justify-items: center;
  gap: 13px;
  max-width: 430px;
}

.entry-eyebrow,
.eyebrow {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  padding: 0.54rem 0.88rem;
  border: 1px solid var(--theme-line);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--theme-highlight);
  background: color-mix(in srgb, var(--theme-panel-strong) 80%, transparent);
  box-shadow: 0 8px 30px var(--theme-glow);
  backdrop-filter: blur(12px);
}

.entry-copy h1,
.hero-card h1 {
  margin: 0;
  font-family: var(--theme-font);
  letter-spacing: var(--theme-heading-tracking);
  color: var(--theme-text);
  text-wrap: balance;
  text-shadow: 0 6px 24px rgba(0, 0, 0, 0.62), 0 0 26px var(--theme-glow);
}

.entry-copy h1 {
  font-size: clamp(3.15rem, 14vw, 5.4rem);
  line-height: 0.95;
}

.entry-copy p,
.hero-card p,
.section-head p,
.empty-copy {
  margin: 0;
  color: var(--theme-muted);
  line-height: 1.7;
}

.entry-copy p {
  max-width: 390px;
  font-size: 1rem;
}

.entry-photo-wrap {
  width: min(220px, 56vw);
}

.entry-photo {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid var(--theme-line);
  border-radius: var(--theme-photo-radius);
  object-fit: cover;
  box-shadow: 0 22px 50px rgba(0, 0, 0, 0.46), 0 0 35px var(--theme-glow);
}

.entry-button {
  align-self: start;
  display: grid;
  place-items: center;
  width: min(320px, 100%);
  min-height: 84px;
  padding: 0;
  color: var(--theme-text);
  background: transparent;
  transition: transform 180ms ease, filter 180ms ease;
}

.entry-button:hover {
  transform: translateY(-4px) scale(1.03);
}

.entry-button:active {
  transform: scale(0.96);
}

.entry-button-art {
  display: block;
  width: min(76%, 250px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 12px var(--theme-glow));
}

.reveal {
  opacity: 0;
}

.background-ready .reveal {
  animation: entry-reveal 700ms 1.35s cubic-bezier(.2, .8, .2, 1) forwards;
}

.background-ready .reveal-photo {
  animation-delay: 1.5s;
}

.background-ready .reveal-button {
  animation-delay: 1.75s;
}

.invite-shell {
  width: min(460px, 100%);
  margin: 0 auto;
  padding: max(22px, env(safe-area-inset-top)) 18px max(34px, env(safe-area-inset-bottom));
  display: grid;
  gap: 16px;
}

.back-link {
  display: inline-flex;
  width: fit-content;
  padding: 0.72rem 0.96rem;
  border: 1px solid var(--theme-line);
  border-radius: 999px;
  color: var(--theme-text);
  background: var(--theme-panel);
  backdrop-filter: blur(12px);
}

.card {
  position: relative;
  padding: 22px;
  border: 1px solid var(--theme-line);
  border-radius: var(--theme-card-radius);
  color: var(--theme-text);
  background: var(--theme-panel);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3), 0 0 28px color-mix(in srgb, var(--theme-glow) 45%, transparent);
  overflow: hidden;
}

.card::after {
  content: '';
  position: absolute;
  width: 90px;
  height: 3px;
  top: 0;
  right: 28px;
  background: linear-gradient(90deg, transparent, var(--theme-highlight), transparent);
  box-shadow: 0 0 14px var(--theme-glow);
}

.hero-card {
  display: grid;
  justify-items: center;
  gap: 12px;
  text-align: center;
  background: var(--theme-panel-strong);
}

.hero-card h1 {
  font-size: clamp(2.7rem, 11vw, 4.7rem);
  line-height: 1;
}

.section-head {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: start;
}

.section-head h2 {
  margin: 0 0 6px;
  color: var(--theme-text);
  font-size: 1.08rem;
}

.section-index {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid color-mix(in srgb, var(--theme-highlight) 38%, transparent);
  border-radius: calc(var(--theme-card-radius) / 2);
  font-weight: 900;
  color: #ffffff;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  box-shadow: 0 10px 24px var(--theme-glow);
}

.gift-grid,
.address-actions,
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.gift-chip,
.ghost-button,
.primary-button,
.link-button,
.confirm-guests-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  width: 100%;
  padding: 0 1rem;
  border-radius: 16px;
  font-weight: 850;
  text-align: center;
}

.gift-chip,
.ghost-button,
.confirm-guests-button {
  color: var(--theme-text);
  background: color-mix(in srgb, var(--theme-panel-strong) 72%, white 8%);
  box-shadow: inset 0 0 0 1px var(--theme-line);
}

.gift-chip {
  min-height: 42px;
}

.incremental-form {
  margin-top: 18px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  color: var(--theme-text);
  font-size: 0.9rem;
  font-weight: 750;
}

.field input {
  color: var(--theme-text);
  border-color: var(--theme-line);
  background: color-mix(in srgb, var(--theme-panel-strong) 72%, white 7%);
}

.field input::placeholder {
  color: rgba(255, 255, 255, 0.48);
}

.field input:focus {
  border-color: var(--theme-highlight);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 28%, transparent);
}

.confirmed-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.confirmed-card {
  padding: 18px;
  border: 1px solid var(--theme-line);
  border-radius: 20px;
  background: color-mix(in srgb, var(--theme-panel-strong) 72%, white 6%);
}

.confirmed-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.confirmed-card strong {
  display: block;
  font-size: 1.12rem;
  color: var(--theme-text);
}

.delete-guest-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 12px;
  color: #ff6b6b;
  background: rgba(131, 14, 24, 0.38);
  box-shadow: inset 0 0 0 1px rgba(255, 107, 107, 0.2);
}

.delete-guest-button svg {
  width: 18px;
  height: 18px;
}

.confirmed-card p,
.address-copy {
  margin: 0;
  line-height: 1.6;
  white-space: pre-line;
  color: var(--theme-muted);
}

.primary-button {
  color: #ffffff;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  box-shadow: 0 14px 28px var(--theme-glow);
}

.primary-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.confirm-actions {
  margin-top: 10px;
}

.confirm-guests-button {
  min-height: 50px;
}

.invite-reveal {
  animation: invite-reveal 520ms cubic-bezier(.2, .8, .2, 1) both;
}

.invite-reveal-2 {
  animation-delay: 80ms;
}

.invite-reveal-3 {
  animation-delay: 160ms;
}

.invite-reveal-4 {
  animation-delay: 240ms;
}

.theme-ocean .theme-atmosphere {
  background-image: repeating-radial-gradient(ellipse at bottom, transparent 0 28px, var(--theme-line) 30px 32px);
}

.theme-noir .card,
.theme-tech .card,
.theme-league .card {
  border-width: 0 0 0 3px;
}

.theme-comic .card,
.theme-graffiti .card,
.theme-toon .card {
  transform: rotate(-0.25deg);
}

.theme-speed .theme-atmosphere,
.theme-thunder .theme-atmosphere {
  background-image: repeating-linear-gradient(115deg, transparent 0 65px, var(--theme-line) 66px 69px, transparent 70px 130px);
}

.theme-dots .theme-atmosphere,
.theme-retro .theme-atmosphere {
  background-image: radial-gradient(circle, var(--theme-highlight) 0 3px, transparent 4px);
  background-size: 52px 52px;
}

.theme-wakanda .card {
  clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
}

.theme-shield .section-index,
.theme-sky .section-index,
.theme-assemble .section-index {
  border-radius: 50%;
}

@keyframes entry-reveal {
  from {
    opacity: 0;
    transform: translateY(22px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes background-impact {
  0% {
    opacity: 0;
    transform: scale(1.3);
    filter: brightness(2.1) saturate(0.55) blur(10px);
  }
  18% {
    opacity: 1;
    filter: brightness(1.7) saturate(1.45) blur(0);
  }
  58% {
    opacity: 1;
    transform: scale(1.045);
    filter: brightness(1.12) saturate(1.15) blur(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: brightness(1) saturate(1) blur(0);
  }
}

@keyframes background-flash {
  0% {
    opacity: 0;
    transform: scale(0.35);
  }
  14% {
    opacity: 0.86;
  }
  42% {
    opacity: 0.2;
    transform: scale(1.12);
  }
  100% {
    opacity: 0;
    transform: scale(1.65);
  }
}

@keyframes atmosphere-arrival {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.34;
  }
}

@keyframes invite-reveal {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 420px) {
  .invite-shell {
    padding-inline: 14px;
  }

  .card {
    padding: 19px;
  }

  .entry-screen {
    padding-inline: 20px;
  }
}

@media (min-width: 768px) {
  .invite-preview::before {
    background-image: var(--invite-bg-desktop);
  }

  .entry-screen {
    position: relative;
    width: min(1320px, 100%);
    margin-inline: auto;
    grid-template-columns: minmax(320px, 480px) minmax(220px, 330px);
    grid-template-rows: 1fr 1fr;
    grid-template-areas:
      'copy photo'
      'button photo';
    justify-content: space-between;
    align-items: center;
    column-gap: clamp(56px, 10vw, 220px);
    row-gap: 18px;
    padding: max(38px, env(safe-area-inset-top)) clamp(36px, 5vw, 76px)
      max(38px, env(safe-area-inset-bottom));
    text-align: left;
  }

  .entry-copy {
    position: absolute;
    z-index: 1;
    grid-area: auto;
    left: 50%;
    bottom: calc(50% + 56px);
    translate: -50% 0;
    width: min(560px, calc(100% - 72px));
    max-width: 560px;
    justify-items: center;
    text-align: center;
  }

  .entry-copy h1 {
    font-size: clamp(4rem, 7vw, 6.8rem);
  }

  .entry-copy p {
    font-size: 1.05rem;
  }

  .entry-photo-wrap {
    grid-area: photo;
    width: min(300px, 24vw);
    justify-self: end;
  }

  .entry-button {
    position: absolute;
    z-index: 2;
    grid-area: auto;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    width: min(360px, 100%);
  }

  .entry-button-art {
    width: min(82%, 290px);
  }

  .invite-shell {
    width: min(1160px, 100%);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px;
    padding: max(34px, env(safe-area-inset-top)) clamp(24px, 4vw, 48px)
      max(48px, env(safe-area-inset-bottom));
  }

  .back-link,
  .hero-card {
    grid-column: 1 / -1;
  }

  .invite-shell > section:nth-of-type(1) {
    grid-row: span 2;
  }

  .card {
    padding: clamp(25px, 3vw, 34px);
  }

  .hero-card h1 {
    font-size: clamp(3.6rem, 7vw, 6.2rem);
  }

  .gift-grid,
  .address-actions,
  .form-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .gift-chip,
  .address-actions > *,
  .form-actions > * {
    flex: 1 1 190px;
  }
}

@media (min-width: 768px) and (max-height: 680px) {
  .entry-screen {
    padding-block: 24px;
  }

  .entry-copy {
    gap: 9px;
  }

  .entry-copy h1 {
    font-size: clamp(3.2rem, 8vh, 5rem);
  }

  .entry-photo-wrap {
    width: min(230px, 22vw, 38vh);
  }
}

@media (prefers-reduced-motion: reduce) {
  .invite-preview::before {
    opacity: 1;
    transform: none;
    filter: none;
  }

  .invite-preview::after {
    display: none;
  }

  .theme-atmosphere {
    opacity: 0.34;
  }

  .background-ready .reveal,
  .invite-reveal {
    opacity: 1;
    animation: none;
  }

  .invite-preview.background-ready::before,
  .background-ready .theme-atmosphere {
    animation: none;
  }
}
</style>
