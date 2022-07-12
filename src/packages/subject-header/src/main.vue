<template>
  <div class="vmp-subject-header">
    <div class="vmp-subject-header_container">
      <div class="subject_logo">
        <a href="" target="_blank">
          <img src="../images/logo-red@2x.png" alt="" />
        </a>
      </div>
      <div class="subject_title">
        <div class="subject_title_intro">
          <p>{{ subjectInfo.title }}</p>
          <span>{{ subjectInfo.created_at }}</span>
        </div>
      </div>
      <div class="subject_collapse">
        <div class="subject_collapse_share" @click="goSubjectShare">
          <i class="vh-iconfont vh-line-share"></i>
          <span>分享</span>
        </div>
        <div class="subject_collapse_login">
          <div class="subject_collapse_unlogin" v-if="!isLogin" @click="goLogin">
            <p><img src="../images/my-light@2x.png" alt="" /></p>
            <span>登录</span>
          </div>
          <div class="subject_collapse_logined" v-else>
            <div class="user_dropdown">
              <p>
                <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="" />
                <img v-else src="../images/my-light@2x.png" alt="" />
              </p>
              <span>{{ userInfo.nick_name | overHidden(8) }}</span>
              <div class="user_list">
                <ul>
                  <!-- <li @click="goUserInfo">
                  <i class="vh-iconfont vh-line-account"></i>
                  {{ $t('account.account_1001') }}
                </li>
                <li @click="goCashInfo">
                  <i class="vh-iconfont vh-a-line-financialcenter"></i>
                  {{ $t('nav.nav_1028') }}
                </li> -->
                  <li @click="exitLogin">
                    <i class="vh-iconfont vh-line-exit"></i>
                    退出登录
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { useSubjectServer, useUserServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpSubjectHeader',
    data() {
      return {
        isLogin: Boolean(window.localStorage.getItem('token'))
      };
    },
    beforeCreate() {
      this.subjectServer = useSubjectServer();
      this.userServer = useUserServer();
    },
    computed: {
      subjectInfo() {
        return this.subjectServer.state.subjectDetailInfo;
      },
      // 获取用户信息
      userInfo() {
        return this.$domainStore.state.userServer.userInfo;
      }
    },
    methods: {
      goLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      goSubjectShare() {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickShare', this.subjectInfo.id)
        );
      },
      exitLogin() {
        this.userServer.loginOut().then(res => {
          if (res.code == 200) {
            this.isLogin = false;
            window.localStorage.clear();
            window.sessionStorage.clear();
            this.$nextTick(() => {
              window.location.reload();
            });
          }
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-subject-header {
    width: 100%;
    height: 64px;
    background: #fff;
    &_container {
      width: 100%;
      display: flex;
      flex: 1;
      margin-bottom: 20px;
      .subject_logo {
        flex: 0 0 180px;
        height: 64px;
        background: #ffffff;
        a {
          float: left;
          margin: 10px 32px;
          text-align: left;
          width: 120px;
          height: 44px;
          img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: scale-down;
          }
        }
      }
      .subject_title {
        flex: 1;
        max-width: calc(100% - 405px);
        &_intro {
          width: 100%;
        }
        p {
          padding-top: 13px;
          line-height: 24px;
          color: #1a1a1a;
          font-size: 18px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 100px;
          font-weight: 500;
        }
        span {
          color: #999;
          font-size: 14px;
        }
      }
      .subject_collapse {
        display: flex;
        justify-items: center;
        justify-content: flex-end;
        flex: 0 0 220px;
        &_share {
          text-align: center;
          font-size: 14px;
          cursor: pointer;
          color: #666;
          margin-top: 18px;
          padding-right: 14px;
          span {
            display: block;
            padding-top: 3px;
          }
        }
        &_login {
          padding: 16px 0 0 10px;
        }
        &_unlogin {
          p {
            width: 36px;
            height: 36px;
            display: inline-block;
            border-radius: 50%;
            margin-right: 8px;
            cursor: pointer;
            vertical-align: middle;
            margin-top: -5px;
            img {
              width: 100%;
              height: 100%;
              object-fit: scale-down;
            }
          }
          span {
            font-size: 14px;
            font-weight: 400;
            color: #666;
            line-height: 14px;
            cursor: pointer;
          }
        }
        &_logined {
          position: relative;
          height: 100%;
          .user_dropdown {
            text-align: center;
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            p {
              width: 36px;
              height: 36px;

              margin-right: 8px;
              overflow: hidden;
              padding: 5px 0;
              img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
              }
            }
            span {
              font-size: 14px;
              font-weight: 400;
              line-height: 32px;
            }
            &:hover {
              .user_list {
                display: block;
              }
            }
          }
          .user_list {
            width: 160px;
            position: absolute;
            top: 42px;
            right: -6px;
            z-index: 11;
            border-radius: 4px;
            padding: 4px 0;
            background: #383838;
            display: none;
            ul {
              list-style: none;
              li {
                height: 40px;
                line-height: 40px;
                text-align: left;
                color: @font-dark-normal;
                font-size: 14px;
                cursor: pointer;
                &:hover {
                  background: #444;
                }
                .vh-iconfont {
                  font-size: 18px;
                  margin-left: 10px;
                  margin-right: 6px;
                  color: @font-dark-normal;
                  display: inline-block;
                  vertical-align: top;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
