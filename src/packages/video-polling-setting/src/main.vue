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
                :disabled="item.value > surplusSpeakCount"
                :value="item.value"
              ></el-option>
            </el-select>
          </div>
          <div class="polling_form_item">
            <el-radio v-model="pollingForm.videoAutoPolling" :label="0">
              手动轮巡
              <span class="item_color">
                （需要手动点击“视频墙”页面中的“下一组”按钮，切换视频画面）
              </span>
            </el-radio>
            <el-radio v-model="pollingForm.videoAutoPolling" :label="1">
              自动轮巡
              <span class="item_color">（展示时间结束后，自动切换到下一组视频画面）</span>
            </el-radio>
            <div class="item_time" v-show="pollingForm.videoAutoPolling == 1">
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
  import { useVideoPollingServer } from 'middle-domain';
  export default {
    name: 'VmpPollingSetting',
    data() {
      return {
        pollingVisible: false,
        pollingForm: {
          videoNum: 1,
          videoAutoPolling: 0,
          videoTime: 30
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
            value: 30,
            label: '0.5分钟'
          },
          {
            value: 60,
            label: '1分钟'
          },
          {
            value: 300,
            label: '5分钟'
          },
          {
            value: 600,
            label: '10分钟'
          }
        ]
      };
    },
    computed: {
      surplusSpeakCount() {
        return this.$domainStore.state.videoPollingServer.surplusSpeakCount;
      },
      // 当前登录的角色 主持人/助理
      roleName() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.role_name;
      }
    },
    beforeCreate() {
      this.videoPollingServer = useVideoPollingServer();
    },
    methods: {
      showVideoPollingSetting() {
        this.getVideoPollingInfo();
      },
      getVideoPollingInfo() {
        this.videoPollingServer.getVideoRoundInfo().then(res => {
          if (res.code === 200) {
            const { account_id, role_name, max_speak_count, surplus_speak_count } = res.data;
            let title = '';
            if (account_id) {
              this.pollingVisible = false;
              if (
                localStorage.getItem(`isVideoPolling_${this.$route.params.id}`) == 1 &&
                this.roleName == role_name
              ) {
                this.goPollingPage();
                return;
              } else {
                if (this.roleName == role_name) {
                  title = '已开启了视频轮巡功能';
                } else {
                  title = `${this.$getRoleName(role_name)}已开启了视频轮巡功能`;
                }
                this.setPollingAlert(title);
                return;
              }
            }
            if (!surplus_speak_count) {
              this.pollingVisible = false;
              this.setSpeakCountAlert(max_speak_count);
              return;
            }
            this.pollingVisible = true;
          } else if (res.code === 513560) {
            this.pollingVisible = false;
            let title = '您尚未配置连麦数，请联系工作人员';
            this.setPollingAlert(title);
            return;
          } else {
            this.$message.error(res.msg);
            return;
          }
        });
      },
      // 开始轮巡
      startPolling() {
        let params = {
          round_video_count: this.pollingForm.videoNum,
          is_auto: this.pollingForm.videoAutoPolling,
          interval: this.pollingForm.videoTime
        };
        this.videoPollingServer.videoRoundStart(params).then(res => {
          if (res.code === 200) {
            // 上报数据
            this.setReportData();
            // 跳转页面
            this.goPollingPage();
          } else if (res.code === 13342) {
            this.setSpeakCountAlert();
          } else {
            this.$message.error(res.msg);
            return;
          }
        });
      },
      goPollingPage() {
        this.pollingVisible = false;
        this.resetFormData();
        const href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/video-polling/${this.$route.params.id}${window.location.search}`;
        window.open(href, '_blank');
      },
      // 已经开启了轮巡
      setPollingAlert(title) {
        this.$alert(title, '', {
          title: '提示',
          confirmButtonText: '知道了',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        });
        return;
      },
      // 上麦人数已满弹窗
      setSpeakCountAlert(speakCount) {
        const maxSpeakCount = speakCount || this.videoPollingServer.state.maxSpeakCount;
        const h = this.$createElement;
        this.$alert('', '', {
          title: '提示',
          message: h('div', null, [
            h(
              'p',
              { style: 'padding-bottom: 5px' },
              `您的连麦数已达到${maxSpeakCount}上限，暂无法开启视频轮巡功能，您可将观众下麦，再开启视频轮巡功能`
            ),
            h('p', { style: 'color: #999' }, '注：每组调取的视频数<=当前活动连麦数-已上麦数')
          ]),
          confirmButtonText: '知道了',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        });
        return;
      },
      // 上报数据
      setReportData() {
        window.vhallReportForProduct?.report(
          this.pollingForm.videoAutoPolling == 1 ? 110150 : 110149
        );
        window.vhallReportForProduct?.report(110151, {
          report_extra: { count: this.pollingForm.videoNum }
        });
      },
      // 重置表单
      resetFormData() {
        this.pollingForm = {
          videoNum: 1,
          videoAutoPolling: 0,
          videoTime: 30
        };
      },
      // 关闭弹窗
      closePolling() {
        this.pollingVisible = false;
        this.resetFormData();
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
