<template>
  <div>
    <div class="page-header">
      <h1>Your Cart</h1>
      <p>Review your order, then fill in your details to request delivery.</p>
    </div>

    <!-- RECEIPT VIEW -->
    <div v-if="orderPlaced" style="padding:2rem 5%;">
      <div class="receipt">
        <div class="receipt-header">
          <h2>Order Confirmed</h2>
          <p style="color:var(--accent-purple);font-weight:700;margin-bottom:0.5rem;font-size:1.1rem;">Thank you for your order!</p>
          <p class="order-number">Order #{{ receipt.orderNumber }}</p>
          <p style="font-size:0.85rem;color:var(--text-light);margin-top:0.5rem;">{{ receipt.date }}</p>
        </div>

        <h3 style="font-size:1rem;text-transform:uppercase;letter-spacing:1px;font-family:'Lato',sans-serif;margin-bottom:1rem;font-weight:700;color:var(--text-light);">Order Summary</h3>
        <div v-for="item in receipt.items" :key="item.id" class="receipt-row">
          <span>{{ item.title }} <span style="color:var(--text-light);font-size:0.9rem;">× {{ item.quantity }}</span></span>
          <span class="receipt-total">{{ formatPrice(item.subtotal) }}</span>
        </div>
        <div class="receipt-row" style="font-weight:700;font-size:1.1rem;margin-top:0.5rem;padding-top:1rem;border-top:2px solid var(--border);">
          <span>Total</span>
          <span class="receipt-total">{{ formatPrice(receipt.total) }}</span>
        </div>

        <div class="receipt-info">
          <p><strong>Name:</strong> {{ receipt.name }}</p>
          <p><strong>Phone:</strong> {{ receipt.phone }}</p>
          <p><strong>Address:</strong> {{ receipt.address }}</p>
          <p v-if="receipt.notes"><strong>Notes:</strong> {{ receipt.notes }}</p>
        </div>

        <p style="margin-top:1.5rem;font-size:0.9rem;color:var(--text-light);line-height:1.7;">
          Dr. Batsaikhan Ookhnoi or his publisher <strong>Rennab</strong> will contact you on the
          provided phone number to arrange delivery and payment within <strong>1–3 business days</strong>.
        </p>
        <div style="margin-top:2rem;display:flex;gap:1rem;flex-wrap:wrap;">
          <button class="btn" onclick="window.print()">Print Receipt</button>
          <NuxtLink to="/books" class="btn-outline">Back to Books</NuxtLink>
        </div>
      </div>
    </div>

    <!-- CART + FORM VIEW -->
    <div v-else class="cart-page">
      <div v-if="cartItems.length === 0" class="empty-cart">
        <p>Your cart is empty.</p>
        <NuxtLink to="/books" class="btn">Browse Books</NuxtLink>
      </div>

      <template v-else>
        <table class="cart-table">
          <thead>
            <tr>
              <th>Book</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cartItems" :key="item.book.id">
              <td>
                <div class="item-title">{{ item.book.title }}</div>
                <div style="font-size:0.8rem;color:var(--text-light);margin-top:0.2rem;">
                  {{ item.book.year }} · {{ item.book.publisher }}
                </div>
              </td>
              <td class="item-price">{{ formatPrice(item.book.price) }}</td>
              <td>
                <div class="qty-control">
                  <button class="qty-btn" @click="updateQuantity(item.book.id, item.quantity - 1)">−</button>
                  <span>{{ item.quantity }}</span>
                  <button class="qty-btn" @click="updateQuantity(item.book.id, item.quantity + 1)">+</button>
                </div>
              </td>
              <td class="item-price">{{ formatPrice(item.book.price * item.quantity) }}</td>
              <td><button class="remove-btn" @click="removeFromCart(item.book.id)">Remove</button></td>
            </tr>
          </tbody>
        </table>

        <div class="cart-summary">
          <p class="cart-total">Total: <strong>{{ formatPrice(totalPrice) }}</strong></p>
          <p style="font-size:0.82rem;color:var(--text-light);margin-top:0.5rem;">Payment collected upon delivery.</p>
        </div>

        <div class="order-form">
          <h2>Delivery Information</h2>
          <p class="form-subtitle">Fill in your details. Rennab will contact you to confirm delivery.</p>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input v-model="form.name" type="text" class="form-input" placeholder="Your full name" />
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <input v-model="form.phone" type="tel" class="form-input" placeholder="+976 xxxxxxxx" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Delivery Address *</label>
            <textarea v-model="form.address" class="form-textarea"
              placeholder="Full address including district, khoroo, apartment number, Ulaanbaatar" />
          </div>

          <div class="form-group">
            <label class="form-label">Additional Notes (optional)</label>
            <input v-model="form.notes" type="text" class="form-input"
              placeholder="Best time to call, preferred delivery day…" />
          </div>

          <div v-if="formError" class="alert-error">{{ formError }}</div>

          <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-top:1.5rem;">
            <button class="btn" :disabled="submitting" @click="placeOrder">
              {{ submitting ? 'Placing order…' : 'Place Order' }}
            </button>
            <NuxtLink to="/books" class="btn-outline">Continue Shopping</NuxtLink>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Cart & Order — Batsaikhan Ookhnoi' })

const api = useApi()
const { cartItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart()

const form = ref({ name: '', phone: '', address: '', notes: '' })
const formError = ref('')
const submitting = ref(false)
const orderPlaced = ref(false)
const receipt = ref<any>(null)

function formatPrice(price: number) {
  return (price || 0).toLocaleString('mn-MN') + ' ₮'
}

async function placeOrder() {
  formError.value = ''
  if (!form.value.name.trim())    { formError.value = 'Please enter your full name.'; return }
  if (!form.value.phone.trim())   { formError.value = 'Please enter your phone number.'; return }
  if (!form.value.address.trim()) { formError.value = 'Please enter your delivery address.'; return }

  submitting.value = true
  try {
    const payload = {
      customerName: form.value.name,
      phone: form.value.phone,
      address: form.value.address,
      notes: form.value.notes,
      items: cartItems.value.map(i => ({
        bookId: i.book.id,
        title: i.book.title,
        price: i.book.price,
        quantity: i.quantity
      })),
      total: totalPrice.value
    }

    const res = await api.post<any>('/orders', payload)

    // Build receipt from API response
    receipt.value = {
      orderNumber: res.orderNumber || res._id?.slice(-8).toUpperCase(),
      date: new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      items: cartItems.value.map(i => ({
        id: i.book.bookId,
        variant: i.book.variant,
        title: i.book.title,
        quantity: i.quantity,
        subtotal: i.book.price * i.quantity
      })),
      total: totalPrice.value,
      name: form.value.name,
      phone: form.value.phone,
      address: form.value.address,
      notes: form.value.notes
    }

    clearCart()
    orderPlaced.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: any) {
    formError.value = e?.data?.message || 'Failed to place order. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
