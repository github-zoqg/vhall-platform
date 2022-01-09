<template>
  <div class="vmp-chat-container" :class="{ assistant: assistantType }">
    <!-- 消息主体区域 -->
    <div class="chat-content" ref="chatContent">
      <div class="chat-content-scroll" ref="scroll">
        <msg-item
          v-for="msg in chatList"
          :key="msg.msgId"
          :msg="msg"
          :roleName="roleName"
          @dispatchEvent="msgEventHandleDisPatch"
          @lotteryCheck="lotteryCheck"
          @questionnaireCheck="questionnaireCheck"
          @previewImg="previewImg"
        ></msg-item>
      </div>
    </div>

    <!--提示-->
    <div class="chat-tip" v-show="showTip" @click="scrollTo">{{ tipMsg }}</div>

    <div class="chat-operate-bar">
      <!-- 表情选择 -->
      <div class="chat-operate-bar__emoji-wrap">
        <emoji ref="emoji" @emojiInput="emojiInput"></emoji>
      </div>
      <!-- 聊天过滤 -->
      <chat-filter
        v-if="roleName != 2"
        :roomId="roomId"
        :webinarId="webinarId"
        :allBanned="allBanned"
        ref="chatFilter"
        :chatFilterUrl="chatFilterUrl"
        :isAssistant="assistantType"
      ></chat-filter>

      <div class="chat-control-wrap">
        <span class="iconfont iconbiaoqing" @click.stop="toggleEmoji"></span>
        <template v-if="chatOptions && chatOptions.hasChatOperateBtn">
          <!--观看端聊天过滤-->
          <span class="icon iconfont iconmeitishezhi" @click.stop="onClickFilterSetting"></span>
          <!-- 过滤设置 -->
          <ul v-show="isFilterShow" class="chat-operate-bar__chat-filter-wrap">
            <li class="filter-item">
              <el-checkbox
                class="filter-item__checkbox"
                @change="onClickOnlyShowSponsor"
                v-model="filterStatus.onlyShowSponsor"
              >
                只看主办方
              </el-checkbox>
            </li>
            <li class="filter-item">
              <el-checkbox
                class="filter-item__checkbox"
                @change="onClickShieldingEffects"
                v-model="filterStatus.isShieldingEffects"
              >
                屏蔽特效
              </el-checkbox>
            </li>
          </ul>
        </template>
        <template v-if="chatOptions && chatOptions.hasImgUpload">
          <!-- 聊天图片上传 -->
          <vmp-chat-img-upload
            class="chat-img-upload"
            ref="chatImgUpload"
            :room-id="roomId"
            :role-name="roleName"
            :disable="inputStatus.disable"
          ></vmp-chat-img-upload>
        </template>
        <a
          v-if="roleName != '2' && plugin.audit.show"
          class="iconfont iconguolv"
          @click="toggleChatFilter"
        ></a>
      </div>
      <!--聊天输入框-->
      <div class="chat-input-wrap">
        <input
          v-if="!inputStatus.disable && !chatLoginStatus"
          ref="chatInput"
          accept="image/jpg, image/png, image/jpeg, image/bmp"
          :placeholder="inputStatus.placeholder"
          :disabled="inputStatus.disable"
          type="text"
          maxlength="140"
          v-model="inputValue"
          @keyup.enter="sendMsgThrottle"
          @keyup.delete="backspace"
        />
        <div
          v-if="(roleName !== 1 && inputStatus.disable) || chatLoginStatus"
          class="chat-input-placeholder"
        >
          {{ inputStatus.placeholder }}
        </div>
        <div v-show="chatLoginStatus" class="chat-input-login">
          <span @click="clickCallLogin">登录</span>
          参与互动
        </div>
        <button :class="{ assistant: assistantType }" @click="sendMsgThrottle">发送</button>
      </div>
      <template v-if="chatOptions && chatOptions.hasImgUpload">
        <!--图片预览-->
        <img-preview
          ref="imgPreview"
          v-if="imgPreviewVisible"
          :images="previewImgList"
          @closeImgPreview="onClosePreviewImg"
        ></img-preview>
      </template>
      <chat-user-control
        :roomId="roomId"
        :userId="userId"
        :reply="reply"
        @deleteMsg="deleteMsg"
        :atUser="atUser"
        :atList="atList"
      ></chat-user-control>
    </div>
  </div>
</template>

