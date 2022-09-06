<template>
  <div class="vmp-chat-auth">
    <!--聊天审核头部栏-->
    <div class="vmp-chat-auth__header-bar">
      <div class="header-bar__operate-bar">
        <div class="switch-box">
          <span class="switch-title">聊天审核</span>
          <el-switch
            v-model="enableChatAuth"
            :inactive-color="options.inactiveColor"
            :width="32"
            :active-value="2"
            :inactive-value="1"
            :active-color="options.activeColor"
            @change="toggleChatAuth"
          ></el-switch>
          <span class="switch-title sub-title">
            {{ enableChatAuth === 2 ? '已开启' : '已关闭' }}，开启后可进行聊天人工审核
          </span>
        </div>
        <span
          class="header-bar__auto-set-btn"
          :class="{ 'operate-disable': enableChatAuth === 1 }"
          @click="openAutoSettingModal"
        >
          <i class="vh-iconfont vh-line-setting"></i>
          自动审核设置
        </span>
      </div>
    </div>
    <div class="vmp-chat-auth__main">
      <div class="main-container">
        <!--列表操作栏-->
        <div class="main-container__header" :class="{ 'operate-disable': enableChatAuth === 1 }">
          <!--          <div-->
          <!--            class="table-select"-->
          <!--            :class="{ disabled: selectMenuType !== 'auth' || (auditList && !auditList.length) }"-->
          <!--          >-->
          <!--            <i class="el-icon-s-operation"></i>-->
          <!--            <div class="sub-menus">-->
          <!--              <span :class="{ active: selectDataType === 'page' }" @click="changeDataType('page')">-->
          <!--                选择本页数据-->
          <!--              </span>-->
          <!--              <span :class="{ active: selectDataType === 'all' }" @click="changeDataType('all')">-->
          <!--                选择所有数据-->
          <!--              </span>-->
          <!--            </div>-->
          <!--          </div>-->
          <div class="table-menu" :class="{ disabled: isCooling }">
            <span
              class="table-menu-item"
              :class="{ active: selectMenuType === 'auth' }"
              @click="switchToTab('auth')"
            >
              未审核({{ auditNum }})
            </span>
            <!--            <span-->
            <!--              class="table-menu-item"-->
            <!--              :class="{ active: selectMenuType === 'prohibit' }"-->
            <!--              @click="switchToTab('prohibit')"-->
            <!--            >-->
            <!--              已阻止({{ prohibitTotal }})-->
            <!--            </span>-->
            <span
              class="table-menu-item"
              :class="{ active: selectMenuType === 'passed' }"
              @click="switchToTab('passed')"
            >
              已通过({{ passedNum }})
            </span>
            <span
              class="table-menu-item"
              :class="{ active: selectMenuType === 'muted' }"
              @click="switchToTab('muted')"
            >
              禁言({{ mutedNum }})
            </span>
            <span
              class="table-menu-item"
              :class="{ active: selectMenuType === 'kickedOut' }"
              @click="switchToTab('kickedOut')"
            >
              踢出({{ kickedNum }})
            </span>
          </div>
          <div
            class="table-handle"
            :class="{ disabled: !selectMsgIds.length }"
            v-if="selectMenuType === 'auth'"
          >
            <!--            <el-button-->
            <!--              v-if="!selectMsgIds.length"-->
            <!--              type="default"-->
            <!--              :size="controlConfig.size"-->
            <!--              :round="controlConfig.round"-->
            <!--            >-->
            <!--              其他操作-->
            <!--            </el-button>-->
            <!--            <el-dropdown @command="handleCommand" v-else>-->
            <!--              <span class="el-dropdown-link">-->
            <!--                <el-button type="default" :size="controlConfig.size" :round="controlConfig.round">-->
            <!--                  其他操作-->
            <!--                </el-button>-->
            <!--              </span>-->
            <!--              <el-dropdown-menu slot="dropdown">-->
            <!--                <el-dropdown-item command="batchBaned">批量禁言</el-dropdown-item>-->
            <!--                <el-dropdown-item command="batchKicked">批量踢出</el-dropdown-item>-->
            <!--              </el-dropdown-menu>-->
            <!--            </el-dropdown>-->
            <el-button
              type="danger"
              @click="handleBatchPass()"
              :size="controlConfig.size"
              :round="controlConfig.round"
            >
              全部通过
            </el-button>
            <el-button
              type="default"
              @click="handleBatchPrevent()"
              :size="controlConfig.size"
              :round="controlConfig.round"
            >
              全部阻止
            </el-button>
          </div>
          <span class="el-icon-refresh-right refresh-btn" @click="refreshList"></span>
        </div>
        <div class="main-container__content">
          <auth-table
            :select-menu-type="selectMenuType"
            :options="options"
            :list="currentList"
            :operate-disable="enableChatAuth === 1"
            ref="authTable"
            @cancelMuted="handleCancelMuted"
            @cancelKicked="handleCancelKicked"
            @messageOperate="handleMessageOperate"
          ></auth-table>
        </div>
      </div>
    </div>
    <div
      class="vmp-chat-auth__bottom-bar"
      v-if="footerInfo.show === 'Y'"
      @click="handleClickFooterInfo"
    >
      {{ footerInfo.text }}
    </div>
    <auto-setting-modal
      ref="autoSettingModal"
      :options="options"
      @confirm="handleAutoSetting"
    ></auto-setting-modal>
  </div>
