<template>
  <div class="vmp-group-setting">
    <el-dialog
      :visible.sync="dialogVisible"
      @open="handlOpen"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :append-to-body="false"
      width="480px"
      title="分组设置"
    >
      <div class="vmp-group-form">
        <div class="vmp-group-item group-number">
          <div class="vmp-group-item__hd">分组数量</div>
          <div class="vmp-group-item__bd">
            将当前 {{ userNumber }} 观众分成
            <el-input
              style="width: 60px; margin: 0 6px"
              clearable
              maxlength="2"
              placeholder="2-50"
              v-model.trim.number="number"
              onkeyup="this.value=this.value.replace(/[^\d]/g,'')"
              class="group-number__input"
            ></el-input>
            小组
          </div>
        </div>
        <div class="vmp-group-item group-way">
          <div class="vmp-group-item__hd">分组方式</div>
          <div class="vmp-group-item__bd">
            <el-radio class="group-radio" v-model="radio" label="1">
              自动分组 （系统随机分屏组内成员）
            </el-radio>
            <el-radio class="group-radio" v-model="radio" label="2">
              手动分组（按照实际情况及个人意愿分配）
            </el-radio>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="vmp-group-ft">
          <el-button type="primary" @click="handleGroup">开始分组</el-button>
          <el-button @click="handleClose">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useGroupServer, useMemberServer } from 'middle-domain';
  export default {
    name: 'VmpGroupSetting',
    props: {
      dialogVisible: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        number: '',
        radio: '1'
      };
    },

    beforeCreate() {
      this.groupServer = useGroupServer();
      this.memberServer = useMemberServer();
    },
    computed: {
      // 观众数量
      userNumber() {
        return this.memberServer.state.onlineUsers.length;
      }
    },
    methods: {
      handlOpen() {
        console.log(this.memberServer.state.onlineUsers);
      },
      handleGroup() {
        this.groupServer.state.status = 'grouping';
      },
      handleClose() {
        this.groupServer.state.status = '';
        this.groupServer.state.show = false;
      }
    }
  };
</script>
<style lang="less">
  .vmp-group-setting {
    .el-dialog__body {
      padding: 0 30px 30px 30px;
    }
    .vmp-group-form {
      display: flex;
      flex-direction: column;

      .vmp-group-item {
        display: block;
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #1a1a1a;
        font-size: 14px;

        .vmp-group-item__hd {
          width: 90px;
        }

        &.group-number {
          .group-number__input.el-input--suffix .el-input__inner {
            padding-right: 0;
          }
        }
        &.group-way {
          margin-top: 30px;
          .vmp-group-item__hd {
            align-self: flex-start;
          }
          .vmp-group-item__bd {
            .group-radio {
              display: block;
              height: 22px;
              line-height: 22px;
              font-weight: normal;
              color: #666;
              padding-bottom: 16px;
            }
            .el-radio__input.is-checked + .el-radio__label {
              color: #666 !important;
            }
          }
        }
      }

      .vmp-group-ft {
        margin-top: 24px;
        text-align: right;
      }
    }
  }
</style>
