<template>
  <div class="vmp-notice-column" v-if="isNoticeColumn">
    <div class="vmp-notice-column-wrap">
      <span class="vmp-notice-column-wrap-icons"><img src="./images/icon.png" alt="" /></span>
      <p class="vmp-notice-column-wrap-nowrap">
        <span class="vmp-notice-column-wrap-animated">
          <span id="vmp-notice-column-text">{{ noticeText }}</span>
        </span>
      </p>
      <span class="vmp-notice-column-wrap-close" @click="isNoticeColumn = false">
        <i class="iconfont iconguanbi_icon"></i>
      </span>
    </div>
  </div>
</template>
<script>
  import { useMsgServer, useRoomBaseServer } from 'middleDomain';
  export default {
    name: 'VmpNoticeColumn',
    data() {
      return {
        noticeText: '',
        isNoticeColumn: false
      };
    },
    beforeCreate() {
      this.msgServer = useMsgServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      this.initNotice();
    },
    methods: {
      initNotice() {
        // 公告消息
        this.msgServer.$on('ROOM_MSG', msg => {
          let msgs = JSON.parse(msg.data);
          if (msgs.type == 'room_announcement') {
            console.log(msg, msgs, '公告zhangxiao==========');
            this.isNoticeColumn = true;
            this.noticeText = msgs.room_announcement_text;
            this.animates();
          }
        });
      },
      animates() {
        this.$nextTick(() => {
          const noticeText = document.querySelector('#vmp-notice-column-text');
          const widthWrap = document.querySelector('.vmp-notice-column-wrap-nowrap').offsetWidth;
          const widthtext = noticeText.offsetWidth;
          let left = widthWrap;
          function render() {
            if (-left >= widthtext) {
              left = widthWrap;
            }
            left = left - 0.5;
            noticeText.style.marginLeft = left + 'px';
            window.requestAnimationFrame(render);
          }
          window.requestAnimationFrame(render);
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-notice-column {
    width: calc(100% - 380px);
    z-index: 12;
    position: absolute;
    top: 0;
    left: 0;
    height: 40px;
    background: rgba(255, 233, 209, 1);
    color: @font-error-low;
    border-radius: 4px 4px 0 0;
    height: 44px;
    line-height: 44px;
    font-size: 16px;
    &-wrap {
      display: flex;
      align-content: center;
      justify-content: space-between;
      margin: 0 24px 0 24px;
      &-icons {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 10px;
        line-height: 42px;
        img {
          width: 100%;
          height: 100%;
          object-fit: scale-down;
        }
      }
      &-nowrap {
        color: #ec7b03;
        font-size: 14px;
        overflow: hidden;
        width: 100%;
        flex: 1;
      }
      &-close {
        cursor: pointer;
        display: inline-block;
        font-size: 14px;
        color: #ec7b03;
        margin-left: 5px;
      }
    }
  }
</style>
