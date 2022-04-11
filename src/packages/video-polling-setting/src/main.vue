<template>
  <div class="vmp-polling-setting">
    <el-dialog
      title="视频轮巡设置"
      :visible.sync="pollingVisible"
      :close-on-click-modal="true"
      :modal-append-to-body="true"
      width="560px"
    >
      <div class="vmp-polling-setting_warp">
        <div class="polling_form">
          <div class="polling_form_item">
            每组调取的视频数
            <el-select v-model="pollingForm.videoNum" placeholder="请选择" style="width: 120px">
              <el-option
                v-for="item in pollingNumList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </div>
          <div class="polling_form_item">
            <el-radio v-model="pollingForm.videoCheck" :label="1">
              手动轮巡
              <span class="item_color">
                （需要手动点击“视频墙”页面中的“下一组”按钮，切换视频画面）
              </span>
            </el-radio>
            <el-radio v-model="pollingForm.videoCheck" :label="2">
              自动轮巡
              <span class="item_color">（展示时间结束后，自动切换到下一组视频画面）</span>
            </el-radio>
            <div class="item_time">
              展示时间
              <el-select v-model="pollingForm.videoTime" placeholder="请选择" style="width: 120px">
                <el-option
                  v-for="item in pollingTimeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
          </div>
          <div class="polling_form_item"><p>注：每组调取的视频数≤最大上麦数-已上麦</p></div>
        </div>
        <div class="vmp-polling-setting_btn">
          <el-button type="primary" round @click="startPolling">开始轮巡</el-button>
          <el-button round @click="closePolling">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: 'VmpPollingSetting',
    data() {
      return {
        pollingVisible: false,
        pollingForm: {
          videoNum: 1,
          videoCheck: 1,
          videoTime: 1
        },
        pollingNumList: [
          {
            value: 1,
            label: 1
          },
          {
            value: 4,
            label: 4
          },
          {
            value: 9,
            label: 9
          }
        ],
        pollingTimeList: [
          {
            value: 1,
            label: '0.5分钟'
          },
          {
            value: 2,
            label: '1分钟'
          },
          {
            value: 3,
            label: '5分钟'
          },
          {
            value: 4,
            label: '10分钟'
          }
        ]
      };
    },
    methods: {
      showVideoPollingSetting() {
        this.pollingVisible = true;
      },
      // 开始轮巡
      startPolling() {},
      // 重置表单
      closePolling() {
        this.pollingVisible = false;
        this.pollingForm = {
          videoNum: 1,
          videoCheck: 1,
          videoTime: 1
        };
      }
    }
  };
</script>
<style lang="less">
  .vmp-polling-setting {
    &_warp {
      .polling_form {
        color: #1a1a1a;
        &_item {
          padding-bottom: 16px;
          .el-radio {
            padding-bottom: 16px;
            &__label {
              padding-left: 5px;
            }
          }
          .el-radio__label {
            color: #1a1a1a;
          }
          .item_color {
            color: #666;
          }
          .item_time {
            padding-left: 25px;
          }
          p {
            color: #999;
          }
        }
      }
    }
    &_btn {
      display: flex;
      justify-content: flex-end;
      align-content: center;
      .el-button {
        display: inline-block;
        width: 90px;
        &.is-round {
          padding: 7px 0;
        }
      }
    }
  }
</style>
