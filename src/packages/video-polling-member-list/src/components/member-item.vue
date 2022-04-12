<template>
  <div class="vmp-video-polling-member-item">
    <section class="member-item__left">
      <img class="member-item__left-avatar" :src="userInfo.avatar || defaultAvatar" alt="" />
      <p class="member-item__left-nickname">{{ userInfo.nickname }}</p>
    </section>
    <section class="member-item__right">
      <span v-if="userInfo.isPolling" class="member-item__right-status__polling">展示中</span>
      <span v-else-if="userInfo.is_speak" class="member-item__right-status__mic">上麦中</span>
      <span
        v-else-if="userInfo.device_status == 2"
        class="member-item__right-status__device vh-iconfont vh-full-warning"
      ></span>
    </section>
  </div>
</template>

<script>
  import defaultAvatar from '@/packages/app-shared/assets/img/my-dark@2x.png';
  import phoneImg from '@/packages/app-shared/assets/img/phone.png';
  export default {
    name: 'VmpMemberItem',
    filters: {},
    props: {
      //成员信息
      userInfo: {
        type: Object,
        required: true,
        default: () => {
          return {};
        }
      }
    },
    mounted() {},
    data() {
      return {
        //默认头像
        defaultAvatar: defaultAvatar,
        //手机图片标识
        phoneImg: phoneImg
      };
    },
    computed: {},
    methods: {}
  };
</script>

<style lang="less">
  .vmp-video-polling-member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48px;
    .member-item__left {
      display: flex;
      align-items: center;
      height: 48px;
      &-avatar {
        width: 30px;
        height: 30px;
        border-radius: 15px;
        overflow: hidden;
        margin-left: 24px;
        margin-right: 10px;
      }
      &-nickname {
        max-width: 224px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        color: #999;
      }
    }
    .member-item__right {
      margin-right: 24px;
      line-height: 48px;
      height: 48px;
      &-status__polling {
        color: #fa9a32;
      }
      &-status__mic {
        color: #0a7ff5;
      }
      &-status__device {
        color: #fb3a21;
      }
    }
  }
</style>
