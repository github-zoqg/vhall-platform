<template>
  <div class="subject-detail">
    <div class="subject-poster">
      <img class="poster-image" :src="detailInfo.webinar_subject.cover" alt="" />
    </div>
    <section class="subject-header">
      <h2 class="subject-title">{{ detailInfo.webinar_subject.title }}</h2>
      <p class="subject-create-time">{{ detailInfo.webinar_subject.created_at }}</p>
      <div class="subject-info">
        <p>
          共&nbsp;
          <span class="subject-info_num">{{ detailInfo.webinar_subject.webinar_num }}</span>
          &nbsp;个直播
        </p>
        <p :style="{ visibility: detailInfo.webinar_subject.hide_pv ? 'visible' : 'hidden' }">
          <img src="./img/pv.png" alt="" />
          热度&nbsp;
          <span class="subject-info_num">{{ detailInfo.webinar_subject.pv }}</span>
        </p>
        <p
          :style="{
            visibility: detailInfo.webinar_subject.hide_appointment ? 'visible' : 'hidden'
          }"
        >
          <span class="subject-info_num">{{ detailInfo.webinar_subject.order_num }}</span>
          &nbsp;次预约
        </p>
      </div>
    </section>
    <section class="subject-intro">
      <p class="subject-intro_title">简介</p>
      <div
        @click="handleOpenHide"
        class="subject-intro_value"
        :style="`height: ${open_hide ? 'auto' : ''}`"
      >
        <p v-html="detailInfo.webinar_subject.intro"></p>
      </div>
      <p @click="handleOpenHide" class="subject-intro_switch">
        <!-- <img src="../../common/images/icon_arrow_down.png" alt="" v-show="!open_hide" /> -->
        <!-- <img src="../../common/images/icon_arrow_up.png" alt="" v-show="open_hide" /> -->
      </p>
    </section>
    <section class="subject-menu">
      <p class="subject-menu_title">目录</p>
      <article
        @click="toWatch(item.webinar_id)"
        v-for="item in detailInfo.webinar_subject.webinar_list"
        :key="item.id"
        class="subject-menu_item clearfix"
      >
        <div class="subject-menu_item-left">
          <img :src="item.img_url" alt="" class="item-poster" />
          <span
            class="item-status"
            :style="`background: ${stateArr[item.webinar_state - 1].bgcolor}`"
          >
            {{ stateArr[item.webinar_state - 1].value }}
            <span v-if="hasDelayPermission == 1 && item && item.no_delay_webinar == 1">
              | 无延迟
            </span>
          </span>
          <!-- <span class="item-type">付费</span> -->
        </div>
        <div class="subject-menu_item-right">
          <p class="item-title">{{ item.subject }}</p>
          <span v-if="item.hide_pv" class="item-num">
            <img src="./img/pv.png" alt="" />
            <span>{{ item.pv }}</span>
          </span>
          <span class="item-date">{{ item.start_time }}</span>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
  // import initWeChat from '@/utils/weChat';
  export default {
    data() {
      return {
        open_hide: false,
        detailInfo: {
          webinar_subject: {
            cover: '',
            title: '',
            created_at: '',
            webinar_num: '',
            hide_pv: '',
            order_num: '',
            intro: '',
            webinar_list: [],
            hasDelayPermission: 0
          }
        },
        stateArr: [
          {
            value: '直播',
            bgcolor: '#fc5659'
          },
          {
            value: '预告',
            bgcolor: '#5ea6ec'
          },
          {
            value: '结束',
            bgcolor: '#999999'
          },
          {
            value: '点播',
            bgcolor: '#ff8834'
          },
          {
            value: '回放',
            bgcolor: '#2ab804'
          }
        ]
      };
    },
    created() {
      this.getDetail();
      this.hasDelayPermission = this.$route.query.delay;
    },
    // mixins: [initWeChat],
    methods: {
      getDetail() {
        this.$axios('subjectInfo', {
          subject_id: this.$route.query.id
        })
          .then(res => {
            this.detailInfo = res.data;
            this.detailInfo.webinar_subject.intro = this.urlToLink(
              this.detailInfo.webinar_subject.intro
            );
            this.wxShareInfo(res.data.webinar_subject);
          })
          .catch(err => {
            this.$toast(err.msg);
          });
      },
      urlToLink(str) {
        if (!str) return '';
        const regImg = /<img.*?(?:>|\/>)/g;
        const imgArr = str.match(regImg);
        const strArr = str.split(regImg);
        const regUrl = /(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])/g;
        strArr.forEach((item, index) => {
          const tempStr = item.replace(regUrl, function (match) {
            return `<a class='show-link' href='${match}' target='_blank'>${match}</a>`;
          });
          strArr[index] = tempStr;
        });
        if (imgArr) {
          const imgArrLength = imgArr.length;
          let imgIndex = 0;
          for (let strIndex = 0; strIndex < imgArrLength; ++strIndex) {
            strArr.splice(strIndex + imgIndex + 1, 0, imgArr[imgIndex]);
            imgIndex++;
          }
        }
        return strArr.join('');
      },
      // 获取微信分享信息
      wxShareInfo(info) {
        this.$axios('weiXinShare', {
          wx_url:
            window.location.protocol +
            process.env.VUE_APP_WATCH_URL +
            process.env.VUE_APP_WEB_KEY +
            `/special/detail?id=${this.$route.query.id}`
        }).then(res => {
          if (res.code == 200 && res.data) {
            console.log('获取微信分享数据', res.data);
            // const hideShare = this.configList ? this.configList['ui.watch_hide_share'] : 0
            const params = {
              appId: res.data.appId,
              timestamp: res.data.timestamp,
              nonceStr: res.data.nonceStr,
              signature: res.data.signature
            };
            let desc = null;
            desc = info.intro.replace(/&nbsp;/g, '');
            desc = desc.replace(/<[^>]+>|&[^>]+;/g, '');
            desc = desc.length > 32 ? `${desc.trim().substring(0, 30)}...` : desc.trim();

            // this.initWeChatSdk(
            //   { ...params },
            //   {
            //     title: info.title,
            //     desc,
            //     link:
            //       window.location.protocol +
            //       `${process.env.VUE_APP_WATCH_URL}${process.env.VUE_APP_WEB_KEY}/special/detail?id=${this.$route.query.id}`,
            //     imgUrl: info.cover
            //   }
            // );
          }
        });
      },
      handleOpenHide() {
        this.open_hide = !this.open_hide;
      },
      toWatch(id) {
        this.$router.push({
          path: `/lives/watch/${id}`
        });
      }
    }
  };
