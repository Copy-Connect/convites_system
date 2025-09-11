<template>
  <nav style="display:flex;gap:12px;padding:12px;border-bottom:1px solid #333">
    <router-link to="/dashboard">Dashboard</router-link>
    <router-link to="/login">Login</router-link>
    <router-link to="/register">Registrar</router-link>
  </nav>
  <router-view />
</template>
