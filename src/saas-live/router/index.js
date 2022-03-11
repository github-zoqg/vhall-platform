import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import NotFound from '../views/NotFound.vue';
import ChatAuth from '@/packages/chat-auth/index';
import PasswordLogin from '@/packages/password-login/index';
// import grayInit from '@/packages/app-shared/gray-init';
import { grayInitByMiddle } from '@/packages/app-shared/gray-init';

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
    component: () => import(/* webpackChunkName: "qa" */ '@/packages/qa-admin/main.vue'),
    meta: { title: '问答', grayType: 'webinar' }
  },
  {
    path: '/lives/split-screen/:id',
    name: 'SplitScreen',
    component: () => import('../views/SplitScreen.vue'),
    meta: { title: '分屏' }
  },
  {
    // 其它没有匹配到的路由都会跳至此模块(404）
    // 该路由为必须路由，不需要权限，必须放在最后
    path: '*',
    name: 'notfound',
    component: NotFound,
    meta: { keepAlive: false, grayType: '' }
  },
  {
    path: '/lives/client/:il_id', // 客户端嵌入
    name: 'Client',
    component: () => import('@/saas-live/views/clientEmbed/index')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.ROUTER_BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  const res = await grayInitByMiddle(to);
  console.log('---grayInit---', res);
  //处理限流逻辑
  if (res.code == 589) {
    // TODO:需要弹框提示
  } else if (res.code == 200) {
    //处理灰度
    const VUE_MIDDLE_SAAS_LIVE_PC_PROJECT = process.env.VUE_MIDDLE_SAAS_LIVE_PC_PROJECT;
    const VUE_APP_WEB_BASE_MIDDLE = process.env.VUE_APP_WEB_BASE_MIDDLE;
    let protocol = window.location.protocol;
    // 如果是中台用户, 跳转到中台
    if (res.data.is_csd_user == 1) {
      if (window.location.origin != `${protocol}${VUE_APP_WEB_BASE_MIDDLE}`) {
        window.location.href = `${protocol}${VUE_APP_WEB_BASE_MIDDLE}/${VUE_MIDDLE_SAAS_LIVE_PC_PROJECT}${window.location.pathname}`;
      }
    }
  } else {
    // console.log('grayInit------------>', res);
  }
  next();
});

export default router;
