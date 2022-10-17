<template>
  <div class="vmp-member-list-wap">
    <div v-if="groupInitData.isInGroup" class="vmp-member-list-wap__group-title">
      <i class="vh-iconfont vh-line-group"></i>
      <span v-text="groupInitData.name"></span>
    </div>
    <van-pull-refresh v-model="refreshing" @refresh="handleRefresh" class="member-list-wrap">
      <van-list v-model="loading" :finished="finished" finished-text="" @load="loadMore">
        <div class="member-list-item" v-for="item in list" :key="item['account_id']">
          <div class="avatar-box">
            <img :src="item && item['avatar'] ? item['avatar'] : defaultAvatar" alt="" />
            <img
              v-show="[1, '1', 3, '3'].includes(item.device_type)"
              class="member-list-item__avatar-wrapper__phone"
              width="9"
              height="12"
              :src="phoneImg"
              alt
            />
          </div>

          <div class="info-name">{{ item['nickname'] }}</div>

          <div
            class="info-role"
            :class="[filterUserRole(item, 'className')]"
            v-if="filterUserRole(item, 'name')"
          >
            {{ filterUserRole(item, 'name') }}
          </div>

          <div class="info-role info-role--guest" v-if="filterGroupLeader(item)">
            {{ $t('chat.chat_1064') }}
          </div>

          <div class="self" v-if="item.role_name == 1">
            <i class="vh-saas-iconfont vh-saas-line-speaker"></i>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>