<script>
  import MsgItem from './components/msg-item.vue';
  import Emoji from './components/emoji.vue';
  import ImgPreview from './components/img-preview';
  import ChatFilter from './components/chat-filter';
  import ChatUserControl from './components/chat-user-control';
  import VmpChatImgUpload from './components/chat-img-upload';

  import EventBus from './js/Events.js';
  import eventMixin from './mixin/event-mixin';

  import { sessionOrLocal } from './js/utils';
  import { useChatServer, RoomBaseServer } from 'middleDomain';
  import dataReportMixin from '@/packages/chat/src/mixin/data-report-mixin';
  import { debounce } from 'lodash';

  export default {
    name: 'VmpChat',
    mixins: [eventMixin, dataReportMixin],
    components: {
      MsgItem,
      Emoji,
      ImgPreview,
      ChatFilter,
      ChatUserControl,
      VmpChatImgUpload
    },
    data() {
      this.chatServer = useChatServer();
      const { chatList } = this.chatServer.state;
      const roomBaseState = new RoomBaseServer().state;
      return {
        roomBaseState,
        //是否是助理
        assistantType: this.$route.query.assistantType,
        //聊天消息列表
        chatList: chatList,
        // @用户
        atList: [],
        // 预览图片列表
        previewImgList: [],
        // 提示开关
        showTip: false,
        // 提示文字
        tipMsg: '',
        // 输入框的值
        inputValue: '',
        // 输入框状态
        inputStatus: {
          placeholder: '参与聊天',
          disable: false
        },
        // 聊天是否需要登录
        chatLoginStatus: false,
        //欢迎信息
        welcomeInfo: {
          required: false
        },
        //参会角色身份
        join_name: {
          type: String
        },
        //活动id 打开手动过滤地址需要
        webinarId: '',
        // 是否全体禁言
        allBanned: false,
        // 是否被禁言
        isBanned: false,
        //频道id
        channelId: '',
        //todo 测试用，后续删掉 房间号
        roomId: 'lss_8434acc2',
        //用户角色
        roleName: '',
        //用户id
        userId: '',
        // 聊天过滤的跳转url
        chatFilterUrl: '',
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
        //分页配置
        pageConfig: {
          page: 0
        },
        //图片预览弹窗是否可见
        imgPreviewVisible: false,
        //聊天配置
        chatOptions: {},
        //观看端的过滤配置模态窗是否显示
        isFilterShow: false,
        //过滤状态集合
        filterStatus: {
          //只看主办方
          onlyShowSponsor: false,
          //屏蔽特效
          isShieldingEffects: false
        }
      };
    },
    computed: {},
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
      'chatList.length'(newVal) {
        setTimeout(() => {
          if (newVal) {
            this.resizeScroll();
            this.$emit('chatUpdata');
          }
        }, 50);
      },
      allBanned: {
        handler() {},
        immediate: true
      },
      isBanned: {
        handler() {
          this.inputStatus = {
            placeholder:
              this.roleName == '1'
                ? '参与聊天'
                : this.roleName != '2'
                ? this.isBanned
                  ? '您已被禁言'
                  : '参与聊天'
                : this.allBanned
                ? '全员禁言中'
                : this.isBanned
                ? '您已被禁言'
                : '参与聊天',
            disable:
              this.roleName == '1'
                ? false
                : this.roleName != '2'
                ? this.isBanned
                : this.isBanned || this.allBanned
          };
        }
      },
      replyMsg() {
        if (Object.keys(this.replyMsg || {}).length === 0) {
          this.inputValue = this.trimPlaceHolder('reply');
        } else {
          this.inputValue = this.inputValue
            ? `回复${this.replyMsg.nickName}: ${this.trimPlaceHolder('reply')}`
            : `回复${this.replyMsg.nickName}: `;
        }
      },
      inputValue(newValue) {
        if (!newValue) {
          this.replyMsg = {};
        }
      }
    },
    beforeCreate() {},
    created() {
      this.initInputStatus();
    },
    mounted() {
      //初始化配置
      this.initConfig();
      this.init();
      // 1--是需要登录才能参与互动   0--不登录也能参与互动
      this.initChatLoginStatus();
      // 口令登录显示  自身显示消息
      this.initCodeLoginMessage();
      this.debounceResizeScroll = debounce(this.resizeScroll, 500);
      window.addEventListener('resize', this.debounceResizeScroll, true);
    },
    destroyed() {
      window.removeEventListener('resize', this.debounceResizeScroll);
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          this.chatOptions = widget.options;
        }
      },
      init() {
        this.$nextTick(() => {
          this.pageConfig.page = 0;
          this.getHistoryMsg();
        });

        EventBus.$on('group_channel-change', msg => {
          console.log('开始接受消息-------------------------', msg);
          this.getHistoryMsg();
        });
        setTimeout(() => {
          this.chatSDK = window.chatSDK;
          //todo 替换掉EventBus，拆为全局信令以及父子组件通信事件
          this.listenEvents();
        }, 1000);
      },
      //初始化聊天输入框数据
      initInputStatus() {
        let placeholder = '参与聊天';
        let disable = false;

        //如果是单人被禁言
        if (this.isBanned) {
          placeholder = '您已被禁言';
          disable = true;
        }
        //如果是全体禁言
        if (this.allBanned) {
          placeholder = '全员禁言中';
          disable = true;
        }

        if ([1, '1'].includes(this.roleName)) {
          placeholder = '参与聊天';
          disable = false;
        }

        this.inputStatus.placeholder = placeholder;
        this.inputStatus.disable = disable;
      },
      //初始检查是否要登录才可以参与互动
      initChatLoginStatus() {
        if (sessionStorage.getItem('watch')) {
          if (JSON.parse(sessionStorage.getItem('moduleShow')).modules.chat_login.show == 0) {
            if (sessionStorage.getItem('userInfo') || this.isEmbed) {
              // 登录状态
              this.chatLoginStatus = false;
            } else {
              // 非登录状态
              this.chatLoginStatus = true;
              this.inputStatus.placeholder = '登录后参与互动';
            }
          } else {
            this.chatLoginStatus = false;
          }
        }
      },
      //todo 信令完成这个或者domain 初始化口令登录自身显示的消息
      initCodeLoginMessage() {
        EventBus.$on('codeText', msg => {
          // 口令登录显示  自身显示消息
          this.chatList.push(msg);
        });
      },
      //处理分组讨论频道变更
      handleChannelChange() {
        this.pageConfig.page = 0;
        this.chatServer.clearHistoryMsg();
        this.getHistoryMsg();
      },
      // 获取历史消息
      getHistoryMsg() {
        const { getHistoryMsg } = this.chatServer;

        const params = {
          room_id: this.roomId,
          pos: Number(this.pageConfig.page) * 50,
          limit: 50
        };

        getHistoryMsg(params, '发起端').then(result => {
          this.pageConfig.page = Number(this.pageConfig.page) + 1;
          console.log(result);
        });
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
      //重置滚动条到最底部
      resizeScroll() {
        const chatDom = document.querySelector('.chat-content-scroll');
        chatDom.scrollTop = chatDom.scrollHeight + 100;
      },
      //滚动到底部
      scrollTo() {
        this.resizeScroll();
        this.onClearElementsHandle();
      },
      // 切换表情显示
      toggleEmoji() {
        if (this.chatLoginStatus) {
          this.$message.warning('未登录');
          return;
        }

        if (this.inputStatus.disable) {
          this.$message.warning('您已被禁言');
          return;
        }
        this.$refs.emoji.toggleShow();
      },
      // 子组件输入表情
      emojiInput(value) {
        if (this.inputStatus.disable) {
          return;
        }
        this.inputValue += value;
      },
      //切换聊天过滤显示
      toggleChatFilter() {
        this.$refs.chatFilter.toggleShow();
      },
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
        }
      },
      //todo domain负责组装 发送消息
      sendMsg(callback) {
        window.clearTimeout(this.sendTimeOut);

        const { checkHasKeyword, sendMsg } = this.chatServer;
        const joinDefaultName = JSON.parse(sessionStorage.getItem('moduleShow'))
          ? JSON.parse(sessionStorage.getItem('moduleShow')).auth.nick_name
          : '';
        //子组件里上传的图片
        const imgUrls = this.getUploadImg();

        this.sendTimeOut = setTimeout(() => {
          const inputValue = this.trimPlaceHolder('reply');
          if (this.inputStatus.disable) {
            return;
          }
          if ((!inputValue || (inputValue && !inputValue.trim())) && !imgUrls.length) {
            return this.$message.warning('内容不能为空');
          }
          const data = {};
          if (inputValue) {
            data.type = 'text';
            data.barrageTxt = inputValue
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\n/g, '<br/>');
            data.text_content = inputValue;
          }
          //如果有聊天图片
          if (imgUrls.length) {
            data.image_urls = imgUrls;
            data.type = 'image';
          }
          const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
          console.warn('获取当前的本地用户信息', userInfo);
          let name = '';
          if (userInfo) {
            if (userInfo.nickname) {
              name = userInfo.nickname;
            } else {
              name = userInfo.nick_name;
            }
          } else {
            name = joinDefaultName;
          }
          if (this.roleName === 2 && this.join_name) {
            name = this.join_name;
          }
          const context = {
            nickname: name, // 昵称
            avatar: userInfo && userInfo.avatar ? userInfo.avatar : '', // 头像
            role_name: this.roleName, // 角色 1主持人2观众3助理4嘉宾
            replyMsg: this.replyMsg, // 回复消息
            atList: this.atList // @用户列表
          };
          let filterStatus = true;
          if (sessionStorage.getItem('watch')) {
            filterStatus = checkHasKeyword(inputValue);
          }

          if (this.roleName !== 2 || (this.roleName === 2 && filterStatus)) {
            if (this.atList.length && data.text_content) {
              this.atList.forEach(a => {
                data.text_content = data.text_content.replace(`@${a.nickName}`, `***${a.nickName}`);
              });
            }

            sendMsg({ data, context });
          }
          //清空一下子组件里上传的图片
          this.clearUploadImg();
          this.inputValue = '';
          this.replyMsg = {};
          this.$refs.emoji.isShow = false;

          this.atList = [];
          callback && callback();
        }, 300);
      },
      // 发送聊天节流
      sendMsgThrottle() {
        if (this.roleName !== 2) {
          this.sendMsg();
          return;
        }
        if (this.chatGap > 0) {
          this.lock = sessionStorage.getItem('chatLock');
          if (this.lock && this.lock == 'true') {
            this.$message.warning(`当前活动火爆，请您在${this.chatGap}秒后再次发言`);
          }
        } else {
          this.sendMsg(() => {
            window.clearInterval(this.chatGapInterval);
            this.lock = sessionStorage.getItem('chatLock');
            this.chatGap = this.delayTime(this.onlineUsers);
            this.chatGapInterval = window.setInterval(() => {
              if (this.chatGap > 0) {
                if (!this.lock || this.lock == 'false') {
                  sessionStorage.setItem('chatLock', true);
                } else {
                  this.$message.warning(`太频繁啦，还有${this.chatGap}秒后才能发送`);
                }
                this.chatGap = this.chatGap - 1;
              } else {
                window.clearInterval(this.chatGapInterval);
                sessionStorage.setItem('chatLock', false);
              }
            }, 1000);
          });
        }
      },
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
          const nickName = userName.replace('@', '');
          // 删除整个@过的用户名逻辑
          if (this.atList.find(u => u.nickName == nickName)) {
            this.atList = this.atList.filter(n => n.nickName != nickName);
            this.inputValue = this.inputValue.replace(userName, '');
          } else {
            this.atList = this.atList.filter(a => {
              const atIndex = this.inputValue.indexOf(`@${a.nickName} `);
              return atIndex != -1;
            });
          }
        }
        // 删除要回复的用户名逻辑
        const lastReplyIndex = firstPart.lastIndexOf('回复');
        if (lastReplyIndex != -1) {
          const replyUserName = this.inputValue.substring(lastReplyIndex, currentIndex);
          console.log(`回复${this.replyMsg.nickName}:` == replyUserName);
          if (`回复${this.replyMsg.nickName}:` == replyUserName) {
            this.inputValue = this.inputValue.replace(replyUserName, '');
            this.replyMsg = {};
          } else {
            this.inputValue.indexOf(`回复${this.replyMsg.nickName}: `) == -1 &&
              (this.replyMsg = {});
          }
        }
      },
      /**
       * 聊天上传图片组件相关逻辑
       * */
      //获取子组件上传的聊天图片
      getUploadImg() {
        const ref = this.$refs && this.$refs['chatImgUpload'] ? this.$refs['chatImgUpload'] : null;
        return ref ? ref.getImgUrls() : [];
      },
      //清空子组件上传的聊天图片
      clearUploadImg() {
        const ref = this.$refs && this.$refs['chatImgUpload'] ? this.$refs['chatImgUpload'] : null;
        ref && ref.clearImgUrls();
      },
      /**
       * 聊天上传图片组件相关逻辑结束
       * */
      //唤起登录
      clickCallLogin() {
        //todo 待发送信令，唤起登录
      },
      trimPlaceHolder() {
        return this.inputValue.replace(/^[回复].+[:]\s/, '');
      },
      //回复消息
      reply(count) {
        this.inputValue = '';
        this.atList = [];
        //数据上报
        this.buriedPointReport(110119, {
          business_uid: this.userId,
          webinar_id: this.$route.params.il_id
        });
        this.replyMsg =
          this.chatList.find(chatMsg => {
            return chatMsg.count === count;
          }) || {};
        this.$refs.chatInput.focus();
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
          this.chatServer.deleteMessage(params).then(res => {
            this.buriedPointReport(110121, {
              business_uid: this.userId,
              webinar_id: this.$route.params.il_id
            });
            const _index = this.chatList.findIndex(chatMsg => {
              return chatMsg.count === count;
            });
            _index !== -1 && this.chatList.splice(_index, 1);
            return res;
          });
        }, 3000); // 优化 17532
      },
      //todo domain负责 @用户
      atUser(accountId) {
        this.replyMsg = {};
        //数据上报
        this.buriedPointReport(110120, {
          business_uid: this.userId,
          webinar_id: this.$route.params.il_id
        });
        //找到at的消息
        const msgToAt = this.chatList.find(chatMsg => chatMsg.sendId === accountId) || {};
        //是否不在atList里
        const notInAtList = !this.atList.find(u => u.accountId === msgToAt.sendId);

        //如果没在atList里，则加入到atList
        if (notInAtList) {
          this.inputValue = this.trimPlaceHolder() + `@${msgToAt.nickName} `;
          this.$refs.chatInput.focus();
          const currentIndex = this.$refs.chatInput.selectionStart || 0;
          this.atList.push({
            nickName: msgToAt.nickName,
            accountId: msgToAt.sendId,
            index: currentIndex
          });
        }
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
            this.onReplyMsg(el);
            break;
        }
      },
      //清空艾特数组
      onClearElementsHandle() {
        this.elements = [];
        this.showTip = false;
        this.tipMsg = '';
        this.replyElement = null;
      },
      //滚动到@本用户的msgItem元素
      onScrollElementHandle(el) {
        this.showTip = true;
        this.elements.push(el);
        this.tipMsg = this.replyElement ? '有多条未读消息' : '有人@你';
      },
      //关闭提示
      onCloseTipHandle() {
        this.showTip = false;
        this.tipMsg = '';
      },
      //有人回复本用户
      onReplyMsg(e) {
        if (this.userId != e.msg.sendId) return;
        this.showTip = true;
        this.tipMsg = this.elements.length ? '有多条未读消息' : '有人回复你';
        this.replyElement = e.el;
      },
      // 过滤设置点击事件
      onClickFilterSetting() {
        this.isFilterShow = !this.isFilterShow;
        // 如果表情弹窗开启，则关闭
        if (this.$refs.emoji.isShow) {
          this.$refs.emoji.toggleShow();
        }
      },
      // 只看主办方点击事件
      onClickOnlyShowSponsor(status) {
        let message = status ? this.$t('已开启只看主办方') : this.$t('已关闭只看主办方');
        this.$message({
          message: message,
          showClose: true,
          // duration: 0,
          type: 'success',
          customClass: 'zdy-info-box'
        });
      },
      // 隐藏特效点击事件
      onClickShieldingEffects(status) {
        let message = status ? this.$t('已屏蔽特效') : this.$t('已开启特效');
        this.$message({
          message: message,
          showClose: true,
          // duration: 0,
          type: 'success',
          customClass: 'zdy-info-box'
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-container {
    @active-color: #fc5659;
    width: 100%;
    /* 临时修改下高度，后续自定义菜单出来，会移除掉 */
    height: calc(100% - 50px);
    position: relative;
    //background: @bg-dark-section;

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
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 91px;
      padding-top: 10px;
      ::-webkit-scrollbar {
        width: 6px;
        height: 10px;
        background-color: #434343;
      }
      ::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background-color: #434343;
        // border: 1px solid #434343;
      }
      ::-webkit-scrollbar-thumb {
        border: 1px solid #fff;
      }
      ::-webkit-scrollbar-track {
        border-radius: 5px;
        background-color: #434343;
      }
      .chat-content-scroll {
        height: 100%;
        position: relative;
        overflow-y: auto;
        transform: all 0.3s;
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
    .chat-operate-bar {
      display: flex;
      flex-direction: column;
      padding: 10px;
      border-top: 1px solid #3a3a48;
      background-color: #2d2d2d;
      position: absolute;
      box-sizing: border-box;
      left: 0;
      right: 0;
      bottom: 0;
      .chat-control-wrap {
        display: flex;
        align-items: center;
        /*height: 20px;*/
        margin-bottom: 7px;
        & > * {
          margin-left: 10px;
        }
        .iconfont {
          color: #999;
          font-size: 19px;
          cursor: pointer;
          &.active {
            color: @active-color;
          }
          &:hover {
            color: @active-color;
            cursor: pointer;
          }
          &.pic-disabled {
            pointer-events: none;
          }
          &.icontupianliaotian {
            font-size: 18px;
          }
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

        .iconbiaoqing {
          font-size: 19px;
          color: #999;
          margin-left: 0;
          margin-bottom: 1px;
          &:hover {
            color: @active-color;
            cursor: pointer;
          }
        }
        .chat-audit {
          background-image: url('./images/auditing.png');
          &:hover {
            background-size: 95%;
            background-image: url('./images/auditing-hover.png');
          }
        }
        .chat-img-upload {
          flex: 1;
        }
      }
      .chat-input-wrap {
        display: flex;
        height: 34px;
        position: relative;
        input {
          flex: 1;
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
          border: none;
          background: rgba(84, 84, 84, 1);
          outline: none;
          padding-left: 12px;
          color: #b8bbca;
          &:focus + button {
            background: #999999;
          }
        }
        .chat-input-placeholder {
          flex: 1;
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
          border: none;
          background: rgba(84, 84, 84, 1);
          outline: none;
          padding-left: 12px;
          color: #b8bbca;
          font-size: 14px;
          line-height: 34px;
        }
        .chat-input-login {
          position: absolute;
          // width: 100%;
          height: 34px;
          line-height: 34px;
          top: 0;
          left: 9px;
          z-index: 2;
          color: #aaa;
          font-size: 12px;
          background: #545454;
          span {
            font-size: 12px !important;
            color: #aaa;
          }
          span:first-of-type {
            color: @active-color;
            cursor: pointer;
            font-size: 12px !important;
          }
        }
        button {
          &.assistant {
            width: 58px;
            flex-basis: initial;
          }
          flex-basis: 20%;
          width: 20%;
          text-align: center;
          line-height: 34px;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
          background: rgba(153, 153, 153, 1);
          cursor: pointer;
          color: #fff;
          border: none;
          outline: none;
          /* &:active {
            background: #999999;
          } */
          &:hover {
            background: @active-color;
          }
        }
      }
      .chat-img-box {
        padding: 8px;
        background: #3f3f3f;
        position: absolute;
        top: -50px;
        left: 7%;
        box-sizing: border-box;
        .chat-img {
          float: left;
          width: 34px;
          height: 34px;
          margin-right: 8px;
          position: relative;
          box-sizing: border-box;
          cursor: pointer;
          .img-close {
            position: absolute;
            width: 15px;
            height: 15px;
            background: url('./images/img-del.png') no-repeat;
            background-size: contain;
            top: 0px;
            right: 0px;
            display: none;
          }
          & > img {
            display: block;
          }
          &:last-child {
            margin-right: 0;
          }
          &:hover {
            border: 1px solid @active-color;
            .img-close {
              display: block;
            }
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
        width: 120px;
        height: 80px;
        padding: 4px 0;
        background-color: #383838;
        box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
        border-radius: 4px;
        position: absolute;
        top: -11px;
        transform: translateY(-100%);
        .iconmeitishezhi {
          font-size: 19px;
          color: #999;
          margin-left: 10px;
          margin-bottom: 1px;
          &:hover {
            color: @active-color;
            cursor: pointer;
          }
        }
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
        }
        .filter-item__checkbox {
          display: inline-block;
          margin-right: 8px;
          position: relative;
          color: #999999;
          font-size: 14px;
        }
        .el-checkbox__label {
          font-size: 14px;
          color: #999999;
        }
      }
    }
  }
</style>
