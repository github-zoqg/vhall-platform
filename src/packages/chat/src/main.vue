<template>
  <div class="vmp-chat-container" :class="{ assistant: assistantType }">
    <!-- 消息主体区域 -->
    <div
      class="chat-content"
      ref="chatContent"
      :style="{ height: 'calc(100% - ' + operatorHeight + 'px)' }"
    >
      <overlay-scrollbars
        ref="chatMessageAreaScroll"
        :options="overlayScrollBarsOptions"
        style="height: 100%"
      >
        <template v-for="(msg, index) in chatList">
          <msg-item
            :key="msg.msgId"
            :msg="msg"
            :pre-msg="chatList[index - 1]"
            v-show="checkMessageShow(msg)"
            :chat-options="chatOptions"
            :role-name="roleName"
            :join-info="joinInfo"
            @dispatchEvent="msgEventHandleDisPatch"
            @lotteryCheck="lotteryCheck"
            @questionnaireCheck="questionnaireCheck"
            @previewImg="previewImg"
          ></msg-item>
        </template>
        <!-- 如果开启观众手动加载聊天历史配置项，并且聊天列表为空的时候显示加载历史消息按钮 -->
        <p
          v-if="[1, '1'].includes(configList['ui.hide_chat_history']) && !chatList.length"
          class="chat-content__get-list-btn-container"
        >
          <span class="chat-content__get-list-btn" @click="getHistoryMsg">
            {{ $t('chat.chat_1058') }}
          </span>
        </p>
      </overlay-scrollbars>
      <div
        v-if="![1, '1'].includes(configList['ui.hide_chat_history'])"
        class="chat-content__tip-box"
      >
        <div
          v-show="
            unReadMessageCount !== 0 &&
            (isHasUnreadNormalMsg || isHasUnreadAtMeMsg || isHasUnreadReplyMsg)
          "
          class="chat-content__tip-box-content"
          @click="scrollToTarget"
        >
          {{ tipMsg }}
          <span class="vh-iconfont vh-line-arrow-down"></span>
        </div>
      </div>
    </div>
    <div class="chat-operate-bar">
      <chat-operate-bar
        ref="chatOperator"
        :chat-options="chatOptions"
        :room-id="roomId"
        :role-name="roleName"
        :input-status="inputStatus"
        :webinar-id="webinarId"
        :all-banned="allBanned"
        :chat-list="chatList"
        :at-list="atList"
        :chat-login-status="chatLoginStatus"
        @changeAllBanned="handleChangeAllBanned"
        @openPrivateChatModal="openPrivateChatModal"
        @onSwitchShowSpecialEffects="onSwitchShowSpecialEffects"
        @ononSwitchShowSponsor="onSwitchShowSponsor"
        @updateHeight="chatOperateBarHeightChange"
      ></chat-operate-bar>
      <img-preview
        ref="imgPreview"
        v-if="imgPreviewVisible"
        :images="previewImgList"
        @closeImgPreview="onClosePreviewImg"
      ></img-preview>
      <chat-user-control
        :roomId="roomId"
        :userId="userId"
        :reply="reply"
        @deleteMsg="deleteMsg"
        :atUser="atUser"
        :atList="atList"
      ></chat-user-control>
    </div>
    <!--礼物、打赏特效-->
    <ul
      v-show="!!this.chatOptions.hasChatFilterBtn && showSpecialEffects"
      class="chat-special-effect"
    >
      <li
        v-for="(msg, index) in specialEffectsList"
        v-show="msg.type !== 'reward_pay_ok' || !isEmbed"
        :key="msg.count"
        class="chat-special-effect__item"
        :class="{
          opacity0: msg.isTimeout,
          // 打赏动效背景class
          'bg-red-package': msg.type !== 'gift_send_success',
          // 默认礼物的背景class
          [effectsMap[msg.content.gift_name] || 'bg-custom']: msg.type === 'gift_send_success'
        }"
        :style="{ top: `${index * 48 + (index + 1) * 18 || 18}px` }"
      >
        <div class="special-effect__avatar-box">
          <img class="special-effect__avatar" :src="msg.avatar || defaultAvatar" alt="" />
        </div>
        <div class="special-effect__middle-content">
          <p class="middle-content__nick-name">
            {{ textOverflowSlice(msg.nickname, 8) }}
          </p>
          <p v-if="msg.type === 'gift_send_success'" class="middle-content__detail">
            {{ $t('chat.chat_1032') }} {{ $t(msg.content.gift_name) }}
          </p>
          <p v-if="msg.type == 'reward_pay_ok'" class="middle-content__detail">
            {{ msg.content.text_content }}
          </p>
        </div>
        <div
          v-if="msg.type == 'gift_send_success' && !effectsMap[msg.content.gift_name]"
          class="special-effect__img-box"
        >
          <img
            class="sepcial-effect__img"
            :src="msg.content.gift_url || require('./img/red-package-1.png')"
            alt=""
          />
        </div>
        <img
          v-if="msg.type == 'gift_send_success' && effectsMap[msg.content.gift_name]"
          class="sepcial-effect__img"
          :class="`sepcial-effect__img-${effectsMap[msg.content.gift_name]}`"
          :src="msg.content.gift_url || require('./img/red-package-1.png')"
          alt=""
        />
        <img
          v-if="msg.type === 'reward_pay_ok'"
          class="sepcial-effect__img-reward"
          :src="msg.content.gift_url || require('./img/red-package-1.png')"
          alt=""
        />
      </li>
    </ul>
  </div>
