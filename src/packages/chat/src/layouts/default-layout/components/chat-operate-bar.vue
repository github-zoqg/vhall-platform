<template>
  <div
    :class="[
      'vmp-chat-operate-container',
      {
        'chat-operate-live': !isWatch
      }
    ]"
    ref="chatOperateContainer"
  >
    <div class="operate-container__tool-bar">
      <div class="operate-container__tool-bar__left">
        <!--表情-->
        <i class="vh-iconfont vh-line-expression" @click.stop="toggleEmoji"></i>
        <!--上传图片-->
        <template v-if="chatOptions && chatOptions.hasImgUpload">
          <!-- 聊天图片上传 -->
          <chat-img-upload
            class="operate-container__tool-bar__img-upload"
            ref="chatImgUpload"
            :room-id="roomId"
            :role-name="roleName"
            :disable="inputStatus.disable"
          ></chat-img-upload>
        </template>
        <!--只看主办方按钮-->
        <i
          class="vh-saas-iconfont vh-saas-a-line-zhikanzhubanfang"
          :class="{ 'is-filter-show': isFilterShow }"
          @click.stop="onClickFilterSetting"
          v-clickoutside="hidechatOptions"
          v-if="chatOptions && chatOptions.hasChatFilterBtn"
        >
          <!-- 过滤设置 -->
          <ul
            v-show="chatOptions && chatOptions.hasChatFilterBtn && isFilterShow"
            class="operate-container__tool-bar__chat-filter-wrap"
          >
            <li :class="['filter-item', { 'is-checkbox': filterStatus.onlyShowSponsor }]">
              <el-checkbox
                class="filter-item__checkbox"
                @change="onClickOnlyShowSponsor"
                v-model="filterStatus.onlyShowSponsor"
              >
                {{ $t('chat.chat_1012') }}
              </el-checkbox>
            </li>
            <li :class="['filter-item', { 'is-checkbox': filterStatus.isShieldingEffects }]">
              <el-checkbox
                class="filter-item__checkbox"
                @change="onClickShieldingEffects"
                v-model="filterStatus.isShieldingEffects"
              >
                {{ $t('chat.chat_1013') }}
              </el-checkbox>
            </li>
            <li :class="['filter-item', { 'is-checkbox': filterStatus.isChat }]">
              <el-checkbox
                class="filter-item__checkbox"
                @change="onClickChat"
                v-model="filterStatus.isChat"
              >
                {{ $t('chat.chat_1094') }}
              </el-checkbox>
            </li>
          </ul>
        </i>
        <!-- 表情选择 -->
        <div class="operate-container__tool-bar__emoji-wrap">
          <emoji ref="emoji" @emojiInput="emojiInput"></emoji>
        </div>
        <div class="operate-container__tool-bar__right">
          <template v-if="chatOptions && chatOptions.enableChatSetting">
            <!--聊天设置-->
            <!--          <i class="chat-setting-btn" @click.stop="openPrivateChatModal">-->
            <!--            {{ $t('common.common_1008') }}-->
            <!--          </i>-->
            <!-- 主持人不在小组或组长在小组显示聊天设置 -->
            <div
              class="chat-setting-btn--chat-auth"
              v-if="
                (roleName == 1 || roleName == 3 || roleName == 4) &&
                !isInGroup &&
                (configList['comment_check'] || configList['disable_msg'])
              "
            >
              <i
                class="chat-setting-btn vh-iconfont vh-line-audit"
                @click.stop="toggleChatSetingBoxIsShow"
              ></i>
              <div class="chat-setting-box" v-show="chatSetingBoxIsShow" @click.stop="">
                <div class="chat-setting-box__item_switch switch-box">
                  <span class="switch-title">屏蔽礼物特效</span>
                  <el-switch
                    class="switch"
                    v-model="filterStatus.isShieldingEffects"
                    inactive-color="#CECECE"
                    active-color="#fb3a32"
                    @change="onClickShieldingEffects"
                  />
                </div>
                <div class="chat-setting-box__item_switch switch-box switch-box_bottom">
                  <span class="switch-title">仅看聊天信息</span>
                  <el-switch
                    class="switch"
                    v-model="filterStatus.isChat"
                    inactive-color="#CECECE"
                    active-color="#fb3a32"
                    @change="onClickChat"
                  />
                  <span class="tip_only">仅对个人生效</span>
                </div>
                <div
                  class="chat-setting-box__item switch-box join-chat-btn"
                  v-if="configList['disable_msg']"
                >
                  <span class="switch-title">全体禁言</span>

                  <el-switch
                    class="switch"
                    :value="allBanned"
                    inactive-color="#CECECE"
                    active-color="#fb3a32"
                    @change="toggleMutedAllStatus"
                  />
                </div>
                <div class="chat-setting-box__item" v-if="showBannedCheckbox">
                  <el-checkbox
                    v-for="(item, index) in bannedMoudleList"
                    :key="index"
                    :label="item.name"
                    v-model="item.status"
                    :disabled="item.isDisable || !allBanned"
                    @change="setAllBanned(allBanned)"
                  ></el-checkbox>
                </div>
                <div
                  class="chat-setting-box__item join-chat-btn join-chat-but-col"
                  @click="joinChatAuth"
                  v-if="configList['comment_check']"
                >
                  进入聊天审核
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="operate-container__input-bar">
      <chat-input
        ref="chatInput"
        :chat-login-status="chatLoginStatus"
        :input-status="inputStatus"
        :chat-options="chatOptions"
        :chat-list="chatList"
        :at-list="atList"
        @needLogin="handleLogin"
        @clearUploadImg="clearUploadImg"
        @getUploadImg="updateImgUrls"
        @chatTextareaHeightChange="chatTextareaHeightChange"
      ></chat-input>
    </div>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { useGroupServer, useChatServer } from 'middle-domain';
  import Emoji from '../../../common/components/emoji.vue';
  import ChatImgUpload from '../../../common/components/chat-img-upload';
  import ChatInput from './chat-input';
  import { cl_openChatFilterUrl, cl_toast } from '@/app-shared/client/client-methods.js';
  export default {
    name: 'VmpChatOperateBar',
    components: {
      Emoji,
      ChatImgUpload,
      ChatInput
    },
    computed: {
      isInGroup() {
        // 在小组中
        return !!this.groupServer.state.groupInitData?.isInGroup;
      },
      joinRole() {
        return !!this.groupServer.state.groupInitData?.join_role;
      },
      configList() {
        return this.$domainStore.state.roomBaseServer.configList;
      },
      //活动状态(直播未开始，已开始，已结束)
      liveStatus() {
        const { watchInitData = {} } = this.$domainStore.state.roomBaseServer;
        const { webinar = {} } = watchInitData;
        return webinar.type;
      },
      // 是否观看端
      isWatch() {
        return !['send', 'record', 'clientEmbed'].includes(
          this.$domainStore.state.roomBaseServer.clientType
        );
      },
      //是否显示全体禁言复选框
      showBannedCheckbox() {
        return this.configList['ui.is_show_estoppel'];
      }
    },
    props: {
      //聊天配置
      chatOptions: {
        type: Object,
        default: () => {
          return {};
        }
      },
      //房间号
      roomId: {
        type: [Number, String],
        default: () => ''
      },
      //角色名
      roleName: {
        type: [String, Number],
        default: () => ''
      },
      //是否被禁言
      inputStatus: {
        type: Object,
        default: () => {
          return {
            placeholder: this.$t('chat.chat_1021'),
            disable: false
          };
        }
      },
      // 是否全体禁言
      allBanned: {
        type: Boolean,
        default: () => false
      },
      allBannedModuleList: {
        type: Object,
        default: () => {
          return {};
        }
      },
      //活动id
      webinarId: {
        type: [Number, String],
        default: () => {
          return '';
        }
      },
      //聊天登录状态
      chatLoginStatus: {
        type: Boolean,
        default: () => false
      },
      //聊天消息列表
      chatList: {
        type: Array,
        default: () => []
      },
      //@列表
      atList: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        //显示观众的过滤设置
        isFilterShow: false,
        //过滤状态集合
        filterStatus: {
          //只看主办方
          onlyShowSponsor: sessionStorage.getItem('filterStatus_isOnlyShowSponsor') == 'true',
          //屏蔽特效
          isShieldingEffects: sessionStorage.getItem('filterStatus_isShieldingEffects') == 'true',
          // 仅查看聊天内容
          isChat: sessionStorage.getItem('filterStatus_isChat') == 'true'
        },
        //聊天审核链接
        chatFilterUrl: `${process.env.VUE_APP_WEB_BASE}${process.env.VUE_APP_WEB_KEY}`,
        //是否是助理
        assistantType: this.$route.query.assistantType,
        //禁言模块列表
        bannedMoudleList: {
          chat: {
            status: true, //this.allBannedModuleList.chat_status,
            name: '聊天',
            isDisable: true
          },
          qa: {
            status: this.allBannedModuleList.qa_status,
            name: '问答',
            isDisable: false
          },
          privateChat: {
            status: this.allBannedModuleList.private_chat_status,
            name: '私聊',
            isDisable: false
          }
        },
        chatSetingBoxIsShow: false
      };
    },
    beforeCreate() {
      this.groupServer = useGroupServer();
    },
    mounted() {
      this.listenEvents();
      document.addEventListener('click', () => {
        if (this.chatSetingBoxIsShow) {
          this.chatSetingBoxIsShow = false;
        }
      });
    },
    methods: {
      listenEvents() {
        //监听全体禁言通知
        useChatServer().$on('allBanned', res => {});
      },
      //隐藏设置弹窗
      hidechatOptions() {
        this.isFilterShow = false;
      },
      //切换全体禁言开关状态
      toggleMutedAllStatus(val) {
        // if (this.liveStatus !== 1) {
        //   if (this.$route.query.assistantType) {
        //     cl_toast('error', '直播未开始禁止调用');
        //   } else {
        //     this.$message.error('直播未开始禁止调用');
        //   }
        //   return;
        // }
        this.setAllBanned(val);
        window.vhallReportForProduct?.report(val ? 110116 : 110117);
      },
      setAllBanned(status) {
        const { chat, qa, privateChat } = this.bannedMoudleList;
        this.$emit('changeAllBanned', {
          status,
          chat_status: chat.status,
          qa_status: qa.status,
          private_chat_status: privateChat.status
        });
      },
      //进入聊天审核
      joinChatAuth() {
        let url = '';
        if (location.search === '') {
          url = [this.chatFilterUrl, `/lives/authchat/${this.webinarId}`].join('');
        } else {
          url = [this.chatFilterUrl, `/lives/authchat/${this.webinarId}${location.search}`].join(
            ''
          );
        }
        if (this.$route.query.assistantType) {
          //客户端嵌入通知客户端打开聊天审核页面
          cl_openChatFilterUrl(url);
        } else {
          window.open(url, '_blank');
        }
      },
      //唤起登录
      handleLogin() {
        this.$emit('needLogin');
      },
      //切换表情模态窗展示
      toggleEmoji() {
        if (this.chatLoginStatus) {
          this.$message.warning(this.$t('510008'));
          return;
        }

        if (this.inputStatus.disable) {
          if (this.$route.query.assistantType) {
            cl_toast('warning', this.$t('chat.chat_1006'));
          } else {
            this.$message.warning(this.$t('chat.chat_1006'));
          }
          return;
        }
        this.$refs.emoji.toggleShow();
        // 关闭聊天设置弹框
        this.chatSetingBoxIsShow = false;
      },
      // 打开聊天设置box
      toggleChatSetingBoxIsShow() {
        this.chatSetingBoxIsShow = !this.chatSetingBoxIsShow;
        this.$refs.emoji.closeModal();
      },
      //将表情发送给input
      emojiInput(value) {
        this.$refs.chatInput.emojiInput(value);
      },
      //更新输入框组件里的图片
      updateImgUrls() {
        const images = this.$refs.chatImgUpload && this.$refs.chatImgUpload.getImgUrls();
        this.$refs.chatInput.updateImgUrls(images);
      },
      //清空上传图片组件里的图片
      clearUploadImg() {
        this.$refs.chatImgUpload && this.$refs.chatImgUpload.clearImgUrls();
      },
      //只看主办方
      onClickOnlyShowSponsor(status) {
        let message = status ? this.$t('chat.chat_1014') : this.$t('chat.chat_1015');
        if (this.$route.query.assistantType) {
          cl_toast('success', message);
        } else {
          this.$message.success(message);
        }
        sessionStorage.setItem('filterStatus_isOnlyShowSponsor', status);
        this.filterStatus.onlyShowSponsor = status;

        this.$emit('onSwitchShowSponsor', status);
      },
      //屏蔽特效
      onClickShieldingEffects(status) {
        let message = status ? this.$t('chat.chat_1016') : this.$t('chat.chat_1017');
        if (this.$route.query.assistantType) {
          cl_toast('success', message);
        } else {
          this.$message.success(message);
        }
        sessionStorage.setItem('filterStatus_isShieldingEffects', status);
        this.filterStatus.isShieldingEffects = status;
        this.$emit('onSwitchShowSpecialEffects', status);
      },
      // 仅查看聊天内容
      onClickChat(status) {
        let message = status ? this.$t('chat.chat_1096') : this.$t('chat.chat_1097');
        if (this.$route.query.assistantType) {
          cl_toast('success', message);
        } else {
          this.$message.success(message);
        }

        this.$emit('onSwitchShowIsChat', status);
        sessionStorage.setItem('filterStatus_isChat', status);
        this.filterStatus.isChat = status;
      },
      //点击筛选
      onClickFilterSetting() {
        this.isFilterShow = !this.isFilterShow;
        // 如果表情弹窗开启，则关闭
        if (this.$refs.emoji.isShow) {
          this.$refs.emoji.toggleShow();
        }
      },
      //响应输入框高度变化事件
      chatTextareaHeightChange() {
        this.$emit('updateHeight', this.$refs.chatOperateContainer.offsetHeight);
      },
      //更新滚动区域高度
      updateOverlayScrollbar() {
        this.$refs.chatInput.overlayScrollbar.update();
      },
      //处理回复消息
      handleReply(count) {
        this.$refs.chatInput.reply(count);
      },
      //处理@用户
      handleAtUser(accountId) {
        this.$refs.chatInput.atUser(accountId);
      },
      //打开私聊模态窗
      openPrivateChatModal() {
        this.$emit('openPrivateChatModal');
      }
    },
    watch: {
      allBannedModuleList: {
        handler: function (data) {
          this.bannedMoudleList.qa.status = data.qa_status;
          this.bannedMoudleList.privateChat.status = data.private_chat_status;
        },
        deep: true
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-operate-container {
    @active-color: var(--theme-color);
    @font-error: #fb3a32;
    display: flex;
    flex-direction: column;
    padding: 10px 24px;
    &.chat-operate-live {
      padding: 10px 10px;
    }
    border-top: 1px solid var(--tab-menu-bg-border);
    background-color: var(--chat-background-color-base);
    position: absolute;
    box-sizing: border-box;
    left: 0;
    right: 0;
    bottom: 0;
    .operate-container__tool-bar {
      display: flex;
      align-items: center;
      height: 19px;
      margin-bottom: 9px;
      position: relative;
      .vh-saas-a-line-zhikanzhubanfang {
        font-size: 18px;
        color: #999;
        margin-left: 10px;
        &:hover {
          color: #ccc;
          cursor: pointer;
        }
      }
      .is-filter-show {
        color: #ccc;
      }
      &__left {
        display: flex;
        justify-content: flex-start;
        flex: 1;
      }
      &__right {
        .chat-setting-btn {
          font-size: 14px;
          color: #999;
          cursor: pointer;
        }
        .chat-setting-btn--chat-auth {
          position: relative;
          font-size: 14px;
          color: #999;
          cursor: pointer;
          margin-right: auto;
          /* hack处理，增加hover的区域大小 */
          &:after {
            content: '';
            display: none;
            width: 100%;
            height: 100%;
            position: absolute;
            top: -100%;
            right: 0;
          }
          &:hover {
            color: @active-color;
            cursor: pointer;
            &:after {
              display: block;
            }
          }
        }
        .chat-setting-box {
          display: block;
          position: absolute;
          bottom: 26px;
          left: -14px;
          width: 212px;
          padding: 20px 24px 10px;
          border-radius: 4px;
          background-color: #fff;
          text-align: left;
          font-size: 12px;
          color: #555;
          .tip_only {
            line-height: 29px;
            color: #666;
            font-size: 12px;
            margin-left: 8px;
          }
          .el-switch__core {
            width: 28px !important;
            height: 16px;
          }
          .el-switch__core:after {
            width: 12px;
            height: 12px;
          }
          .el-switch.is-checked .el-switch__core::after {
            margin-left: -13px;
          }
          .el-checkbox__input.is-disabled .el-checkbox__inner {
            background-color: #e6e6e6;
          }
          &__item {
            height: 29px;
            line-height: 29px;
            padding-bottom: 4px;
            color: #1a1a1a;
          }
          &__item_switch {
            color: #1a1a1a;
            line-height: 29px;
          }
          .switch-box_bottom {
            padding-bottom: 6px;
          }
          .el-checkbox {
            color: #1a1a1a;
            font-size: 12px;
            margin-right: 22px;
            font-weight: 400;
            &.is-disabled {
              .el-checkbox__label {
                color: #b3b3b3 !important;
              }

              .el-checkbox__input.is-checked .el-checkbox__inner {
                background-color: #b3b3b3 !important;
                border-color: #b3b3b3 !important;
              }
            }
            .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
              border-color: #fff;
            }
          }
          .el-checkbox__label {
            font-size: 12px;
          }
          .el-checkbox__input.is-checked + .el-checkbox__label {
            color: #1a1a1a;
          }
          .switch-box {
            .switch-title {
              display: inline-block;
              vertical-align: middle;
              margin-right: 8px;
            }
          }
          .join-chat-btn {
            border-top: 1px solid #e2e2e2;
            padding-top: 6px;
          }
          .join-chat-but-col {
            color: #3562fa;
          }
        }
      }
      &__emoji-wrap {
        width: 294px;
        position: absolute;
        top: 0;
        transform: translateY(-100%);
        left: 0;
      }
      &__chat-filter-wrap {
        // width: 120px;
        // height: 80px;
        padding: 4px 0;
        background-color: var(--header-tab-item-dropdown-color);
        box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
        border-radius: 4px;
        position: absolute;
        top: -11px;
        left: 15px;
        transform: translateY(-100%);
        .filter-item {
          height: 40px;
          line-height: 40px;
          padding-left: 15px;
          display: flex;
          align-items: center;
          cursor: pointer;
          &:hover {
            .filter-item__label {
              color: #e6e6e6;
            }
          }
          .el-checkbox {
            &.is-checked {
              background-color: var(--chat-bg-color-filter-checked);
              .el-checkbox__label {
                color: var(--chat-font-color-filter-checked);
              }
              .el-checkbox__inner {
                background-color: var(--chat-bg-color-checkbox-checked);
                border-color: var(--chat-bg-color-checkbox-checked);
              }
            }
          }
        }
        .filter-item__checkbox {
          display: inline-block;
          margin-right: 8px;
          position: relative;
          color: var(--chat-font-color-filter);
          font-size: 14px;
        }
        .el-checkbox__label {
          font-size: 14px;
          color: var(--chat-font-color-filter);
        }

        .el-checkbox__inner {
          border: 1px solid var(--chat-bg-color-checkbox);
        }
      }
      .vh-iconfont {
        color: #999;
        font-size: 19px;
        cursor: pointer;
        &.active {
          color: @active-color;
        }
        &:hover {
          color: @font-error;
          cursor: pointer;
        }
        &.pic-disabled {
          pointer-events: none;
        }
        &.vh-line-expression {
          font-size: 18px;
        }

        margin-left: 10px;
      }
      .icon-common {
        width: 24px;
        color: #999;
        height: 24px;
        font-size: 18px;
        background-size: 100%;
        background-repeat: no-repeat;
        background-position: center;
      }
      .vh-line-expression {
        font-size: 18px;
        color: #999;
        margin-left: 0;
      }
    }
    .operate-container__input-bar {
    }
  }
</style>
