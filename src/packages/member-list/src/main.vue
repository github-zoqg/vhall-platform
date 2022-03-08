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

        <!--举手的成员-->

        <!--受限制的成员-->
      </div>
    </div>
    <!--底部操作区域-->
    <div class="vmp-member-list__operate-container">
      <!--信息面板-->
      <div class="vmp-member-list__operate-container__info-panel"></div>
      <!--按钮面板-->
      <div class="vmp-member-list__operate-container__button-panel"></div>
    </div>
  </div>
</template>

<script>
  import { contextServer, userMemberServer } from 'vhall-sass-domain';
  export default {
    name: 'VmpMemberList',
    data() {
      return {
        //成员列表组件配置
        chatOptions: {},
        //在线人数
        onlineUsers: [],
        //申请人数
        applyUsers: [],
        //受限人数
        limitedUsers: []
      };
    },
    beforeCreate() {
      this.roomBaseServer = contextServer.get('roomBaseServer');
      this.micServer = contextServer.get('micServer');
      // this.memberServer = userMemberServer();
    },
    beforeDestroy() {},
    mounted() {
      //初始化配置
      this.initConfig();
    },
    computed: {
      //是否在分组里
      isInGroup() {
        const { state = {} } = this.roomBaseServer;
        const { groupInitData = {} } = state;
        return groupInitData.isInGroup;
      }
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          this.chatOptions = widget.options;
        }
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
  }
</style>
