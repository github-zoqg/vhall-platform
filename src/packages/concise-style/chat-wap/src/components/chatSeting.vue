<template>
  <span class="icon-wrap-chat_set">
    <span @click="openSet">
      <i class="vh-iconfont vh-line-audit"></i>
    </span>
    <van-popup
      class="chat_set_base"
      overlay-class="van-overlay_chat_set"
      get-container="#app"
      v-model="isShowSet"
      position="bottom"
    >
      <div class="vmp-chat_set_container">
        <div class="container-title">
          <span class="container-title-text">{{ $t('chat.chat_1095') }}</span>
          <i class="vh-iconfont vh-line-close" @click="closeSet"></i>
        </div>
        <van-cell center :title="$t('chat.chat_1012')" class="set_line_h">
          <template #right-icon>
            <van-switch
              v-model="onlyShowSponsor"
              @change="changeSponsor"
              active-color="#FB2626"
              inactive-color="#D9D9D9"
              size="20"
            />
          </template>
        </van-cell>
        <van-cell center :title="$t('chat.chat_1094')" class="set_line_h">
          <template #right-icon>
            <van-switch
              v-model="isChat"
              @change="changeChat"
              active-color="#FB2626"
              inactive-color="#D9D9D9"
              size="20"
            />
          </template>
        </van-cell>
        <van-cell center :title="$t('chat.chat_1013')" class="set_line_h">
          <template #right-icon>
            <van-switch
              v-model="isShieldingEffects"
              @change="changeEffects"
              active-color="#FB2626"
              inactive-color="#D9D9D9"
              size="20"
            />
          </template>
        </van-cell>
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
        noticeNumIsWatch: sessionStorage.getItem(this.$route.params.id) || 0,
        isChat: sessionStorage.getItem('only_isChat') == 'true',
        onlyShowSponsor: sessionStorage.getItem('onlyShowSponsor') == 'true',
        isShieldingEffects: sessionStorage.getItem('isShieldingEffects') == 'true'
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
    created() {},
    mounted() {},
    methods: {
      openSet() {
        this.isShowSet = true;
      },
      closeSet() {
        this.isShowSet = false;
      },
      // 特效
      changeEffects(val) {
        sessionStorage.setItem('isShieldingEffects', val);
        this.isShieldingEffects = val;
        this.$emit('filterChat', false);
        // let message = val ? this.$t('chat.chat_1016') : this.$t('chat.chat_1017');
        // this.$message.success(message);
      },
      // 聊天
      changeChat(val) {
        sessionStorage.setItem('only_isChat', val);
        // let message = val ? this.$t('chat.chat_1014') : this.$t('chat.chat_1015');
        // this.$message.success(message);
        this.isChat = val;
        this.$emit('filterChat', true);
      },
      // 主办方
      changeSponsor(val) {
        sessionStorage.setItem('onlyShowSponsor', val);
        this.onlyShowSponsor = val;
        this.$emit('filterChat', true);
        // let message = val ? this.$t('chat.chat_1014') : this.$t('chat.chat_1015');
        // this.$message.success(message);
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
    .vh-line-audit {
      padding-right: 10px;
      border-right: 3px solid #d9d9d9;
    }
  }
  .van-overlay_chat_set {
    background-color: rgba(0, 0, 0, 0.7) !important;
  }
  .chat_set_base {
    max-height: 680px;
    border-radius: 30px 30px 0 0;
    .vmp-chat_set_container {
      max-height: 680px;
      padding-bottom: 30px;
      .set_line_h {
        line-height: 100px;
        padding: 0 40px;
        font-size: 32px;
      }
      .set_line_h::after {
        border: 0;
      }
      .container-title {
        height: 142px;
        text-align: center;
        position: relative;
        .container-title-text {
          font-weight: 500;
          font-size: 32px;
          color: #000;
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
        right: 36px;
        cursor: pointer;
      }
    }
  }
</style>
