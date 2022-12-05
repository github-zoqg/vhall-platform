<template>
  <section class="vmp-invitation">
    <template v-if="isInviteVisible">
      <div class="vh-invitation__down-warp">
        <img v-show="canvasImgUrl" :src="canvasImgUrl" alt />
      </div>
      <div class="vh-invitation__card-preview-content-download" ref="drawCanvasDom">
        <div class="vh-invitation__card-preview-content-warp">
          <div class="watch-img" v-if="webinarInfo.show_type == 1" id="shopInvent">
            <div class="hsrc vh-invitation__show-img">
              <img
                :src="webinarInfo.showImg"
                alt
                v-parseImgOss="{ url: webinarInfo.showImg }"
                class="invitation__img"
              />
            </div>
            <div class="watch-bg">
              <div class="watch-header">
                <div class="watch-avator">
                  <img class="hsrc" :src="webinarInfo.avatar" alt="" />
                </div>
                <p class="ellips">{{ webinarInfo.nick_name }}</p>
                <p>{{ $t('nav.nav_1044') }}</p>
              </div>
              <div class="watch-middle-box">
                <div class="watch-middle-insidebox">
                  <div class="watch-text">
                    <h1>{{ webinarInfo.title }}</h1>
                    <p v-if="webinarInfo.desciption">{{ webinarInfo.desciption }}</p>
                  </div>
                  <div class="watch-time">
                    <p v-show="webinarInfo.company"><i class="iconfont icontime_icon"></i></p>
                    <p>{{ webinarInfo.company }}</p>
                    <p class="location-icon" v-show="webinarInfo.date">
                      <i class="vh-iconfont vh-line-time"></i>
                    </p>
                    <p>{{ webinarInfo.date }}</p>
                    <p class="location-icon" v-show="webinarInfo.location">
                      <i class="vh-iconfont vh-line-location-outline"></i>
                    </p>
                    <p>{{ webinarInfo.location }}</p>
                  </div>
                </div>
              </div>
              <div class="watch-footer">
                <div class="watch-code">
                  <img class="hsrc" :src="invite_qr_url" alt="" />
                </div>
                <div class="watch-action">
                  <p class="qr-value">{{ $t('nav.nav_1046') }}</p>
                  <h1>{{ $t('nav.nav_1045') }}</h1>
                  <p>{{ $t('nav.nav_1047') }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="look-img" v-else-if="webinarInfo.show_type == 2" id="shopInvent">
            <div class="hsrc vh-invitation__show-img">
              <img
                :src="webinarInfo.showImg"
                alt
                v-parseImgOss="{ url: webinarInfo.showImg }"
                class="invitation__img"
              />
            </div>
            <div class="look-header">
              <div class="look-avator">
                <img class="hsrc" :src="webinarInfo.avatar" alt="" />
              </div>
              <p class="ellips">{{ webinarInfo.nick_name }}</p>
              <p>{{ $t('nav.nav_1044') }}</p>
            </div>
            <div class="bottom-content">
              <div class="look-text">
                <h1>{{ webinarInfo.title }}</h1>
                <p>{{ webinarInfo.desciption }}</p>
              </div>
              <div class="look-footer">
                <div class="look-code">
                  <img class="hsrc" :src="invite_qr_url" alt="" />
                </div>
                <div class="look-action">
                  <p>{{ webinarInfo.company }}</p>
                  <p>{{ webinarInfo.date }}</p>
                  <p>{{ webinarInfo.location }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="show-img" v-else id="shopInvent">
            <div class="hsrc vh-invitation__show-img">
              <img
                :src="webinarInfo.showImg"
                v-parseImgOss="{ url: webinarInfo.showImg }"
                alt
                class="invitation__img"
              />
            </div>
            <div class="show-img-shadow"></div>
            <div class="show-container">
              <div class="show-header">
                <div class="show-avator">
                  <img class="hsrc" :src="webinarInfo.avatar" alt="" />
                </div>
                <p class="ellips">{{ webinarInfo.nick_name }}</p>
                <p>{{ $t('nav.nav_1044') }}</p>
              </div>
              <div class="show-middle-box">
                <div class="show-middle-container">
                  <div class="show-text" v-if="webinarInfo.title || webinarInfo.desciption">
                    <h1>{{ webinarInfo.title }}</h1>
                    <p>{{ webinarInfo.desciption }}</p>
                  </div>
                  <div v-if="webinarInfo.company" class="show-time">
                    <p class="top-border"></p>
                    <p class="show-time-item no-padding-bottom">{{ $t('nav.nav_1053') }}</p>
                    <p class="show-time-item no-padding-top">{{ webinarInfo.company }}</p>
                  </div>
                  <div v-if="webinarInfo.date" class="show-time">
                    <p class="top-border"></p>
                    <p class="show-time-item no-padding-bottom">{{ $t('nav.nav_1048') }}</p>
                    <p class="show-time-item no-padding-top">{{ webinarInfo.date }}</p>
                  </div>
                  <div v-if="webinarInfo.location" class="show-location">
                    <p class="top-border"></p>
                    <p class="show-time-item no-padding-bottom">{{ $t('nav.nav_1049') }}</p>
                    <p class="show-time-item no-padding-top no-padding-bottom">
                      {{ webinarInfo.location }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="show-footer">
                <div class="show-code">
                  <img class="hsrc" :src="invite_qr_url" alt="" />
                </div>
                <div class="show-action">
                  <p class="qr-value">{{ $t('nav.nav_1046') }}</p>
                  <h1>{{ $t('nav.nav_1045') }}</h1>
                  <p>{{ $t('nav.nav_1047') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="vmp-invitation__no-data" v-if="!isInviteVisible && inited">
      <img src="../img/nodata-img@2x.png" alt />
      <p>{{ $t('nav.nav_1050') }}</p>
      <p>{{ $t('appointment.appointment_1031') }}</p>
    </div>
  </section>
</template>

<script>
  import Html2canvas from 'html2canvas';
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import { getBase64Image, padStringWhenTooLang, formatDesc } from '../js/utils';
  import { bgImgOptions } from '../js/getOptions';
  import { sleep } from '@/app-shared/utils/tool';
  import { initWeChatSdk } from '@/app-shared/utils/wechat';
  import { useInviteServer } from 'middle-domain';
  import { cropperImage } from '@/app-shared/utils/common';

  export default {
    name: 'invitationCard',
    data() {
      return {
        isInviteVisible: false, // 是否开启邀请卡
        inited: false,
        // 展示添加封面背景数据
        selectBgDataInit: Object.freeze(bgImgOptions),
        webinarInfo: {
          title: '', // 标题
          img: '', // 背景图
          company: '', // 主办方
          date: '', // 时间
          location: '', // 活动地点
          desciption: '', // 活动简介
          isShowWaterMark: false, // 是否隐藏水印
          show_type: 0, // 展示方式当前选中样式
          img_type: 0, // 背景选中样式
          avatar: ''
        },
        invite_qr_url: `//aliqr.e.vhall.com/qr.png?s=7&t=https:${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_WEB_KEY}/lives/watch/${this.$route.params.id}`,
        canvasImgUrl: '',
        nickname: ''
      };
    },
    beforeCreate() {
      this.inviteServer = useInviteServer();
    },
    async created() {
      this.getRoomStatus();
      await sleep(2000);
      this.inited = true;
    },
    methods: {
      async getRoomStatus() {
        let params = {
          webinar_id: this.$route.params.id
        };
        if (this.$route.query) {
          params.invite_id = this.$route.query.join_id || this.$route.query.invite_id;
        }

        // 获取屏幕宽高
        const screen_wid = Math.floor(window.screen.width);
        const screen_height = Math.floor(window.screen.height);

        const res = await this.inviteServer.createInvite(params);
        const data = res.data;

        this.webinarInfo.avatar = data.avatar || defaultAvatar;
        this.webinarInfo.title = data.invite_card.title;
        this.webinarInfo.img = data.invite_card.img;
        this.webinarInfo.company = data.invite_card.company;
        this.webinarInfo.nick_name = data.nick_name;
        this.webinarInfo.date = data.invite_card.webinar_date;
        this.webinarInfo.location = data.invite_card.location;
        this.webinarInfo.desciption = data.invite_card.desciption;
        this.webinarInfo.isShowWaterMark = data.invite_card.is_show_watermark == 0;
        this.webinarInfo.show_type = data.invite_card.show_type;
        this.webinarInfo.img_type = data.invite_card.img_type;
        this.invite_qr_url += `?invite=${data.invite}`;
        this.$emit('changeInvite', data.invite);

        if (this.webinarInfo.img_type == 0) {
          // 默认
          if (cropperImage(data.invite_card.img)) {
            this.webinarInfo.showImg = data.invite_card.img;
          } else {
            this.webinarInfo.showImg = `${data.invite_card.img}?x-oss-process=image/resize,m_mfit,w_${screen_wid},h_${screen_height}`;
          }
        } else {
          this.webinarInfo.showImg = `${
            this.selectBgDataInit[this.webinarInfo.img_type - 1].imageUrl
          }?x-oss-process=image/resize,m_mfit,w_${screen_wid},h_${screen_height}`;
        }

        this.nickname = padStringWhenTooLang(data.nick_name, '...', 5);
        this.loading = false;

        this.isInviteVisible = parseInt(data.status) === 1 ? true : false;
        this.inited = true;
        if (this.isInviteVisible) {
          this.$nextTick(() => {
            this.drawCanvas();
          });
        }
        this.wxShareInfo();
      },
      getWxShareUrl() {
        const protocol = window.location.protocol;
        const url = process.env.VUE_APP_WAP_WATCH;
        const id = this.$route.params.id;
        const search = window.location.search;
        return `${protocol}${url}/v3/lives/invite/${id}${search}`;
      },
      // 获取微信分享信息
      async wxShareInfo() {
        const wxShareUrl = this.getWxShareUrl();

        const res = await this.inviteServer.wechatShare({
          wx_url: wxShareUrl
        });

        if (res.code != 200 || !res.data) return;

        const params = {
          appId: res.data.appId,
          timestamp: res.data.timestamp,
          nonceStr: res.data.nonceStr,
          signature: res.data.signature
        };

        // set desc
        let desc = null;
        if (this.webinarInfo.desciption) {
          desc = formatDesc(this.webinarInfo.desciption);
        } else {
          desc = this.$t('nav.nav_1044'); // 邀请你一起看直播
        }

        // wechat-sdk 初始化
        const initData = { ...params };
        const shareData = {
          title: this.webinarInfo.title,
          desc,
          link: wxShareUrl,
          imgUrl: this.webinarInfo.avatar
        };
        const wechatRes = await initWeChatSdk(initData, shareData);
        // const shareSuccessStr = this.$t('webinar.webinar_1038');
        // wechatRes.isSuccess && this.$toast(shareSuccessStr);
      },
      // 记录生成邀请卡, /create-invite-self-relation 传递了join_id
      async submitCreateHistory(join_id) {
        const token =
          this.$route.query.token ||
          localStorage.getItem('token') ||
          sessionStorage.getItem('token') ||
          '';

        await this.inviteServer.createInvite(
          // data
          {
            webinar_id: this.$route.params.id,
            join_id
          },
          // options
          {
            headers: {
              token
            }
          }
        );
      },
      /**
       * 生成图片
       */
      drawCanvas() {
        const dom = this.$refs.drawCanvasDom;
        const imgList = document.querySelectorAll('img.hsrc');
        let count = 0;
        return new Promise(resolve => {
          imgList.forEach(img => {
            const imaObj = new Image();
            imaObj.setAttribute('crossorigin', 'anonymous');
            const draw = () => {
              count++;
              img.src = getBase64Image(imaObj);
              if (imgList.length === count) {
                Html2canvas(dom, {
                  allowTaint: true,
                  useCORS: true,
                  logging: false,
                  width: Math.round(dom.offsetWidth),
                  height: Math.round(dom.offsetHeight),
                  background: '#fff',
                  scale: 3
                })
                  .then(canvas => {
                    this.canvasImgUrl = canvas.toDataURL();
                    resolve();
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }
            };
            imaObj.onload = draw;
            imaObj.onerror = draw;
            imaObj.src = img.getAttribute('src');
          });
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-invitation {
    overflow: hidden;
    height: 100%;
    position: relative;
    z-index: 1;
    // .hsrc {
    //   width: 560px;
    //   left: 0;
    //   position: absolute;
    //   opacity: 0;
    // }
    .vh-invitation__down-warp {
      width: 100%;
      height: 100%;
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .vh-invitation__card-preview-content-download {
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: absolute;
      z-index: -1;
      background-color: #fff;
      .vh-invitation__card-preview-content-warp {
        width: 100%;
        height: 100%;
        .ellips {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .vh-invitation__show-img {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 100%;
          z-index: 1;
          .invitation__img {
            width: 100%;
            height: 100%;
          }
        }
        .show-img {
          width: 100%;
          border-radius: 4px;
          border: 1px solid #e2e2e2;
          height: 100%;
          position: relative;
          .show-img-shadow {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            background: rgba(0, 0, 0, 0.2);
            z-index: 2;
          }
          .show-container {
            padding: 24px;
            width: 100%;
            height: 100%;
            position: relative;
            // background-color: #fff;
            // box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.1);
            z-index: 2;
            .show-header {
              padding: 10px 24px 10px;
              text-align: center;
              .show-avator {
                margin: auto;
                margin-bottom: 10px;
                img {
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                }
              }
              p {
                padding: 0;
                font-size: 30px;
                color: #ffffff;
                font-weight: 400;
                line-height: 40px;
              }
            }
            .show-middle-box {
              height: calc(100% - 454px);
              display: flex;
              flex-direction: column;
              justify-content: space-around;
            }
            .show-text {
              margin: 20px 40px 10px;
              padding: 20px 24px 20px 24px;
              text-align: center;
              border-radius: 6px;
              border: 5px solid #ffffff;
              h1 {
                padding: 0;
                font-size: 66px;
                color: #ffffff;
                font-weight: 500;
                line-height: 80px;
                letter-spacing: 2px;
              }
              p {
                font-size: 30px;
                color: #ffffff;
                font-weight: 400;
                line-height: 40px;
                padding: 2px 10px 5px;
                // height: 140px;
                // letter-spacing: 2px;
                margin-top: 20px;
                word-wrap: break-word;
                white-space: normal;
                word-break: break-all;
              }
            }
            .show-time {
              margin: 38px 60px 10px 74px;
              p {
                word-wrap: break-word;
                white-space: normal;
                word-break: break-all;
              }
            }
            .show-time-item {
              color: #ffffff;
              line-height: 40px;
              font-size: 28px;
              padding-top: 10px;
              padding-bottom: 6px;
              &.no-padding-bottom {
                padding-bottom: 0;
              }
              &.no-padding-top {
                padding-top: 8px;
              }
            }
            .show-location {
              margin: 28px 60px 0px 74px;
              p {
                word-wrap: break-word;
                white-space: normal;
                word-break: break-all;
              }
            }
            .top-border {
              width: 56px;
              border: 2px #fff solid;
              background: #fff;
              border-radius: 2px;
            }
            .show-footer {
              margin: 0px 48px 10px;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 6px;
              display: flex;
              padding: 20px 40px 24px 40px;
              width: calc(100% - 140px);
              height: 220px;
              align-items: center;
              position: absolute;
              bottom: 15px;
              .show-code {
                width: 166px;
                height: 166px;
                margin-right: 30px;
                margin-left: 10px;
                img {
                  width: 100%;
                  height: 100%;
                }
              }
              .show-action {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 24px 0px;
                word-break: break-all;
                white-space: nowrap;
                h1 {
                  white-space: nowrap;
                  padding: 0;
                  font-size: 14px;
                  color: #ffffff;
                  font-weight: 600;
                  line-height: 42px;
                  width: 100%;
                  text-align: center;
                  letter-spacing: 10px;
                }
                p {
                  white-space: nowrap;
                  padding: 0;
                  font-size: 32px;
                  color: #fff;
                  font-weight: 400;
                  line-height: 33px;
                  width: 100%;
                  text-align: center;
                }
                .qr-value {
                  white-space: nowrap;
                  letter-spacing: 7px;
                }
              }
            }
          }
        }
        .watch-img {
          width: 100%;
          border-radius: 4px;
          border: 1px solid #e2e2e2;
          height: 100%;
          .watch-bg {
            width: calc(100% - 100px);
            height: calc(100% - 170px);
            margin: 80px 50px 80px;
            background: #ffffff;
            position: relative;
            border-radius: 4px;
            border: 1px solid #e2e2e2;
            box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.2);
            z-index: 2;
            .watch-header {
              padding: 34px 24px 20px;
              text-align: center;
              .watch-avator {
                margin: auto;
                margin-bottom: 8px;
                img {
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                }
              }
              p {
                padding: 0;
                font-size: 30px;
                color: #666666;
                font-weight: 400;
                line-height: 40px;
              }
            }
          }
          .watch-middle-box {
            padding: 20px 0;
            height: calc(100% - 486px);
            display: flex;
            flex-direction: column;
            justify-content: space-around;
          }
          .watch-text {
            width: calc(100% - 82px);
            margin: 0 auto;
            margin-top: 8px;
            padding: 0;
            h1 {
              font-size: 67px;
              color: #1a1a1a;
              font-weight: 500;
              line-height: 74px;
              letter-spacing: 2px;
              text-align: center;
            }
            p {
              margin-top: 20px;
              font-size: 28px;
              color: #1a1a1a;
              font-weight: 400;
              line-height: 36px;
              padding: 2px 0 5px 0;
              letter-spacing: 2px;
              text-align: center;
              word-wrap: break-word;
              white-space: normal;
              word-break: break-all;
            }
          }
          .watch-time {
            width: calc(100% - 82px);
            margin: 0 auto;
            padding: 18px 0 10px;
            p {
              text-align: center;
              font-size: 28px;
              font-weight: 400;
              line-height: 36px;
              color: #666666;
              word-wrap: break-word;
              white-space: normal;
              word-break: break-all;
            }
            .location-icon {
              padding-top: 10px;
            }
            .iconbiaoqing {
              font-size: 30px;
            }
            .iconicon_guanzhu_no-copy {
              font-size: 30px;
            }
          }
          .watch-footer {
            border-top: 1px dashed #979797;
            margin: 0px 48px 10px;
            border-radius: 6px;
            display: flex;
            padding: 4px 40px 0 40px;
            width: calc(100% - 96px);
            height: 210px;
            align-items: center;
            position: absolute;
            bottom: 0px;
            .watch-code {
              width: 147px;
              height: 147px;
              img {
                width: 100%;
                height: 100%;
              }
            }
            .watch-action {
              height: 147px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              margin-left: 20px;
              padding: 10px 0;
              white-space: nowrap;
              h1 {
                padding: 0;
                font-size: 40px;
                color: #666666;
                font-weight: 600;
                line-height: 62px;
                width: 100%;
                text-align: center;
                letter-spacing: 10.2px;
              }
              p {
                padding: 0;
                font-size: 32px;
                color: #666666;
                font-weight: 400;
                line-height: 33px;
                width: 100%;
                text-align: center;
              }
              .qr-value {
                letter-spacing: 7.4px;
              }
            }
          }
        }
        .look-img {
          width: 100%;
          border-radius: 4px;
          border: 1px solid #e2e2e2;
          height: 100%;
          .look-header {
            height: calc(100% - 600px);
            padding: 20px 24px;
            text-align: center;
            position: absolute;
            z-index: 2;
            width: 100%;
            .look-avator {
              margin: auto;
              margin-bottom: 10px;
              img {
                width: 100px;
                height: 100px;
                border-radius: 50%;
              }
            }
            p {
              padding: 0;
              font-size: 30px;
              color: #ffffff;
              font-weight: 400;
              line-height: 40px;
            }
          }
          .bottom-content {
            width: 100%;
            height: 600px;
            position: absolute;
            bottom: 0;
            left: 0;
            background: #ffffff;
            z-index: 2;
          }
          .look-text {
            width: calc(100% - 84px);
            padding: 16px 32px;
            margin: auto;
            margin-top: 10px;
            padding: 20px 0 0;
            height: 330px;
            h1 {
              font-size: 64px;
              color: #1a1a1a;
              font-weight: 500;
              line-height: 80px;
              letter-spacing: 2px;
              word-wrap: break-word;
              white-space: normal;
              word-break: break-all;
            }
            p {
              margin-top: 20px;
              font-size: 30px;
              color: #666666;
              font-weight: 400;
              line-height: 44px;
              padding: 2px 0 5px 0;
              min-height: 45px;
              height: 140px;
              letter-spacing: 2px;
              word-wrap: break-word;
              white-space: normal;
              word-break: break-all;
            }
          }
          .look-footer {
            width: calc(100% - 84px);
            margin: auto;
            border-radius: 6px;
            display: flex;
            height: 220px;
            align-items: center;
            .look-code {
              width: 147px;
              height: 147px;
              margin-right: 10px;
              margin-left: 10px;
              img {
                width: 100%;
                height: 100%;
              }
            }
            .look-action {
              height: 147px;
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-around;
              padding: 6px 10px;
              .scanqr {
                color: #666666;
              }
              p {
                color: #1a1a1a;
                font-size: 30px;
                line-height: 33px;
                word-wrap: break-word;
                white-space: normal;
                word-break: break-all;
              }
            }
          }
        }
      }
    }
    .vmp-invitation__no-data {
      img {
        width: 416px;
        margin: 100px auto 30px;
        display: block;
      }
      p {
        text-align: center;
        font-size: 40px;
        color: #2e2e2e;
      }
    }
  }
</style>
