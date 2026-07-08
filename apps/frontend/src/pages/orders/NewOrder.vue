<template>
  <section class="new-order-page">
    <header class="intro-card">
      <div>
        <span class="eyebrow">Novo pedido</span>
        <h1>Montar convite mobile</h1>
        <p>
          Cadastre os dados da festa e os convidados sugeridos para visualizar a prévia do
          convite com o tema Homem-Aranha.
        </p>
      </div>
    </header>

    <form class="form-card" @submit.prevent="submit">
      <div class="field-grid">
        <label class="field">
          <span>Nome do aniversariante</span>
          <input v-model.trim="name" required />
        </label>

        <label class="field">
          <span>Idade</span>
          <input v-model.number="age" type="number" min="1" required />
        </label>
      </div>

      <section class="address-section">
        <div class="address-header">
          <div>
            <h2>Endereço da festa</h2>
            <p>Preencha os campos completos para melhorar a precisão do mapa e do Street View.</p>
          </div>
        </div>

        <div class="address-grid">
          <label class="field">
            <span>CEP</span>
            <input
              :model-value="zipCode"
              inputmode="numeric"
              maxlength="9"
              placeholder="00000-000"
              required
              @input="updateZipCode"
            />
          </label>

          <label class="field">
            <span>UF</span>
            <input
              :model-value="stateCode"
              maxlength="2"
              placeholder="SP"
              required
              @input="updateStateCode"
            />
          </label>

          <label class="field field-span-2">
            <span>Rua</span>
            <input v-model.trim="street" placeholder="Ex.: Rua das Flores" required />
          </label>

          <label class="field">
            <span>Número</span>
            <input v-model.trim="addressNumber" placeholder="Ex.: 120" required />
          </label>

          <label class="field">
            <span>Bairro</span>
            <input v-model.trim="neighborhood" placeholder="Ex.: Centro" required />
          </label>

          <label class="field">
            <span>Cidade</span>
            <input v-model.trim="city" placeholder="Ex.: São Paulo" required />
          </label>

          <label class="field field-span-2">
            <span>Complemento</span>
            <input v-model.trim="complement" placeholder="Ex.: Salão 2, fundos, casa azul..." />
          </label>

          <label class="field field-span-2">
            <span>Ponto de referência</span>
            <input
              v-model.trim="referencePoint"
              placeholder="Ex.: Em frente à praça principal"
            />
          </label>
        </div>

        <label class="field">
          <span>Prévia do endereço</span>
          <textarea :model-value="addressPreview" rows="4" readonly />
        </label>
      </section>

      <label class="field">
        <span>Tema inicial</span>
        <input :model-value="themeLabel" readonly />
        <small>Por enquanto a prévia mobile será exibida apenas com o tema Homem-Aranha.</small>
      </label>

      <label class="field">
        <span>Ideias de presentes</span>
        <textarea
          v-model.trim="giftIdeas"
          rows="4"
          placeholder="Separe cada sugestão em uma nova linha."
        />
      </label>

      <section class="guest-section">
        <div class="guest-header">
          <div>
            <h2>Possíveis convidados</h2>
            <p>Esses nomes ficam disponíveis na prévia do convite para agilizar o preenchimento.</p>
          </div>

          <button class="ghost-button" type="button" @click="addGuestRow">+ Adicionar</button>
        </div>

        <div class="guest-list">
          <div v-for="(guest, index) in possibleGuests" :key="index" class="guest-row">
            <label class="field">
              <span>Nome</span>
              <input v-model.trim="guest.name" placeholder="Ex.: Maria" />
            </label>

            <label class="field guest-age">
              <span>Idade</span>
              <input
                :model-value="guest.age"
                type="number"
                min="1"
                placeholder="Ex.: 7"
                @input="updateGuestAge(index, $event)"
              />
            </label>

            <button
              class="remove-button"
              type="button"
              :disabled="possibleGuests.length === 1"
              @click="removeGuestRow(index)"
            >
              Remover
            </button>
          </div>
        </div>
      </section>

      <button class="submit" :disabled="loading">
        {{ loading ? 'Criando pedido...' : 'Salvar e seguir para o pagamento' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { OrdersService } from '@/services/OrdersService';
import { useRouter } from 'vue-router';
import { formatOrderAddress, formatZipCode } from '@/utils/orderInvite';

type EditableGuest = {
  name: string;
  age: string;
};

const themeSlug = 'homem-aranha';
const name = ref('');
const age = ref<number | undefined>();
const zipCode = ref('');
const street = ref('');
const addressNumber = ref('');
const neighborhood = ref('');
const city = ref('');
const stateCode = ref('');
const complement = ref('');
const referencePoint = ref('');
const giftIdeas = ref('');
const possibleGuests = ref<EditableGuest[]>([{ name: '', age: '' }]);
const loading = ref(false);
const error = ref('');
const router = useRouter();

const themeLabel = computed(() => 'Homem-Aranha');
const addressPreview = computed(() =>
  formatOrderAddress({
    zipCode: zipCode.value,
    street: street.value,
    addressNumber: addressNumber.value,
    neighborhood: neighborhood.value,
    city: city.value,
    stateCode: stateCode.value,
    complement: complement.value,
    referencePoint: referencePoint.value,
  }),
);

function updateZipCode(event: Event) {
  const target = event.target as HTMLInputElement;
  zipCode.value = formatZipCode(target.value);
}

function updateStateCode(event: Event) {
  const target = event.target as HTMLInputElement;
  stateCode.value = target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
}

function addGuestRow() {
  possibleGuests.value.push({ name: '', age: '' });
}

function removeGuestRow(index: number) {
  if (possibleGuests.value.length === 1) {
    possibleGuests.value[0] = { name: '', age: '' };
    return;
  }

  possibleGuests.value.splice(index, 1);
}

function updateGuestAge(index: number, event: Event) {
  const target = event.target as HTMLInputElement;
  possibleGuests.value[index].age = target.value;
}

function normalizeGuests() {
  const normalized = possibleGuests.value
    .map((guest) => ({
      name: guest.name.trim(),
      age: guest.age.trim(),
    }))
    .filter((guest) => guest.name || guest.age);

  const hasIncompleteGuest = normalized.some((guest) => {
    const ageValue = Number(guest.age);
    return !guest.name || !Number.isInteger(ageValue) || ageValue <= 0;
  });

  if (hasIncompleteGuest) {
    throw new Error('Preencha nome e idade dos convidados sugeridos ou remova a linha incompleta.');
  }

  return normalized.map((guest) => ({
    name: guest.name,
    age: Number(guest.age),
  }));
}

async function submit() {
  loading.value = true;
  error.value = '';

  try {
    const order = await OrdersService.create({
      name: name.value,
      age: age.value!,
      address: addressPreview.value,
      zipCode: zipCode.value,
      street: street.value,
      addressNumber: addressNumber.value,
      neighborhood: neighborhood.value,
      city: city.value,
      stateCode: stateCode.value,
      complement: complement.value,
      referencePoint: referencePoint.value,
      themeSlug,
      giftIdeas: giftIdeas.value,
      possibleGuests: normalizeGuests(),
    });

    await router.push({ name: 'orders-checkout', params: { id: order.id } });
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Erro ao criar pedido.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.new-order-page {
  display: grid;
  gap: 22px;
}

.intro-card,
.form-card {
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 28px;
  background: rgba(255, 251, 247, 0.78);
  box-shadow: 0 28px 60px rgba(31, 45, 82, 0.12);
  backdrop-filter: blur(16px);
}

.intro-card {
  padding: 34px;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 0.56rem 0.88rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c25540;
  background: rgba(255, 118, 92, 0.12);
}

.intro-card h1 {
  margin: 16px 0 12px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.6rem, 4vw, 3.4rem);
  line-height: 1;
  color: #15274a;
}

.intro-card p,
.field small,
.guest-header p,
.address-header p {
  margin: 0;
  line-height: 1.7;
  color: #62708b;
}

.form-card {
  display: grid;
  gap: 18px;
  padding: 30px;
}

.field-grid,
.guest-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field-span-2 {
  grid-column: span 2;
}

.field span,
.guest-header h2,
.address-header h2 {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 800;
  color: #30405e;
}

.address-section,
.guest-section {
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 22px;
  background: rgba(241, 244, 251, 0.78);
}

.guest-header,
.address-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.guest-list {
  display: grid;
  gap: 12px;
}

.guest-row {
  align-items: end;
}

.guest-age {
  max-width: 180px;
}

.ghost-button,
.remove-button,
.submit {
  min-height: 52px;
  border-radius: 18px;
  font-weight: 800;
}

.ghost-button {
  padding: 0 1rem;
  color: #20345d;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 0 0 1px rgba(31, 47, 87, 0.08);
}

.remove-button {
  padding: 0 1rem;
  color: #8e3e3a;
  background: rgba(255, 238, 236, 0.9);
}

.remove-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.submit {
  color: #fff9f4;
  background: linear-gradient(135deg, #f36f5d 0%, #c4473d 100%);
  box-shadow: 0 18px 30px rgba(196, 71, 61, 0.2);
}

.submit:disabled {
  opacity: 0.72;
  cursor: wait;
}

.error {
  margin: 0;
  padding: 0.92rem 1rem;
  border-radius: 18px;
  color: #9a231b;
  background: rgba(216, 78, 56, 0.12);
}

@media (max-width: 980px) {
  .address-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .field-grid,
  .guest-row,
  .address-grid {
    grid-template-columns: 1fr;
  }

  .guest-header,
  .address-header {
    flex-direction: column;
  }

  .guest-age,
  .field-span-2 {
    max-width: none;
    grid-column: auto;
  }
}

@media (max-width: 720px) {
  .intro-card,
  .form-card {
    padding: 22px;
    border-radius: 24px;
  }

  .address-section,
  .guest-section {
    padding: 18px;
  }
}
</style>