</template>

<script>
  import defaultAvatar from './img/my-dark@2x.png';
  import MsgItem from './components/msg-item.vue';
  import ImgPreview from './components/img-preview';
  import ChatUserControl from './components/chat-user-control';
  import ChatOperateBar from './components/chat-operate-bar';

  import eventMixin from './mixin/event-mixin';

  import { sessionOrLocal } from './js/utils';
  import { useChatServer, useRoomBaseServer, useGiftsServer } from 'middle-domain';
  import dataReportMixin from '@/packages/chat/src/mixin/data-report-mixin';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpChat',
    mixins: [eventMixin, dataReportMixin],
    components: {
      MsgItem,
      ImgPreview,
      ChatUserControl,
      ChatOperateBar
    },
    data() {
      const { chatList } = useChatServer().state;
      return {
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
        chatServerState: useChatServer().state,
        //默认兜底头像
        defaultAvatar,
        /** domain中读取的数据 */
        //配置列表
        configList: {},
        //活动id 打开手动过滤地址需要
        webinarId: '',
        //直播的类型，直播，回放
        playerType: '',
        //房间号
        roomId: '',
        //用户角色
        roleName: '',
        //用户id
        userId: '',
        //聊天消息列表
        chatList: chatList,
        //聊天消息页码
        page: 0,
        /** domain中读取的数据结束 */
        /** 消息提示 */
        //未读消息数量
        unReadMessageCount: 0,
        //是否有常规未读消息
        isHasUnreadNormalMsg: false,
        //是否有@我的未读消息
        isHasUnreadAtMeMsg: false,
        //是否有未读的回复消息
        isHasUnreadReplyMsg: false,
        /** 消息提示结束 */
        //是否正在执行动画
        animationRunning: false,
        //是否是助理
        assistantType: this.$route.query.assistantType,
        //todo 可以放入domain @用户
        atList: [],
        // 预览图片列表
        previewImgList: [],
        // 提示开关
        showTip: false,
        // 提示文字
        tipMsg: '',
        // 输入框状态
        inputStatus: {
          placeholder: this.$t('chat.chat_1021'),
          disable: false
        },
        isBanned: useChatServer().state.banned, //true禁言，false未禁言
        allBanned: useChatServer().state.allBanned, //true全体禁言，false未禁言
        // 聊天是否需要登录
        chatLoginStatus: false,
        //欢迎信息
        welcomeInfo: {
          required: false
        },
        //插件
        plugin: {
          image: false,
          emoji: false,
          audit: {
            show: true,
            src: 'javascript:;'
          }
        },
        //是否为嵌入页
        isEmbed: false,
        //图片预览弹窗是否可见
        imgPreviewVisible: false,
        //聊天配置
        chatOptions: {},
        //底部操作栏高度
        operatorHeight: 91,
        //是否展示礼物特效
        showSpecialEffects: true,
        //礼物特效数组
        specialEffectsList: [],
        //只看主办方
        isOnlyShowSponsor: false,
        //特效样式map
        effectsMap: {
          鲜花: 'bg-flower',
          咖啡: 'bg-coffee',
          赞: 'bg-praise',
          鼓掌: 'bg-applause',
          666: 'bg-666',
          'bg-custom': 'bg-custom'
        },
        //当前登录人信息
        joinInfo: {}
      };
    },
    computed: {
      //文字过长截取
      textOverflowSlice() {
        return function (val = '', len = 0) {
          if (['', void 0, null].includes(val) || ['', void 0, null].includes(len)) {
            return '';
          }
          if (val.length > len) {
            return val.substring(0, len) + '...';
          }
          return val;
        };
      },
      //检查消息项是否显示，实现只看主办方效果
      checkMessageShow() {
        return function (msg = {}) {
          let { roleName = '' } = msg;
          //如果开启了只看主办方
          return this.isOnlyShowSponsor ? ![2, '2'].includes(roleName) : true;
        };
      }
    },
    watch: {
      welcomeInfo: {
        handler(val) {
          if (val) {
            this.getMenuList(val);
          }
        },
        immediate: true,
        deep: true
      },
      chatList: {
        deep: true,
        handler() {
          // 如果滚动条未滚动至最底部
          if (this.osInstance.scroll().ratio.y !== 1) {
            this.unReadMessageCount++;
          }
        }
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      console.log('roomBaseState', this.roomBaseServer.state);
    },
    mounted() {
      //初始化配置
      this.initConfig();
      //初始化视图数据，domain里取
      this.initViewData();
      this.initInputStatus();
      this.init();
      // 1--是需要登录才能参与互动   0--不登录也能参与互动
      this.initChatLoginStatus();
      //初始化聊天区域滚动组件
      this.initScroll();
      //拉取聊天历史
      this.getHistoryMsg();
      //监听domain层chatServer通知
      this.listenChatServer();
    },
    destroyed() {},
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          this.chatOptions = widget.options;
        }
      },
      //初始化视图数据
      initViewData() {
        const { configList = {}, watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {}, webinar = {}, interact = {} } = watchInitData;
        this.joinInfo = join_info;
        this.configList = configList;
        this.webinarId = webinar.id;
        this.playerType = webinar.type;
        this.roomId = interact.room_id;
        this.roleName = join_info.role_name;
        this.userId = join_info.user_id;
      },
      listenChatServer() {
        const chatServer = useChatServer();
        const giftsServer = useGiftsServer();
        //监听@我的消息
        chatServer.$on('atMe', () => {
          if (this.osInstance.scroll().ratio.y != 1) {
            this.isHasUnreadAtMeMsg = true;
            this.tipMsg = '有人@你';
          }
        });
        //监听回复我的消息
        chatServer.$on('replyMe', () => {
          if (this.osInstance.scroll().ratio.y != 1) {
            this.isHasUnreadAtMeMsg = true;
            this.tipMsg = '有人回复你';
          }
        });
        //监听到新消息过来
        chatServer.$on('receiveMsg', () => {
          if (this.osInstance.scroll().ratio.y != 1 && this.osInstance.scroll().max.y > 0) {
            this.isHasUnreadAtMeMsg = true;
            this.unReadMessageCount++;
            this.tipMsg = `有${this.unReadMessageCount}条未读消息`;
          }
        });
        //监听禁言通知
        chatServer.$on('banned', res => {
          this.isBanned = res;
          this.initInputStatus();
        });
        //监听全体禁言通知
        chatServer.$on('allBanned', res => {
          this.allBanned = res;
          this.initInputStatus();
        });
        //监听分组房间变更通知
        chatServer.$on('changeChannel', () => {
          this.handleChannelChange();
        });
        //监听被提出房间消息
        chatServer.$on('roomKickout', () => {
          this.$message('您已经被踢出房间');
        });
        // 发起端 礼物消息接受
        giftsServer.$on('gift_send_success', msg => {
          console.log('VmpWapRewardEffect-------->', this.$route);
          if (this.$route.path.includes('/lives/room')) {
            const data = {
              nickname:
                msg.data.gift_user_nickname.length > 8
                  ? msg.data.gift_user_nickname.substr(0, 8) + '...'
                  : msg.data.gift_user_nickname,
              avatar: msg.data.avatar,
              content: {
                gift_name: msg.data.gift_name,
                gift_url: `${msg.data.gift_image_url}`,
                source_status: msg.data.source_status
              },
              type: msg.data.type,
              interactToolsStatus: true
            };
            chatServer.addChatToList(data);
          }
        });
      },
      init() {
        setTimeout(() => {
          this.chatSDK = window.chatSDK;
          //todo 替换掉EventBus，拆为全局信令以及父子组件通信事件
          this.listenEvents();
        }, 1000);
      },
      //初始化聊天输入框数据
      initInputStatus() {
        let placeholder = this.$t('chat.chat_1021');
        let disable = false;

        //如果是单人被禁言
        if (this.isBanned) {
          placeholder = this.$t('chat.chat_1006');
          disable = true;
        }
        //如果是全体禁言
        if (this.allBanned) {
          placeholder = this.$t('chat.chat_1044'); // TODO: 缺翻译
          disable = true;
        }
        //主持人不受禁言限制
        if ([1, '1'].includes(this.roleName)) {
          placeholder = this.$t('chat.chat_1021');
          disable = false;
        }

        this.inputStatus.placeholder = placeholder;
        this.inputStatus.disable = disable;
      },
      //初始检查是否要登录才可以参与互动
      initChatLoginStatus() {
        if ([0, '0'].includes(this.configList['ui.show_chat_without_login'])) {
          //主持人，这时候在发起端
          if ([1, '1'].includes(this.roleName)) {
            // 不需要登录
            this.chatLoginStatus = false;
            return;
          }
          if (![1, '1'].includes(this.roleName) && ['', null, 0].includes(this.userId)) {
            // 需要登录
            this.chatLoginStatus = true;
          }
        } else {
          // 不需要登录
          this.chatLoginStatus = false;
        }
      },
      //处理分组讨论频道变更
      handleChannelChange() {
        this.page = 0;
        useChatServer().clearHistoryMsg();
        this.getHistoryMsg();
      },
      // 获取历史消息
      async getHistoryMsg() {
        const params = {
          room_id: this.roomId,
          pos: Number(this.page) * 50,
          limit: 50
        };
        await useChatServer().getHistoryMsg(params);
        this.page++;
      },
      //todo domain负责 抽奖情况检查
      lotteryCheck() {},
      //todo domain负责 问卷情况检查
      questionnaireCheck() {},
      /**
       * 聊天图片预览
       * */
      // 预览聊天图片
      previewImg(index, images) {
        //处理掉图片携带的查询参数，只保留主要链接
        this.previewImgList = images.map(item => item.split('?')[0]);
        this.imgPreviewVisible = true;
        this.$nextTick(() => {
          this.$refs.imgPreview.jumpToTargetImg(index);
        });
      },
      //关闭预览图片弹窗之后的处理
      onClosePreviewImg() {
        this.imgPreviewVisible = false;
      },
      /**
       * 聊天图片预览结束
       * */
      /** 消息区域滚动处理 */
      initScroll() {
        this.osInstance = this.$refs.chatMessageAreaScroll.osInstance();
        const that = this;
        this.overlayScrollBarsOptions.callbacks = {
          onHostSizeChanged: function () {
            if (that.doScroll) {
              that.performScroll();
            }
          },
          onContentSizeChanged: function () {
            if (that.doScroll) {
              that.performScroll();
            }
          },
          onScroll: that.setDoScroll,
          onInitialized: that.setDoScroll,
          onOverflowChanged: function (e) {
            if (e.y) {
              that.performScroll();
            }
          },
          onScrollStop: this.handleScrollStop
        };
        this.osInstance.options(this.overlayScrollBarsOptions);
      },
      setDoScroll() {
        this.$nextTick(() => {
          if (!this.animationRunning) {
            this.doScroll = this.osInstance.scroll().ratio.y === 1;
          } else {
            this.doScroll = true;
          }
        });
      },
      performScroll() {
        this.$nextTick(() => {
          this.animationRunning = true;
          const delayTime = [1, '1'].includes(this.configList['ui.hide_chat_history']) ? 0 : 250;
          this.osInstance.scrollStop().scroll({ y: '100%' }, delayTime, 'linear', () => {
            this.animationRunning = false;
          });
        });
      },
      //滚动到底部
      handleScrollStop() {
        if (this.osInstance.scroll().ratio.y === 1) {
          this.unReadMessageCount = 0;
          this.isHasUnreadNormalMsg = false;
          this.isHasUnreadAtMeMsg = false;
          this.isHasUnreadReplyMsg = false;
        }
      },
      //滚动到目标处
      scrollToTarget() {
        this.animationRunning = true;
        const delayTime = [1, '1'].includes(this.configList['ui.hide_chat_history']) ? 0 : 250;
        this.osInstance.scrollStop().scroll(
          {
            el: this.osInstance.getElements().content.children[
              this.chatList.length - this.unReadMessageCount
            ],
            block: { y: 'end' }
          },
          delayTime,
          'linear',
          () => {
            this.animationRunning = false;
            this.unReadMessageCount = 0;
            this.isHasUnreadNormalMsg = false;
            this.isHasUnreadAtMeMsg = false;
            this.isHasUnreadReplyMsg = false;
          }
        );
      },
      /** 消息区域滚动处理结束 */
      //todo domain负责 获取菜单列表
      getMenuList(val) {
        const vo = val;
        if (this.roleName === 2) {
          // 嵌入会调用 watchEmbedInit —— 房间初始化；
          // 用户若已登录，获取userInfo中nick_name；若未登录，获取init房间初始化接口中join
          const userInfo = sessionOrLocal.get('userInfo')
            ? JSON.parse(sessionOrLocal.get('userInfo'))
            : {};
          const rmJoin = sessionOrLocal.get('v3_rm_join')
            ? JSON.parse(sessionOrLocal.get('v3_rm_join'))
            : {};
          if (userInfo && userInfo.nick_name) {
            vo.nick_name = userInfo.nick_name;
          }
          if (rmJoin && rmJoin.nickname) {
            vo.nick_name = rmJoin.nickname;
          }
          this.welcome_vo = vo;
          console.log('自定义菜单...', this.welcome_vo);
          //todo 欢迎语功能需要加上
        }
      },
      //todo domain负责组装 发送消息
      // sendMsg(callback) {
      //   window.clearTimeout(this.sendTimeOut);

      //   const { checkHasKeyword } = useChatServer();
      //   const joinDefaultName = JSON.parse(sessionStorage.getItem('moduleShow'))
      //     ? JSON.parse(sessionStorage.getItem('moduleShow')).auth.nick_name
      //     : '';
      //   //子组件里上传的图片
      //   const imgUrls = this.getUploadImg();

      //   this.sendTimeOut = setTimeout(() => {
      //     const inputValue = this.trimPlaceHolder('reply');
      //     if (this.inputStatus.disable) {
      //       return;
      //     }
      //     if ((!inputValue || (inputValue && !inputValue.trim())) && !imgUrls.length) {
      //       return this.$message.warning('内容不能为空');
      //     }
      //     const data = {};
      //     if (inputValue) {
      //       data.type = 'text';
      //       data.barrageTxt = inputValue
      //         .replace(/</g, '&lt;')
      //         .replace(/>/g, '&gt;')
      //         .replace(/\n/g, '<br/>');
      //       data.text_content = inputValue;
      //     }
      //     //如果有聊天图片
      //     if (imgUrls.length) {
      //       data.image_urls = imgUrls;
      //       data.type = 'image';
      //     }
      //     const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      //     console.warn('获取当前的本地用户信息', userInfo);
      //     let name = '';
      //     if (userInfo) {
      //       if (userInfo.nickname) {
      //         name = userInfo.nickname;
      //       } else {
      //         name = userInfo.nick_name;
      //       }
      //     } else {
      //       name = joinDefaultName;
      //     }
      //     if (this.roleName === 2 && this.join_name) {
      //       name = this.join_name;
      //     }
      //     const context = {
      //       nickname: name, // 昵称
      //       avatar: userInfo && userInfo.avatar ? userInfo.avatar : '', // 头像
      //       role_name: this.roleName, // 角色 1主持人2观众3助理4嘉宾
      //       replyMsg: this.replyMsg, // 回复消息
      //       atList: this.atList // @用户列表
      //     };
      //     let filterStatus = true;
      //     if (sessionStorage.getItem('watch')) {
      //       filterStatus = checkHasKeyword(inputValue);
      //     }

      //     if (this.roleName !== 2 || (this.roleName === 2 && filterStatus)) {
      //       if (this.atList.length && data.text_content) {
      //         this.atList.forEach(a => {
      //           data.text_content = data.text_content.replace(`@${a.nickname}`, `***${a.nickname}`);
      //         });
      //       }

      //       useChatServer().sendMsg({ data, context });
      //     }
      //     //清空一下子组件里上传的图片
      //     this.clearUploadImg();
      //     this.inputValue = '';
      //     this.replyMsg = {};
      //     this.$refs.emoji.isShow = false;

      //     this.atList = [];
      //     callback && callback();
      //   }, 300);
      // },
      // // 发送聊天节流
      // sendMsgThrottle() {
      //   if (this.roleName !== 2) {
      //     this.sendMsg();
      //     return;
      //   }
      //   if (this.chatGap > 0) {
      //     this.lock = sessionStorage.getItem('chatLock');
      //     if (this.lock && this.lock == 'true') {
      //       this.$message.warning(`当前活动火爆，请您在${this.chatGap}秒后再次发言`);
      //     }
      //   } else {
      //     this.sendMsg(() => {
      //       window.clearInterval(this.chatGapInterval);
      //       this.lock = sessionStorage.getItem('chatLock');
      //       this.chatGap = this.delayTime(this.onlineUsers);
      //       this.chatGapInterval = window.setInterval(() => {
      //         if (this.chatGap > 0) {
      //           if (!this.lock || this.lock == 'false') {
      //             sessionStorage.setItem('chatLock', true);
      //           } else {
      //             this.$message.warning(`太频繁啦，还有${this.chatGap}秒后才能发送`);
      //           }
      //           this.chatGap = this.chatGap - 1;
      //         } else {
      //           window.clearInterval(this.chatGapInterval);
      //           sessionStorage.setItem('chatLock', false);
      //         }
      //       }, 1000);
      //     });
      //   }
      // },
      backspace() {
        if (!this.inputValue) {
          this.atList = [];
          return;
        }
        const currentIndex = this.$refs.chatInput.selectionStart;
        const firstPart = this.inputValue.substring(0, currentIndex);
        const lastIndex = firstPart.lastIndexOf('@');
        if (lastIndex != -1) {
          const userName = this.inputValue.substring(lastIndex, currentIndex);
          const nickname = userName.replace('@', '');
          // 删除整个@过的用户名逻辑
          if (this.atList.find(u => u.nickname == nickname)) {
            this.atList = this.atList.filter(n => n.nickname != nickname);
            this.inputValue = this.inputValue.replace(userName, '');
          } else {
            this.atList = this.atList.filter(a => {
              const atIndex = this.inputValue.indexOf(`@${a.nickname} `);
              return atIndex != -1;
            });
          }
        }
        // 删除要回复的用户名逻辑
        const replyText = this.$t('chat.chat_1036');
        const lastReplyIndex = firstPart.lastIndexOf(replyText);
        if (lastReplyIndex != -1) {
          const replyUserName = this.inputValue.substring(lastReplyIndex, currentIndex);
          console.log(`${replyText}${this.replyMsg.nickname}:` == replyUserName);
          if (`${replyText}${this.replyMsg.nickname}:` == replyUserName) {
            this.inputValue = this.inputValue.replace(replyUserName, '');
            this.replyMsg = {};
          } else {
            this.inputValue.indexOf(`${replyText}${this.replyMsg.nickname}: `) == -1 &&
              (this.replyMsg = {});
          }
        }
      },
      //处理聊天内容
      trimPlaceHolder() {
        return this.inputValue.replace(/^[回复].+[:]\s/, ''); // TODO: 正则用翻译文案
      },
      //回复消息
      reply(count) {
        this.buriedPointReport(110119, {
          business_uid: this.userId,
          webinar_id: this.$route.params.il_id
        });
        this.$refs.chatOperator.handleReply(count);
      },
      //todo domain负责 删除消息（主持人，助理）
      deleteMsg(count) {
        const msgToDelete =
          this.chatList.find(chatMsg => {
            return chatMsg.count === count;
          }) || {};
        setTimeout(() => {
          const params = {
            channel_id: msgToDelete.channel,
            msg_id: msgToDelete.msgId,
            room_id: this.roomId
          };
          useChatServer()
            .deleteMessage(params)
            .then(res => {
              this.buriedPointReport(110121, {
                business_uid: this.userId,
                webinar_id: this.$route.params.il_id
              });
              return res;
            });
        }, 3000); // 优化 17532
      },
      //todo domain负责 @用户
      //@用户处理
      atUser(accountId) {
        //数据上报
        this.buriedPointReport(110120, {
          business_uid: this.userId,
          webinar_id: this.$route.params.il_id
        });
        this.$refs.chatOperator.handleAtUser(accountId);
      },
      /**
       * 事件处理分发
       * */
      msgEventHandleDisPatch(params = {}) {
        let { type = '', el = null, msg = '' } = params;
        console.log(msg);
        switch (type) {
          case 'scrollElement':
            this.onScrollElementHandle(el);
            break;
          case 'closeTip':
            this.onCloseTipHandle();
            break;
          case 'replyMsg':
            this.onReplyMsg(el, msg);
            break;
        }
      },
      //滚动到@本用户的msgItem元素
      onScrollElementHandle(el) {
        this.showTip = true;
        this.elements.push(el);
        this.tipMsg = this.replyElement
          ? this.$t('chat.chat_1035', this.unReadMessageCount) // TODO:确认是否+1
          : this.$t('chat.chat_1075');
      },
      //关闭提示
      onCloseTipHandle() {
        this.showTip = false;
        this.tipMsg = '';
      },
      //有人回复本用户
      onReplyMsg(el, msg) {
        if (this.userId !== msg.sendId) return;
        this.showTip = true;
        this.tipMsg = this.elements.length
          ? this.$t('chat.chat_1035', this.unReadMessageCount) // TODO:确认是否+1
          : this.$t('chat.chat_1076');
        this.replyElement = el;
      },
      //底部输入框输入较多内容，聊天区域也调整高度
      chatOperateBarHeightChange(operatorHeight) {
        this.operatorHeight = operatorHeight;
        this.$refs.chatOperator.updateOverlayScrollbar();
      },
      //特效
      addSpecialEffect(item) {
        // 如果开启聊天高并发的配置项，礼物特效需要限频，丢弃
        if (this.configList['ui.hide_chat_history'] == '1') {
          if (this._addSpecialEffectTimer) return;
          this._addSpecialEffectTimer = setTimeout(() => {
            clearTimeout(this._addSpecialEffectTimer);
            this._addSpecialEffectTimer = null;
          }, 200);
        }
        item.isTimeout = false;
        item.timer = setTimeout(() => {
          item.isTimeout = true;
          // this.$forceUpdate()
          setTimeout(() => {
            this.specialEffectsList.pop();
          }, 100);
        }, 3000);
        // 如果长度已经大于等于三个了，就需要将最早的关掉
        if (this.specialEffectsList.length >= 3) {
          clearTimeout(this.specialEffectsList[this.specialEffectsList.length - 1].timer);
          this.specialEffectsList[this.specialEffectsList.length - 1].isTimeout = true;
          // this.$forceUpdate()
          setTimeout(() => {
            this.specialEffectsList.pop();
          }, 100);
        }
        this.specialEffectsList.unshift(item);
      },
      //处理开启/屏蔽特效
      onSwitchShowSpecialEffects(status) {
        this.showSpecialEffects = status;
      },
      //处理只看主办方
      onSwitchShowSponsor(status) {
        this.isOnlyShowSponsor = status;
      },
      //处理全体禁言切换
      handleChangeAllBanned(flag) {
        let params = {
          room_id: this.roomId,
          status: flag ? 1 : 0
        };
        useChatServer()
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
      //打开私聊模态窗
      openPrivateChatModal() {
        // window.$middleEventSdk?.event?.send({
        //   cuid: 'comLivePrivateChat',
        //   method: 'openModal'
        // });
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitOpenLivePrivateChatModal')
        );
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-container {
    @active-color: #fc5659;
    @font-error: #fb3a32;
    width: 100%;
    height: 100%;
    position: relative;

    &.assistant {
      background: #323232;
    }

    .pic-control {
      position: absolute;
      background: #36383f;
      border: 1px solid #505061;
      border-radius: 4px;
      color: #b8bbca;
      font-size: 12px;
      width: 118px;
      padding: 6px 0;
      text-align: center;
      top: 30px;
      z-index: 1;
      // left:0;
      p {
        line-height: 34px;
        cursor: pointer;
      }
    }
    .chat-content {
      position: relative;
      .vmp-chat-msg-item {
        &:last-child {
          padding-bottom: 20px;
        }
      }
      &__get-list-btn-container {
        display: block;
        text-align: center;
        padding-top: 10px;
      }
      &__get-list-btn {
        cursor: pointer;
        color: #3562fa;
        font-size: 14px;
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
        .vh-line-arrow-down {
          font-size: 12px;
          margin-left: 6px;
        }
      }
    }
    .chat-special-effect {
      position: absolute;
      left: 0;
      top: 10px;
      &__item {
        width: 232px;
        height: 40px;
        background: linear-gradient(90deg, #fb3a32 0%, rgba(255, 172, 44, 0.8) 100%);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
        border-radius: 26px;
        position: absolute;
        left: 0;
        top: 10px;
        padding: 4px;
        padding-top: 11px;
        transition: all 200ms;
        background-image: url(img/red-package-bg.png);
        background-size: 100%;
        &.bg-applause {
          background-image: url(img/applause-bg.png);
        }
        &.bg-coffee {
          background-image: url(img/coffee-bg.png);
        }
        &.bg-custom {
          background-image: url(img/custom-bg.png);
        }
        &.bg-flower {
          background-image: url(img/flower-bg.png);
        }
        &.bg-praise {
          background-image: url(img/praise-bg.png);
        }
        &.bg-666 {
          background-image: url(img/666-bg.png);
        }
        &:first-child {
          animation: added 180ms;
        }
        &.opacity0 {
          opacity: 0;
        }
        .special-effect__img-box {
          width: 42px;
          height: 42px;
          border-radius: 21px;
          background-color: #ffffff;
          position: absolute;
          right: 16px;
          top: -1px;
          overflow: hidden;
        }
        .sepcial-effect__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .sepcial-effect__img-bg-flower {
          width: 62px;
          position: absolute;
          right: 6px;
          top: -16px;
        }
        .sepcial-effect__img-bg-coffee {
          width: 62px;
          position: absolute;
          right: 6px;
          top: -16px;
        }
        .sepcial-effect__img-bg-applause {
          width: 62px;
          position: absolute;
          right: 6px;
          top: -16px;
        }
        .sepcial-effect__img-bg-praise {
          width: 62px;
          position: absolute;
          right: 6px;
          top: -16px;
        }
        .sepcial-effect__img-reward {
          width: 32px;
          position: absolute;
          right: 18px;
          top: -1px;
        }
        .sepcial-effect__img-bg-666 {
          width: 70px;
          position: absolute;
          right: -2px;
          top: -11px;
        }
      }
      @keyframes added {
        from {
          margin-left: -160px;
        }
        to {
          margin-left: 0;
        }
      }
      .special-effect__avatar-box {
        float: left;
        width: 40px;
        height: 40px;
        border-radius: 20px;
        .special-effect__avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 100%;
        }
      }
      .special-effect__middle-content {
        float: left;
        margin-left: 6px;
        font-size: 14px;
        color: #ffffff;
      }
    }
    .tip {
      display: flex;
      flex-direction: column;
      text-align: center;
      height: 32px;
      line-height: 32px;
      background: rgba(255, 241, 232, 1);
      color: #ff9446;
      font-size: 12px;
      position: absolute;
      box-sizing: border-box;
      left: 0;
      right: 0;
      bottom: 84px;
      cursor: pointer;
    }
  }
</style>
