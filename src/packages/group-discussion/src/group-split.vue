<template>
  <div class="vmp-group-split">
    <div class="vmp-group-split__hd">
      <span class="split-title">分组设置</span>
      <div class="split-op">
        <el-button type="default" size="small" :round="true" @click="handleNotice">
          小组公告
        </el-button>
        <el-button type="default" size="small" :round="true" @click="handleAdd">新增分组</el-button>
        <el-button type="default" size="small" :round="true" :disabled="true">开始讨论</el-button>
      </div>
    </div>
    <div class="vmp-group-split__bd">
      <div v-for="(item, index) in dataList" :key="index" class="split-card">
        <div class="split-card__inner">
          <div class="split-card__hd">
            <div class="split-card__title">{{ item.name }} ( 0 )</div>
            <div class="split-card__menus">
              <el-button class="btn-menu" type="text" :disabled="false">
                <i class="iconfont icona-icon_piliangfenpei1x"></i>
                <span>批量分配</span>
              </el-button>
              <el-button class="btn-menu" type="text">
                <i class="iconfont icona-icon_jiesan1x"></i>
                <span>解散</span>
              </el-button>
              <el-button class="btn-menu" type="text" :disabled="false">
                <i class="iconfont icona-icon_pilianghuanzu1x"></i>
                <span>批量换组</span>
              </el-button>
            </div>
          </div>
          <div class="split-card__bd"></div>
        </div>
      </div>
    </div>

    <vmp-group-add :show.sync="addDialogVisible"></vmp-group-add>
    <vmp-group-notice :show.sync="noticeDialogVisible"></vmp-group-notice>
  </div>
</template>
<script>
  import VmpGroupAdd from './group-add.vue';
  import VmpGroupNotice from './group-notice.vue';
  export default {
    name: 'VmpGroupSplit',
    components: {
      VmpGroupAdd,
      VmpGroupNotice
    },
    data() {
      return {
        addDialogVisible: false,
        noticeDialogVisible: false,
        dataList: [
          {
            name: '待分配'
          },
          {
            name: '分组1'
          },
          {
            name: '分组2'
          },
          {
            name: '分组3'
          }
        ]
      };
    },
    methods: {
      handleNotice() {
        this.noticeDialogVisible = true;
      },
      handleAdd() {
        this.addDialogVisible = true;
      }
    }
  };
</script>
<style lang="less">
  .vmp-group-split {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    background-color: #2d2d2d;
  }

  .vmp-group-split__hd {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 24px 24px 0 24px;

    .split-op {
      flex: 1;
      text-align: right;

      button.is-disabled {
        color: #666;
        border-color: #666;
      }
    }
  }
  .vmp-group-split__bd {
    flex: 1;
    overflow-y: auto;
    margin: 25px 17px 0;

    &::-webkit-scrollbar {
      /*滚动条*/
      width: 6px;
      background: transparent !important;
    }
    &::-webkit-scrollbar-thumb {
      /*滚动条里面小方块*/
      height: 50px;
      border-radius: 10px;
      background: #666 !important;
    }
    &::-webkit-scrollbar-track {
      background: transparent !important;
    }

    .split-card {
      width: 50%;
      vertical-align: top;
      padding: 0 7px;
      display: inline-block;
      box-sizing: border-box;

      .split-card__inner {
        height: 200px;
        background: #434343;
        border-radius: 4px;
        margin-bottom: 14px;

        .split-card__hd {
          padding: 9px 16px;
          border-radius: 4px 4px 0 0;
          border-bottom: 1px solid #525252;
          background: #434343;
          display: flex;
          flex-direction: row;
        }

        .split-card__title {
          font-size: 14px;
          font-weight: 400;
          color: #f4f4f4;
          line-height: 22px;
        }
        .split-card__menus {
          flex: 1;
          text-align: right;
          font-size: 12px;

          .btn-menu {
            font-size: 12px;
            font-weight: 400;
            color: #f4f4f4;
            line-height: 22px;

            .iconfont {
              position: relative;
              top: 1px;
              padding-right: 2px;
            }
          }
        }

        .split-card__bd {
        }
      }
    }
  }
</style>
