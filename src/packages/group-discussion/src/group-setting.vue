<template>
  <!-- 分组设置弹窗 -->
  <div class="vmp-group-setting">
    <el-dialog
      :visible.sync="dialogVisible"
      @open="handleOpen"
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
              :disabled="way == 3"
              style="width: 60px; margin: 0 6px"
              clearable
              maxlength="2"
              placeholder="2-50"
              type="number"
              v-model.number.trim="count"
              @input="validCount"
              class="group-number__input"
            ></el-input>
            小组
          </div>
        </div>
        <div class="vmp-group-item group-way">
          <div class="vmp-group-item__hd">分组方式</div>
          <div class="vmp-group-item__bd">
            <el-radio class="group-radio" v-model="way" label="1">
              自动分组 （系统随机分配组内成员）
            </el-radio>
            <el-radio class="group-radio" v-model="way" label="2">
              手动分组（按照实际情况及个人意愿分配）
            </el-radio>
            <el-radio class="group-radio" v-model="way" label="3" :disabled="mode == 2">
              白名单预设分组（按照白名单观众组中的小组分配）
            </el-radio>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="vmp-group-ft">
          <el-button type="primary" round @click="handleGroup">开始分组</el-button>
          <el-button round @click="handleClose">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useRoomBaseServer, useGroupServer, useMemberServer } from 'middle-domain';
  export default {
    name: 'VmpGroupSetting',
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        dialogVisible: this.show,
        count: '', // 分组数量，2~50 之间
        way: '1' // 分组方式，1=随机分配|2=手动分配
      };
    },

    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
      this.memberServer = useMemberServer();
    },
    computed: {
      //观看限制白名单，白名单预设分组可设置，其他则不可选
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      // 观众数量
      userNumber() {
        return this.memberServer.state.onlineUsers.filter(item => item.role_name == 2).length;
      }
    },
    watch: {
      show: function (newVal) {
        this.dialogVisible = newVal;
      }
    },
    methods: {
      validCount(v) {
        if (v.length > 2) {
          this.count = v.slice(0, 2);
        }
      },
      handleOpen() {
        this.count = '';
        this.way = '1';
      },
      // 开始分组
      handleGroup: async function () {
        console.log('this.count:', this.count);
        if (this.way == 3) {
          console.log('白名单预设分组');
        } else {
          if (isNaN(this.count) || this.count < 2 || this.count > 50) {
            this.$message.warning('请输入正确分组数量');
            return false;
          }
          try {
            const result = await this.groupServer.groupCreate({
              number: this.count,
              way: this.way
            });
            if (result && result.code === 200) {
              this.count = '';
              this.close();
            } else {
              this.$message.warning(result.msg || '分组失败');
            }
          } catch (ex) {
            this.$message.warning(ex.messge || '分组出现异常');
          }
        }
      },
      // 取消
      handleClose() {
        this.close();
        this.$emit('settingCancel');
      },
      close() {
        this.dialogVisible = false;
        this.$emit('update:show', false);
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
