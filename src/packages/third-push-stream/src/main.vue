<template>
  <div class="vmp-third-stream" v-show="isShowThirdStream">
    <!-- 第三方推流 -->
    <div class="vmp-third-stream-box">
      <div class="vmp-third-stream-title">
        第三方发起
        <span class="vmp-third-stream-subTitle">
          当直播下有多个正在进行的拉流，观众只能看到拉取的第一路流
        </span>
      </div>
      <div class="vmp-third-stream-modal" :class="'streamModal' + streamModal">
        <div class="title">发起模式</div>
        <el-radio-group v-model="streamModal">
          <el-radio :label="1">拉流设置1</el-radio>
          <el-radio :label="2">拉流设置2</el-radio>
        </el-radio-group>
        <div class="input-item" v-show="streamModal == 1">
          <label>RTMP/URL</label>
          <div class="vmp-third-stream-modal-input readOnly">
            <span class="input" :title="thirdWatchWebUrl">{{ thirdWatchWebUrl }}</span>
            <span class="tool">
              <span title="复制" @click="doCopy(1)" class="vh-iconfont vh-line-copy"></span>
            </span>
          </div>
        </div>
        <div class="input-item" v-show="streamModal == 1">
          <label>播放路径/串流码</label>
          <div class="vmp-third-stream-modal-input readOnly">
            <span class="input" :title="thirdPlayUrl">{{ thirdPlayUrl }}</span>
            <span class="tool">
              <span title="复制" @click="doCopy(2)" class="vh-iconfont vh-line-copy"></span>
            </span>
          </div>
        </div>
        <div class="input-item" v-show="streamModal == 2">
          <label>
            <span class="required">*</span>
            拉流地址
          </label>
          <div
            class="vmp-third-stream-modal-input"
            :class="showRulePullUrl ? 'showRulePullUrl' : ''"
          >
            <el-input
              v-model="pullUrl"
              @blur="validatePullUrl(true)"
              placeholder="请输入拉流地址，支持rtmp、hls协议"
            ></el-input>
            <span class="alert" v-show="showRulePullUrl">
              {{ pullUrl ? '无法访问指定频道，请仔细检查您的拉流地址' : '请输入拉流地址' }}
            </span>
          </div>
        </div>
        <div class="input-item">
          <label>拉流状态</label>
          <div class="vmp-third-stream-modal-input readOnly">
            <span class="input" :class="!!streamStatus ? 'success' : 'fail'">
              {{ !!streamStatus ? '正在拉流' : '未检测到拉流' }}
            </span>
            <span class="tool">
              <span
                title="刷新"
                @click="getThirdPushStreamStatus"
                class="vh-iconfont vh-line-refresh-right"
              ></span>
            </span>
          </div>
        </div>
        <div class="separator"></div>
        <template v-if="streamModal == 1">
          <div class="title">使用第三方推流</div>
          <div class="content">
            <p>1.在第三方工具中添加RTMP URL与串流码;</p>
            <p>2.使用第三方工具推流;</p>
            <p>3.点击右上方的“开始直播”按钮;</p>
            <p>4.播放路径/串流码的有效期为7天，建议定期更新。</p>
          </div>
          <div class="title">
            使用设备推流
            <a href="https://www.vhall.com/saas/doc/1698.html" target="_blank">详细教程</a>
          </div>
          <div class="content">
            <p>1.在设备中添加RTMP URL与串流码;</p>
            <p>2.使用设备推流;</p>
            <p>3.点击右上方的“开始直播”按钮。</p>
          </div>
        </template>
        <template v-else>
          <div class="title">使用第三方推流</div>
          <div class="content">
            <p>1.在第三方工具中获取拉流地址，并填写到拉流地址中;</p>
            <p>2.使用第三方工具推流;</p>
            <p>3.点击右上角的“开始直播”按钮。</p>
          </div>
          <div class="title">注意事项</div>
          <div class="content">
            <p>
              拉流开始前，请沟通视频流资源方，将我们的拉流服务器IP列入白名单，否则有可能造成拉流失败。
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, useMsgServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  export default {
    name: 'VmpThirdStream',
    data() {
      return {
        thirdWatchWebUrl: '',
        thirdPlayUrl: '',
        isShowThirdStream: false,
        streamModal: 1,
        pullUrl: '',
        showRulePullUrl: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.msgServer = useMsgServer();
    },
    computed: {
      isThirdStream() {
        return this.roomBaseServer.state.isThirdStream;
      },
      //是否有流：0-无，1-有
      streamStatus() {
        return this.roomBaseServer.state.streamStatus;
      },
      // 当前用户角色 1-主持人 2-观众(发起端没有观众) 3-助理；4-嘉宾（互动直播才有嘉宾）
      roleName() {
        return this.roomBaseServer.state.watchInitData.join_info.role_name;
      }
    },
    watch: {
      streamModal(val) {
        this.roomBaseServer.setThirdPullStreamMode(val);
      },
      pullUrl(val) {
        this.roomBaseServer.setThirdPullStreamUrl(val);
        if (val) {
          this.showRulePullUrl = false;
        }
      }
    },
    created() {
      if (this.roleName != 1) return;
      if (this.isThirdStream && this.roomBaseServer.state.watchInitData.webinar.type == 1) {
        this.isShowThirdStream = true;
        this.getThirdPushStream();
        this.getThirdPushStreamStatus();
        this.changePushImage(true);
      }
    },
    mounted() {
      this.msgServer.$onMsg('ROOM_MSG', msg => {
        if (msg.data.type == 'live_over' && this.roleName == 1) {
          this.isShowThirdStream = false;
          this.changePushImage(false);
          this.isShowThirdStream = false;
        }
      });
    },
    methods: {
      showThirdStream(info) {
        this.isShowThirdStream = info.status;
        this.roomBaseServer.setThirdPushStream(info.status);
        info.status && this.getThirdPushStream();
        this.getThirdPushStreamStatus();
      },
      getThirdPushStream() {
        this.roomBaseServer.getThirdPushStreamAddress().then(res => {
          if (res.code == 200) {
            this.thirdPlayUrl = res.data.stream_code;
            this.thirdWatchWebUrl = res.data.stream_address;
          }
        });
      },
      //刷新房间内流状态
      getThirdPushStreamStatus() {
        this.roomBaseServer.getLiveStreamStatus();
      },
      changePushImage(flag) {
        const thirdBackground = document.querySelector('.vmp-basic-right__hd');
        if (flag) {
          thirdBackground.style.background = `url(${process.env.VUE_APP_STATIC_BASE}/common-static/images/thirdDefault.png) no-repeat`;
        } else {
          thirdBackground.style.background = `url(${process.env.VUE_APP_STATIC_BASE}/common-static/images/base-right.png) no-repeat`;
        }
        thirdBackground.style.backgroundSize = '100% 100%';
        thirdBackground.style.backgroundPosition = 'center';
      },
      closeThirdStream() {
        this.isShowThirdStream = false;
      },
      doCopy(type) {
        let btn = '';
        if (type == 1) {
          btn = 'vmp-third-watch';
        } else {
          btn = 'vmp-third-play';
        }
        const input = document.getElementById(btn);
        input.select();
        document.execCommand('copy');
        this.$message({
          message: '复制成功！',
          showClose: true,
          type: 'success',
          customClass: 'zdy-info-box'
        });
      },
      validatePullUrl(cur = false) {
        if (!this.pullUrl) {
          this.showRulePullUrl = true;
        } else {
          const reg = /^(rtmp:\/\/)|(rtmps:\/\/)/g;
          if (reg.test(this.pullUrl)) {
            this.showRulePullUrl = false;
            if (!cur) {
              // 派发开始直播事件
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitClickStartClick', [null, true])
              );
            }
          } else {
            this.showRulePullUrl = true;
          }
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-third-stream {
    position: absolute;
    top: 0;
    left: 60px;
    width: calc(100% - 370px);
    height: 100%;
    background: #f1f1f1;
    z-index: 3;
    overflow-y: auto;
    &-box {
      margin: 0 auto;
      width: 100%;
      height: 100%;
    }
    &-title {
      width: 720px;
      margin: 0 auto;
      padding-top: 32px;
      height: 40px;
      padding-bottom: 10px;
      font-weight: 600;
      overflow: auto;
      font-size: 20px;
      line-height: 28px;
      color: #1a1a1a;
    }
    &-subTitle {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: #999999;
      margin-left: 8px;
    }
    &-modal {
      width: 720px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 4px;
      padding: 24px;
      box-sizing: border-box;
      &.streamModal2 {
        .input-item label {
          min-width: 68px;
          width: 68px;
        }
        .required {
          color: #fb3a32;
        }
        input {
          border-color: #ccc;
        }
        .el-input__inner:focus,
        .el-textarea__inner:focus,
        .el-input__inner:hover,
        .el-textarea__inner:hover {
          border-color: #999;
        }
      }
      .title {
        font-weight: 600;
        font-size: 14px;
        line-height: 22px;
        color: #1a1a1a;
        position: relative;
        padding-left: 11px;
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          height: 14px;
          width: 3px;
          background-color: #fb3a32;
        }
        a {
          color: #436dfa;
          margin-left: 6px;
          font-weight: 400;
        }
      }
      .el-radio-group {
        margin-top: 24px;
        .el-radio {
          margin-right: 35px;
        }
        .el-radio__label {
          color: #666;
        }
        .el-radio__input.is-checked + .el-radio__label {
          color: #1a1a1a;
        }
        .el-radio__inner {
          width: 16px;
          height: 16px;
        }
        .el-radio__inner::after {
          width: 8px;
          height: 8px;
        }
      }
      .input-item {
        margin-top: 24px;
        display: flex;
        align-items: center;
        color: #1a1a1a;
        label {
          min-width: 105px;
          width: 105px;
          text-align: right;
          font-size: 14px;
          line-height: 20px;
          margin-right: 12px;
        }
      }
      &-input {
        width: 555px;
        display: flex;
        align-items: center;
        height: 40px;
        box-sizing: border-box;
        position: relative;
        &.readOnly {
          border: 1px solid #cccccc;
          padding: 0 0 0 12px;
          background: #f7f7f7;
          border-radius: 4px;
        }
        &.showRulePullUrl {
          input {
            border: 1px solid #fb3a32;
          }
          .alert {
            color: #fb3a32;
            font-size: 12px;
            position: absolute;
            bottom: -17px;
          }
        }
        .input {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          width: 100%;
          &.success {
            color: #436dfa;
          }
          &.fail {
            color: #fb3a32;
          }
        }
        .tool {
          min-width: 29px;
          padding-right: 12px;
          text-align: right;
          .vh-iconfont {
            cursor: pointer;
          }
        }
      }
      .separator {
        width: 100%;
        height: 40px;
      }
      .content {
        margin-top: 8px;
        margin-bottom: 24px;
        padding: 20px;
        background: #f7f7f7;
        border-radius: 4px;
        line-height: 22px;
        font-size: 14px;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
</style>
