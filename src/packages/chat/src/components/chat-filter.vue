<template>
  <transition name="vmp-chat-filter-slide">
    <div class="vmp-chat-filter" v-show="chatFilterShow">
      <p class="vmp-chat-filter__operate">
        <input
          class="vmp-chat-filter__operate--input"
          v-model="bannedAll"
          @change="handleChange"
          type="checkbox"
          id="disableSendMsg"
        />
        <label class="vmp-chat-filter__operate--label" for="disableSendMsg">全员禁言</label>
      </p>
      <a
        v-if="!isAssistant"
        class="vmp-chat-filter__button"
        :href="filterUrl"
        target="_blank"
        @click="sendMsgFilter"
      >
        开启手动过滤
      </a>
      <a v-if="isAssistant" class="vmp-chat-filter__button" @click="sendMsgToAssistant">
        开启手动过滤
      </a>
    </div>
  </transition>
</template>

<script>
  import EventBus from '../js/Events.js';
  import { useChatServer } from 'middleDomain';
  import dataReportMixin from '@/packages/chat/src/mixin/data-report-mixin';
  export default {
    mixins: [dataReportMixin],
    props: {
      webinarId: {
        required: true
      },
      roomId: {
        required: true
      },
      allBanned: {
        required: true
      },
      chatFilterUrl: {
        required: true // 聊天过滤的跳转路径
      },
      isAssistant: {
        required: true
      }
    },
    data() {
      return {
        chatFilterShow: false,
        bannedAll: this.allBanned,
        filterUrl: '',
        userId: ''
      };
    },
    beforeCreate() {
      this.chatServer = useChatServer();
    },
    mounted() {
      //todo 考虑放配置或者domain
      this.filterUrl = this.chatFilterUrl;
      // 全体禁言
      EventBus.$on('disable_all', () => {
        this.bannedAll = true;
      });
      // 取消全体禁言
      EventBus.$on('permit_all', () => {
        this.bannedAll = false;
      });
    },
    methods: {
      //根据复选框的状态来决定是否开启/关闭全体禁言
      handleChange(e) {
        this.setAllBanned(e.target.checked);
      },
      //切换聊天审核模态窗展示
      toggleShow() {
        this.chatFilterShow = !this.chatFilterShow;
      },
      //开启 / 关闭 全体禁言
      //todo domain负责这部分逻辑，以及上报
      setAllBanned(flag) {
        let params = {
          room_id: this.roomId,
          status: flag ? 1 : 0
        };
        this.chatServer
          .setAllBanned(params)
          .then(res => {
            this.buriedPointReport(flag ? 110116 : 110117, {
              business_uid: this.userId,
              webinar_id: this.webinarId
            });
            return res;
          })
          .catch(error => {
            this.$message.error(error.msg);
          });
      },
      sendMsgFilter() {
        this.buriedPointReport(110118, { business_uid: this.userId, webinar_id: this.webinarId });
      },
      /**
       * 开启手动过滤
       * */
      sendMsgToAssistant() {
        this.buriedPointReport(110118, { business_uid: this.userId, webinar_id: this.webinarId });
        EventBus.$emit('chatFilterUrl', this.filterUrl);
      }
    }
  };
</script>
<style lang="less">
  .vmp-chat-filter {
    position: absolute;
    top: 0;
    right: 10px;
    transform: translateY(-100%);
    background: #fff;
    padding: 11px 10px 11px 12px;
    width: 148px;
    box-sizing: border-box;
    border-radius: 2px;
    font-size: 12px;
    &__operate {
      margin-bottom: 25px;
      &--input {
        position: absolute;
        margin-top: 3px;
        cursor: pointer;
      }
      &--label {
        padding-left: 18px;
        color: #999;
        padding-bottom: 5px;
        cursor: pointer;
      }
    }

    &__button {
      display: block;
      color: #4da1ff;
      text-align: right;
    }
  }
  .vmp-chat-filter-slide-enter-active {
    transition: all 0.3s ease;
  }
  .vmp-chat-filter-slide-leave-active {
    transition: all 0.3s ease;
  }
  .vmp-chat-filter-slide-enter,
  .vmp-chat-filter-slide-leave-to {
    transform: translateY(0);
    opacity: 0;
  }
</style>
