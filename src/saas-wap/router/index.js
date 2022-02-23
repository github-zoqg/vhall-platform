import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

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
  // 专题
  {
    path: '/special/detail',
    name: 'subject',
    component: () => import('../views/Subject/main.vue')
  },
  // 邀请卡
  {
    path: '/lives/invite/:id',
    name: 'inviteCard',
    component: () => import('../views/InviteCard/main.vue')
  },
  // 错误页、升级页
  {
    path: '/upgrading',
    name: 'upgrading',
    component: () => import('../views/Upgrading.vue')
  },
  {
    path: '/lives/bind/:id',
    name: 'bind',
    component: () => import('../views/bind'),
    meta: { grayType: '' }
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
