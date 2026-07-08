<template>
  <section class="invite-preview" :style="pageStyle">
    <div class="overlay" />

    <audio ref="musicRef" :src="spiderMusic" preload="auto" loop />
    <audio ref="clickRef" :src="spiderClickSound" preload="auto" />

    <div v-if="loading" class="state-card">Carregando previa do convite...</div>
    <div v-else-if="error" class="state-card is-error">{{ error }}</div>

    <template v-else-if="order">
      <div v-if="!inviteOpen" class="entry-screen">
        <div class="entry-copy">
          <span class="entry-eyebrow">Convite especial</span>
          <h1>{{ order.name }}</h1>
          <p>Ola, voce foi convidado para a minha festa, toque no botao abaixo para confirmar sua presenca.</p>
        </div>

        <div v-if="order.inviteImageUrl" class="entry-photo-wrap">
          <img class="entry-photo" :src="order.inviteImageUrl" alt="Imagem do aniversariante" />
        </div>

        <button class="entry-button" type="button" @click="openInvite">
          <img class="entry-button-art" :src="spiderButton" alt="Abrir convite" />
        </button>
      </div>

      <main v-else class="invite-shell">
        <RouterLink class="back-link" :to="{ name: 'orders-show', params: { id: order.id } }">
          Voltar ao pedido
        </RouterLink>

        <header class="card hero-card">
          <span class="eyebrow">Aniversario em missao</span>
          <h1>{{ order.name }}</h1>
          <p>{{ order.age }} anos de aventura aracnidea.</p>
        </header>

        <section class="card">
          <div class="section-head">
            <span class="section-index">01</span>
            <div>
              <h2>Confirmacao de convidados</h2>
              <p>Preencha nome e idade dos convidados que virao a minha festa.</p>
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
                <p>
                  Missao confirmada para voce. Agora se prepare para a festa de
                  {{ order.name }}.
                </p>
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

        <section class="card">
          <div class="section-head">
            <span class="section-index">02</span>
            <div>
              <h2>Onde sera a festa</h2>
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

        <section class="card">
          <div class="section-head">
            <span class="section-index">03</span>
            <div>
              <h2>Ideias de presentes</h2>
              <p>Sugestoes cadastradas no pedido para ajudar os convidados.</p>
            </div>
          </div>

          <div v-if="giftIdeas.length" class="gift-grid">
            <span v-for="gift in giftIdeas" :key="gift" class="gift-chip">{{ gift }}</span>
          </div>

          <p v-else class="empty-copy">Nenhuma ideia de presente cadastrada ainda.</p>
        </section>
      </main>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Order } from '@/models/Order';
import { OrdersService } from '@/services/OrdersService';
import {
  buildStreetViewUrl,
  formatOrderAddress,
  parseGiftIdeas,
} from '@/utils/orderInvite';
import spiderBackground from '@/assets/images/Mobile/Super Heróis/Homem-Aranha/bg1.png';
import spiderButton from '@/assets/images/Mobile/Super Heróis/Homem-Aranha/bt1.png';
import spiderMusic from '@/assets/music/Super Heróis/SpiderMan/Ramones - Spider-Man - MACVSOG84 (youtube).mp3';
import spiderClickSound from '@/assets/sound/HomemAranha/Firefly_audio_Spider-Man_web-shooting_effect_variation3.wav';

type ConfirmedGuest = {
  id: string;
  name: string;
  age: number;
};

const route = useRoute();
const order = ref<Order | null>(null);
const loading = ref(true);
const error = ref('');
const inviteOpen = ref(false);
const currentStep = ref<'name' | 'age' | 'done'>('name');
const guestName = ref('');
const guestAge = ref('');
const confirmedGuests = ref<ConfirmedGuest[]>([]);
const musicRef = ref<HTMLAudioElement | null>(null);
const clickRef = ref<HTMLAudioElement | null>(null);

const pageStyle = computed(() => ({
  '--invite-bg': `url('${spiderBackground}')`,
}));

const giftIdeas = computed(() => parseGiftIdeas(order.value?.giftIdeas));
const streetViewUrl = computed(() => buildStreetViewUrl(order.value));
const formattedAddress = computed(() => formatOrderAddress(order.value));
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
  window.setTimeout(() => {
    void ensureMusicPlayback();
  }, 120);
}

function handleUserGesture() {
  if (!inviteOpen.value) {
    return;
  }

  void ensureMusicPlayback();
}

function handleVisibilityChange() {
  if (!document.hidden) {
    void ensureMusicPlayback();
  }
}

