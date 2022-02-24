import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Subscribe from '../views/Subscribe/index.vue';
import entryForm from '../views/Subscribe/entryForm.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/lives/watch/:id',
    component: Home,
    name: 'LiveRoom',
    meta: { title: '直播间' }
  },
  {
    path: '/lives/subscribe/:id',
    component: Subscribe,
    name: 'Subscribe',
    meta: { title: '预约' }
  },
  {
    path: '/lives/entryform/:id',
    component: entryForm,
    name: 'entryForm',
    meta: { title: '独立报名表单' }
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.ROUTER_BASE_URL,
  routes
});

export default router;
