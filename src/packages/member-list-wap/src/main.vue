<template>
  <div class="vmp-member-list-wap">
    <div v-if="groupInitData.isInGroup" class="vmp-member-list-wap__group-title">
      <i class="vh-iconfont vh-line-group"></i>
      {{ groupInitData.name }}
    </div>
    <van-pull-refresh v-model="refreshing" @refresh="handleRefresh" class="member-list-wrap">
      <van-list v-model="loading" :finished="finished" finished-text="" @load="loadMore">
        <div class="member-list-item" v-for="item in list" :key="item['account_id']">
          <div class="avatar-box">
            <img :src="item && item['avatar'] ? item['avatar'] : defaultAvatar" alt="" />
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
            <i class="vh-iconfont vh-saas-line-speaker"></i>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>
<script>
  import defaultAvatar from '@/packages/app-shared/assets/img/default_avatar.png';
  import { uniqBy } from 'lodash';
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
          limit: 10,
          total: 0
        },
        // 默认头像
        defaultAvatar: defaultAvatar,
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
            name: this.$t('chat.chat_1022'),
            className: 'info-role--host'
          },
          {
            code: 3,
            name: this.$t('chat.chat_1024'),
            className: 'info-role--assistant'
          },
          {
            code: 4,
            name: this.$t('chat.chat_1023'),
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
        console.log(this.roomBaseServer.state);
        this.roomId = interact.room_id;
      },
      // 初始化事件监听
      listenEvents() {
        const _this = this;
        // 加入房间消息
        this.msgServer.$on('JOIN', msg => {
          console.log(msg, '加入房间消息');
          this.handleGroupPerson(msg, 'JOIN');
        });
        // 离开房间消息
        this.msgServer.$on('LEFT', msg => {
          console.log(msg, '离开房间消息');
          this.handleGroupPerson(msg, 'LEFT');
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
              handleGroupLeaderChange(temp);
              break;
            case 'group_join_info':
              handleGroupJoinInfoChange(temp);
              break;
            case 'room_channel_change':
              handleChannelChange(temp);
              break;
            case 'main_room_join_change':
              handleMainRoomJoinChange(temp);
              break;
            default:
              break;
          }
        });
        // 组长改变的消息
        function handleGroupLeaderChange(msg) {
          console.log(msg, '组长改变的消息');
        }
        // 人员身份更改
        function handleGroupJoinInfoChange(msg) {
          _this.list.forEach(item => {
            if (item.account_id == msg.accountId) {
              item.role_name = msg.join_role;
            }
          });
          console.log(msg, '人员身份更改');
        }
        //切换channel
        function handleChannelChange(msg) {
          console.log('room_channel_change', msg);
          setTimeout(() => {
            _this.pageConfig.page = 0;
            _this.list = [];
            _this.getList();
          }, 1000);
        }
        // 主房间人员变动
        function handleMainRoomJoinChange(msg) {
          // 必须在主房间
          if (!_this.groupInitData.isInGroup) {
            // 进入主房间
            if (msg.data.isJoinMainRoom) {
              _this.list.push({
                nickname: msg.nickname,
                isBanned: msg.isBanned,
                account_id: msg.accountId,
                role_name: msg.role_name == 20 ? 2 : msg.role_name,
                device_type: msg.device_type
              });
            } else {
              _this.list.forEach((item, index) => {
                if (item.account_id == msg.accountId) {
                  _this.list.splice(index, 1);
                }
              });
            }
            console.log(msg, 'MAIN_ROOM_JOIN_CHANGE');
          }
        }
      },
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
            console.log(res, '请求在线人员');
            const { list = [], total = 0, code } = res && res.data ? res.data : {};
            if (this.pageConfig.page === 0) {
              this.list = list;
            } else {
              this.list.push(...list);
            }
            const uniqList = uniqBy(this.list, 'account_id');
            this.list = this._sortUsers(uniqList);
            console.log(this.list);
            this.pageConfig.total = total;
            this.finished = this.list.length >= total;
            if (!['200', 200].includes(code) || !list.length) {
              if (!this.pageConfig.page) return;
              this.pageConfig.page--;
            }
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
        console.log('222222');
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
      /**
       * 将在线人员列表分为五个部分排序 主持人 / 上麦嘉宾 / 下麦嘉宾 / 助理 / 上麦观众 / 普通观众
       */
      _sortUsers(list) {
        const host = []; // 主持人
        const onMicGuest = []; // 上麦嘉宾
        const downMicGuest = []; // 下麦嘉宾
        const assistant = []; // 助理
        const onMicAudience = []; // 上麦观众
        let downMicAudience = []; // 普通观众
        const leader = []; // 组长
        list.forEach(item => {
          switch (Number(item.role_name)) {
            // 主持人
            case 1:
              host.push(item);
              break;
            // 观众
            case 2:
              item.is_speak ? onMicAudience.push(item) : downMicAudience.push(item);
              break;
            // 助理
            case 3:
              assistant.push(item);
              break;
            // 嘉宾
            case 4:
              item.is_speak ? onMicGuest.push(item) : downMicGuest.push(item);
              break;
            // 组长
            case 20:
              leader.push(item);
              break;
            default:
              console.error('角色未定义');
              break;
          }
        });

        // 加载更多的时候，如果普通观众超过200，只显示后200
        if (downMicAudience.length > 200) {
          downMicAudience = downMicAudience.slice(-200);
        }
        return host.concat(
          onMicGuest,
          downMicGuest,
          assistant,
          leader,
          onMicAudience,
          downMicAudience
        );
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
        const temp = {
          account_id: info.sender_id,
          ...info.context,
          role_name:
            (info.context.groupInitData && info.context.groupInitData.join_role) ||
            (info.context && info.context.role_name)
        };
        if (temp && Object.prototype.hasOwnProperty.call(temp, 'nick_name')) {
          temp.nickname = temp.nick_name;
        }
        const index = this.list.findIndex(item => item.account_id === temp.account_id);
        console.log(this.list);

        if (type === 'JOIN' && index === -1) {
          this.list.push(temp);
          this.list = this._sortUsers(this.list);
          this.pageConfig.total++;
          console.log(temp, '上线人员信息');
          return;
        }
        if (type === 'LEFT' && index !== -1) {
          this.list.splice(index, 1);
          this.pageConfig.total--;
          console.log(temp, '离线人员信息');
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
    .member-list-wrap {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding-bottom: 20px;
    }
    .member-list-item {
      margin: 0 32px 38px 32px;
      display: flex;
      align-items: center;
      &:first-child {
        margin-top: 19px;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }
    .avatar-box {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 50%;
        display: block;
        border: 2px solid #e3e3e3;
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
      font-size: 30px;
      font-weight: 400;
      color: #8c8c8c;
      line-height: 30px;
      vertical-align: middle;
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
      background: rgba(255, 209, 201, 0.7);
      color: #fb2626;
    }
    .info-role--assistant {
      background: rgba(173, 225, 255, 0.5);
      color: #0a7ff5;
    }
    .info-role--guest {
      background: rgba(173, 225, 255, 0.5);
      color: #0a7ff5;
    }
    .info-role--demonstrate {
      background: rgba(0, 0, 0, 0.4);
      color: #ffffff;
    }
    .vmp-member-list-wap__group-title {
      padding: 30px 45px 10px;
      .vh-iconfont {
        font-size: 40px;
        vertical-align: text-bottom;
      }
    }
    .self {
      position: absolute;
      right: 32px;
      .vh-iconfont {
        color: #ff9446;
        font-size: 30px;
      }
    }
  }
</style>