</script>

<style lang="less" scoped>
  .subject-detail {
    width: 100%;
    overflow-y: auto;
    height: 100%;
    .subject-poster {
      width: 100%;
      .poster-image {
        width: 100%;
        height: 420px;
      }
    }
    .subject-header {
      width: calc(100% - 40px);
      height: 186px;
      margin: 0 20px;
      padding: 20px 0;
      border-bottom: 4.1px solid #e2e2e2;
      .subject-title {
        font-size: 36px;
        color: #676767;
        line-height: 48px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .subject-create-time {
        font-size: 24px;
        color: #8c8786;
        padding: 5px 0 25px;
        line-height: 32px;
      }
      .subject-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 24px;
        color: #666;
        line-height: 32px;
        p {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        img {
          width: 30px;
        }
      }
      .subject-info_num {
        color: #ff3332;
      }
    }
    .subject-intro {
      padding: 20px 20px 0 20px;
      border-bottom: 10px solid #f7f7f7;
      .subject-intro_title {
        line-height: 38px;
        color: #5b5b5b;
        font-size: 28px;
        padding-left: 6px;
        border-left: 8px solid #f15c5c;
      }
      .subject-intro_value {
        padding-top: 8px;
        min-height: 100px;
        height: 100px;
        font-size: 24px;
        overflow: hidden;
        color: #818181;
        ::v-deep strong {
          font-weight: bold;
        }
        ::v-deep img {
          max-width: 100%;
        }
        .show-link {
          color: #3562fa;
          cursor: pointer;
        }
      }
      .subject-intro_switch {
        padding: 10px 0;
        line-height: 16px;
        text-align: center;
        img {
          width: 36px;
        }
      }
    }
    .subject-menu {
      .subject-menu_title {
        margin: 20px 20px 0 20px;
        line-height: 38px;
        color: #5b5b5b;
        font-size: 28px;
        padding-left: 6px;
        border-left: 8px solid #f15c5c;
      }
      .subject-menu_item {
        border-bottom: 4px solid #f7f7f7;
        padding: 20px;
        zoom: 1;
      }
      .subject-menu_item-left {
        height: 160px;
        width: 280px;
        position: relative;
        float: left;
        img {
          width: 100%;
          height: 160px;
          border: none;
        }
        .item-status {
          position: absolute;
          left: 0;
          top: 0;
          display: inline-block;
          text-align: center;
          line-height: 36px;
          font-size: 20px;
          color: #fff;
          padding: 2.7px 5.3px;
          background-color: #5ea6ec;
        }
        .item-type {
          position: absolute;
          bottom: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.5) none repeat scroll 0 0;
          color: #fff;
          font-size: 20px;
          line-height: 36px;
          padding: 2.7px 5.3px;
          text-align: center;
        }
      }
      .subject-menu_item-right {
        height: 160px;
        width: 400px;
        position: relative;
        float: right;
      }
      .item-title {
        font-size: 28px;
        color: #000;
        line-height: 38px;
        word-break: break-all;
        text-overflow: ellipsis;
        display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
        -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
        -webkit-line-clamp: 2; /** 显示的行数 **/
        overflow: hidden; /** 隐藏超出的内容 **/
      }
      .item-num {
        color: #818181;
        position: absolute;
        bottom: 0;
        left: 0;
        font-size: 24px;
        line-height: 32px;
        display: flex;
        align-items: center;
        img {
          width: 30px;
          padding-right: 5px;
        }
      }
      .item-date {
        color: #818181;
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: 24px;
        line-height: 32px;
      }
    }
    .delay-icon {
      display: inline-block;
      // width: 116px;
      height: 50px;
      vertical-align: bottom;
    }
  }
</style>
