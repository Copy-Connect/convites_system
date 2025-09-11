import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/pages/Login.vue') },
  { path: '/register', name: 'register', component: () => import('@/pages/Register.vue') },

  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      { path: '', name: 'dashboard', component: () => import('@/pages/Dashboard.vue') },
      { path: 'orders/new', name: 'orders-new', component: () => import('@/pages/ordes/NewOrder.vue') },
      { path: 'orders/:id', name: 'orders-show', component: () => import('@/pages/ordes/Show.vue') },
    ],
    meta: { requiresAuth: true },
  },

  { path: '/pagseguro/return', name: 'pagseguro-return', component: () => import('@/pages/PagSeguroReturn.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } };
});

export default router;
