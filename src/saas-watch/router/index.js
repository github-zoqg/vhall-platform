import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Subscribe from '../views/Subscribe/index.vue';
import entryForm from '../views/Subscribe/entryForm.vue';
import forgetPwd from '../views/forgetPwd/index.vue';
import grayInit from '@/packages/app-shared/gray-init';

Vue.use(VueRouter);

const routes = [
  {
    path: '/lives/watch/:id',
    component: Home,
    name: 'LiveRoom',
    meta: { title: '直播间', grayType: 'webinar' }
  },
  {
    path: '/lives/subscribe/:id',
    component: Subscribe,
    name: 'Subscribe',
    meta: { title: '预约', grayType: 'webinar' }
  },
  {
    path: '/lives/entryform/:id',
    component: entryForm,
    name: 'entryForm',
    meta: { title: '独立报名表单' }
  },
  {
    path: '/forgetPwd',
    component: forgetPwd,
    name: 'forgetPwd',
    meta: { title: '忘记密码' }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.ROUTER_BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  await grayInit(to);
  next();
});

export default router;
