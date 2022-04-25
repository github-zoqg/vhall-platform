<template>
  <div class="vmp-third-stream" v-if="isShowThirdStream">
    <!-- 第三方推流 -->
    <div class="vmp-third-stream-box">
      <div class="vmp-third-stream-title">推流设置</div>
      <div class="vmp-third-stream-wrap">
        <div class="vmp-third-stream-wrap-left">
          <div class="vmp-third-stream-wrap-left-step">
            <div class="vmp-third-stream-wrap-left-step-round"><span></span></div>
            <div class="vmp-third-stream-wrap-left-step-line"></div>
            <div class="vmp-third-stream-wrap-left-step-round"><span></span></div>
          </div>
          <div class="vmp-third-stream-wrap-left-text">
            <span>
              获取
              <br />
              推流地址
            </span>
            <span>
              使用第三方
              <br />
              推流工具
            </span>
          </div>
        </div>
        <div class="vmp-third-stream-wrap-right">
          <div class="vmp-third-stream-wrap-right-top">
            <div>
              <label>RTMP URL</label>
              <div class="vmp-third-stream-wrap-right-top-input">
                <el-input id="vmp-third-watch" v-model="thirdWatchWebUrl" readOnly></el-input>
                <span @click="doCopy(1)">复制</span>
              </div>
            </div>
            <div style="margin-top: 16px">
              <label>播放路径/串流码</label>
              <div class="vmp-third-stream-wrap-right-top-input">
                <el-input id="vmp-third-play" v-model="thirdPlayUrl" readOnly></el-input>
                <span @click="doCopy(2)">复制</span>
              </div>
            </div>
          </div>
          <div class="vmp-third-stream-wrap-right-bottom">
            <div style="padding-bottom: 20px; border-bottom: 1px solid #ddd">
              <p>
                <i></i>
                使用第三方推流
              </p>
              <ul>
                <li>1.在第三方工具中添加RTMP URL与串流码</li>
                <li>2.使用第三方工具推流</li>
                <li>3.点击右上方的“开始直播”按钮</li>
                <li>4.播放路径/串流码的有效期为7天，建议定期更新</li>
              </ul>
            </div>
            <div style="margin-top: 20px">
              <p>
                <i></i>
                使用设备推流
              </p>
              <ul>
                <li>1.在设备中添加RTMP URL与串流码</li>
                <li>2.使用设备推流</li>
                <li>3.点击右上方的“开始直播”按钮</li>
              </ul>
            </div>
            <p class="vmp-third-stream-wrap-right-bottom-detail">
              <a href="https://www.vhall.com/saas/doc/1698.html" target="_blank">详细教程</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, useMsgServer } from 'middle-domain';
  export default {
    name: 'VmpThirdStream',
    data() {
      return {
        thirdWatchWebUrl: '',
        thirdPlayUrl: '',
        isShowThirdStream: false
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
      // 当前用户角色 1-主持人 2-观众(发起端没有观众) 3-助理；4-嘉宾（互动直播才有嘉宾）
      roleName() {
        return this.roomBaseServer.state.watchInitData.join_info.role_name;
      }
    },
    mounted() {
      if (
        this.isThirdStream &&
        this.roomBaseServer.state.watchInitData.webinar.type == 1 &&
        this.roleName == 1
      ) {
        this.isShowThirdStream = true;
        this.changePushImage(true);
      }
      this.msgServer.$onMsg('ROOM_MSG', msg => {
        if (msg.data.type == 'live_over' && this.roleName == 1) {
          this.isShowThirdStream = false;
          this.changePushImage(false);
        }
      });
    },
    methods: {
      showThirdStream(info) {
        this.isShowThirdStream = info.status;
        this.roomBaseServer.setThirdPushStream(info.status);
        info.status && this.getThirdPushStream();
      },
      getThirdPushStream() {
        this.roomBaseServer.getThirdPushStreamAddress().then(res => {
          if (res.code == 200) {
            this.thirdPlayUrl = res.data.stream_code;
            this.thirdWatchWebUrl = res.data.stream_address;
          }
        });
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
    &-box {
      padding-top: 50px;
      margin: 0 auto;
      width: 100%;
      height: 100%;
    }
    &-title {
      height: 40px;
      line-height: 40px;
      padding-bottom: 10px;
      font-size: 16px;
      font-weight: 700;
      color: #666;
      width: 750px;
      overflow: auto;
      margin: 0 auto;
    }
    &-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      &-left {
        width: 151px;
        height: 100%;
        margin-right: 25px;
        display: flex;
        &-step {
          display: flex;
          flex-direction: column;
          width: 30px;
          align-items: center;
          margin-right: 40px;
          padding-bottom: 15px;
          &-round {
            width: 26px;
            height: 26px;
            background-color: #fff;
            -webkit-box-shadow: 0 0 9px 0 #ccc;
            box-shadow: 0 0 9px 0 #ccc;
            border-radius: 50%;
            span {
              display: inline-block;
              width: 12px;
              height: 12px;
              background-color: #ccc;
              margin: 7px;
              border-radius: 50%;
            }
          }
          &-line {
            height: 235px;
            width: 1px;
            background: #ccc;
          }
        }
        &-text {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #333;
        }
      }
      &-right {
        width: 608px;
        &-top {
          padding: 50px 36px;
          background: #fff;
          margin-bottom: 10px;
          border-radius: 4px;
          > div {
            display: flex;
            width: 100%;
            label {
              display: inline-block;
              width: 90px;
              text-align: right;
              font-size: 12px;
              color: #333;
              line-height: 36px;
              margin-right: 10px;
            }
          }
          &-input {
            height: 36px;
            width: 416px;
            border: 1px solid #ccc;
            border-radius: 4px;
            .el-input {
              width: 336px;
              border-radius: 4px 0 0 4px;
              background: #f7f7f7;
            }
            .el-input__inner {
              border: none;
              height: 36px;
              background: transparent;
              font-size: 12px;
              font-weight: 400;
              color: #1a1a1a;
              line-height: 20px;
            }
            span {
              display: inline-block;
              width: 80px;
              height: 36px;
              text-align: center;
              line-height: 36px;
              background: #e6e6e6;
              color: #666;
              vertical-align: top;
              cursor: pointer;
              font-size: 12px;
              border-radius: 0 4px 4px 0;
            }
          }
        }
        &-bottom {
          padding: 40px;
          background: #fff;
          border-radius: 4px;
          position: relative;
          div {
            display: flex;
            p {
              font-size: 12px;
              color: #333;
              // margin-right: 10px;
              width: 140px;
              font-weight: bold;
              text-align: left;
              i {
                display: inline-block;
                width: 28px;
                height: 28px;
                background: url(https://cnstatic01.e.vhall.com/static/images/vhall3.0/new_host_sprite.png?v=SGnm%2B%2FdyJ64oKrOI%2BJTU%2Fg%3D%3D)
                  no-repeat -179px -127px;
                border-radius: 50%;
                vertical-align: middle;
                padding-right: 10px;
              }
            }
            ul {
              font-size: 12px;
              color: #333;
              // padding-top: 4px;
              li {
                list-style: none;
                font-weight: normal;
                line-height: 25px;
              }
            }
          }
          &-detail {
            position: absolute;
            font-size: 12px;
            color: #4da1ff;
            cursor: pointer;
            bottom: 20px;
            right: 38px;
            a {
              color: #4da1ff;
            }
          }
        }
      }
    }
  }
</style>