onMounted(async () => {
  try {
    order.value = await OrdersService.get(String(route.params.id));
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Nao foi possivel carregar a previa do convite.';
  } finally {
    loading.value = false;
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
  --text: #ffffff;
  --muted: rgba(255, 255, 255, 0.78);
  --panel: rgba(9, 11, 20, 0.72);
  --panel-strong: rgba(5, 7, 14, 0.84);
  --line: rgba(255, 255, 255, 0.12);
  position: relative;
  min-height: 100vh;
  background-image: var(--invite-bg);
  background-position: center;
  background-size: cover;
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.88) 0%, rgba(4, 4, 12, 0.84) 100%),
    rgba(0, 0, 0, 0.5);
}

.state-card,
.entry-screen,
.invite-shell {
  position: relative;
  z-index: 1;
}

.state-card {
  width: min(440px, calc(100% - 32px));
  margin: 120px auto 0;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 28px;
  color: var(--text);
  background: var(--panel);
  backdrop-filter: blur(18px);
}

.state-card.is-error {
  color: #ffd7d7;
}

.entry-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  gap: 26px;
  padding: 28px;
  text-align: center;
}

.entry-copy {
  display: grid;
  gap: 12px;
}

.entry-eyebrow,
.eyebrow {
  display: inline-flex;
  width: fit-content;
  margin: 0 auto;
  padding: 0.52rem 0.84rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text);
  background: rgba(255, 255, 255, 0.08);
}

.entry-copy h1,
.hero-card h1 {
  margin: 0;
  color: var(--text);
  text-shadow: 0 6px 22px rgba(0, 0, 0, 0.42);
}

.entry-copy h1 {
  font-family: 'Spider-Man Invite', 'Trebuchet MS', sans-serif;
  font-size: clamp(3.2rem, 13vw, 5.2rem);
  letter-spacing: 0.06em;
}

.entry-copy p,
.hero-card p,
.section-head p,
.empty-copy {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.entry-photo-wrap {
  width: min(220px, 58vw);
}

.entry-photo {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 28px;
  object-fit: cover;
  box-shadow:
    0 22px 44px rgba(0, 0, 0, 0.34),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.entry-button {
  display: grid;
  justify-items: center;
  width: min(300px, 100%);
  padding: 0;
  color: var(--text);
  background: transparent;
}

.entry-button-art {
  width: 50%;

  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.36));
}

.invite-shell {
  width: min(460px, 100%);
  margin: 0 auto;
  padding: 22px 18px 32px;
  display: grid;
  gap: 16px;
}

.back-link {
  display: inline-flex;
  width: fit-content;
  padding: 0.72rem 0.96rem;
  border-radius: 999px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.card {
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 28px;
  color: var(--text);
  background: var(--panel);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.26);
}

.hero-card {
  display: grid;
  gap: 12px;
  text-align: center;
  background: var(--panel-strong);
}

.hero-card h1 {
  font-family: 'Spider-Man Invite', 'Trebuchet MS', sans-serif;
  font-size: clamp(2.8rem, 11vw, 4.6rem);
  letter-spacing: 0.08em;
}

.section-head {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: start;
}

.section-head h2 {
  margin: 0 0 6px;
  color: var(--text);
  font-size: 1.08rem;
}

.section-index {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  font-weight: 900;
  color: #ffffff;
  background: linear-gradient(135deg, rgba(208, 28, 42, 0.96), rgba(79, 7, 13, 0.96));
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
  min-height: 48px;
  width: 100%;
  padding: 0 1rem;
  border-radius: 16px;
  font-weight: 800;
}

.gift-chip,
.ghost-button,
.confirm-guests-button {
  color: var(--text);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.gift-chip {
  min-height: 40px;
}

.incremental-form {
  margin-top: 18px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 700;
}

.field input {
  color: var(--text);
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
}

.field input::placeholder {
  color: rgba(255, 255, 255, 0.46);
}

.field input:focus {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
}

.confirmed-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.confirmed-card {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.06);
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
  color: var(--text);
}

.delete-guest-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 12px;
  color: #ff6b6b;
  background: rgba(131, 14, 24, 0.34);
  box-shadow: inset 0 0 0 1px rgba(255, 107, 107, 0.18);
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
  color: var(--muted);
}

.primary-button {
  color: #ffffff;
  background: linear-gradient(135deg, #f22d3e 0%, #8d0a16 100%);
  box-shadow: 0 16px 28px rgba(73, 0, 6, 0.38);
}

.primary-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.confirm-actions {
  margin-top: 12px;
}

.confirm-guests-button {
  min-height: 52px;
}

@media (max-width: 420px) {
  .invite-shell {
    padding-inline: 14px;
  }

  .card {
    padding: 18px;
    border-radius: 24px;
  }

  .address-actions,
  .form-actions {
    gap: 10px;
  }
}
</style>
