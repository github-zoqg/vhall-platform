<template>
  <div class="vmp-notice-wap" :class="wapNoticeClass">
    <van-notice-bar
      class="notice"
      ref="notice"
      :text="announcement.content"
      :scrollable="true"
      color="#80511B"
      mode="closeable"
      v-if="announcement.isShow"
      @close="closeAnnouncement"
    >
      <i slot="left-icon" class="vh-iconfont vh-line-voice"></i>
    </van-notice-bar>
  </div>
</template>

<script>
  import { useNoticeServer, useRoomBaseServer, useGroupServer } from 'middle-domain';
  export default {
    name: 'VmpNoticeWap',
    data() {
      return {
        announcement: {
          content: '12313',
          isShow: false
        },
        mini: false
      };
    },
    computed: {
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      },
      isFixedIndex() {
        return this.$domainStore.state.menuServer.selectedType == 2 && this.isWapBodyDocSwitch;
      },
      isSmallPlayer() {
        return this.$domainStore.state.playerServer.isSmallPlayer;
      },
      // wap-body和文档是否切换位置
      isWapBodyDocSwitch() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitch;
      },
      wapNoticeClass() {
        let className = '';
        // showHeader: 是否展示顶部header组件，控制台配置
        // isWapBodyDocSwitch: wapBody 和 文档组件是否切换位置
        // isSmallPlayer: 音频播放器是否缩小
        // mini: 播放器是否是mini状态（打开问卷）
        if (this.mini || !this.isFixedIndex) return '';
        if (this.showHeader && this.isWapBodyDocSwitch) {
          className = 'vmp-notice-wap__bottom';
          if (this.isSmallPlayer) {
            className += ' vmp-notice-wap__bottom__small';
          }
          return className;
        }
        if (!this.showHeader && this.isWapBodyDocSwitch) {
          className = 'vmp-notice-wap__bottom-noheader';
          if (this.isSmallPlayer) {
            className += ' vmp-notice-wap__bottom-noheader__small';
          }
          return className;
        }
        return '';
      },
      /**
       * 是否显示头部
       */
      showHeader() {
        if (this.embedObj.embed || (this.webinarTag && this.webinarTag.organizers_status == 0)) {
          return false;
        } else {
          return true;
        }
      },
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      },
      // 主办方配置
      webinarTag() {
        return this.$domainStore.state.roomBaseServer.webinarTag;
      }
    },
    watch: {
      isInGroup(val) {
        this.announcement.isShow = false;
        this.openAnnouncement();
      }
    },
    beforeCreate() {
      this.noticeServer = useNoticeServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    mounted() {
      this.openAnnouncement();
      console.log(this.roomBaseServer, 'useRoomBaseServer123');
      // 监听到 公告
      this.noticeServer.$on('room_announcement', msg => {
        this.announcement = {
          content: msg.room_announcement_text,
          isShow: true
        };
      });
      // 直播结束自动关闭公告
      this.noticeServer.$on('live_over', () => {
        this.announcement.isShow = false;
      });
      // 结束讨论
      this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
        if (!this.isInGroup) {
          this.openAnnouncement();
        } else {
          this.announcement.isShow = false;
        }
      });
      this.groupServer.$on('GROUP_SWITCH_START', () => {
        this.announcement.isShow = false;
      });
    },
    methods: {
      questionnaireVisible(flag) {
        this.mini = flag;
      },
      examVisible(flag) {
        // this.mini = flag;
      },
      closeAnnouncement() {
        this.announcement.isShow = false;
      },
      openAnnouncement() {
        // 刷新展示最新一条公告&&为直播状态
        if (
          this.roomBaseServer.state.noticeInfo.total &&
          this.roomBaseServer.state.watchInitData.webinar.type == 1 &&
          !this.isInGroup
        ) {
          this.announcement = {
            content: this.roomBaseServer.state.noticeInfo.list[0]?.content.content,
            isShow: true
          };
        } else {
          this.announcement.isShow = false;
        }
      }
    }
  };
</script>

<style lang="less">
  @import url(./skins/notice.concise.less);
  .vmp-notice-wap {
    .notice {
      position: absolute;
      top: 80px;
      left: 0px;
      width: 100%;
      background: linear-gradient(59.32deg, #ffebe9 0%, #edecff 107.06%);
      .van-notice-bar__content {
        color: #262626;
      }
    }
    &__bottom {
      position: fixed;
      left: 0;
      top: 573px;
      width: 100%;
      z-index: 2;
      .notice {
        top: 0;
      }
    }
    &__bottom-noheader {
      position: fixed;
      left: 0;
      top: 502px;
      width: 100%;
      z-index: 2;
      .notice {
        top: 0;
      }
    }
    .vh-line-voice {
      color: #fb3a32;
      padding-right: 11px;
    }
  }
</style>
