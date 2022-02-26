import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import NotFound from '../views/NotFound.vue';
import ChatAuth from '@/packages/chat-auth/index';
import PasswordLogin from '@/packages/password-login/index';
import grayInit from '@/packages/app-shared/gray-init';

Vue.use(VueRouter);

const routes = [
  {
    path: '/lives/room/:id',
    component: Home,
    name: 'LiveRoom',
    meta: { title: '直播间', grayType: 'webinar' }
  },
  {
    path: '/lives/recordvideo/:id',
    component: () => import('../views/RecordVideo/index.vue'),
    name: 'RecordVideo',
    meta: { title: '录制视频' }
  },
  {
    path: '/lives/keylogin/:id/:role_name',
    name: 'KeyLogin',
    component: PasswordLogin,
    meta: { title: '口令登录', grayType: 'webinar' }
  },
  {
    path: '/lives/keylogin-host/:id/:role_name',
    name: 'KeyLoginHost',
    component: PasswordLogin,
    meta: { title: '口令登录', grayType: 'webinar' }
  },
  {
    path: '/lives/chat-auth/:id',
    name: 'ChatAuth',
    component: ChatAuth,
    meta: { title: '聊天审核', grayType: 'webinar' }
  },
  {
    path: '/lives/qa/:id',
    name: 'qa',
    component: () => import(/* webpackChunkName: "qa" */ '@/packages/qa/main.vue'),
    meta: { title: '问答', grayType: 'webinar' }
  },
  {
    // 其它没有匹配到的路由都会跳至此模块(404）
    // 该路由为必须路由，不需要权限，必须放在最后
    path: '*',
    name: 'notfound',
    component: NotFound,
    meta: { keepAlive: false, grayType: '' }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.ROUTER_BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  console.log('---grayInit---');
  await grayInit(to);
  next();
});

export default router;
