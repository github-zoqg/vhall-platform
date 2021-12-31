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
        class="vmp-chat-filter--btn"
        :href="filterUrl"
        target="_blank"
        @click="sendMsgFilter"
      >
        开启手动过滤
      </a>
      <a v-if="isAssistant" class="vmp-chat-filter--btn" @click="sendMsgToAssistant">
        开启手动过滤
      </a>
    </div>
  </transition>
</template>

<script>
  import EventBus from '../js/Events.js';
  export default {
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
        userId: window.sessionStorage.getItem('userInfo').third_party_user_id || ''
      };
    },
    mounted() {
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
      handleChange(e) {
        this.setAllBanned(e.target.checked);
      },
      toggleShow() {
        this.chatFilterShow = !this.chatFilterShow;
      },
      setAllBanned(flag) {
        this.$fetch('setAllBanned', {
          room_id: this.roomId,
          status: flag ? 1 : 0
        })
          .then(res => {
            this.$vhall_paas_port({
              k: flag ? 110116 : 110117,
              data: {
                business_uid: this.userId,
                user_id: '',
                webinar_id: this.webinarId,
                refer: '',
                s: '',
                report_extra: {},
                ref_url: '',
                req_url: ''
              }
            });
            // this.bannedAll = !this.bannedAll
          })
          .catch(error => {
            this.$message.error(error.msg);
          });
      },
      sendMsgFilter() {
        this.$vhall_paas_port({
          k: 110118,
          data: {
            business_uid: this.userId,
            user_id: '',
            webinar_id: this.webinarId,
            refer: '',
            s: '',
            report_extra: {},
            ref_url: '',
            req_url: ''
          }
        });
      },
      sendMsgToAssistant() {
        this.$vhall_paas_port({
          k: 110118,
          data: {
            business_uid: this.userId,
            user_id: '',
            webinar_id: this.webinarId,
            refer: '',
            s: '',
            report_extra: {},
            ref_url: '',
            req_url: ''
          }
        });
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

    &--btn {
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
