<template>
  <div class="vmp-video-polling-member-list">
    <div class="vmp-video-polling-member-list__title">成员</div>
    <!--成员区域-->
    <div class="vmp-video-polling-member-list__container">
      <scroll
        class="vmp-video-polling-member-list__container__scroll"
        ref="scroll"
        :pullUpLoad="false"
        @pullingUp="loadMore"
      >
        <!--全部成员-->
        <div class="member-list__all-tab">
          <member-item
            v-for="user in onlineUsers"
            :key="user.account_id"
            :user-info="user"
          ></member-item>
        </div>
      </scroll>
    </div>
  </div>
</template>

<script>
  import memberItem from './components/member-item';
  import scroll from '@/packages/member-list/src/components/scroll';
  import {
    useMicServer,
    useRoomBaseServer,
    useMemberServer,
    useMsgServer,
    useVideoPollingServer
  } from 'middle-domain';
  export default {
    name: 'VmpVideoPollingMemberList',
    components: {
      memberItem,
      scroll
    },
    data() {
      return {
        //分页配置
        pageConfig: {
          page: 0,
          limit: 100
        }
      };
    },
    beforeCreate() {
      this.memberServer = useMemberServer();
      this.memberServer.updateState('isVideoPolling', true);
      this.msgServer = useMsgServer();
      this.micServer = useMicServer();
      this.videoPollingServer = useVideoPollingServer();
    },
    beforeDestroy() {
      this.removeEventListeners();
    },
    async mounted() {
      await this.getOnlineUserList();
      this.declareEventCallback();
      this.addEventListeners();
    },
    computed: {
      onlineUsers() {
        return this.$domainStore.state.memberServer.onlineUsers;
      },
      //上麦列表
      speakerList() {
        return this.$domainStore.state.micServer.speakerList;
      },
      // 轮询列表
      pollingList() {
        return this.$domainStore.state.videoPollingServer.pollingList;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      }
    },
    watch: {
      pollingList: {
        deep: true,
        immediate: true,
        handler: function () {
          this.videoPollingServer.updateOnlineUsers();
        }
      }
    },
    methods: {
      //获取在线人员列表
      getOnlineUserList(pos) {
        const params = {
          room_id: useRoomBaseServer().state.watchInitData?.interact?.room_id,
          pos: pos || this.pageConfig.page,
          limit: this.pageConfig.limit
        };

        return this.memberServer
          .getOnlineUserList(params)
          .then(res => {
            if (res.code === 200) {
              this.videoPollingServer.updateOnlineUsers();
              this.$refs.scroll.finishPullUp();

              if (!res?.data?.list?.length) {
                this.pageConfig.page > 0 && this.pageConfig.page--;
              }
            } else {
              this.pageConfig.page > 0 && this.pageConfig.page--;
            }
          })
          .catch(() => {
            this.pageConfig.page > 0 && this.pageConfig.page--;
          })
          .finally(() => {
            this.refresh();
          });
      },
      // 滚动加载
      loadMore() {
        this.pageConfig.page++;
        this.getOnlineUserList();
      },
      // 声明消息消息回调函数
      declareEventCallback() {
        this._handleRoomJoin = msg => {
          // 上线的人是自己，不做操作
          if (msg.sender_id == this.joinInfo.third_party_user_id) {
            return;
          }
          // 如果已存在
          if (this.getUserIndex(msg.sender_id, this.onlineUsers) >= 0) {
            return;
          }
          // 在线人数大于 200 不再往列表添加，只能加载更多
          if (msg.uv > 200) {
            return;
          }
          // 当前人是否在麦上
          const isSpeak = this.getUserIndex(msg.sender_id, this.speakerList) > -1;
          // 当前人是否正轮询列表中
          const isPolling = this.getUserIndex(msg.sender_id, this.pollingList) > -1;

          const user = {
            account_id: msg.sender_id,
            avatar: msg.context.avatar,
            device_type: !['', void 0, null].includes(msg.context.device_type)
              ? msg.context.device_type
              : 2,
            device_status: !['', void 0, null].includes(msg.context.device_status)
              ? msg.context.device_status
              : 1,
            nickname: msg.context.nick_name || msg.context.nickname,
            role_name: msg.context.role_name,
            is_speak: Number(isSpeak),
            isPolling: Number(isPolling)
          };

          this.memberServer.state.onlineUsers.push(user);
          this.memberServer.state.onlineUsers = this.memberServer._sortUsers(
            this.memberServer.state.onlineUsers
          );

          setTimeout(() => {
            this.refresh();
          }, 100);
        };
        this._handleRoomLeft = msg => {
          const index = this.getUserIndex(msg.sender_id, this.memberServer.state.onlineUsers);
          // 判断存在直接删除
          if (index > -1) {
            this.memberServer.state.onlineUsers.splice(index, 1);
            this.memberServer.state.onlineUsers = this.memberServer._sortUsers(
              this.memberServer.state.onlineUsers
            );
          }
        };
        const handleVrtcConnectSuccess = msg => {
          const index = this.getUserIndex(
            msg.data.room_join_id,
            this.memberServer.state.onlineUsers
          );
          if (index > -1) {
            const user = this.memberServer.state.onlineUsers[index];
            this.memberServer.state.onlineUsers.splice(index, 1, {
              ...user,
              is_speak: 1
            });
          }
        };
        const handleVrtcDisconnectSuccess = msg => {
          const index = this.getUserIndex(msg.data.target_id, this.memberServer.state.onlineUsers);
          if (index > -1) {
            const user = this.memberServer.state.onlineUsers[index];
            this.memberServer.state.onlineUsers.splice(index, 1, {
              ...user,
              is_speak: 0
            });
          }
        };
        this._handleRoomMsg = msg => {
          switch (msg.data.type) {
            case 'vrtc_connect_success':
              handleVrtcConnectSuccess(msg);
              break;
            case 'vrtc_disconnect_success':
              handleVrtcDisconnectSuccess(msg);
              break;
          }
        };
      },
      //查找用户在数组的索引号
      getUserIndex(accountId, list) {
        return list.findIndex(
          item => item.account_id === accountId || item.accountId === accountId
        );
      },
      // 注册消息监听
      addEventListeners() {
        this.msgServer.$onMsg('JOIN', this._handleRoomJoin);
        this.msgServer.$onMsg('LEFT', this._handleRoomLeft);
        this.msgServer.$onMsg('ROOM_MSG', this._handleRoomMsg);
      },
      // 注销消息监听
      removeEventListeners() {
        this.msgServer.$offMsg('JOIN', this._handleRoomJoin);
        this.msgServer.$offMsg('LEFT', this._handleRoomLeft);
        this.msgServer.$offMsg('ROOM_MSG', this._handleRoomMsg);
      },
      //滚动条位置更新
      refresh() {
        if (this.$refs && this.$refs.scroll) {
          this.$refs.scroll.refresh();
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-video-polling-member-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    font-size: 12px;
    background-color: #2a2a2a;
    &__title {
      display: flex;
      height: 44px;
      align-items: center;
      justify-content: center;
      color: #e6e6e6;
      font-size: 14px;
      border-bottom: 1px solid #1a1a1a;
    }
    &__container {
      flex: 1 0 auto;
      max-height: calc(100% - 45px);
      overflow: hidden;
      position: relative;
      &__scroll {
        max-height: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
      .member-list__all-tab {
        // height: 2000px;
      }
    }
  }
</style>
