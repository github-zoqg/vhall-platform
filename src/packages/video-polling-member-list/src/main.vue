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
        <div class="member-list__all-tab">
          <member-item
            v-for="user in onlineUsers"
            :key="user.account_id"
            :user-info="user"
          ></member-item>
        </div>
        <div class="member-list__all-tab">
          <member-item
            v-for="user in onlineUsers"
            :key="user.account_id"
            :user-info="user"
          ></member-item>
        </div>
        <div class="member-list__all-tab">
          <member-item
            v-for="user in onlineUsers"
            :key="user.account_id"
            :user-info="user"
          ></member-item>
        </div>
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
  import data1 from './data.js';
  import {
    useMicServer,
    useRoomBaseServer,
    useMemberServer,
    useInteractiveServer,
    useMsgServer,
    useGroupServer
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
    },
    beforeDestroy() {},
    async mounted() {
      this.getOnlineUserList();
    },
    computed: {
      onlineUsers() {
        return (this.memberServer.state.onlineUsers && false) || data1.list;
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

        this.memberServer
          .getOnlineUserList(params)
          .then(res => {
            if (res.code === 200) {
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