</template>

<script>
  import autoSettingModal from './components/autoSettingModal';
  import authTable from './components/authTable';
  import { useChatAuthServer, useMsgServer } from 'middle-domain';
  import { setRequestBody, setRequestHeaders } from 'middle-domain';
  export default {
    name: 'VmpChatAuth',
    components: {
      autoSettingModal,
      authTable
    },
    data() {
      return {
        //开启聊天审核
        enableChatAuth: 1,
        //是否开启了自动处理
        enableAutoHandle: '1',
        //底部支持信息
        footerInfo: {
          show: 'Y',
          text: '微吼提供技术支持'
        },
        //是否正在刷新
        refreshing: false,
        //选中的菜单类型 auth:未审核， prohibit：禁止
        selectMenuType: 'auth',
        //批处理选择的是哪种 all:所有数据 , page：当前页的数据
        selectDataType: '',
        //已阻止的数量
        prohibitTotal: 0,
        //查询参数
        searchParams: {
          page: 1,
          pageSize: 200,
          total: 0
        },
        //todo  tab切换限流 是否在冷却
        isCooling: false,
        //选中的操作消息的id集合 todo
        selectMsgIds: [],
        //选中的操作人员的id集合 todo
        selectUserIds: [],
        //控件配置
        controlConfig: {
          size: 'small',
          round: true
        },
        //聊天审核配置 todo 后续移到config里，当前config不支持
        options: {
          //是否有通过并回复按钮(未审核按钮)
          hasPassAndReplyBtn: true,
          //switch未激活的颜色
          inactiveColor: '#cccccc',
          //switch激活的颜色
          activeColor: '#fc5659'
        },
        //当前活动id
        webinarId: this.$route.params.id || '',
        //url上携带的参数
        urlParams: {}
      };
    },
    computed: {
      //活动标题
      activityTitle() {
        return this.$domainStore.state.chatAuthServer.activityTitle;
      },
      //当前的列表
      currentList() {
        let list = [];
        switch (this.selectMenuType) {
          case 'auth':
            //未审核
            list = this.auditList;
            break;
          case 'prohibit':
            //已阻止
            break;
          case 'passed':
            list = this.passedList;
            //已通过
            break;
          case 'muted':
            list = this.mutedList;
            break;
          case 'kickedOut':
            list = this.kickedList;
            break;
          default:
            break;
        }
        return list;
      },
      //待审核列表
      auditList() {
        return this.$domainStore.state.chatAuthServer.auditList;
      },
      //已审核的列表
      passedList() {
        return this.$domainStore.state.chatAuthServer.passedList;
      },
      //已禁言的列表
      mutedList() {
        return this.$domainStore.state.chatAuthServer.mutedList;
      },
      //已踢出的列表
      kickedList() {
        return this.$domainStore.state.chatAuthServer.kickedList;
      },
      //已审核的数量
      passedNum() {
        return this.$domainStore.state.chatAuthServer.passedNum;
      },
      //未审核的数量
      auditNum() {
        return this.$domainStore.state.chatAuthServer.auditList.length;
      },
      //已禁言的数量
      mutedNum() {
        return this.$domainStore.state.chatAuthServer.mutedNum;
      },
      //已踢出的数量
      kickedNum() {
        return this.$domainStore.state.chatAuthServer.kickedNum;
      }
    },
    beforeCreate() {
      this.chatAuthServer = useChatAuthServer();
      this.msgServer = useMsgServer();
    },
    created() {},
    mounted() {
      this.getFooterInfo();
      this.init();
    },
    methods: {
      async init() {
        //提取Url参数
        this.urlParams = this.extractionUrlParams();
        //初始化房间信息，这里也会在domain里初始化聊天sdk和消息sdk
        await this.initRoomInfo();
        //获取聊天审核开关状态
        this.getChatAuthEnableStatus();
        this.listenEvents();
      },
      //初始化聊天实例
      listenEvents() {
        this.chatAuthServer.initChatInstance();
      },
      //操作用户
      operateUser(id, type) {
        this.chatAuthServer.operateUser(id, type);
        const { baseChanelInfo = {} } = this.chatAuthServer.state || {};
        const params = Object.assign({ msg_id: '', status: 2 }, baseChanelInfo);
        this.chatAuthServer.state.auditList.forEach(item => {
          if (item.third_party_user_id === id) {
            params.msg_id += item.msg_id + ',';
          }
        });
        this.fetchOperate(params);
      },
      //更新操作
      fetchOperate(params, cb) {
        if (!params.msg_id) return;
        this.chatAuthServer
          .operateMessage(params)
          .then(res => {
            if (cb) {
              cb();
            }
            this.getChatMessageList();
            if (res.code === 50014) {
              // this.getChatMessageList();
            } else if (res.code == 10001) {
              this.$message.warning(res.msg);
            }
          })
          .catch(res => {
            this.getChatMessageList();
            if (res.code === 50014) {
              // this.getChatMessageList();
            } else if (res.code === 10040) {
              this.$message({
                message: '当前无聊天消息',
                type: 'error'
              });
            } else {
              this.$message({
                message: res.msg,
                type: 'error'
              });
            }
          });
      },
      //提取url参数
      extractionUrlParams() {
        const url = decodeURIComponent(window.location.href);
        const mapObj = {};
        if (url.indexOf('?') !== -1) {
          let _index = -1;
          if (url.indexOf('?') > url.indexOf('#/')) {
            _index = url.length;
          } else {
            _index = url.indexOf('#/');
          }
          const str = url.substring(url.indexOf('?') + 1, _index);
          const entriesList = str.split('&');
          for (let i = 0; i < entriesList.length; i++) {
            mapObj[entriesList[i].split('=')[0]] = entriesList[i].split('=')[1];
          }
        }
        return mapObj;
      },
      //获取房间信息、活动信息
      initRoomInfo() {
        let vc = this.$route.query.vc;
        try {
          vc = decodeURI(vc);
        } catch (e) {
          console.error(e);
        }
        vc = vc === void 0 ? '' : vc;

        const params = Object.assign({}, this.urlParams, {
          webinar_id: this.webinarId,
          vc
        });

        const paramKeyList = Object.keys(params);

        //这里兼容一下以前的参数，保证口令登录的情况下，聊天审核也能正常,以前参数附加live_token这一步是在axios封装的方法里实现的
        if (
          paramKeyList.includes('liveT') &&
          (!paramKeyList.includes('live_token') ||
            ['', null, void 0].includes(params['live_token']))
        ) {
          params.live_token = params.liveT;
        }

        if (!params.live_token && params.assistant_token) {
          if (location.search.includes('token_type=')) {
            // 1: livetoken   0:token
            if (params.token_type == 1) {
              setRequestBody({
                live_token: params.assistant_token
              });
            } else {
              setRequestHeaders({
                token: params.assistant_token
              });
            }
          }
        }

        if (params.live_token) {
          setRequestBody({
            live_token: params.live_token
          });
        }

        return this.chatAuthServer
          .initRoomInfo(params)
          .then(res => {
            sessionStorage.setItem('interact_token', res.data.interact.interact_token);
            if (!sessionStorage.getItem('user')) {
              sessionStorage.setItem('user', JSON.stringify(res.data.join_info));
            }
            //获取所有tab下的数据
            this.initTabTotalNum();
          })
          .catch(error => {
            console.log(error);
          });
      },
      //获取聊天审核开启状态
      getChatAuthEnableStatus() {
        const { baseChanelInfo = {} } = this.chatAuthServer.state || {};
        const params = { ...baseChanelInfo };
        return this.chatAuthServer
          .getChatAuthEnableStatus(params)
          .then(res => {
            if (res.code == 200) {
              this.enableChatAuth = res?.data?.switch ? Number(res.data.switch) : 1;
              this.enableAutoHandle = res.data.switch_options + '';
            } else {
              this.$message({
                message: res.msg,
                type: 'error'
              });
            }
          })
          .catch(error => {
            this.$message({
              message: error,
              type: 'error'
            });
          });
      },
      //获取tab上的处理数
      initTabTotalNum() {
        //获取全部的tab
        this.getChatMessageList();
        this.getPassedMessageList();
        this.getMutedUserList();
        this.getKickedUserList();
      },
      //获取未审核的聊天数据 (0:未审核 1:通过  2:阻止)
      getChatMessageList() {
        return this.chatAuthServer.fetchChatMessageList();
      },
      //获取已通过的审核的聊天数据
      getPassedMessageList() {
        const params = {
          page_size: this.searchParams.pageSize,
          curr_page: this.searchParams.page
        };
        return this.chatAuthServer.fetchPassedMessageList(params);
      },
      //获取被禁言的人员列表
      getMutedUserList() {
        const params = {
          pos: 0,
          limit: this.searchParams.pageSize
        };
        return this.chatAuthServer.fetchMutedUserList(params).catch(error => {
          console.log(error);
        });
      },
      //获取被踢出的人员列表
      getKickedUserList() {
        const params = {
          pos: 0,
          limit: this.searchParams.pageSize
        };
        return this.chatAuthServer.fetchKickedUserList(params).catch(error => {
          console.log(error);
        });
      },
      //打开自动审核弹窗
      openAutoSettingModal() {
        this.$refs.autoSettingModal.openModal({ enableAutoHandle: this.enableAutoHandle });
      },
      //开启/关闭聊天审核
      toggleChatAuth() {
        const params = {
          ...this.$domainStore.state.chatAuthServer.baseChanelInfo,
          switch: this.enableChatAuth
        };
        this.chatAuthServer
          .toggleChatAuthStatus(params)
          .then(res => {
            this.enableChatAuth = res.data.switch;
            this.enableChatAuth && window.vhallReportForProduct?.report(110118);
          })
          .catch(error => {
            const { msg = '' } = error || {};
            this.$message({
              message: msg,
              type: 'error'
            });
          });
      },
      //todo 请求接口获取底部技术支持配置
      getFooterInfo() {},
      //todo 点击底部技术支持的处理
      handleClickFooterInfo() {},
      //切换批量处理的选项
      changeDataType(type = '') {
        if (type === this.selectDataType) {
          this.selectDataType = '';
        } else {
          this.selectDataType = type;
        }
      },
      //切换tab
      switchToTab(type = '') {
        // 相等表示当前点击的是当前tab
        if (this.selectMenuType === type) {
          return;
        }
        this.isCooling = true;
        let s = setTimeout(() => {
          clearTimeout(s);
          this.isCooling = false;
        }, 1000);
        this.selectMenuType = type;
        this.searchParams.page = 1;
        switch (type) {
          case 'auth':
            this.getChatMessageList();
            break;
          case 'passed':
            this.getPassedMessageList();
            break;
          case 'muted':
            this.getMutedUserList();
            break;
          case 'kickedOut':
            this.getKickedUserList();
            break;
          default:
            break;
        }
      },
      //刷新当前tab下的列表
      refreshList() {
        this.searchParams.page = 1;
        switch (this.selectMenuType) {
          case 'auth':
            this.getChatMessageList();
            break;
          case 'passed':
            this.getPassedMessageList();
            break;
          case 'muted':
            this.getMutedUserList();
            break;
          case 'kickedOut':
            this.getKickedUserList();
            break;
          default:
            break;
        }
      },
      //选中下拉选项的处理
      handleCommand(type) {
        console.log(type);
      },
      //全部通过
      handleBatchPass() {
        const params = {
          ...this.$domainStore.state.chatAuthServer.baseChanelInfo
        };
        params.msg_id = this.$domainStore.state.chatAuthServer.auditList
          .map(it => it.msg_id)
          .join();
        params.status = 1;
        this.fetchOperate(params);
      },
      //全部阻止
      handleBatchPrevent() {
        const params = {
          ...this.$domainStore.state.chatAuthServer.baseChanelInfo
        };
        params.msg_id = this.$domainStore.state.chatAuthServer.auditList
          .map(it => it.msg_id)
          .join();
        params.status = 2;
        this.fetchOperate(params);
      },
      //取消禁言
      handleCancelMuted(item = {}) {
        const { roomInfo = {} } = this.chatAuthServer.state;
        const params = {
          ...roomInfo,
          receive_account_id: item.account_id,
          status: 0
        };
        this.chatAuthServer
          .toggleBannedStatus(params)
          .then(res => {
            const { code = '', msg = '' } = res || {};
            if (![200, '200'].includes(code)) {
              this.$message({
                message: msg,
                type: 'error'
              });
            }
          })
          .catch(error => {
            console.log(error);
          });
      },
      //取消踢出
      handleCancelKicked(item = {}) {
        const { roomInfo = {} } = this.chatAuthServer.state;
        const params = {
          ...roomInfo,
          receive_account_id: item.account_id,
          status: 0
        };
        this.chatAuthServer
          .toggleKickedStatus(params)
          .then(res => {
            const { code = '', msg = '' } = res || {};
            if (![200, '200'].includes(code)) {
              this.$message({
                message: msg,
                type: 'error'
              });
            }
          })
          .catch(error => {
            console.log(error);
          });
      },
      //禁言
      handleSetMuted(params = {}) {
        return this.chatAuthServer
          .toggleBannedStatus(params)
          .then(res => {
            const { code = '', msg = '' } = res || {};
            if (![200, '200'].includes(code)) {
              this.$message({
                message: msg,
                type: 'error'
              });
            }
          })
          .catch(error => {
            console.log(error);
          });
      },
      //踢出
      handleSetKicked(params = {}) {
        return this.chatAuthServer
          .toggleKickedStatus(params)
          .then(res => {
            const { code = '', msg = '' } = res || {};
            if (![200, '200'].includes(code)) {
              this.$message({
                message: msg,
                type: 'error'
              });
            }
          })
          .catch(error => {
            console.log(error);
          });
      },
      //处理消息操作
      handleMessageOperate(eventInfo = {}) {
        const { type = '', params = {} } = eventInfo;
        switch (type) {
          case 'setPassed':
            this.handleSetPassed(params);
            break;
          case 'setProhibit':
            this.handleSetProhibit(params);
            break;
          case 'setMuted':
            this.handleSetMuted(params);
            break;
          case 'setKicked':
            this.handleSetKicked(params);
            break;
          case 'passedAndReply':
            this.handlePassedAndReply(params);
            break;
          default:
            break;
        }
      },
      //处理通过消息
      handleSetPassed(params = {}) {
        this.fetchOperate(params);
      },
      //处理阻止消息
      handleSetProhibit(params = {}) {
        this.fetchOperate(params);
      },
      //处理通过并回复
      handlePassedAndReply({ messageInfo = {}, replyText = '' }) {
        const _this = this;
        const replayData = {
          type: 'text',
          access_audit: 1,
          text_content: replyText
        };
        const user = JSON.parse(sessionStorage.getItem('user'));
        const context = {
          nickname: user.nickname || user.nick_name,
          avatar: user.avatar,
          role_name: this.$domainStore.state.chatAuthServer.roleName,
          replyMsg: {
            ...messageInfo,
            nickName: messageInfo.nick_name,
            content: { text_content: messageInfo.text_content, type: 'text' }
          }
        };
        //先发送消息
        function sendReplyData() {
          _this.chatAuthServer.chatInstance.emit(replayData, context, 0);
        }
        const params = {
          ...this.$domainStore.state.chatAuthServer.baseChanelInfo,
          msg_id: messageInfo.msg_id,
          status: 1
        };
        this.fetchOperate(params, sendReplyData);
      },
      //处理自动审核设置
      handleAutoSetting(messageInfo = {}) {
        const { switch_options = '' } = messageInfo;
        if (this.enableChatAuth === 1) {
          this.enableChatAuth = 2;
        }
        const params = {
          ...this.$domainStore.state.chatAuthServer.baseChanelInfo,
          switch: this.enableChatAuth,
          switch_options: switch_options
        };
        this.chatAuthServer
          .setMessageFilterOptions(params)
          .then(res => {
            const { switch_options = '' } = res && res.data ? res.data : {};
            this.enableAutoHandle = switch_options + '';
          })
          .catch(error => {
            const { msg = '' } = error || {};
            this.$message({
              message: msg,
              type: 'error'
            });
          });
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-auth {
    @color-blue: #4b5afe;
    @color-blue-hover: #5d6afe;
    @color-bd: #e2e2e2;
    @color-default-hover: #fb3a32;
    @color-default-active: #fc5659;
    @color-blue-hover: #5d6afe;
    @color-blue: #4b5afe;

    width: 100%;
    height: 100vh;
    background-color: #f3f4f8;
    &__header-bar {
      position: relative;
      display: flex;
      align-items: center;
      height: 50px;
      padding: 8px 30px 0 30px;
      background-color: #fff;
      font-size: 14px;

      .header-bar__title {
      }
      .header-bar__operate-bar {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        .switch-box {
          display: inline-block;
          .switch-title {
            display: inline-block;
            vertical-align: middle;
            font-weight: bold;
            margin-right: 6px;
            &.sub-title {
              color: #888;
              padding-left: 4px;
              font-weight: normal;
            }
          }
        }
        &.header-title {
          max-width: 500px;
          overflow: hidden;
          word-break: break-all;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 20px;
          font-weight: bold;
          color: #222;
          .vh-iconfont {
            display: inline-block;
            color: #888;
            margin-right: 10px;
            font-size: 20px;
            vertical-align: middle;
          }
        }
      }
      .header-bar__auto-set-btn {
        display: flex;
        align-items: center;
        color: @color-blue;
        &:hover {
          cursor: pointer;
          color: @color-blue-hover;
        }
        .vh-iconfont {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
        }
      }
    }
    &__main {
      min-width: 996px;
      width: 80%;
      height: calc(100% - 120px);
      padding: 0 20px;
      margin: 20px auto 0 auto;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
      background-color: #fff;
      overflow: hidden;
      box-shadow: 0 0 12px 0 rgba(213, 197, 231, 0.5);
      .main-container {
        display: flex;
        flex-direction: column;
        position: relative;
        height: 100%;
        padding-bottom: 20px;
      }
      .main-container__header {
        position: relative;
        display: flex;
        align-items: center;
        height: 50px;
        background-color: #fff;
        z-index: 2;
        border-bottom: 1px solid @color-bd;

        .refresh-btn {
          position: absolute;
          font-size: 20px;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          &:hover {
            cursor: pointer;
            opacity: 0.8;
            color: @color-blue-hover;
          }
        }
        .table-menu {
          float: left;
          display: inline-block;
          font-size: 16px;
          .table-menu-item {
            position: relative;
            display: inline-block;
            height: 50px;
            line-height: 50px;
            padding: 0 10px;
            border-radius: 4px;
            &:hover {
              cursor: pointer;
              color: @color-default-hover;
            }
            &.active:after {
              content: '';
              position: absolute;
              left: 50%;
              bottom: 0;
              margin-left: -15px;
              width: 20px;
              height: 3px;
              background-color: @color-default-active;
            }
          }
        }
        .table-handle {
          display: inline-block;
          position: absolute;
          right: 30px;
        }
        .el-button--danger,
        .el-button--success {
          color: #fff;
        }
        .table-select {
          display: flex;
          position: relative;
          width: 30px;
          align-items: center;
          height: 40px;
          z-index: 10;
          float: left;
          i {
            font-size: 20px;
          }
          .vh-iconfont {
            display: inline-block;
            width: 20px;
            height: 20px;
            font-size: 16px;
            color: #666;
            &:hover {
              cursor: pointer;
              color: @color-blue;
            }
          }
          &:hover {
            .sub-menus {
              display: block;
            }
          }
          .sub-menus {
            display: none;
            padding: 5px 0;
            position: absolute;
            top: 40px;
            left: 0;
            width: 140px;
            background-color: #fff;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
            z-index: 11;
            border-radius: 4px;
            span {
              display: block;
              line-height: 40px;
              padding: 0 15px;
              &.active,
              &:hover {
                cursor: pointer;
                background-color: #f0f1fe;
                color: @color-blue;
              }
            }
          }
        }
      }
      .main-container__content {
        flex: 1;
      }
    }
    &__bottom-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 50px;

      font-size: 14px;
      color: #888;
      cursor: pointer;
    }
    .operate-disable {
      pointer-events: none;
      opacity: 0.6;
      user-select: none;
    }
    .el-button--danger {
      &:focus,
      &:hover {
        background: #fb3a32;
        border: 1px solid #fb3a32;
      }
      &.is-disabled {
        background: #fb3a32;
      }
    }
  }
</style>
