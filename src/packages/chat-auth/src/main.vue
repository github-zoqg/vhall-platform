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
            <span
              class="table-menu-item"
              :class="{ active: selectMenuType === 'prohibit' }"
              @click="switchToTab('prohibit')"
            >
              已阻止({{ prohibitTotal }})
            </span>
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
          <auth-table :select-menu-type="selectMenuType" :options="options"></auth-table>
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
  import { useChatAuthServer } from 'middle-domain';
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
          page_size: 20,
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
          activeColor: '#FFD021',
        }
      };
    },
    beforeCreate() {
      this.chatAuthServer = useChatAuthServer();
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
        this.getActivityInfo();
        this.getChatAuthEnableStatus();
      },
      //todo 获取活动信息
      getActivityInfo() {},
      //todo 获取聊天审核开启状态
      getChatAuthEnableStatus() {},
      //todo 获取tab上的处理数
      initTabTotalNum() {},
      //todo 获取聊天数据 (0:未审核 1:通过  2:阻止)
      getChatMessageList() {},
      //打开自动审核弹窗
      openAutoSettingModal() {
        this.$refs.autoSettingModal.openModal();
      },
      //开启/关闭聊天审核
      toggleChatAuth() {},
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
