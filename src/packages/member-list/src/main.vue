<template>
  <div class="vmp-member-list">
    <!--分组名称-->
    <div class="vmp-member-list__group-name" v-if="isInGroup">
      <i class="iconfont icona-icon_fenzutaolun1x"></i>
      <span class="pr_top">{{ roomBaseServer.state.groupInitData.name }}</span>
    </div>
    <!--成员区域-->
    <div class="vmp-member-list__container">
      <div class="vmp-member-list__container__scroll" ref="scroll">
        <!--全部成员-->
        <template v-if="tabIndex === 1">
          <div class="member-list__all-tab">
            <div
              v-if="searchEmpty"
              class="empty-container"
              :style="{ 'padding-top': `${this.emptyContainerPaddingTop}px` }"
            >
              <span class="iconzanwusousuo iconfont"></span>
              <p>很抱歉，没有搜索到您要找的人</p>
            </div>
            <template v-else>
              <template v-for="user in onlineUsers">
                <member-item
                  :key="user.account_id"
                  v-if="![1, '1'].includes(user.is_kicked)"
                  :user-info="user"
                  :role-name="roleName"
                  :is-in-group="isInGroup"
                ></member-item>
              </template>
            </template>
          </div>
        </template>
        <!--举手的成员-->
        <template v-if="tabIndex === 2">
          <div class="member-list__apply-tab"></div>
        </template>
        <!--受限制的成员-->
        <template v-if="tabIndex === 3">
          <div class="member-list__limit-tab"></div>
        </template>
      </div>
    </div>
    <!--底部操作区域-->
    <div class="vmp-member-list__operate-container">
      <!--信息面板-->
      <div class="vmp-member-list__operate-container__info-panel">
        <i class="iconfont iconzaixianrenshu"></i>
        <span class="info-panel__online-num">{{ totalNum | numberCompression }}人在线</span>
        <span class="info-panel__refresh-btn" @click="refreshList">刷新</span>
        <div class="info-panel__allow-raise-hand" v-if="mode !== 6">
          <label class="lb-raisehands" for="lb-raisehands">
            允许举手
            <input
              style="display: none"
              v-model="allowRaiseHand"
              @change="onSwitchAllowRaiseHand"
              type="checkbox"
              id="lb-raisehands"
            />
            <i class="ss">
              <em></em>
            </i>
          </label>
        </div>
      </div>
      <!--按钮面板-->
      <div class="vmp-member-list__operate-container__button-panel">
        <div class="button-panel__btn-box">
          <ul>
            <li
              @click="switchToTab(1)"
              class="button-panel__btn-box__tab-item"
              :class="tabIndex === 1 ? 'active' : ''"
            >
              全部
            </li>
            <li
              @click="switchToTab(2)"
              :class="[
                'button-panel__btn-box__tab-item',
                raiseHandTip ? 'raise-hand' : '',
                tabIndex === 2 ? 'active' : ''
              ]"
            >
              举手
            </li>
            <li
              @click="switchToTab(3)"
              class="button-panel__btn-box__tab-item"
              :class="tabIndex === 3 ? 'active' : ''"
            >
              受限
            </li>
          </ul>
          <div
            v-show="tabIndex === 1"
            @click="toggleSearchTab"
            class="button-panel__btn-box__tab-item search-btn"
          >
            找人
          </div>
        </div>
      </div>
      <div
        v-show="tabIndex === 1 && searchShow"
        class="vmp-member-list__operate-container__search-panel"
      >
        <input
          type="text"
          v-model.trim="searchUserInput"
          class="search-panel__input"
          placeholder="输入成员名称…"
        />
        <a href="javascript:;" @click="clearSearchInput" class="search-panel__clear-btn"></a>
        <span class="search-panel__confirm" @click="doSearch">确定</span>
      </div>
    </div>
  </div>
</template>

<script>
  import memberItem from './components/member-item';
  import { useMicServer, useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpMemberList',
    components: {
      memberItem
    },
    filters: {
      //数值压缩
      numberCompression(num) {
        if (num < 10000) {
          return num;
        } else {
          const n = Math.floor(num / 10000);
          let l = Math.floor((num % 10000) / 1000);
          l = l === 0 ? '' : '.' + l;
          return n + l + '万';
        }
      }
    },
    data() {
      return {
        //成员列表组件配置
        memberOptions: {},
        //当前角色
        roleName: '',
        //todo domain负责 在线人数
        onlineUsers: [],
        //申请人数
        applyUsers: [],
        //受限人数
        limitedUsers: [],
        //mod 6代表分组活动
        mode: 3,
        /** 搜索输入框相关 */
        //是否显示搜索输入框
        searchShow: false,
        //未能找到搜索的人
        searchEmpty: false,
        // 输入的成员名称
        searchUserInput: '',
        //
        /** 搜索输入框结束 */
        // 容器内边距
        emptyContainerPaddingTop: 10,
        //todo domain里取 当前主讲人的id
        currentSpeakerId: '',
        //当前的激活的tab
        tabIndex: 1,
        //总人数
        totalNum: 0,
        //todo 是否允许举手
        allowRaiseHand: false,
        // 举手提示
        raiseHandTip: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.micServer = useMicServer();
      // this.memberServer = userMemberServer();
    },
    beforeDestroy() {},
    mounted() {
      //初始化配置
      this.initConfig();
      //初始化视图数据
      this.initViewData();
    },
    computed: {
      //是否在分组里
      isInGroup() {
        const { state = {} } = this.roomBaseServer;
        const { groupInitData = {} } = state;
        return groupInitData.isInGroup;
      },
      //主讲人ID
      docPermissionId() {
        //todo 临时注释
        const { state = {} } = this.roomBaseServer;
        const { groupInitData = {} } = state;
        return groupInitData.doc_permission;
      }
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          this.memberOptions = widget.options;
        }
      },
      //初始化视图数据
      initViewData() {
        const { groupInitData = {}, watchInitData = {} } = this.roomBaseServer.state;
        const { webinar = {}, join_info = {} } = watchInitData;
        this.mode = webinar.mode;
        this.roleName = join_info.role_name;
      },
      //获取在线人员列表
      getOnlineUserList() {},
      //获取受限人员列表
      getLimitUserList() {},
      //刷新在线人数
      refreshList() {},
      //切换允许举手状态
      onSwitchAllowRaiseHand() {},
      //切换聊天搜索框显示状态
      toggleSearchTab() {
        this.searchShow = !this.searchShow;
      },
      //切换至某个tab
      switchToTab(index) {
        this.tabIndex = index;
      },
      //清空人员搜索
      clearSearchInput() {
        this.searchUserInput = '';
      },
      //按条件进行搜索
      doSearch() {}
    }
  };
