<template>
  <div class="vmp-user-account">
    <!-- 个人资料弹出框 -->
    <el-dialog
      :title="$t('account.account_1001')"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="365px"
    >
      <div class="vmp-user-account-wrap">
        <div class="vmp-user-account-wrap-item">
          <label>{{ $t('account.account_1002') }}</label>
          <div class="vmp-user-account-wrap-item__center">
            {{ userServer.state.userInfo.phone || $t('account.account_1003') }}
          </div>
          <div>
            <el-button type="text" @click="openPhoneDialog">
              {{
                userServer.state.userInfo.phone
                  ? $t('account.account_1004')
                  : $t('account.account_1005')
              }}
            </el-button>
          </div>
        </div>
        <div class="vmp-user-account-wrap-item">
          <label>{{ $t('account.account_1006') }}</label>
          <div class="vmp-user-account-wrap-item__center nick-item">
            <span v-if="!isNickNameEdit">
              {{ userServer.state.userInfo.nick_name | overHidden(6) }}
            </span>
            <el-input
              v-if="isNickNameEdit"
              v-model.trim="nickName"
              :maxlength="30"
              :minlength="1"
              :class="['btn-relative btn-two', { 'input-error': nickError != '' }]"
            >
              <el-button slot="append" class="no-border" @click="editNickHandler">
                {{ $t('account.account_1007') }}
              </el-button>
            </el-input>
            <span v-if="nickError != ''" class="vmp-user-account-wrap-error">{{ nickError }}</span>
          </div>
          <div>
            <el-button v-if="!isNickNameEdit" type="text" @click="changeNickEditStatus">
              {{ $t('account.account_1008') }}
            </el-button>
          </div>
        </div>
        <div class="vmp-user-account-wrap-item upload">
          <label>{{ $t('account.account_1009') }}</label>
          <div class="vmp-user-account-wrap-item__center upload-zdy">
            <Upload
              v-model="userServer.state.userInfo.avatar"
              class="upload__avatar"
              :domain_url="userServer.state.userInfo.avatar"
              :saveData="{
                path: 'users/face-imgs',
                type: 'image'
              }"
              :widthImg="80"
              :heightImg="80"
              :on-success="handleUploadSuccess"
              :on-progress="uploadProcess"
              :on-error="uploadError"
              :on-preview="uploadPreview"
              :before-upload="beforeUploadHandler"
              @delete="delAvatarHandler"
            ></Upload>
          </div>
          <div class="upload-right">
            <p>{{ $t('account.account_1010') }}</p>
            <p>{{ $t('account.account_1011') }}</p>
            <p>{{ $t('account.account_1012') }}</p>
          </div>
        </div>
        <div class="vmp-user-account-wrap-item pwd-item">
          <label>{{ $t('account.account_1013') }}</label>
          <div class="vmp-user-account-wrap-item__center">
            {{
              userServer.state.userInfo.has_password !== 0
                ? $t('account.account_1014')
                : $t('account.account_1015')
            }}
          </div>
          <div>
            <el-button type="text" @click="openPwdHandler">
              {{
                userServer.state.userInfo.has_password !== 0
                  ? $t('account.account_1016')
                  : $t('account.account_1017')
              }}
            </el-button>
          </div>
        </div>
        <div class="vmp-user-account-wrap-item bind-item">
          <label>{{ $t('account.account_1018') }}</label>
          <div class="vmp-user-account-wrap-item__center">
            {{ userServer.state.thirdInfo.QQNickName | overHidden(6) }}
            {{
              userServer.state.thirdInfo.QQNickName
                ? `（${$t('account.account_1019')}）`
                : $t('account.account_1020')
            }}
          </div>
          <div>
            <el-button type="text" @click="editQQHandler">
              {{
                userServer.state.thirdInfo.QQBind
                  ? $t('account.account_1021')
                  : $t('account.account_1022')
              }}
            </el-button>
          </div>
        </div>
        <div class="vmp-user-account-wrap-item bind-item">
          <label>{{ $t('account.account_1023') }}</label>
          <div class="vmp-user-account-wrap-item__center">
            {{ userServer.state.thirdInfo.WeixinNickName | overHidden(6) }}
            {{
              userServer.state.thirdInfo.WeixinNickName
                ? `（${$t('account.account_1019')}）`
                : $t('account.account_1020')
            }}
          </div>
          <div>
            <el-button type="text" @click="editWXHandler">
              {{
                userServer.state.thirdInfo.WeixinBind
                  ? $t('account.account_1021')
                  : $t('account.account_1022')
              }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 设置手机号 -->
      <Phones v-model="phoneData" @bound="handleBoundMobile" />

      <!-- 设置密码 -->
      <Password v-model="pwdData.visible" :pwdData="pwdData"></Password>
    </el-dialog>
  </div>
</template>
<script>
  import Upload from './components/upload/upload.vue';
  import Phones from './components/phones/index.vue';
  import Password from './components/password/password.vue';
  import { useUserServer, useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpUserAccount',
    components: {
      Upload,
      Phones,
      Password
    },
    data() {
      return {
        dialogVisible: false,
        isNickNameEdit: false,
        nickName: '',
        nickError: '',
        avatar: '',
        domain_url: '',
        phoneData: {
          dialogShow: false,
          type: 'add',
          step: 1,
          phone: ''
        },
        pwdData: {
          type: 'add',
          visible: false
        }
      };
    },
    created() {
      this.userServer = useUserServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    methods: {
      // 上传、替换头像
      handleUploadSuccess(res) {
        console.log('handleUploadSuccess');
        console.log(res);
        if (res.data) {
          const domain_url = res.data.domain_url || '';
          const file_url = res.data.file_url || '';
          this.avatar = file_url;
          this.domain_url = domain_url;
          // 发送保存头像接口
          this.userServer
            .changeAvatarSend({ avatar: file_url })
            .then(res => {
              if (res && res.code === 200) {
                this.$message({
                  message: this.$t('account.account_1047'),
                  showClose: true,
                  type: 'success',
                  customClass: 'zdy-info-box'
                });
                this.roomBaseServer.setChangeUserInfo(1, { avatar: domain_url });
                this.userServer.getUserInfo({ scene_id: 2 });
              } else {
                this.$message({
                  message: this.$tec(res.code) || this.$t('account.account_1048'),
                  showClose: true,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              }
            })
            .catch(res => {
              this.$message({
                message: this.$tec(res.code) || this.$t('account.account_1048'),
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            });
        }
      },
      beforeUploadHandler(file) {
        console.log(file);
        const typeList = ['png', 'jpeg', 'gif', 'bmp'];
        console.log(file.type.toLowerCase());
        const typeArr = file.type.toLowerCase().split('/');
        const isType = typeList.includes(typeArr[typeArr.length - 1]);
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isType) {
          this.$message({
            message: this.$t('account.account_1044', { n: typeList.join('、') }),
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          return false;
        }
        if (!isLt2M) {
          this.$message({
            message: this.$t('account.account_1045'),
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        }
        return isType && isLt2M;
      },
      uploadProcess(event, file, fileList) {
        console.log('uploadProcess', event, file, fileList);
      },
      uploadError(err, file, fileList) {
        console.log('uploadError', err, file, fileList);
        this.$message({
          message: this.$t('account.account_1046'),
          showClose: true,
          type: 'error',
          customClass: 'zdy-info-box'
        });
      },
      uploadPreview(file) {
        console.log('uploadPreview', file);
      },
      // 删除头像
      delAvatarHandler() {
        this.avatar = '';
        this.domain_url = '';
        this.userServer
          .changeAvatarSend({ avatar: '' })
          .then(res => {
            if (res && res.code === 200) {
              this.$message({
                message: this.$t('account.account_1047'),
                showClose: true,
                type: 'success',
                customClass: 'zdy-info-box'
              });
              this.roomBaseServer.setChangeUserInfo(1, { avatar: '' });
              this.userServer.getUserInfo({ scene_id: 2 });
            } else {
              this.$message({
                message: this.$tec(res.code) || this.$t('account.account_1048'),
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            }
          })
          .catch(res => {
            this.$message({
              message: this.$tec(res.code) || this.$t('account.account_1048'),
              showClose: true,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          });
      },

      // 设置手机号 or 修改手机号
      openPhoneDialog() {
        this.phoneData.dialogShow = true;
        this.phoneData.type = this.userServer.state.userInfo.phone ? 'edit' : 'add';
        this.phoneData.phone = this.userServer.state.userInfo.phone;
        this.phoneData.step = 1;
      },
      // 切换昵称为 可修改状态
      changeNickEditStatus() {
        this.isNickNameEdit = true;
        this.nickName = this.userServer.state.userInfo.nick_name;
      },
      // 设置昵称 or 修改昵称
      editNickHandler() {
        if (!this.nickName) {
          this.nickError = this.$t('account.account_1055');
        } else {
          if (this.nickName.length < 1 || this.nickName.length > 30) {
            this.nickError = this.$t('account.account_1056');
          } else {
            this.nickError = '';
            this.userServer
              .editUserNickName({ nick_name: this.nickName })
              .then(res => {
                if (res && res.code == 200) {
                  this.$message({
                    message: this.$t('account.account_1057'),
                    showClose: true,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                  // 触发保存接口
                  this.isNickNameEdit = false;
                  this.roomBaseServer.setChangeUserInfo(2, { nick_name: this.nickName });
                  // 用户信息接口更新
                  this.userServer.getUserInfo({ scene_id: 2 });
                } else {
                  this.$message({
                    message: this.$tec(res.code) || this.$t('account.account_1058'),
                    showClose: true,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(res => {
                this.$message({
                  message: this.$tec(res.code) || this.$t('account.account_1058'),
                  showClose: true,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          }
        }
      },
      // 设置密码 or 修改密码
      openPwdHandler() {
        this.pwdData.visible = true;
        this.pwdData.type = this.userServer.state.userInfo.has_password === 1 ? 'edit' : 'add';
      },
      // QQ绑定 or QQ解绑
      editQQHandler() {
        if (this.userServer.state.thirdInfo.QQBind) {
          // 解绑
          this.$confirm(this.$t('account.account_1060'), this.$t('account.account_1061'), {
            confirmButtonText: this.$t('account.account_1062'),
            cancelButtonText: this.$t('account.account_1063'),
            customClass: 'zdy-message-box',
            lockScroll: false,
            cancelButtonClass: 'zdy-confirm-cancel'
          })
            .then(() => {
              // 1微博 2QQ 3微信 4 阿里 5 SDK打赏生的用户6小程序观看端
              this.unBindSend(2);
            })
            .catch(() => {});
        } else {
          localStorage.setItem('vmp_auth_tag', 'bindQQ');
          const hostPath = process.env.VUE_APP_BIND_BASE_URL;
          const jumpUrlPath = `https:${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.$route.params.id}`;
          window.open(
            `https:${hostPath}/v3/commons/auth/qq?source=pc&jump_url=${encodeURIComponent(
              jumpUrlPath
            )}`
          );
        }
      },
      unBindSend(type) {
        this.userServer
          .thirdUnbind({ type })
          .then(res => {
            if (res && res.code == 200) {
              this.$message({
                message: this.$t('account.account_1064'),
                showClose: true,
                type: 'success',
                customClass: 'zdy-info-box'
              });
              // 解绑成功后，刷新页面
              this.userServer.getUserInfo({ scene_id: 2 });
            } else {
              this.$message({
                message: this.$tec(res.code) || this.$t('account.account_1065'),
                showClose: true,
                type: 'success',
                customClass: 'zdy-info-box'
              });
              this.userServer.getUserInfo({ scene_id: 2 });
            }
          })
          .catch(res => {
            this.$message({
              message: this.$tec(res.code) || this.$t('account.account_1065'),
              showClose: true,
              // duration: 0,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          });
      },
      // 微信绑定 or 微信解绑
      editWXHandler() {
        if (this.userServer.state.thirdInfo.WeixinBind) {
          // 解绑
          this.$confirm(this.$t('account.account_1066'), this.$t('account.account_1061'), {
            confirmButtonText: this.$t('account.account_1062'),
            cancelButtonText: this.$t('account.account_1063'),
            customClass: 'zdy-message-box',
            lockScroll: false,
            cancelButtonClass: 'zdy-confirm-cancel'
          })
            .then(() => {
              this.unBindSend(3);
            })
            .catch(() => {});
        } else {
          // 绑定
          localStorage.setItem('vmp_auth_tag', 'bindWx');
          const hostPath = process.env.VUE_APP_BIND_BASE_URL;
          const jumpUrlPath = `https:${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.$route.params.id}`;
          window.open(
            `https:${hostPath}/v3/commons/auth/weixin?source=pc&jump_url=${encodeURIComponent(
              jumpUrlPath
            )}`
          );
        }
      },
      // 打开个人资料弹出框
      openUserAccountDialog() {
        this.dialogVisible = true;
        this.isNickNameEdit = false;
        this.nickError = '';
        this.userServer.getUserInfo({ scene_id: 2 });
      },
      // 绑定手机号后的回调
      handleBoundMobile() {
        // 重新更新用户信息
        this.userServer.getUserInfo({ scene_id: 2 });
      }
    }
  };
</script>
<style lang="less">
  .vmp-user-account {
    .el-dialog__body {
      padding-bottom: 0;
    }
    &-wrap {
      &-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0;
        padding-bottom: 24px;
        &:last-child {
          padding-bottom: 32px;
        }
        .el-button {
          padding: 0 0;
        }
        .el-button.el-button--text {
          font-size: 14px;
          font-weight: 400;
          color: #3562fa;
          line-height: 20px;
        }
        &.upload {
          align-items: flex-start;
          border-bottom: 1px solid #e6e6e6;
          padding-bottom: 16px;
          .upload-right {
            font-size: 12px;
            font-weight: 400;
            color: #999999;
            line-height: 17px;
            margin-right: auto;
            p {
              word-break: break-word;
            }
          }
        }
        &.pwd-item {
          border-bottom: 1px solid #e6e6e6;
          padding-top: 24px;
          margin-bottom: 16px;
        }
        label {
          width: 56px;
          margin-right: 12px;
          text-align: right;
          font-size: 14px;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 20px;
        }
        &.bind-item {
          label {
            text-align: right;
          }
        }
        &__center {
          margin-right: auto;
          &.upload-zdy {
            margin-right: 8px;
          }
          &.nick-item {
            position: relative;
          }
        }
        .el-upload--picture-card {
          width: 80px;
          height: 80px;
          line-height: unset;
          overflow: hidden;
        }
        .el-input-group__append {
          width: 52px;
          height: 38px;
          background: #f7f7f7;
          border-radius: 0px 4px 4px 0px;
          text-align: center;
          padding: 0 0;
        }
      }
      &-error {
        position: absolute;
        left: 0;
        top: 43px;
        font-size: 12px;
        font-weight: 400;
        color: #fb3a32;
        line-height: 17px;
      }
      .el-form-item__error {
        color: #fb3a32;
      }
    }
  }

  .btn-relative {
    position: relative;
    .el-input-group__append {
      width: 52px !important;
      height: 38px;
      background: #f7f7f7;
      border-radius: 0 4px 4px 0;
      position: absolute;
      right: 1px;
      top: 1px;
      line-height: 38px;
      text-align: center;
      padding: 0 0;
      margin: 0 0;
      font-weight: 400;
      color: #666;
      border: 0;
    }
    .el-input__inner {
      padding: 0 62px 0 10px;
      border-top-right-radius: 4px !important;
      border-bottom-right-radius: 4px !important;
      /*border-color: #cccccc;*/
      /*&:hover {
        color: #999999;
      }*/
    }
    &.input-error {
      .el-input__inner {
        border-color: #fb3a32;
        &:hover {
          color: #999999;
        }
      }
      .el-input__inner:hover {
        color: #999999;
      }
    }
  }
</style>
