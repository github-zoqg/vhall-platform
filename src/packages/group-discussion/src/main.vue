<template>
  <div v-show="show" class="vmp-group-discussion">
    <!-- 分组设置页 -->
    <vmp-group-split
      ref="groupSplit"
      v-show="isOpenSwitch == 1 || isOpenSwitch == 2"
      @endDiscussion="endDiscussion"
    ></vmp-group-split>

    <!-- 准备设置分组对话框 -->
    <vmp-group-setting
      :show.sync="settingDialogVisible"
      @settingCancel="settingCancel"
    ></vmp-group-setting>

    <!-- 新增分组对话框 -->
    <vmp-group-add :show.sync="addDialogVisible"></vmp-group-add>

    <!-- 小组公告对话框 -->
    <vmp-group-notice :show.sync="noticeDialogVisible"></vmp-group-notice>

    <!-- 选择小组（用户换组）对话框 -->
    <vmp-group-choose
      :show.sync="chooseDialogVisible"
      @chooseGroupComplete="chooseGroupComplete"
    ></vmp-group-choose>
  </div>
</template>
<script>
  import VmpGroupSetting from './group-setting.vue';
  import VmpGroupSplit from './group-split.vue';
  import VmpGroupAdd from './group-add.vue';
  import VmpGroupNotice from './group-notice.vue';
  import VmpGroupChoose from './group-choose.vue';
  import { useGroupServer, useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpGroupDiscussion',
    components: {
      VmpGroupSetting,
      VmpGroupSplit,
      VmpGroupAdd,
      VmpGroupNotice,
      VmpGroupChoose
    },
    data() {
      return {
        settingDialogVisible: false,
        addDialogVisible: false,
        noticeDialogVisible: false,
        chooseDialogVisible: false
      };
    },
    beforeCreate() {
      this.groupServer = useGroupServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    watch: {
      ['groupServer.state.show'](val) {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitToggle', [val]));
      }
    },
    computed: {
      show() {
        return this.groupServer.state.show;
      },
      // 0 未分组 1开始讨论 2已存在分组
      isOpenSwitch() {
        return this.roomBaseServer.state.interactToolStatus.is_open_switch;
      }
    },

    methods: {
      // 切换显示隐藏
      switchTo(menu) {
        if (menu === 'group') {
          if (this.groupServer.state.show) {
            // 如果是显示状态，直接隐藏
            this.groupServer.state.show = false;
            this.settingDialogVisible = false;
            this.addDialogVisible = false;
            this.noticeDialogVisible = false;
            this.chooseDialogVisible = false;
          } else {
            // 如果是隐藏状态，
            this.groupServer.state.show = true;
            if (this.isOpenSwitch === 0) {
              this.settingDialogVisible = true;
            }
          }
        } else {
          this.groupServer.state.show = false;
          this.settingDialogVisible = false;
          this.addDialogVisible = false;
          this.noticeDialogVisible = false;
          this.chooseDialogVisible = false;
        }
      },
      // 分配设置主动取消回调
      settingCancel() {
        this.groupServer.state.show = false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitCancelGroup'));
      },
      // 结束讨论回调
      endDiscussion() {
        this.groupServer.state.show = false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitCancelGroup'));
      },
      // 选择小组后确定
      chooseGroupComplete(selectGroup) {
        this.$refs.groupSplit.handleChangeGroupSubmit(selectGroup);
      },
      // 退出小组
      exitGroup() {
        alert('退出小组');
      }
    }
  };
</script>
<style lang="less">
  .vmp-group-discussion {
    position: absolute;
    top: 0;
    left: 60px;
    right: 309px;
    bottom: 0;
    width: calc(100% - 370px);
    box-sizing: border-box;
    color: #f4f4f4;
    display: flex;
  }
</style>
