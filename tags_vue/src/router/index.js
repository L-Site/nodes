import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Categories from '../views/Categories.vue'
import Register from '../views/Register.vue'
import CategoryNotes from '../views/CategoryNotes.vue'
import ForgotPassword from '../views/ForgotPassword.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/categories',
      name: 'categories',
      component: Categories,
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
        path: '/register',
        name: 'register',
        component: Register
    },
    {
      path: '/categories/:categoryId',
      name: 'category-notes',
      component: CategoryNotes,
      props: true,
      meta: { requiresAuth: true }
    },
     {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' });
  } else if ((to.name === 'login' || to.name === 'register') && token) {
      next({ name: 'categories' });
  } else {
    next();
  }
});

export default router