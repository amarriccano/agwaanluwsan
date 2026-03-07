<template>
  <div>
    <div v-if="loading" style="text-align:center;padding:6rem;color:var(--text-light);">
      Loading…
    </div>

    <div v-else-if="!book" style="text-align:center;padding:6rem;">
      <p style="color:var(--text-light);margin-bottom:1.5rem;">Book not found.</p>
      <NuxtLink to="/books" class="btn">← Books</NuxtLink>
    </div>

    <template v-else>
      <div class="breadcrumb">
        <NuxtLink to="/books">Books</NuxtLink>
        <span>›</span>
        <span>{{ book.title }}</span>
      </div>

      <div class="book-detail">

        <div class="book-detail-cover">
          <img v-if="book.coverImage" :src="book.coverImage" :alt="book.title" class="cover-img" />
          <div v-else class="cover-placeholder"><span>{{ book.title }}</span></div>
        </div>

        <div class="book-detail-info">
          <p class="book-detail-author">{{ book.author }}</p>
          <h1 class="book-detail-title">{{ book.title }}</h1>

          <div v-if="book.year || book.publisher || book.pages || book.language" class="book-meta">
            <span v-if="book.year">{{ book.year }}</span>
            <span v-if="book.publisher" class="meta-sep">·</span>
            <span v-if="book.publisher">{{ book.publisher }}</span>
            <span v-if="book.pages" class="meta-sep">·</span>
            <span v-if="book.pages">{{ book.pages }} pp.</span>
            <span v-if="book.language" class="meta-sep">·</span>
            <span v-if="book.language">{{ book.language }}</span>
          </div>

          <p v-if="book.description" class="book-detail-desc">{{ book.description }}</p>

          <div class="variant-section">
            <p class="variant-label">Format</p>
            <div class="variant-grid">
              <button
                v-for="v in book.variants"
                :key="v._id"
                :class="['variant-btn', { active: selectedVariant?._id === v._id, soldout: v.status === 'soldout' }]"
                :disabled="v.status === 'soldout'"
                @click="selectVariant(v)"
              >
                <span class="variant-format">{{ formatLabel(v.format) }}</span>
                <span class="variant-price">{{ formatPrice(v.price) }}</span>
                <span v-if="v.status === 'soldout'" class="variant-soldout-tag">Sold Out</span>
              </button>
            </div>
          </div>

          <Transition name="fade">
            <div v-if="selectedVariant" class="selected-detail">
              <div class="selected-price">{{ formatPrice(selectedVariant.price) }}</div>
              <p v-if="selectedVariant.isbn" class="selected-meta">ISBN {{ selectedVariant.isbn }}</p>
              <p v-if="selectedVariant.sku" class="selected-meta">SKU {{ selectedVariant.sku }}</p>
            </div>
          </Transition>

          <div class="detail-actions">
            <button
              class="btn"
              :disabled="!selectedVariant || selectedVariant.status === 'soldout' || addedToCart"
              @click="addToCart"
            >
              <span v-if="addedToCart">✓ In Cart</span>
              <span v-else-if="!selectedVariant">Select a Format</span>
              <span v-else-if="selectedVariant.status === 'soldout'">Sold Out</span>
              <span v-else>Add to Cart</span>
            </button>
            <NuxtLink v-if="addedToCart" to="/books/cart" class="btn-outline">Cart →</NuxtLink>
            <NuxtLink to="/books" class="btn-outline">← Books</NuxtLink>
          </div>

          <p class="delivery-note">
            Orders are fulfilled locally. No online payment required — payment arranged upon delivery in Ulaanbaatar.
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()
const { addToCart: cartAdd, isInCart } = useCart()

const book = ref<any>(null)
const loading = ref(true)
const selectedVariant = ref<any>(null)
const addedToCart = ref(false)

useHead({
  title: computed(() => book.value ? `${book.value.title} — Batsaikhan Ookhnoi` : 'Books')
})

