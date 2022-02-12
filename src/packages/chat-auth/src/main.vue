<template>
  <div class="vmp-chat-auth">
    <!--聊天审核头部栏-->
    <div class="vmp-chat-auth__header-bar">
      <!--活动标题-->
      <!--      <div class="header-bar__title">-->
      <!--        <i class="iconfont iconzhibo"></i>-->
      <!--        {{ activityInfo.title }}-->
      <!--      </div>-->
      <div class="header-bar__operate-bar">
        <div class="switch-box">
          <span class="switch-title">聊天审核</span>
          <el-switch
            v-model="enableChatAuth"
            :inactive-color="options.inactiveColor"
            :width="32"
            :active-color="options.activeColor"
            @change="toggleChatAuth"
          ></el-switch>
          <span class="switch-title sub-title">
            {{ enableChatAuth ? '已开启' : '已关闭' }}，开启后可进行聊天人工审核
          </span>
        </div>
        <span
          class="header-bar__auto-set-btn"
          :class="{ disabled: !enableChatAuth }"
          @click="openAutoSettingModal"
        >
          <i class="iconfont iconshezhi"></i>
          自动审核设置
        </span>
      </div>
    </div>
    <div class="vmp-chat-auth__main">
      <div class="main-container">
        <!--列表操作栏-->
        <div class="main-container__header">
          <div
            class="table-select"
            :class="{ disabled: selectMenuType !== 'auth' || (list && !list.length) }"
          >
            <i class="el-icon-s-operation"></i>
            <div class="sub-menus">
              <span :class="{ active: selectDataType === 'page' }" @click="changeDataType('page')">
                选择本页数据
              </span>
              <span :class="{ active: selectDataType === 'all' }" @click="changeDataType('all')">
                选择所有数据
              </span>
            </div>
          </div>
          <div class="table-menu" :class="{ disabled: isCooling }">
            <span
              class="table-menu-item"
              :class="{ active: selectMenuType === 'auth' }"
              @click="switchToTab('auth')"
            >
              未审核({{ authTotal }})
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
              已通过({{ passedTotal }})
            </span>
            <span
              class="table-menu-item"
              :class="{ active: selectMenuType === 'muted' }"
              @click="switchToTab('muted')"
            >
              禁言({{ mutedTotal }})
            </span>
            <span
              class="table-menu-item"
              :class="{ active: selectMenuType === 'kickedOut' }"
              @click="switchToTab('kickedOut')"
            >
              踢出({{ kickedOutTotal }})
            </span>
          </div>
          <div
            class="table-handle"
            :class="{ disabled: !selectMsgIds.length }"
            v-if="selectMenuType === 'auth'"
          >
            <el-button
              v-if="!selectMsgIds.length"
              type="default"
              :size="controlConfig.size"
              :round="controlConfig.round"
            >
              其他操作
            </el-button>
            <el-dropdown @command="handleCommand" v-else>
              <span class="el-dropdown-link">
                <el-button type="default" :size="controlConfig.size" :round="controlConfig.round">
                  其他操作
                </el-button>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="batchBaned">批量禁言</el-dropdown-item>
                <el-dropdown-item command="batchKicked">批量踢出</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button
              type="success"
              @click="handleBatchPass()"
              :size="controlConfig.size"
              :round="controlConfig.round"
            >
              批量通过
            </el-button>
            <el-button
              type="danger"
              @click="handleBatchPrevent()"
              :size="controlConfig.size"
              :round="controlConfig.round"
            >
              批量阻止
            </el-button>
          </div>
          <span class="el-icon-refresh-right refresh-btn" @click="refreshList"></span>
        </div>
        <div class="main-container__content">
          <auth-table
            :select-menu-type="selectMenuType"
            :options="options"
            :list="currentList"
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
    <auto-setting-modal ref="autoSettingModal" :options="options"></auto-setting-modal>
  </div>
</template>