<script>
  import defaultAvatar from '@/app-shared/assets/img/my-dark@2x.png';
  import phoneImg from '@/app-shared/assets/img/phone_wap.png';

  import { uniqBy, throttle } from 'lodash';
  import { useRoomBaseServer, useMemberServer, useGroupServer, useMsgServer } from 'middle-domain';
  export default {
    name: 'VmpMemberListWap',
    data() {
      return {
        // 成员列表
        list: [],
        // 是否正在加载
        loading: false,
        // 分页配置
        pageConfig: {
          page: 0,
          limit: 100,
          total: 0
        },
        // 默认头像
        defaultAvatar: defaultAvatar,
        //手机图片标识
        phoneImg: phoneImg,
        // 是否全部加载完成
        finished: false,
        // 是否是在刷新
        refreshing: false,
        //房间号
        roomId: ''
      };
    },
    computed: {
      //分组活动信息
      groupInitData() {
        return this.groupServer.state.groupInitData;
      },
      //用户角色转换
      filterUserRole() {
        const mapList = [
          {
            code: 1,
            name: this.$getRoleName(1),
            className: 'info-role--host'
          },
          {
            code: 3,
            name: this.$getRoleName(3),
            className: 'info-role--assistant'
          },
          {
            code: 4,
            name: this.$getRoleName(4),
            className: 'info-role--guest'
          }
        ];
        return function (item, key) {
          const result = mapList.find(value => {
            return value.code == item.role_name;
          });
          return result ? result[key] : '';
        };
      },
      // 找出组长
      filterGroupLeader() {
        return function (item) {
          return [20, '20'].includes(item.role_name);
        };
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.msgServer = useMsgServer();
      this.groupServer = useGroupServer();
      this.memberServer = useMemberServer();
    },
    created() {
      this.initViewData();
      this.getList();
    },
    mounted() {
      this.listenEvents();
    },
    methods: {
      //初始化视图数据
      initViewData() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { interact = {} } = watchInitData;
        this.roomId = interact.room_id;
      },
      // 初始化事件监听
      listenEvents() {
        const _this = this;
        // 加入房间消息
        this.msgServer.$onMsg('JOIN', msg => {
          this.handleGroupPerson(msg, 'JOIN');
        });
        // 离开房间消息
        this.msgServer.$onMsg('LEFT', msg => {
          this.handleGroupPerson(msg, 'LEFT');
        });
        //直播结束
        this.msgServer.$on('live_over', () => {
          this.updateOnlineUserList();
        });
        this.msgServer.$onMsg('ROOM_MSG', rawMsg => {
          let temp = Object.assign({}, rawMsg);
          if (Object.prototype.toString.call(temp.data) !== '[object Object]') {
            temp.data = JSON.parse(temp.data);
            temp.context = JSON.parse(temp.context);
          }
          const { type = '' } = temp.data || {};
          switch (type) {
            case 'group_leader_change':
              // handleGroupLeaderChange(temp);
              break;
            case 'group_join_info':
              // handleGroupJoinInfoChange(temp);
              break;
            case 'room_channel_change':
              // handleChannelChange(temp);
              break;
            case 'main_room_join_change':
              handleMainRoomJoinChange(temp);
              break;
            case 'group_switch_start':
              //groupServer并不会给在主房间的观众发开始讨论的消息，所以这里需要监听房间事件
              _this.updateOnlineUserList();
              break;
            case 'group_switch_proceed':
              //groupServer并不会给在主房间的观众发开始讨论的消息，所以这里需要监听房间事件
              _this.updateOnlineUserList();
              break;
            default:
              break;
          }
        });

        //结束讨论
        this.groupServer.$on('GROUP_SWITCH_END', msg => {
          this.updateOnlineUserList();
        });
        // 主持人进入退出小组 消息监听
        this.groupServer.$on('GROUP_MANAGER_ENTER', msg => {
          this.updateOnlineUserList();
        });
        //解散小组
        this.groupServer.$on('GROUP_DISBAND', () => {
          this.updateOnlineUserList();
        });
        // 踢出小组
        this.groupServer.$on('ROOM_GROUP_KICKOUT', msg => {
          handleGroupKicked(msg);
        });
        //切换频道
        this.groupServer.$on('ROOM_CHANNEL_CHANGE', msg => {
          this.updateOnlineUserList();
        });
        // 切换组长(组长变更)
        this.groupServer.$on('GROUP_LEADER_CHANGE', msg => {
          handleGroupLeaderChange(msg);
        });
        //为上线的分组成员添加身份
        this.groupServer.$on('GROUP_JOIN_INFO', msg => {
          handleGroupJoinInfoChange(msg);
        });
        //踢出小组
        function handleGroupKicked(msg) {
          if (!_this.groupInitData.isInGroup) return;
          if (_this.userId == msg.data.target_id) {
            _this.initList();
          } else {
            // 不等于时删除该人员
            _this.list.forEach((item, index) => {
              if (item.account_id == msg.data.target_id) {
                _this.list.splice(index, 1);
                _this.memberServer.updateState('onlineUsers', _this.list);
              }
            });
          }
        }
        // 组长改变的消息
        function handleGroupLeaderChange(msg) {
          console.log(msg, '组长改变的消息');
          if (!_this.groupInitData.isInGroup) {
            return;
          }
          _this.updateOnlineUserList();
        }
        // 人员身份更改
        function handleGroupJoinInfoChange(msg) {
          _this.list.forEach(item => {
            if (item.account_id == msg.data.accountId) {
              item.role_name = msg.data.join_role;
            }
          });
        }
        // 主房间人员变动
        function handleMainRoomJoinChange(msg) {
          // 必须在主房间
          if (!_this.groupInitData.isInGroup) {
            // 进入主房间
            if (msg.data.isJoinMainRoom) {
              _this.list.push({
                nickname: msg.data.nickname || msg.data.nick_name,
                isBanned: msg.data.isBanned,
                account_id: msg.data.accountId,
                role_name: msg.data.role_name == 20 ? 2 : msg.data.role_name,
                device_type: msg.data.device_type
              });
            } else {
              _this.list.forEach((item, index) => {
                if (item.account_id == msg.data.accountId) {
                  _this.list.splice(index, 1);
                }
              });
            }
          }
        }
      },
      //初始化列表信息，然后重新请求列表数据
      initList() {
        this.pageConfig.page = 0;
        this.list = [];
        this.getList();
      },
      //更新列表
      updateOnlineUserList: throttle(function () {
        this.pageConfig.page = 0;
        this.list = [];
        this.getList();
      }, 2000),
      // 获取成员列表
      getList() {
        const params = {
          room_id: this.roomId,
          pos: this.pageConfig.page,
          limit: this.pageConfig.limit
        };
        this.loading = true;
        return this.memberServer
          .getOnlineUserList(params)
          .then(res => {
            const { list = [], total = 0, code } = res && res.data ? res.data : {};
            if (this.pageConfig.page === 0) {
              this.list = list;
            } else {
              this.list.push(...list);
            }
            const uniqList = uniqBy(this.list, 'account_id');
            this.list = this.memberServer._sortUsers(uniqList);
            this.memberServer.updateState('onlineUsers', this.list);
            this.pageConfig.total = total;
            this.finished = this.list.length >= total;
            if (!['200', 200].includes(code) || !list.length) {
              if (!this.pageConfig.page) return;
              this.pageConfig.page--;
            }
            this.memberServer.updateState('totalNum', this.pageConfig.total);
          })
          .catch(error => {
            console.log(error, '请求在线人员错误');
          })
          .finally(() => {
            this.loading = false;
          });
      },
      // 加载更多
      loadMore() {
        if (this.loading || this.finished || this.refreshing) {
          return;
        }
        this.pageConfig.page++;
        this.getList();
      },
      // 下拉刷新处理
      handleRefresh() {
        this.refreshing = true;
        this.pageConfig.total = 0;
        this.pageConfig.page = 0;
        this.list = [];
        this.getList().finally(() => {
          this.refreshing = false;
        });
      },
      // 人员加入或者离开房间
      handleGroupPerson(info, type) {
        try {
          if (typeof info !== 'object') {
            info = JSON.parse(info);
          }

          if (info.context && typeof info.context !== 'object') {
            info.context = JSON.parse(info.context);
          }

          if (info.data && typeof info.data !== 'object') {
            info.data = JSON.parse(info.data);
          }
        } catch (e) {
          console.log(e);
        }
        // 不在小组中，并且join消息的人是在小组中的，不处理
        if (!this.groupInitData.isInGroup && info.context.groupInitData.isInGroup) {
          return;
        }
        const temp = {
          account_id: info.sender_id,
          ...info.context,
          role_name:
            (info.context.groupInitData &&
              info.context.groupInitData.isInGroup &&
              info.context.groupInitData.join_role) ||
            (info.context && info.context.role_name)
        };
        if (temp && Object.prototype.hasOwnProperty.call(temp, 'nick_name')) {
          temp.nickname = temp.nick_name;
        }
        const index = this.list.findIndex(item => item.account_id === temp.account_id);

        if (type === 'JOIN' && index === -1) {
          this.list.push(temp);
          this.list = this.memberServer._sortUsers(this.list);
          this.pageConfig.total++;
          return;
        }
        if (type === 'LEFT' && index !== -1) {
          this.list.splice(index, 1);
          this.pageConfig.total--;
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-member-list-wap {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    padding-bottom: 100px;
    .member-list-wrap {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding-bottom: 100px;
    }
    .member-list-item {
      margin: 0 0;
      padding: 23px 30px 23px 24px;
      display: flex;
      align-items: center;
    }
    .avatar-box {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      // background: #ffffff;
      border-radius: 100%;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 50%;
        display: block;
      }
      .member-list-item__avatar-wrapper__phone {
        position: absolute;
        width: 12px;
        height: 17px;
        right: -2px;
        bottom: -2px;
      }
    }
    .info-name {
      max-width: 4rem;
      margin-left: 16px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      word-break: break-all;
      vertical-align: middle;
      color: var(--theme-group-name-color);
      font-style: normal;
      font-weight: 400;
      font-size: 28px;
      line-height: 28px;
    }
    .info-role {
      text-align: center;
      padding: 4px 8px;
      margin-left: 8px;
      border-radius: 100px;
      vertical-align: middle;
      font-size: 22px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      line-height: 22px;
    }
    .info-role--host {
      background: rgba(255, 209, 201, 1);
      color: #fb2626;
    }
    .info-role--assistant {
      background: rgba(10, 127, 245, 0.15);
      color: rgba(10, 127, 245, 1);
    }
    .info-role--guest {
      background: rgba(10, 127, 245, 0.15);
      color: rgba(10, 127, 245, 1);
    }
    .info-role--demonstrate {
      background: rgba(0, 0, 0, 0.4);
      color: #ffffff;
    }
    .vmp-member-list-wap__group-title {
      color: var(--theme-group-color);
      text-align: left;
      padding: 23px 24px;
      i {
        display: inline-block;
        vertical-align: middle;
        font-size: 44px;
        margin-right: 8px;
      }
      span {
        display: inline-block;
        vertical-align: middle;
        font-style: normal;
        font-weight: 400;
        font-size: 32px;
        line-height: 45px;
        color: var(--theme-group-color);
      }
    }
    .self {
      position: absolute;
      right: 30px;
      .vh-saas-iconfont {
        color: rgba(217, 131, 3, 1);
        font-size: 28px;
      }
    }
  }
</style>
