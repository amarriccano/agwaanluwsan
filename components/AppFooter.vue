<template>
  <footer class="footer">
    <div class="footer-links">
      <NuxtLink to="/about">About</NuxtLink>
      <NuxtLink to="/books">Books</NuxtLink>
      <NuxtLink to="/interviews">Interviews</NuxtLink>
      <NuxtLink to="/talks">Talks</NuxtLink>
      <NuxtLink to="/articles">Articles</NuxtLink>
      <NuxtLink to="/media">Media</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ year }} DR. BATSAIKHAN OOKHNOI. ALL RIGHTS RESERVED. &nbsp;|&nbsp; CREATED BY <strong style="color: rgba(255,255,255,0.8);">RENNAB</strong></p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>
