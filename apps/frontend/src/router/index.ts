import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/pages/Login.vue') },
  { path: '/register', name: 'register', component: () => import('@/pages/Register.vue') },
  {
    path: '/pagseguro/return',
    name: 'pagseguro-return',
    component: () => import('@/pages/PagSeguroReturn.vue'),
  },
  {
    path: '/pagamento/retorno',
    name: 'payment-return',
    component: () => import('@/pages/PagSeguroReturn.vue'),
  },
  {
    path: '/orders/:id/preview',
    name: 'orders-invite-preview',
    component: () => import('@/pages/orders/PreviewInvite.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/:id/preview/map',
    name: 'orders-invite-map',
    component: () => import('@/pages/orders/PreviewMap.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/pages/Dashboard.vue') },
      {
        path: 'orders',
        name: 'orders-index',
        component: () => import('@/pages/orders/Index.vue'),
      },
      {
        path: 'orders/new',
        name: 'orders-new',
        component: () => import('@/pages/orders/NewOrder.vue'),
      },
      {
        path: 'orders/:id',
        name: 'orders-show',
        component: () => import('@/pages/orders/Show.vue'),
      },
      {
        path: 'checkout/:id',
        name: 'orders-checkout',
        component: () => import('@/pages/orders/Checkout.vue'),
      },
    ],
  },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
});

export default router;
