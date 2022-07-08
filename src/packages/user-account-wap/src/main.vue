<template>
  <div>
    <!-- 修改个人资料-弹出框 -->
    <van-popup
      v-model="visible"
      class="vmp-user-account-wap"
      position="bottom"
      get-container="body"
    >
      <div class="user-info-title">
        <i class="vh-iconfont vh-line-arrow-left" @click="closePopup"></i>
        {{ $t('account.account_1075') }}
      </div>

      <!-- 手机号 -->
      <van-cell is-link @click="openPhoneHandler">
        <template #title>
          <span class="user-info-form-label">{{ $t('account.account_1002') }}</span>
          <span
            :class="
              userServer.state.userInfo.phone ? 'user-info-form-ready' : 'user-info-form-no-ready'
            "
          >
            {{ userServer.state.userInfo.phone || $t('account.account_1003') }}
          </span>
        </template>
      </van-cell>

      <!-- 头像 -->
      <van-cell>
        <!-- 使用 title 插槽来自定义标题 -->
        <template #title>
          <span class="user-info-form-label">{{ $t('account.account_1009') }}</span>
          <van-uploader
            v-model="fileList"
            :max-count="1"
            accept="image/x-ms-bmp,image/x-png,image/gif,image/jpeg,image/bmp"
            :after-read="handleuploadSuccess"
            :before-read="handleuploadBefore"
            :deletable="false"
          >
            <i
              v-if="!userServer.state.userInfo.avatar"
              class="vh-iconfont vh-a-line-cloudtoupload"
            ></i>
            <div class="img-logo" v-if="userServer.state.userInfo.avatar">
              <img :src="userServer.state.userInfo.avatar" class="avatar" alt="" />
            </div>
          </van-uploader>
        </template>
        <template #right-icon>
          <van-button
            class="user-info-form-btn"
            v-if="userServer.state.userInfo.avatar"
            @click="removeAvatar"
          >
            {{ $t('account.account_1076') }}
          </van-button>
        </template>
      </van-cell>

      <!-- 昵称 -->
      <van-field v-model.trim="nickName" center clearable>
        <template #label>
          <span class="user-info-form-label">{{ $t('account.account_1006') }}</span>
        </template>
        <template #button>
          <van-button class="user-info-form-btn" @click="editNickHandler">
            {{ $t('account.account_1007') }}
          </van-button>
        </template>
      </van-field>

      <!-- 登录密码 -->
      <van-cell is-link @click="openPwdHandler">
        <!-- 使用 title 插槽来自定义标题 -->
        <template #title>
          <span class="user-info-form-label">{{ $t('account.account_1013') }}</span>
          <span
            :class="
              userServer.state.userInfo.has_password !== 0
                ? 'user-info-form-ready'
                : 'user-info-form-no-ready'
            "
          >
            {{
              userServer.state.userInfo.has_password !== 0
                ? $t('account.account_1014')
                : $t('account.account_1015')
            }}
          </span>
        </template>
      </van-cell>
      <van-cell></van-cell>
    </van-popup>

    <!-- 设置手机号 -->
    <bind-phone v-model="phoneDialog" />

    <!-- 设置密码 -->
    <bind-password v-model="pwdData" />
  </div>
</template>

