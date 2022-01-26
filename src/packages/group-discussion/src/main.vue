<template>
  <div v-show="show" class="vmp-group-discussion">
    <!-- 准备设置分组对话框 -->
    <vmp-group-setting :dialogVisible="settingVisible"></vmp-group-setting>

    <!-- 设置分组页 -->
    <vmp-group-split v-show="splitVisible"></vmp-group-split>
  </div>
</template>
<script>
  import VmpGroupSetting from './group-setting.vue';
  import VmpGroupSplit from './group-split.vue';
  import { useGroupServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpGroupDiscussion',
    components: {
      VmpGroupSetting,
      VmpGroupSplit
    },
    data() {
      return {};
    },
    beforeCreate() {
      this.groupServer = useGroupServer();
    },
    watch: {
      ['groupServer.state.show'](val) {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'toggle', [val]));
      }
    },
    computed: {
      show() {
        return this.groupServer.state.show;
      },
      settingVisible() {
        return this.groupServer.state.status === 'ready';
      },
      splitVisible() {
        return this.groupServer.state.status === 'grouping';
      }
    },
    methods: {
      switchTo(type) {
        if (type !== 'group') {
          this.groupServer.state.show = false;
        } else {
          if (!this.show) {
            this.groupServer.state.show = true;
            if (!this.groupServer.state.status) {
              this.groupServer.state.status = 'ready';
            }
          } else {
            this.groupServer.state.show = false;
          }
        }
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
    color: #f4f4f4;
    z-index: 3000; // 层级要比文档高,比对话框层级高
  }
</style>
