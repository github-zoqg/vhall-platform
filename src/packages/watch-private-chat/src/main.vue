<template>
  <div class="vmp-watch-private-chat">
    <!--消息区域-->
    <div class="private-chat-content" :style="{ height: 'calc(100% - ' + operatorHeight + 'px)' }">
      <overlay-scrollbars
        ref="chatContent"
        :options="overlayScrollBarsOptions"
        style="height: 100%"
      >
        <template v-for="msg in chatList">
          <msg-item :key="msg.count" :msg="msg" :role-name="roleName"></msg-item>
        </template>
      </overlay-scrollbars>
      <div class="private-chat-content__tip-box">
        <div
          v-show="unReadMessageCount !== 0 && isHasUnreadNormalMsg"
          class="private-chat-content__tip-box-content"
          @click="scrollToTarget"
        >
          {{ tipMsg }}
          <span class="iconfont iconyourennijiantou"></span>
        </div>
      </div>
    </div>
    <!--操作栏-->
    <chat-operate
      ref="privateChatOperator"
      :chat-list="chatList"
      :chat-login-status="chatLoginStatus"
      :input-status="inputStatus"
      :latestMessage="latestMessage"
      @chatTextareaHeightChange="handleHeightChange"
      @performScroll="performScroll"
    ></chat-operate>
  </div>
</template>

<script>
  import defaultAvatar from '@/packages/chat/src/images/my-dark@2x.png';
  import msgItem from './components/msg-item';
  import chatOperate from './components/chat-operate';
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpWatchPrivateChat',
    components: {
      msgItem,
      chatOperate
    },
    data() {
      return {
        defaultAvatar,
        //私聊的列表 todo 假数据待移除，由domain维护
        chatList: [
          {
            uv: 1,
            data: '6666\n',
            msg_source: 'prefix01',
            pv: 1,
            channel: 'ch_ZKv4Oe7c',
            sender_id: '16422770',
            service_type: 'service_im',
            bu: '1',
            date_time: '2022-01-19 16:58:23',
            context: {
              role_name: 1,
              app: 'vhall',
              user_role: 1,
              form: 'self',
              user_id: '16422770',
              user_name: '春有百花秋有月 夏有凉风冬有雪，若无闲事挂心头便是人间好时节',
              nick_name: '春有百花秋有月 夏有凉风冬有雪，若无闲事挂心头便是人间好时节',
              nickname: '春有百花秋有月 夏有凉风冬有雪，若无闲事挂心头便是人间好时节',
              avatar:
                'https://t-alistatic01.e.vhall.com/upload/users/face-imgs/08/2e/082ea1e5abcba87b5d5c57600c1bbec3.jpg',
              to: '100696'
            },
            client: 'pc_browser',
            msg_id: 'msg_7cbeb9b0578f4da7b62f89b03623d2b8',
            app_id: 'fd8d3653'
          },
          {
            uv: 1,
            data: '9999<img width="24" height="24" style="vertical-align:text-bottom;" src="https://cnstatic01.e.vhall.com/static/img/arclist/Expression_1@2x.png"/>',
            msg_source: 'prefix01',
            pv: 1,
            channel: 'ch_ZKv4Oe7c',
            sender_id: '100696',
            service_type: 'service_im',
            bu: '1',
            date_time: '2022-01-19 17:22:03',
            context: {
              role_name: 2,
              app: 'vhall',
              account_id: '100696',
              user_id: '100696',
              user_name: '春有百花秋有月 夏有凉风冬有雪，若无闲事挂心头便是人间好时节',
              nick_name: '测试人员5',
              to: '16422770',
              avatar: ''
            },
            client: 'pc_browser',
            msg_id: 'msg_f1a51f206f664db4a8254a98188a2372',
            app_id: 'fd8d3653'
          }
        ],
        //私聊是否需要登录
        chatLoginStatus: false,
        //滚动插件配置
        overlayScrollBarsOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-light os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          }
        },
        //是否滚动
        doScroll: false,
        //操作栏高度
        operatorHeight: 91,
        //是否在执行动画
        animationRunning: false,
        //是否有正常的未读消息 todo domain提供事件监听
        isHasUnreadNormalMsg: false,
        //未读消息数量
        unReadMessageCount: 0,
        //输入框状态
        inputStatus: {
          disable: false,
          placeholder: '参与聊天'
        },
        //禁言状态 todo domain提供事件监听
        isBanned: false,
        //全体禁言状态 todo domain提供事件监听
        allBanned: false,
        //是否是初始化私聊tab todo 预留
        isFirstPrivateChat: false,
        //最新的消息 todo domain负责事件那部分提供提示消息
        latestMessage: {},
        //用户角色
        roleName: '',
        //配置信息
        configList: {},
        //提示消息 todo domain负责事件那部分提供提示消息
        tipMsg: {}
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    mounted() {},
    methods: {
      //初始化视图数据
      initViewData() {
        const { configList = {}, watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {} } = watchInitData;
        this.configList = configList;
        this.roleName = join_info.role_name;
      },
      //滚动到指定目标处
      scrollToTarget() {},
      //响应高度变化
      handleHeightChange(height) {
        this.operatorHieght = height;
        this.$refs.privateChatOperator.overlayScrollbar.update();
      },
      //执行滚动处理
      performScroll() {
        this.$nextTick(() => {
          this.animationRunning = true;
          this.osInstance.scrollStop().scroll({ y: '100%' }, 250, 'linear', () => {
            this.animationRunning = false;
          });
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-watch-private-chat {
    position: relative;
    width: 100%;
    //flex: 1;
    height: calc(100% - 20px);
    .private-chat-content {
      position: relative;
      &:last-child {
        padding-bottom: 20px;
      }
      &__tip-box {
        position: absolute;
        z-index: 1;
        bottom: 5px;
        left: 50%;
        transform: translate(-50%, 0);
      }
      &__tip-box-content {
        padding: 0 14px;
        line-height: 28px;
        border-radius: 14px;
        background-color: #363636;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
        color: @font-error;
        font-size: 14px;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        .iconyourennijiantou {
          font-size: 12px;
          margin-left: 6px;
        }
      }
    }
    .private-chat-operate {
    }
  }
</style>