<script>
  import { useUserServer, useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  import BindPhone from './components/bind-phone';
  import BindPassword from './components/bind-password';
  export default {
    name: 'VmpUserAccountWap',
    components: { BindPhone, BindPassword },
    data() {
      return {
        userServer: {},
        visible: false,
        fileList: [],
        nickName: '',
        phoneDialog: {
          visible: false,
          step: 1,
          type: 'add',
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
      // 打开弹窗
      openUserAccountWap() {
        this.visible = true;
        this.nickName = this.userServer.state.userInfo.nick_name;
      },

      // 关闭弹窗
      closePopup() {
        this.visible = false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitCloseUserCenterWap'));
      },

      // 打开手机号弹窗
      openPhoneHandler() {
        this.phoneDialog = {
          visible: true,
          type: this.userServer.state.userInfo.phone ? 'edit' : 'add',
          step: 1,
          phone: this.userServer.state.userInfo.phone
        };
      },

      // 图片上传前的回调
      handleuploadBefore(file) {
        const typeList = ['png', 'jpeg', 'gif', 'bmp'];
        const typeArr = file.type.toLowerCase().split('/');
        const isType = typeList.includes(typeArr[typeArr.length - 1]);
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isType) {
          this.$toast(this.$t('account.account_1044'));
          return false;
        }
        if (!isLt2M) {
          this.$toast(this.$t('account.account_1045'));
          return false;
        }
        return isType && isLt2M;
      },

      // 图片上传成功回调
      handleuploadSuccess(files) {
        const param = {
          platform: 10,
          type: 'image',
          resfile: files.file,
          path: 'users/face-imgs'
        };
        this.userServer
          .uploadImage(param)
          .then(res => {
            if (res && res.code == 200) {
              // 上传成功，自动保存
              console.log('上传成功后图片地址', res.data.file_url);
              this.changeAvatarSend(res.data.file_url);
            } else {
              this.$toast(this.$tec(res.code) || this.$t('account.account_1046'));
            }
          })
          .catch(err => {
            this.$toast(this.$tec(err.code) || this.$t('account.account_1046'));
          });
      },

      // 更换头像接口
      changeAvatarSend(avatar) {
        this.userServer
          .changeAvatarSend({ avatar })
          .then(res => {
            if (res && res.code == 200) {
              this.$toast(this.$t('account.account_1047'));
              if (avatar === '') {
                this.fileList = [];
              }
              // 用户信息接口更新
              this.userServer.getUserInfo({ scene_id: 2 }).then(res => {
                const avatarUrl = res.data?.avatar;
                this.roomBaseServer.setChangeUserInfo(1, { avatar: avatarUrl });
              });
            } else {
              this.$toast(this.$tec(res.code) || this.$t('account.account_1048'));
            }
          })
          .catch(err => {
            this.$toast(this.$tec(err.code) || this.$t('account.account_1048'));
          });
      },

      // 删除头像事件
      removeAvatar() {
        this.changeAvatarSend('');
      },

      // 编辑昵称
      editNickHandler() {
        if (!this.nickName) {
          this.$toast(this.$t('account.account_1055'));
        } else if (this.nickName.length < 1 || this.nickName.length > 30) {
          this.$toast(this.$t('account.account_1056'));
        } else {
          this.userServer
            .editUserNickName({ nick_name: this.nickName })
            .then(res => {
              if (res && res.code == 200) {
                this.$toast(this.$t('account.account_1057'));
                this.roomBaseServer.setChangeUserInfo(2, { nick_name: this.nickName });
                this.userServer.getUserInfo({ scene_id: 2 });
              } else {
                this.$toast(this.$tec(res.code) || this.$t('account.account_1058'));
              }
            })
            .catch(err => {
              this.$toast(this.$tec(err.code) || this.$t('account.account_1058'));
            });
        }
      },

      // 修改密码
      openPwdHandler() {
        this.pwdData.visible = true;
        this.pwdData.type = this.userServer.state.userInfo.has_password === 1 ? 'edit' : 'add';
      }
    }
  };
</script>

<style lang="less">
  .vmp-user-account-wap {
    width: 100%;
    height: 100%;

    .user-info-title {
      width: 100%;
      height: 72px;
      background: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      font-size: 32px;
      font-weight: 600;
      color: #262626;

      .vh-line-arrow-left {
        width: 176px;
        height: 100%;
        display: flex;
        align-items: center;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        font-size: 32px;
        padding-left: 40px;
      }
    }

    .van-cell {
      padding: 24px 32px;

      .van-cell__title {
        display: flex;
      }

      &::after {
        border-bottom: 1px solid #d9d9d9;
        left: 32px;
        right: 32px;
      }

      .user-info-form-label {
        width: 145px;
        text-align: left;
        display: inline-block;
        vertical-align: top;
        font-size: 28px;
        font-weight: 400;
        color: #262626;
      }

      .user-info-form-no-ready {
        color: #999999;
      }
      .user-info-form-ready {
        color: #262626;
      }

      .van-cell__title.van-field__label {
        margin-right: 0;
        width: 145px;
      }

      .van-uploader {
        margin-top: 8px;
        .img-logo {
          width: 160px;
          height: 160px;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
          }
        }
        .vh-a-line-cloudtoupload {
          width: 160px;
          height: 160px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #e6e6e6;
          border-radius: 8px;
          background: #f7f7f7;
          color: #999999;
          font-size: 52px;
        }
      }

      .van-field__button {
        height: 48px;
        display: flex;
      }
      .user-info-form-btn {
        height: 48px;
        line-height: 48px;
        border: 0;
        color: #3562fa;
        padding-right: 0;
      }
    }
  }
</style>
