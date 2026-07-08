<template>
  <section class="new-order-page">
    <header class="intro-card">
      <div>
        <span class="eyebrow">Novo pedido</span>
        <h1>Montar convite mobile</h1>
        <p>Cadastre os dados da festa para visualizar a previa do convite com o tema Homem-Aranha.</p>
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

      <section class="media-section">
        <div class="media-header">
          <div>
            <h2>Imagem de abertura</h2>
            <p>Upload opcional para aparecer entre o texto e o botao na abertura do convite.</p>
          </div>
        </div>

        <label class="field">
          <span>Imagem do aniversariante</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" @change="updateInviteImage" />
          <small>Dimensao recomendada: 1080 x 1080 px ou superior, com foco centralizado.</small>
        </label>

        <div v-if="inviteImageUrl" class="image-preview">
          <img :src="inviteImageUrl" alt="Previa da imagem de abertura" />
          <button class="remove-image-button" type="button" @click="removeInviteImage">
            Remover imagem
          </button>
        </div>
      </section>

      <section class="address-section">
        <div class="address-header">
          <div>
            <h2>Endereco da festa</h2>
            <p>Preencha os campos completos para melhorar a precisao do mapa e do Street View.</p>
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
            <span>Numero</span>
            <input v-model.trim="addressNumber" placeholder="Ex.: 120" required />
          </label>

          <label class="field">
            <span>Bairro</span>
            <input v-model.trim="neighborhood" placeholder="Ex.: Centro" required />
          </label>

          <label class="field">
            <span>Cidade</span>
            <input v-model.trim="city" placeholder="Ex.: Sao Paulo" required />
          </label>

          <label class="field field-span-2">
            <span>Complemento</span>
            <input v-model.trim="complement" placeholder="Ex.: Salao 2, fundos, casa azul..." />
          </label>

          <label class="field field-span-2">
            <span>Ponto de referencia</span>
            <input
              v-model.trim="referencePoint"
              placeholder="Ex.: Em frente a praca principal"
            />
          </label>
        </div>
      </section>

      <label class="field">
        <span>Tema inicial</span>
        <input :model-value="themeLabel" readonly />
        <small>Por enquanto a previa mobile sera exibida apenas com o tema Homem-Aranha.</small>
      </label>

      <label class="field">
        <span>Ideias de presentes</span>
        <textarea
          v-model.trim="giftIdeas"
          rows="4"
          placeholder="Separe cada sugestao em uma nova linha."
        />
      </label>

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
const inviteImageUrl = ref('');
const giftIdeas = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();

const themeLabel = computed(() => 'Homem-Aranha');

function updateZipCode(event: Event) {
  const target = event.target as HTMLInputElement;
  zipCode.value = formatZipCode(target.value);
}

function updateStateCode(event: Event) {
  const target = event.target as HTMLInputElement;
  stateCode.value = target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
}

async function updateInviteImage(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    inviteImageUrl.value = '';
    return;
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    target.value = '';
    throw new Error('Use apenas imagens PNG, JPG ou WEBP.');
  }

  inviteImageUrl.value = await readFileAsDataUrl(file);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Nao foi possivel carregar a imagem.'));
    reader.readAsDataURL(file);
  });
}

function removeInviteImage() {
  inviteImageUrl.value = '';
}

async function submit() {
  loading.value = true;
  error.value = '';

  const formattedAddress = formatOrderAddress({
    zipCode: zipCode.value,
    street: street.value,
    addressNumber: addressNumber.value,
    neighborhood: neighborhood.value,
    city: city.value,
    stateCode: stateCode.value,
    complement: complement.value,
    referencePoint: referencePoint.value,
  });

  try {
    const order = await OrdersService.create({
      name: name.value,
      age: age.value!,
      address: formattedAddress,
      zipCode: zipCode.value,
      street: street.value,
      addressNumber: addressNumber.value,
      neighborhood: neighborhood.value,
      city: city.value,
      stateCode: stateCode.value,
      complement: complement.value,
      referencePoint: referencePoint.value,
      inviteImageUrl: inviteImageUrl.value,
      themeSlug,
      giftIdeas: giftIdeas.value,
      possibleGuests: [],
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
.address-header p,
.media-header p {
  margin: 0;
  line-height: 1.7;
  color: #62708b;
}

.form-card {
  display: grid;
  gap: 18px;
  padding: 30px;
}

.field-grid {
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
.address-header h2,
.media-header h2 {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 800;
  color: #30405e;
}

.media-section,
.address-section {
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 22px;
  background: rgba(241, 244, 251, 0.78);
}

.address-header,
.media-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.image-preview {
  display: grid;
  gap: 12px;
}

.image-preview img {
  width: min(220px, 100%);
  border-radius: 22px;
  object-fit: cover;
  box-shadow: 0 18px 30px rgba(31, 45, 82, 0.14);
}

.remove-image-button,
.submit {
  min-height: 52px;
  border-radius: 18px;
  font-weight: 800;
}

.remove-image-button {
  padding: 0 1rem;
  color: #20345d;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 0 0 1px rgba(31, 47, 87, 0.08);
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
  .address-grid {
    grid-template-columns: 1fr;
  }

  .address-header,
  .media-header {
    flex-direction: column;
  }

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

  .media-section,
  .address-section {
    padding: 18px;
  }
}
</style>