<script>
  import autoSettingModal from './components/autoSettingModal';
  import authTable from './components/authTable';
  import { useChatAuthServer, useMsgServer } from 'middle-domain';
  export default {
    name: 'VmpChatAuth',
    components: {
      autoSettingModal,
      authTable
    },
    data() {
      return {
        //todo 需要根据配置决定是否展示活动标题 活动信息
        activityInfo: {
          title: '测试用活动标题'
        },
        //开启聊天审核
        enableChatAuth: false,
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
        //列表数据
        list: [],
        //已通过审核的列表
        passedList: [],
        // 被踢出和禁言的消息列表
        specialUser: [],
        //已阻止的数量
        prohibitTotal: 0,
        //未审核的数量
        authTotal: 0,
        //已通过总数
        passedTotal: 0,
        //已禁言总数
        mutedTotal: 0,
        //已踢出的总数
        kickedOutTotal: 0,
        //查询参数
        searchParams: {
          page: 1,
          pageSize: 200,
          total: 0
        },
        //todo  tab切换限流 是否在冷却
        isCooling: false,
        //选中的操作消息的id集合
        selectMsgIds: [],
        //选中的操作人员的id集合
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
          activeColor: '#FFD021'
        },
        //当前活动id
        webinarId: this.$route.params.id || '',
        //url上携带的参数
        urlParams: {}
      };
    },
    computed: {
      //当前的列表
      currentList() {
        let list = [];
        switch (this.selectMenuType) {
          case 'auth':
            //未审核
            list = this.list;
            break;
          case 'prohibit':
            //已阻止
            break;
          case 'passed':
            list = this.passedList;
            //已通过
            break;
          case 'muted':
            list = this.specialUser;
            break;
          case 'kickedOut':
            list = this.specialUser;
            break;
          default:
            break;
        }
        return list;
      }
    },
    beforeCreate() {
      this.chatAuthServer = useChatAuthServer();
      this.msgServer = useMsgServer();
    },
    created() {
      this.init();
      this.getFooterInfo();
    },
    mounted() {
      console.log(this.chatAuthServer, 'chatAuthServer');
    },
    methods: {
      //todo 初始化方法
      init() {
        //获取活动信息
        this.getActivityInfo();
        //获取聊天审核开关状态
        this.getChatAuthEnableStatus();
        //提取Url参数
        this.urlParams = this.extractionUrlParams();
        //初始化房间信息，这里也会在domain里初始化聊天sdk和消息sdk
        this.initRoomInfo();
      },
      listenEvents() {
        this.msgServer.$onMsg('CHAT', rawMsg => {
          let temp = Object.assign({}, rawMsg);
          if (typeof temp.data !== 'object') {
            temp.data = JSON.parse(temp.data);
            temp.context = JSON.parse(temp.context);
          }
          const { type = '' } = temp.data || {};
          switch (type) {
            case 'disable':
              break;
            case 'permit':
              break;
            default:
              break;
          }
        });
        this.msgServer.$onMsg('ROOM_MSG', rawMsg => {
          let temp = Object.assign({}, rawMsg);
          if (typeof temp.data !== 'object') {
            temp.data = JSON.parse(temp.data);
            temp.context = JSON.parse(temp.context);
          }
          const { type = '' } = temp.data || {};
          switch (type) {
            case 'room_kickout':
              break;
            case 'room_kickout_cancel':
              break;
            default:
              break;
          }
        });
      },
      //操作用户
      operateUser(id, type) {
        //更新tab栏上的未读数
        if (type === 'room_kickout') {
          this.kickedOutTotal++;
        } else if (type === 'disable') {
          this.mutedTotal++;
        }
        const { baseChanelInfo = {} } = this.chatAuthServer.state || {};
        const params = Object.assign({ msg_id: '', status: 2 }, baseChanelInfo);
        this.list.forEach(item => {
          if (item.third_party_user_id === id) {
            params.msg_id += item.msg_id + ',';
          }
        });
        this.fetchOperate(params);
      },
      fetchOperate(params, cb) {
        if (!params.msg_id) return;
        this.chatAuthServer
          .operateMessage(params)
          .then(res => {
            if (cb) {
              cb();
            }
            if (res.code === 50014) {
              this.getChatMessageList();
            } else if (res.code == 10001) {
              this.$message.warning(res.msg);
            }
          })
          .catch(res => {
            if (res.code === 50014) {
              this.getChatMessageList();
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
        const url = window.location.href;
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
      //获取房间信息  todo 获取房间信息，初始化消息sdk和聊天sdk
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

        return this.chatAuthServer
          .initRoomInfo(params)
          .then(res => {
            sessionStorage.setItem('interact_token', res.data.interact.interact_token);
            if (!sessionStorage.getItem('user')) {
              sessionStorage.setItem('user', JSON.stringify(res.data.join_info));
            }
            //获取审核按钮状态
            this.getChatAuthEnableStatus();

            //初始化聊天消息监听
            this.initListenEvents();
            //获取所有tab下的数据
            this.initTabTotalNum();
          })
          .catch(error => {
            console.log(error);
          });
      },
      //todo 获取活动信息
      getActivityInfo() {},
      //获取聊天审核开启状态
      getChatAuthEnableStatus() {
        const { baseChanelInfo = {} } = this.chatAuthServer.state || {};
        const params = { ...baseChanelInfo };
        return this.chatAuthServer
          .getChatAuthEnableStatus(params)
          .then(res => {
            this.enableChatAuth = res.data.switch || 1;
            this.enableAutoHandle = res.data.switch_options + '';
          })
          .catch(res => {
            this.$message({
              message: res.msg,
              type: 'error'
            });
          });
      },
      //todo 获取tab上的处理数
      initTabTotalNum() {
        //获取全部的tab
        this.getChatMessageList();
        this.getPassedMessageList();
        this.getMutedUserList();
        this.getKickedUserList();
      },
      //初始化事件监听
      initListenEvents() {
        this.msgServer.$onMsg('CHAT', rawMsg => {
          let temp = Object.assign({}, rawMsg);
          if (typeof temp.data !== 'object') {
            temp.data = JSON.parse(temp.data);
            temp.context = JSON.parse(temp.context);
          }
          const { type = '' } = temp.data || {};
          switch (type) {
            case 'disable':
              this.operateUser(temp.data.target_id, type);
              break;
            case 'permit':
              this.mutedTotal--;
              this.specialUser = this.specialUser.filter(item => {
                return item.account_id !== temp.data.target_id;
              });
              break;
            default:
              break;
          }
        });
        this.msgServer.$onMsg('ROOM_MSG', rawMsg => {
          let temp = Object.assign({}, rawMsg);
          if (typeof temp.data !== 'object') {
            temp.data = JSON.parse(temp.data);
            temp.context = JSON.parse(temp.context);
          }
          const { type = '' } = temp.data || {};
          switch (type) {
            case 'room_kickout':
              this.operateUser(temp.data.target_id, type);
              break;
            case 'room_kickout_cancel':
              this.kickedOutTotal--;
              this.specialUser = this.specialUser.filter(item => {
                return item.account_id !== temp.data.target_id;
              });
              break;
            default:
              break;
          }
        });
      },
      //获取未审核的聊天数据 (0:未审核 1:通过  2:阻止)
      getChatMessageList() {
        const { baseChanelInfo = {} } = this.chatAuthServer.state || {};
        const params = Object.assign({}, baseChanelInfo);
        this.list = [];
        let tempItem = {};
        let object = {};
        let context, data;
        this.chatAuthServer.getAuditMessageList(params).then(res => {
          for (let i in res.data) {
            object = JSON.parse(res.data[i]);
            context =
              typeof JSON.parse(object.context) === 'object'
                ? JSON.parse(object.context)
                : JSON.parse(JSON.parse(object.context));
            tempItem.nick_name = context.nickname || context.nick_name;
            tempItem.time = object.time;
            tempItem.type = object.type;
            tempItem.msg_id = i;
            tempItem.third_party_user_id = object.sender_id; // 发送消息的人第三方id
            tempItem.channel = object.channel;
            tempItem.room_id = object.room_id;
            data = JSON.parse(object.data);
            if (tempItem.type === 'text') {
              tempItem.text_content = data.barrageTxt || data.text_content;
            } else if (tempItem.type === 'video') {
              tempItem.video_url = data.video_url;
            } else if (tempItem.type === 'voice') {
              tempItem.voice_url = data.voice_url;
            } else if (tempItem.type === 'image') {
              tempItem.image_urls = data.image_urls;
              if (Object.prototype.hasOwnProperty.call(data, 'text_content')) {
                tempItem.text_content = data.barrageTxt || data.text_content;
              }
            } else if (tempItem.type === 'link') {
              tempItem.link_url = data.link_url;
            }
            tempItem.isOperate = 0; // 0 未对数据操作， 1审核通过，2拒绝
            this.list.push(tempItem);
            tempItem = {};
            object = {};
          }
        });
      },
      //获取已通过的审核的聊天数据
      getPassedMessageList() {
        const { baseChanelInfo = {}, createTime = '' } = this.chatAuthServer.state;
        const params = {
          ...baseChanelInfo,
          msg_type: 'image,text,link,video,voice',
          page_size: this.searchParams.pageSize,
          curr_page: this.searchParams.page,
          start_time: createTime
        };
        this.chatAuthServer.getPassedMessageList(params).then(res => {
          this.passedList = res.data.list;
          this.passedTotal = res.data.total;
          this.searchParams.total = res.data.total;
        });
      },
      //获取被禁言的人员列表
      getMutedUserList() {
        const { roomInfo = {} } = this.chatAuthServer.state;
        const params = {
          ...roomInfo,
          pos: 0,
          limit: this.searchParams.pageSize
        };
        return this.chatAuthServer
          .getBannedList(params)
          .then(res => {
            this.specialUser = res.data.list;
            this.searchParams.total = res.data.total;
            this.mutedTotal = res.data.total;
          })
          .catch(error => {
            console.log(error);
          });
      },
      //获取被踢出的人员列表
      getKickedUserList() {
        const { roomInfo = {} } = this.chatAuthServer.state;
        const params = {
          ...roomInfo,
          pos: 0,
          limit: this.searchParams.pageSize
        };
        return this.chatAuthServer
          .getKickedList(params)
          .then(res => {
            this.specialUser = res.data.list;
            this.searchParams.total = res.data.total;
            this.kickedOutTotal = res.data.total;
          })
          .catch(error => {
            console.log(error);
          });
      },
      //打开自动审核弹窗
      openAutoSettingModal() {
        this.$refs.autoSettingModal.openModal({ enableAutoHandle: this.enableAutoHandle });
      },
      //开启/关闭聊天审核
      toggleChatAuth() {
        const params = {};
        this.chatAuthServer
          .toggleChatAuthStatus(params)
          .then(res => {
            console.log(res);
          })
          .catch(error => {
            console.log(error);
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
        //todo 考虑优化
      },
      //切换tab
      switchToTab(type = '') {
        // 相等表示当前点击的是当前tab
        if (this.selectMenuType === type) {
          return;
        }
        this.list = [];
        this.isCooling = true;
        let s = setTimeout(() => {
          clearTimeout(s);
          this.isCooling = false;
        }, 1000);
        this.selectMenuType = type;
        this.searchParams.page = 1;
      },
      //刷新当前tab下的列表
      refreshList() {},
      //选中下拉选项的处理
      handleCommand(type) {
        console.log(type);
      },
      //批量通过
      handleBatchPass() {},
      //批量阻止
      handleBatchPrevent() {}
    }
  };
</script>

<style lang="less">
  .vmp-chat-auth {
    @color-blue: #4b5afe;
    @color-blue-hover: #5d6afe;
    @color-bd: #e2e2e2;
    @color-default-hover: #fdd43f;
    @color-default-active: #eec11a;
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
          .iconfont {
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
        .iconfont {
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
          .iconfont {
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
  }
</style>
