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
                  @operateUser="handleOperateUser"
                  :user-info="user"
                  :role-name="roleName"
                  :is-in-group="isInGroup"
                  :webinar_type="webinar_type"
                  :current-speaker-id="currentSpeakerId"
                  :user-id="userId"
                  :apply-users="applyUsers"
                ></member-item>
              </template>
            </template>
          </div>
        </template>
        <!--举手的成员-->
        <template v-if="tabIndex === 2">
          <div class="member-list__apply-tab">
            <div
              v-if="!applyUsers.length"
              class="empty-container"
              :style="{ 'padding-top': `${this.emptyContainerPaddingTop}px` }"
            >
              <span class="iconzanwujushou iconfont"></span>
              <p>暂无人举手</p>
            </div>
            <template v-else>
              <template v-for="user in applyUsers">
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
        <!--受限制的成员-->
        <template v-if="tabIndex === 3">
          <div class="member-list__limit-tab">
            <div
              v-if="!limitedUsers.length"
              class="empty-container"
              :style="{ 'padding-top': `${this.emptyContainerPaddingTop}px` }"
            >
              <span class="iconzanwuchengyuan iconfont"></span>
              <p>没有禁言或者踢出的成员</p>
            </div>
            <template v-else>
              <template v-for="user in limitedUsers">
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
      </div>
    </div>
    <!--底部操作区域-->
    <div class="vmp-member-list__operate-container">
      <!--信息面板-->
      <div class="vmp-member-list__operate-container__info-panel">
        <i class="iconfont iconzaixianrenshu"></i>
        <span class="info-panel__online-num">{{ totalNum | numberCompression }}人在线</span>
        <span class="info-panel__refresh-btn" @click="refreshList">刷新</span>
        <div class="info-panel__allow-raise-hand" v-if="webinar_type !== 6">
          <span class="info-panel__allow-raise-hand__switch-title">允许举手</span>
          <el-switch
            v-model="allowRaiseHand"
            :width="32"
            @change="onSwitchAllowRaiseHand"
            active-color="#fc5659"
          ></el-switch>
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
  import { useMicServer, useRoomBaseServer, useMemberServer } from 'middle-domain';
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
        //当前登录的用户
        userId: '',
        //todo domain负责 在线人数
        onlineUsers: [
          {
            join_id: 1001627,
            room_id: 'lss_1057afbe',
            account_id: '16422770',
            nickname: '春有百花秋有月 夏有凉风冬有雪，若无闲事挂心头便是人间好时节',
            avatar:
              'https://t-alistatic01.e.vhall.com/upload/users/face-imgs/08/2e/082ea1e5abcba87b5d5c57600c1bbec3.jpg',
            role_name: '1',
            is_banned: 0,
            is_kicked: 0,
            device_type: 0,
            device_status: 1,
            is_signed: 0,
            is_answered_questionnaire: 0,
            is_lottery_winner: 0,
            is_answered_exam: 0,
            is_answered_vote: 0,
            status: 0,
            updated_at: '2022-01-13 10:37:25',
            created_at: '2022-01-04 21:30:04',
            deleted_at: '',
            is_speak: 0
          }
        ],
        //申请人数
        applyUsers: [],
        //受限人数
        limitedUsers: [],
        //房间号
        roomId: '',
        //mod 6代表分组活动
        webinar_type: 3,
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
        raiseHandTip: false,
        //分页配置
        pageConfig: {
          page: 1,
          limit: 10
        },
        //受限人员是否为空
        limitedUsersEmpty: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.micServer = useMicServer();
      this.memberServer = useMemberServer();
    },
    beforeDestroy() {},
    mounted() {
      //初始化配置
      this.initConfig();
      //初始化视图数据
      this.initViewData();
      //开始初始化流程
      this.init();
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
        const { join_info = {}, webinar = {}, interact = {} } = watchInitData;
        this.webinar_type = webinar.webinar_type;
        this.roleName = join_info.role_name;
        this.userId = join_info.userId;
        this.roomId = interact.room_id;
      },
      //统一初始化方法
      init() {
        this.getOnlineUserList();
      },
      //获取在线人员列表
      getOnlineUserList() {
        const { getOnlineUserList } = this.memberServer;
        const data = {
          room_id: this.roomId,
          pos: this.pageConfig.page <= 0 ? 0 : 10 * this.pageConfig.page,
          limit: this.pageConfig.limit
        };

        //如果存在输入搜索人员的值
        if (this.searchUserInput) {
          Object.assign(data, { nickname: this.searchUserInput });
        }
        getOnlineUserList(data).then(res => {
          if (res.code === 200) {
            this.onlineUsers = this.memberServer.state.onlineUsers || [];
          }
        });
      },
      //获取受限人员列表
      async getLimitUserList() {
        const { getMutedUserList, getKickedUserList } = this.memberServer;
        const data = {
          room_id: this.roomId,
          pos: 0,
          limit: 100
        };
        try {
          const bannedList = await getMutedUserList(data);
          const kickedList = this.isInGroup
            ? { data: { list: [] } }
            : await getKickedUserList(data);
          const list = bannedList.data.list.concat(kickedList.data.list);
          const hash = {};
          this.limitedUsers = list.reduce((preVal, curVal) => {
            !hash[curVal.account_id] && (hash[curVal.account_id] = true && preVal.push(curVal));
            return preVal;
          }, []);
        } catch (error) {
          console.error('获取受限人员列表接口错误', error);
        }
      },
      //刷新在线人数
      refreshList() {},
      //切换允许举手状态
      onSwitchAllowRaiseHand(status) {},
      //切换聊天搜索框显示状态
      toggleSearchTab() {
        this.searchShow = !this.searchShow;
      },
      //切换至某个tab
      switchToTab(index) {
        this.tabIndex = index;
        //清空输入的人员筛选
        this.searchUserInput = '';
        if (index === 2) {
          this.raiseHandTip = false;
        } else if (index === 3) {
          this.getLimitUserList();
        }
        //todo scroll调整
      },
      //清空人员搜索
      clearSearchInput() {
        this.searchUserInput = '';
      },
      //按条件进行搜索
      doSearch() {},
      //响应人员操作
      handleOperateUser({ type = '', params = {} }) {
        console.log(type, params);
      }
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
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
      }
      .empty-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        span {
          font-size: 80px;
          color: #7e7e7e;
        }
        p {
          margin-top: 10px;
          color: #999999;
        }
      }
      .member-list__all-tab {
        flex: 1;
      }
      .member-list__apply-tab {
        flex: 1;
      }
      .member-list__limit-tab {
        flex: 1;
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
        &__switch-title {
          display: inline-block;
          vertical-align: middle;
          margin-right: 4px;
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
        width: calc(100% - 20px);
        height: 30px;
        position: absolute;
        top: 4px;
        left: 10px;
        background-color: #34363a;
        border-radius: 4px;
        overflow: hidden;

        .search-panel__input {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          background-color: hsla(0, 0%, 100%, 0.9);
          padding: 0 75px 0 10px;
          border: none;
          color: #666;
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
