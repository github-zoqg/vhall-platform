<template>
  <div class="vmp-auth">
    <el-dialog
      :title="$t('appointment.appointment_1020')"
      :visible.sync="authVisible"
      @close="closeVisibleDialog"
      width="400px"
    >
      <div class="vmp-auth-wrap">
        <div class="vmp-auth-wrap-text">
          <el-input
            :type="isHideEye ? 'text' : 'password'"
            v-model="authTitle"
            :placeholder="placeholder"
          >
            <i
              slot="suffix"
              @click="hideEye"
              :class="`vh-iconfont ${isHideEye ? 'vh-line-view' : 'vh-line-hidden'}`"
            ></i>
          </el-input>
        </div>
        <div class="vmp-auth-wrap-btn">
          <el-button type="primary" round @click="authSubmit">
            {{ $t('account.account_1062') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useRoomBaseServer, useSubscribeServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpWatchAuth',
    data() {
      return {
        authVisible: false,
        isHideEye: false,
        placeholder: '',
        authTitle: ''
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.subscribeServer = useSubscribeServer();
    },
    methods: {
      openAuthDialog(info) {
        this.authVisible = true;
        this.placeholder = info;
      },
      hideEye() {
        this.isHideEye = !this.isHideEye;
      },
      closeVisibleDialog() {
        this.authTitle = '';
        this.placeholder = '';
        this.isHideEye = false;
        this.authVisible = false;
      },
      authSubmit() {
        const { webinar } = this.roomBaseServer.state.watchInitData;
        console.log(webinar, '???13214');
        let data = {
          webinar_id: webinar.id,
          visitor_id: this.roomBaseServer.state.watchInitData.visitor_id,
          type: webinar.verify == 6 ? 4 : webinar.verify,
          verify_value: this.authTitle,
          ...this.$route.query
        };
        this.subscribeServer.watchAuth(data).then(res => {
          if (res.code == 200) {
            if (res.data.status == 'live') {
              let pageUrl = '';
              if (location.pathname.indexOf('embedclient') != -1) {
                pageUrl = '/embedclient';
              }
              window.location.href =
                window.location.origin +
                process.env.VUE_APP_ROUTER_BASE_URL +
                `/lives${pageUrl}/watch/${webinar.id}${window.location.search}`;
            } else {
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } else if (res.code === 512525) {
            // 填写报名表单
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickOpenSignUpForm')
            );
          } else {
            this.$message({
              message: this.$tec(res.code) || res.msg,
              showClose: true,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
          }
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-auth {
    &-wrap {
      padding-top: 12px;
      &-text {
        padding-bottom: 24px;
        .el-input__suffix {
          line-height: 40px;
          padding: 0 5px;
          cursor: pointer;
          .iconfont {
            font-size: 14px;
          }
        }
        .el-input__inner {
          padding-right: 40px;
        }
      }
      &-btn {
        text-align: right;
        .el-button {
          background-color: var(--theme-color) !important;
          border: 1px solid var(--theme-color) !important;
        }
      }
    }
  }
</style>