</script>

<style lang="less">
  .vmp-member-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    font-size: 12px;
    background-color: #434343;
    &__group-name {
      padding: 18px 20px 5px;
      color: #ccc;
      i {
        vertical-align: bottom;
      }
      .pr_top {
        position: relative;
        top: -2px;
        font-size: 14px;
      }
    }
    &__container {
      flex: 1;
      position: relative;
      &__scroll {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
      }
    }
    &__operate-container {
      position: relative;
      width: 100%;
      height: 80px;
      padding: 10px;
      background-color: #34363a;
      box-sizing: border-box;
      color: #e2e2e2;
      .iconzaixianrenshu {
        margin-top: -3px;
        vertical-align: middle;
        margin-right: 4px;
      }
      .info-panel__online-num {
        display: inline-block;
        margin-left: 6px;
        color: #ababab;
      }
      .info-panel__refresh-btn {
        display: inline-block;
        margin-left: 6px;
        color: #ababab;
        cursor: pointer;
        &:hover {
          color: #4da1ff;
        }
      }
      .info-panel__allow-raise-hand {
        float: right;
        .lb-raisehands {
          cursor: pointer;
          color: #ccc;
          font-size: 12px;
          margin-right: 1px;
          & > input:checked + i em {
            border-color: #ff9446;
            left: 22px;
            transition: all 0.1s ease-in-out;
          }
          & > i {
            display: inline-block;
            width: 30px;
            height: 14px;
            background-color: #242527;
            border-radius: 100px;
            position: relative;
            margin-left: 5px;
            position: relative;
            top: 3px;
            & > em {
              box-sizing: border-box;
              position: absolute;
              top: 2px;
              left: 0;
              content: '';
              width: 10px;
              height: 10px;
              background-color: #242527;
              border: 2px solid #aaaaaa;
              border-radius: 10px;
              transition: all 0.1s ease-in-out;
              backface-visibility: hidden;
              transform-style: preserve-3d;
            }
          }
        }
      }

      .button-panel__btn-box {
        margin-top: 10px;
        & > ul {
          list-style-type: none;
          float: left;
          height: 30px;
          line-height: 30px;
          border-radius: 3px;
          overflow: hidden;
        }
        &__tab-item {
          width: 74px;
          height: 30px;
          text-align: center;
          background-color: #666666;
          color: #cacaca;
          float: left;
          cursor: pointer;
          position: relative;
          margin-right: 1px;
          &:hover {
            background-color: #969696;
            color: #fff;
          }
          &.active {
            background-color: #fc5659;
            color: #fff;
            &:hover {
              color: #fff;

              background-color: #fc5659;
            }
          }
          &.raise-hand {
            &::before {
              content: ' ';
              top: 6px;
              right: 6px;
              position: absolute;
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background-color: #fc5659;
              position: absolute;
            }
          }
        }
        .search-btn {
          float: right;
          width: 50px;
          height: 30px;
          line-height: 30px;
          border-radius: 4px;
          text-align: center;
          color: #fff;
          background-color: #666666;
        }
      }
      &__search-panel {
        display: flex;
        width: 80%;
        height: 30px;
        position: absolute;
        top: 4px;
        left: 10px;
        background-color: #34363a;
        border-radius: 4px;
        overflow: hidden;
        &__input {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.9);
          padding: 0 75px 0 10px;
          border: none;
          color: #666666;
        }
        .search-panel__clear-btn {
          width: 15px;
          height: 15px;
          position: absolute;
          top: 7px;
          right: 55px;
          background-image: url('./images/account-file-close-default.png');
          background-repeat: no-repeat;
          background-size: 100%;
        }
        .search-panel__confirm {
          display: inline-block;
          width: 50px;
          height: 30px;
          line-height: 30px;
          border-radius: 0 4px 4px 0;
          text-align: center;
          background-color: #a6a6a8;
          color: #ffffff;
          position: absolute;
          top: 0;
          right: 0;
          cursor: pointer;
        }
      }
    }
  }
</style>
