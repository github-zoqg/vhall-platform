<template>
  <span class="icon-wrap-chat_set">
    <span @click="openSet">+</span>
    <!-- 问卷列表弹框 -->
    <van-popup
      get-container="#otherPopupContainer"
      class="chat_set_base"
      v-model="isShowSet"
      position="bottom"
    >
      <div class="vmp-chat_set_container">
        <div class="container-title">
          <span class="container-title-text">{{ $t('聊天设置') }}</span>
          <i class="vh-iconfont vh-line-close" @click="closeSet"></i>
        </div>
      </div>
    </van-popup>
  </span>
</template>
<script>
  import { useNoticeServer, useRoomBaseServer, useGroupServer } from 'middle-domain';
  export default {
    name: 'QuestionnaireIcon',
    data() {
      return {
        noticeNum: 0,
        isShowSet: false,
        isShowNotice: false, //是否显示公告列表
        noticeList: [],
        noticeNumIsWatch: sessionStorage.getItem(this.$route.params.id) || 0
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      noticeLatestInfo() {
        // 最新公告信息
        return this.roomBaseServer.state.noticeInfo;
      }
    },
    watch: {},
    beforeCreate() {
      this.noticeServer = useNoticeServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    created() {
      this.getNoticeInfo();
    },
    mounted() {
      this.initNotice();
    },
    methods: {
      openSet() {
        this.isShowSet = true;
      },
      closeSet() {
        this.isShowSet = false;
      }
    }
  };
</script>

<style lang="less">
  .icon-wrap-chat_set {
    margin-bottom: 10px;
    width: 84px;
    height: 84px;
    position: relative;
    font-size: 28px;
    background: linear-gradient(180deg, #fca810 0%, #fe7d00 100%);
    .van-overlay {
      background-color: rgba(0, 0, 0, 0.7) !important;
    }
    .chat_set_base {
      max-height: 680px;
      background: transparent;
      background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
      border-radius: 30px 30px 0 0;
    }
    .vmp-chat_set_container {
      max-height: 680px;
      overflow: auto;
      .container-title {
        height: 142px;
        background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
        text-align: center;
        position: relative;
        .container-title-text {
          text-shadow: 0 0.05333rem 0 #fff;
          font-weight: 600;
          font-size: 40px;
          line-height: 56px;
          position: relative;
          top: 47px;
          z-index: 1;
        }
      }
      .vh-line-close {
        position: absolute;
        color: #8c8c8c;
        top: 37px;
        right: 30px;
        cursor: pointer;
      }
    }
  }
</style>
