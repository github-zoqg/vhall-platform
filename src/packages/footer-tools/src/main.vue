<template>
  <div class="vmp-footer-tools">
    <div class="vmp-footer-tools__left">
      <div class="vmp-footer-tools-left-setting" v-if="isInteractLive" @click="settingShow">
        <i class="vh-iconfont vh-line-setting"></i>
        设置
      </div>
      <div class="vmp-footer-tools-left-online" v-if="roomBaseState.watchInitData.online.show">
        <i class="vh-iconfont vh-line-user"></i>
        {{ onlineNum | formatHotNum }}
      </div>
      <div class="vmp-footer-tools-left-hot" v-if="roomBaseState.watchInitData.pv.show">
        <i class="vh-saas-iconfont vh-saas-line-heat"></i>
        {{ hotNum | formatHotNum }}
      </div>
    </div>
    <!-- <div class="vmp-footer-tools__right">
      <vmp-air-container :cuid="cuid"></vmp-air-container>
    </div> -->
    <!-- 上下麦按钮 -->
    <div class="vmp-footer-tools__center" v-if="isInteractLive">
      <handup></handup>
    </div>
    <!-- 互动工具 -->
    <ul v-if="!isTrySee" class="vmp-footer-tools__right">
      <li>
        <!-- 公告 -->
        <notice></notice>
      </li>
      <li>
        <!-- 问卷-->
      </li>
      <li>
        <!-- 签到 -->
      </li>
      <li v-if="isLiving">
        <!-- 抽奖 -->
      </li>
      <li>
        <!-- 红包 -->
      </li>
      <li v-if="isLiving">
        <!-- 计时器 -->
        <div v-if="openTimer" class="pr">
          <i v-if="showTimer" class="circle"></i>
          <img src="./img/timer.png" alt="" @click="openTimerHandle" />
        </div>
      </li>
      <li v-if="showGiftIcon">
        <!-- 礼物 -->
        <div class="vh-gifts-wrap">
          <img src="./img/iconGifts@2x.png" @click.stop="handleShowGift" />
          <!-- showCount展示次数，只有第一次点击礼物图标的时候才会调接口 -->
          <vh-gifts
            v-show="showGift && roomBaseState.watchInitData.interact.room_id"
            :roomId="roomBaseState.watchInitData.interact.room_id"
            :show-gift-count="showGiftCount"
          />
        </div>
      </li>
      <li>
        <!-- 打赏 -->
        <div class="vh-icon-box">
          <img src="./img/reward-icon.png" alt="" @click="onClickReward" />
          <reward ref="reward" />
        </div>
      </li>
      <li>
        <!-- 点赞 -->
        <praise></praise>
      </li>
    </ul>
  </div>
</template>
<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import { useMsgServer, useRoomBaseServer, useGroupServer } from 'middle-domain';
  import onlineMixin from './js/mixins';
  import handup from './handup.vue';
  import reward from './component/reward/index.vue';
  import vhGifts from './component/gifts/index.vue';
  import notice from './component/notice/index.vue';
  import praise from './component/praise/index.vue';
  export default {
    name: 'VmpFooterTools',
    mixins: [onlineMixin],
    data() {
      return {
        roomBaseState: null,
        showGiftIcon: true,
        showGift: false,
        showGiftCount: 0,
        openTimer: false,
        showTimer: false,
        groupInitData: {}
      };
    },
    components: {
      handup,
      reward,
      vhGifts,
      notice,
      praise
    },
    computed: {
      isInteractLive() {
        const { watchInitData } = this.roomBaseState;
        return (
          (watchInitData.webinar.mode == 3 || watchInitData.webinar.mode == 6) &&
          watchInitData.webinar.type == 1
        );
      },
      isLiving() {
        const { watchInitData } = this.roomBaseState;
        //是否正在直播  虚拟人数是否可以使用，只有直播的时候可以使用
        return watchInitData.webinar.type == 1;
      },
      isTrySee() {
        const { watchInitData } = this.roomBaseState;
        return (
          watchInitData.status == 'subscribe' &&
          watchInitData.preview_paas_record_id &&
          watchInitData.is_subscribe == 0
        );
      },
      isInGroup() {
        return this.groupServer.state.groupInitData.isInGroup;
      }
    },
    beforeCreate() {
      this.msgServer = useMsgServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    created() {
      window.addEventListener('click', () => {
        if (this.showGift) {
          this.showGift = false;
        }
      });
    },
    methods: {
      settingShow() {
        window.$middleEventSdk?.event?.send({
          cuid: this.cuid,
          method: 'emitClickMediaCheck' // TODO 设置媒体的弹窗方法
        });
      },
      changeStatus(data, status) {
        this[data] = status;
      },
      // 打开计时器弹框
      openTimerHandle() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenTimer'));
        this.changeStatus('showTimer', false);
      },
      // 打开礼物弹框
      handleShowGift() {
        this.showGift = !this.showGift;
        if (this.showGift) {
          this.showGiftCount++;
        }
        // TODO:是否需要处理
        this.$refs.notice && (this.$refs.notice.isShowNotice = false);
      },
      // 打开打赏弹框
      onClickReward() {
        this.$refs.reward.onClickReward();
      }
    }
  };
</script>
<style lang="less">
  .vmp-footer-tools {
    height: 56px;
    background: @bg-dark-section;
    line-height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    position: relative;
    z-index: 10;

    &__left {
      display: flex;
      align-items: center;
      color: @font-dark-normal;
      font-size: 14px;
      > div {
        margin-right: 16px;
        .iconfont {
          vertical-align: bottom;
        }
      }
      &-setting {
        cursor: pointer;
      }
    }
    &__right {
      display: flex;
      align-items: center;
      color: @font-dark-normal;
      font-size: 14px;
      > div {
        margin-left: 16px;
      }
      li > div > img {
        width: 32px;
        height: 32px;
        margin-left: 16px;
        border-radius: 16px;
        cursor: pointer;
      }
      .vh-gifts-wrap {
        border-radius: 16px;
        position: relative;
      }
    }
    &__center {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .circle {
      position: absolute;
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #fb3a32;
      border: 1px solid #2a2a2a;
      border-radius: 50%;
      top: 10px;
      right: 0px;
      position: absolute;
    }
    .pr {
      position: relative;
    }
  }
</style>