onMounted(async () => {
  try {
    book.value = await api.get<any>(`/books/${route.params.id}`)
    if (book.value?.variants?.length) {
      selectedVariant.value =
        book.value.variants.find((v: any) => v.status === 'available') ?? book.value.variants[0]
      checkCart()
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function selectVariant(v: any) {
  selectedVariant.value = v
  checkCart()
}

function cartItemId() {
  return `${book.value._id}_${selectedVariant.value.format}`
}

function checkCart() {
  addedToCart.value = isInCart(cartItemId())
}

function addToCart() {
  if (!selectedVariant.value || selectedVariant.value.status === 'soldout') return
  cartAdd({
    id: cartItemId(),
    bookId: book.value._id,
    variant: selectedVariant.value.format,
    title: `${book.value.title} (${formatLabel(selectedVariant.value.format)})`,
    price: selectedVariant.value.price,
    publisher: book.value.publisher ?? '',
    year: book.value.year ?? '',
    coverImage: book.value.coverImage ?? '',
  })
  addedToCart.value = true
}

const FORMAT_LABELS: Record<string, string> = {
  hardcover: 'Hardcover',
  paperback: 'Paperback',
  ebook:     'E-Book',
  audiobook: 'Audiobook',
}

function formatLabel(format: string) {
  return FORMAT_LABELS[format] ?? format
}

function formatPrice(price: number) {
  return (price ?? 0).toLocaleString('mn-MN') + ' ₮'
}
</script>

<style scoped>
.breadcrumb {
  padding: 0.9rem 5%; font-size: 0.82rem; color: var(--text-light);
  display: flex; gap: 0.5rem; align-items: center;
  border-bottom: 1px solid var(--border); background: #fff;
}
.breadcrumb a { color: var(--primary-blue); text-decoration: none; font-weight: 700; }
.breadcrumb a:hover { text-decoration: underline; }

.book-detail {
  display: grid; grid-template-columns: 320px 1fr;
  gap: 4rem; max-width: 1060px; margin: 3rem auto; padding: 0 5%; align-items: start;
}
.book-detail-cover { position: sticky; top: 90px; }
.cover-img {
  width: 100%; aspect-ratio: 2/3; object-fit: cover;
  display: block; border-radius: 2px; box-shadow: 0 10px 36px rgba(0,0,0,0.2);
}
.cover-placeholder {
  width: 100%; aspect-ratio: 2/3; background: linear-gradient(135deg,#162447,#4a148c);
  border-radius: 2px; display: flex; align-items: flex-end; padding: 1.5rem;
  box-shadow: 0 10px 36px rgba(0,0,0,0.2); color: white;
  font-family: 'Playfair Display',serif; font-size: 1.05rem; line-height: 1.4;
}
.book-detail-author {
  font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2.5px;
  color: var(--accent-purple); font-weight: 700; margin-bottom: 0.5rem;
}
.book-detail-title {
  font-family: 'Playfair Display',serif; font-size: 2.1rem;
  line-height: 1.2; color: var(--text-dark); margin-bottom: 1rem;
}
.book-meta {
  display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;
  font-size: 0.82rem; color: var(--text-light); margin-bottom: 1.5rem;
}
.meta-sep { opacity: 0.35; }
.book-detail-desc {
  font-size: 0.96rem; color: var(--text-light); line-height: 1.9;
  margin-bottom: 2rem; border-left: 3px solid var(--border); padding-left: 1.2rem;
}
.variant-section { margin-bottom: 1.2rem; }
.variant-label {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1.5px;
  font-weight: 700; color: var(--text-light); margin-bottom: 0.8rem;
}
.variant-grid { display: flex; flex-wrap: wrap; gap: 0.7rem; }
.variant-btn {
  display: flex; flex-direction: column; align-items: center;
  padding: 0.75rem 1.3rem; border: 1.5px solid var(--border);
  border-radius: 2px; background: #fff; cursor: pointer;
  transition: all 0.2s; min-width: 110px; font-family: 'Lato',sans-serif;
}
.variant-btn:hover:not(:disabled) {
  border-color: var(--primary-blue); transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22,36,71,0.1);
}
.variant-btn.active { border-color: var(--primary-blue); background: var(--primary-blue); color: white; }
.variant-btn.soldout { opacity: 0.4; cursor: not-allowed; background: #f5f5f5; }
.variant-format { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.variant-price { font-size: 1rem; font-weight: 700; margin-top: 5px; font-family: 'Playfair Display',serif; }
.variant-btn.active .variant-format,
.variant-btn.active .variant-price { color: rgba(255,255,255,0.95); }
.variant-soldout-tag { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; color: #999; }

.selected-detail {
  padding: 1rem 1.4rem; background: #f8f8f8; border: 1px solid var(--border);
  border-radius: 2px; margin-bottom: 1.5rem;
}
.selected-price {
  font-family: 'Playfair Display',serif; font-size: 1.9rem;
  color: var(--primary-blue); font-weight: 700;
}
.selected-meta { font-size: 0.76rem; color: var(--text-light); margin-top: 5px; }

.detail-actions { display: flex; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 1.5rem; align-items: center; }
.delivery-note {
  font-size: 0.78rem; color: var(--text-light); line-height: 1.7;
  padding-top: 1rem; border-top: 1px solid var(--border);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 768px) {
  .book-detail { grid-template-columns: 1fr; gap: 2rem; }
  .book-detail-cover { position: static; max-width: 240px; margin: 0 auto; }
  .book-detail-title { font-size: 1.6rem; }
}
</style>