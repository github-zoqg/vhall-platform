<template>
  <section id="homePage">
    <div class="v-home-bg">
      <img :src="home_bg_user" v-parseImgOss="{ url: home_bg_user }" :class="`home_img`" alt="" />
    </div>
    <div class="v-content">
      <span class="v-avatar">
        <img
          :src="home_avatar_user"
          alt=""
          :class="`v-avatar_img home_avator_${imagAvatarMode}`"
          v-if="home_avatar_user"
        />
        <img src="./img/head_mobile.png" alt="主页头像" class="v-avatar_img" v-else />
      </span>
      <div class="v-bg-content"></div>
    </div>
    <div class="v-userinfo-content">
      <div class="user-top" id="userTop">
        <div class="user--info_title">
          <h1 :class="['open_hide', { min: userHomeVo && userHomeVo.content }]">
            {{ userHomeVo && userHomeVo.title ? userHomeVo.title : '' }}
          </h1>
          <span class="user__open" @click="showBtnChange" v-if="userHomeVo && userHomeVo.content">
            <img src="./img/icon_arrow_down.png" alt="" v-if="open_hide && showToggle" />
            <img src="./img/icon_arrow_up.png" alt="" v-if="!open_hide && showToggle" />
          </span>
        </div>
        <div class="user__remark__layout" v-if="userHomeVo && userHomeVo.content">
          <p ref="intro" :class="open_hide ? 'open_hide user__remark' : 'user__remark'">
            {{ userHomeVo.content }}
          </p>
        </div>
      </div>
      <div class="v-user-center">
        <ul :class="['user__tabs', { marginBottom: loading }]">
          <template v-for="(item, ins) in tabList">
            <li
              @click="handleClick(item.value)"
              :style="
                Number(userHomeVo.show_subject) === 0 || Number(userHomeVo.show_webinar_list) === 0
                  ? 'width: 100%'
                  : 'width: 50%'
              "
              v-if="userHomeVo[item.compare_key]"
              :key="ins"
            >
              <span :class="tabType === item.value ? 'active' : ''">{{ item.label }}</span>
            </li>
          </template>
        </ul>
        <ul class="v-data-list" ref="dataListDom">
          <template v-if="dataList && dataList.length > 0"></template>
          <a
            href="javascript:void(0);"
            v-for="(item, index) in dataList"
            :key="index"
            @click="toPage(item)"
          >
            <li class="clearfix">
              <div class="card-top pull-left">
                <span class="liveTag" v-if="tabType === 'live'">
                  <label class="live-status" v-if="item.webinar_state == 1">
                    <img src="./img/live.gif" alt="" />
                  </label>
                  {{ liveTag(item) }}
                </span>
                <img
                  :class="`bg-cover bg-cover_${item.itemMode}`"
                  :src="tabType === 'live' ? item.img_url : item.cover"
                  alt=""
                />
              </div>
              <div class="card-bottom pull-left clearfix">
                <p class="v-title">{{ tabType === 'live' ? item.subject : item.title }}</p>
                <div class="v-info">
                  <span
                    class="v-num"
                    :style="{ visibility: item.hide_pv > 0 ? 'visible' : 'hidden' }"
                  >
                    <i class="vh-saas-iconfont vh-saas-line-heat"></i>
                    <!-- <img src="./img/saasicon_redu.png"
                      alt="" /> -->
                    <span>{{ item.pv | formatHotNum }}</span>
                  </span>
                  <span class="v-date pull-right" v-if="tabType === 'live'">
                    {{ tabType === 'live' ? item.start_time : item.created_at.substring(0, 16) }}
                  </span>
                </div>
              </div>
            </li>
          </a>
        </ul>
        <p class="loading-icon"><van-loading size="24" v-if="loading" /></p>

        <div class="null-page" v-if="!loading && !(dataList && dataList.length > 0)">
          <div class="search">
            <img src="./img/no-search@2x.png" class="no-search" />
            <p class="null-info">暂无数据~</p>
          </div>
        </div>
      </div>
      <div style="height: 60px">&nbsp;</div>
    </div>
  </section>
</template>

<script>
  import { initWeChatSdk } from '@/app-shared/utils/wechat';
  import { useHomepageServer } from 'middle-domain';
  import { cropperImage } from '@/app-shared/utils/common';
  import { parseImgOssQueryString } from '@/app-shared/utils/tool';
  export default {
    name: 'userHome',
    data() {
      return {
        loading: true,
        isSetShow: false,
        userHomeVo: {},
        attentioned_count: 0,
        follow: 0,
        avatarImgUrl: '',
        userInfo: null,
        open_hide: false,
        showToggle: false,
        tabType: null,
        hasDelayPermission: false,
        query: {
          pos: 0,
          limit: 12,
          pageNumber: 1,
          keyword: ''
        },
        tabList: [],
        vsQuanxian: [],
        dataList: [],
        vo: {},
        imageBgMode: 1,
        imagAvatarMode: 1,
        heightAuto: 200,
        isBool: true // 是否触发下一页加载
      };
    },
    beforeCreate() {
      this.homePageServer = useHomepageServer();
    },
    computed: {
      home_bg_user() {
        let defaultImage =
          'https://t-alistatic01.e.vhall.com/upload/common/static-imgs/dc/d2/dcd284bd60054e12a1eefebc804a7802.png';
        let url = this.userHomeVo.img_url;
        if (url) {
          if (cropperImage(url)) {
            this.handlerImageInfo(url, 1);
          }
          return url;
        } else {
          return defaultImage;
        }
      },
      home_avatar_user() {
        let url = this.userHomeVo.homepage_avatar || this.avatarImgUrl;
        if (!url) return '';
        if (url) {
          if (cropperImage(url)) {
            this.handlerImageInfo(url, 2);
          }
          return url;
        } else {
          return '';
        }
      }
    },
    created() {
      // 非控制台个人主页，单独调用权限信息页
      this.getPlanFunc();
    },
    methods: {
      liveTag(val) {
        /** 个人主页没有多语言翻译
         * webinar_state  1直播 2预约 3结束 4点播 5回放
         * webinar_type  1音频直播 2视频直播 3互动直播 5 定时直播 6 分组直播
         */
        const liveTypeStr = ['', '直播', '预告', '结束', '点播', '回放'];
        const liveStatusStr = ['', '音频', '视频', '互动', '', '', '分组'];
        let str = liveTypeStr[val.webinar_state];
        if (val.webinar_state != 4 && val.webinar_type != 5) {
          str += ` | ${liveStatusStr[val.webinar_type]}`;
        }
        return str;
      },
      // 解析图片地址
      handlerImageInfo(url, index) {
        console.log('----,0--00-0-00-', url, index);
        let obj = parseImgOssQueryString(url);
        if (index == 1) {
          this.imageBgMode = Number(obj.mode);
        } else if (index == 2) {
          this.imagAvatarMode = Number(obj.mode);
        } else {
          return Number(obj.mode);
        }
      },
      pullingDown() {
        this.query.pageNumber++;
        this.query.pos = parseInt((this.query.pageNumber - 1) * this.query.limit);
        this.isPullingDown = true;
        this.getDataList();
      },
      handleClick(type) {
        this.tabType = type;
        this.dataList = [];
        this.searchHandle();
      },
      getPlanFunc() {
        this.homePageServer
          .getConfigList({ webinar_user_id: this.$route.params.id })
          .then(result => {
            if (result && result.code === 200) {
              const miss = result.data.permissions;
              // 设置全部权限
              this.vsQuanxian = miss ? JSON.parse(miss) : {};
              this.hasDelayPermission = this.vsQuanxian && this.vsQuanxian['no.delay.webinar'] == 1;
              sessionStorage.setItem('vh_permission', this.hasDelayPermission);
            }
            this.homeInfoGet();
          })
          .catch(e => {
            console.log(e);
            this.homeInfoGet();
          });
      },
      toPage(item) {
        window.location.href =
          this.tabType === 'live'
            ? `//${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${item.webinar_id}`
            : `//${process.env.VUE_APP_WAP_WATCH}${
                process.env.VUE_APP_ROUTER_BASE_URL
              }/special/detail?id=${item.id}&delay=${this.hasDelayPermission ? 1 : 0}`;
      },
      // 查询
      searchHandle() {
        this.query.pos = 0;
        this.query.pageNumber = 1;
        this.tabList.total = 0;
        this.getDataList();
      },
      // 区分是获取直播列表 还是 主题列表
      getDataList() {
        if (this.tabType === 'live') {
          this.getLiveList();
        } else {
          this.getSpecialList();
        }
      },
      // 获取直播列表
      getLiveList() {
        const params = {
          pos: this.query.pos,
          home_user_id: this.$route.params.id,
          limit: this.query.limit,
          order_type: 1, // 排序规则 1 按照创建时间排序 2 按照最后直播时间排序
          webinar_states: 0, // 直播状态 默认为0 可以传入多个值 使用逗号分隔  0 全部 2 预告 1 直播 3 结束 5 回放 4 点播
          is_private: 0, // 展示所有公开的
          need_flash: 1 // 是否需要flash数据 0 否 1 是
        };
        this.loading = true;
        this.homePageServer
          .getlivingList(params)
          .then(res => {
            this.isBool = true;
            this.loading = false;
            if (res && res.code === 200 && this.tabType === 'live') {
              const list = res.data.list;
              list.map(item => {
                item.share_link = `${
                  window.location.origin +
                  (process.env.VUE_APP_WAP_WATCH || '') +
                  process.env.VUE_APP_ROUTER_BASE_URL
                }/lives/watch/${item.webinar_id}`;
                if (cropperImage(item.img_url)) {
                  item.itemMode = this.handlerImageInfo(item.img_url, 3);
                } else {
                  item.itemMode = 3;
                }
              });
              if (list.length > 0) {
                // this.dataList.unshift(...list)
                this.dataList = this.dataList.concat(list);
                console.log('每次打印出来的长度' + this.dataList.length);
                this.isPullingDown = true;
              } else {
                console.log('触发了结尾');
                this.isPullingDown = false;
              }
              this.tabList.total = res.data.total;
            }
          })
          .catch(error => {
            this.isBool = true;
            console.log('触发了异常this.isBool', this.isBool);
            console.log(error);
            this.dataList = [];
            this.tabList.total = 0;
            this.loading = false;
          });
      },
      // 获取专题列表
      getSpecialList() {
        const params = {
          pos: this.query.pos,
          home_user_id: this.$route.params.id,
          limit: this.query.limit,
          is_private: 0, // 展示所有公开的
          order_type: 1 // 排序规则 1 按照创建时间排序 2 按照最后直播时间排序
          // need_flash: 1 是否需要展示双语专题（个人主页不展示双语专题 ）
        };
        console.log(`getSpecialList当前查询，从....${params.pos}开始查询${params.limit}条`);
        this.loading = true;
        this.homePageServer
          .getSubjectList(params)
          .then(res => {
            this.isBool = true;
            console.log('this.isBool', this.isBool);
            this.loading = false;
            if (res && res.code === 200 && this.tabType !== 'live') {
              const list = res.data.list || [];
              list.map(item => {
                item.share_link = `${
                  window.location.origin +
                  (process.env.VUE_APP_WAP_WATCH || '') +
                  process.env.VUE_APP_ROUTER_BASE_URL
                }/special/detail?id=${item.id}`;
                if (cropperImage(item.cover)) {
                  item.itemMode = this.handlerImageInfo(item.cover, 3);
                } else {
                  item.itemMode = 3;
                }
              });
              if (list.length > 0) {
                // this.dataList.unshift(...list);
                this.dataList = this.dataList.concat(list);
              } else {
                this.isPullingDown = false;
              }
              this.tabList.total = res.data.total;
            }
          })
          .catch(error => {
            this.isBool = true;
            console.log('this.isBool', this.isBool);
            console.log(error);
            this.dataList = [];
            this.tabList.total = 0;
            this.loading = false;
          })
          .finally(() => {});
      },
      showBtnChange() {
        this.open_hide = !this.open_hide;
      },
      //计算简介文字是否过长
      calculateText() {
        const txtDom = this.$refs.intro;
        if (!txtDom) return false;
        const twoHeight = 30;
        const curHeight = txtDom.offsetHeight;
        if (curHeight > twoHeight) {
          this.showToggle = true;
        }
      },
      homeInfoGet() {
        this.homePageServer
          .getUserHomeInfo({ home_user_id: this.$route.params.id })
          .then(res => {
            console.log(res);
            // 粉丝数、是否关注、主页信息
            const { avatar, attentioned_count, follow, homepage_info } = res.data;
            this.userHomeVo = homepage_info;
            document.title = this.userHomeVo.title;
            this.attentioned_count = attentioned_count;
            this.follow = follow;
            this.content = homepage_info.content;
            this.getShow(this.userHomeVo);
            this.wxShareInfo();
            this.avatarImgUrl = avatar || '';
          })
          .catch(e => {
            console.log(e);
            this.tabList = [];
            this.tabType = null;
            this.loading = false;
          });
      },
      getShow(vo) {
        console.log('是否专题', this.vsQuanxian.subject_manager);
        // 根据个人主页信息，控制 直播 or 专题展示
        if (this.vsQuanxian && this.vsQuanxian.subject_manager > 0) {
          this.tabList = [
            {
              label: '直播',
              value: 'live',
              compare_key: 'show_webinar_list',
              total: 0
            },
            {
              label: '专题',
              value: 'special',
              compare_key: 'show_subject',
              total: 10
            }
          ];
          // 考虑专题配置项
          if (Number(vo.show_subject) > 0 && Number(vo.show_webinar_list) > 0) {
            this.tabType = this.tabList[0].value;
            this.searchHandle(1);
          } else if (Number(vo.show_webinar_list) > 0) {
            this.tabType = this.tabList[0].value;
            this.searchHandle(1);
          } else if (Number(vo.show_subject) > 0) {
            this.tabType = this.tabList[1].value;
            this.searchHandle(1);
          } else {
            this.tabType = null;
            this.loading = false;
          }
        } else {
          this.tabList = [
            {
              label: '直播',
              value: 'live',
              compare_key: 'show_webinar_list',
              total: 0
            }
          ];
          // 不考虑专题配置项，只考虑直播列表
          if (Number(vo.show_webinar_list) > 0) {
            this.tabType = this.tabList[0].value;
            this.searchHandle(1);
          } else {
            this.tabType = null;
            this.loading = false;
          }
        }
      },
      lazyLoading() {
        // 滚动到底部，再加载的处理事件
        const dom = document.getElementById('homePage');
        const scrollTop = dom.scrollTop || document.body.scrollTop;
        const clientHeight = dom.clientHeight;
        const scrollHeight = dom.scrollHeight;
        // console.log('个人主页触发scrollTop + clientHeight=' + Math.round(scrollTop + clientHeight), scrollHeight);
        // console.log('个人主页触发isBool', this.isBool);
        // console.log('个人主页触发isPullingDown', this.isPullingDown);
        // isPullingDown => 限制加载下一页触发动作是否允许, isPullingDown => true表示还有数据
        if (
          Math.round(scrollTop + clientHeight) >= scrollHeight &&
          this.isBool == true &&
          this.isPullingDown == true
        ) {
          // 如果滚动到接近底部，自动加载下一页
          // 事件处理
          console.log('当前是否下一页');
          this.isBool = false;
          this.pullingDown();
        } else {
          // console.log('当前木的下一页');
        }
      },
      // 获取微信分享信息
      wxShareInfo() {
        this.homePageServer
          .wechatShare({
            wx_url:
              window.location.protocol +
              process.env.VUE_APP_WAP_WATCH +
              process.env.VUE_APP_ROUTER_BASE_URL +
              `/user/home/${this.$route.params.id}`
          })
          .then(res => {
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
              desc = this.userHomeVo.content.replace(/&nbsp;/g, '');

              this.$nextTick(() => {
                this.calculateText();
              });
              desc = desc.replace(/<[^>]+>|&[^>]+;/g, '');
              desc = desc.length > 32 ? `${desc.trim().substring(0, 30)}...` : desc.trim();
              console.log(9191, desc);

              initWeChatSdk(
                { ...params },
                {
                  title: this.userHomeVo.title,
                  desc,
                  link:
                    window.location.protocol +
                    `${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/user/home/${this.$route.params.id}`,
                  imgUrl: this.home_avatar_user
                }
              );
            }
          });
      }
    },
    mounted() {
      document.getElementById('homePage').addEventListener('scroll', this.lazyLoading, true); // 滚动到底部，再加载的处理事件
      // 如果是返回的是缓存中的页面，则刷新
      window.addEventListener('pageshow', event => {
        if (event.persisted) {
          window.location.replace(window.location.href);
        }
      });
    },
    beforeDestroy() {
      document.getElementById('homePage') &&
        document.getElementById('homePage').removeEventListener('scroll', this.lazyLoading); // 离开页面时移除
    }
  };
</script>
<style lang="less">
  #homePage {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 100px;
  }
</style>
<style lang="less" scoped>
  body {
    background: #f7f7f7;
  }
  .v-home-bg {
    width: 100%;
    height: 246px;
    .home_img {
      width: 100%;
      height: 100%;
    }
  }
  .v-content {
    width: 100%;
    position: relative;
  }
  .v-avatar {
    border-radius: 50%;
    width: 140px;
    height: 140px;
    position: absolute;
    top: -90px;
    left: 30px;
    z-index: 10;
    background: #fff;
    &_img {
      width: 100%;
      height: 100%;
      object-fit: fill;
      border-radius: 50%;
      &.home_avator_2 {
        object-fit: cover;
        object-position: left top;
      }
      &.home_avator_3 {
        object-fit: contain;
        object-position: center;
      }
    }
  }
  .user-top {
    padding: 0 30px 40px 30px;
  }
  /*.v-userinfo-content {
  width: 100%;
  background: #fff;
  padding: 120px 0 0 0;
  position: absolute;
  border-radius: 30px 30px 0 0;
  top: -30px;
  left: 0;
  z-index: 5;
}*/
  .v-bg-content {
    height: 120px;
    position: absolute;
    border-radius: 30px 30px 0 0;
    top: -30px;
    left: 0;
    width: 100%;
    background: #fff;
    padding: 0 0;
    z-index: 5;
  }
  .v-userinfo-content {
    margin-top: 90px;
  }
  .user--info_title {
    h1 {
      font-size: 36px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #1a1a1a;
      line-height: 43px;
      height: 43px;
      word-break: break-all;
      width: 100%;
      margin-right: 60px;
      display: inline-block;
      &.open_hide {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-inline-box;
        display: -moz-inline-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        /* autoprefixer: ignore next */
        -webkit-box-orient: vertical;
        word-break: break-all;
      }
      &.min {
        width: calc(100% - 92px);
      }
    }
    .user__open {
      display: inline-block;
      vertical-align: top;
      width: 32px;
      height: 32px;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .user__remark__layout {
    margin-top: 16px;
  }
  .user__remark {
    font-size: 26px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #999999;
    line-height: 36px;
    vertical-align: top;
    word-break: break-all;
    &.open_hide {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      /* autoprefixer: ignore next */
      -webkit-box-orient: vertical;
      word-break: break-all;
    }
  }
  /* 切换直播 or 专题 */
  .user__tabs {
    width: 100%;
    display: block;
    border-bottom: 1px solid #e2e2e2;
    border-top: 12px solid #f7f7f7;
    &.marginBottom {
      margin-bottom: 10px;
    }
    li {
      list-style-type: none;
      width: 50%;
      display: inline-block;
      vertical-align: middle;
      height: auto;
      text-align: center;
      span {
        font-size: 32px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #222222;
        line-height: 45px;
        border-bottom: 4px solid #ffffff;
        padding: 28px 0 23px 0;
        display: block;
        width: max-content;
        margin: 0 auto;
        &.active {
          color: #fb3a32;
          border-bottom: 4px solid #fb3a32;
        }
      }
    }
  }
  .home-scroll-list {
    /*  height: calc(100vh - 300px); */
    overflow: hidden;
  }
  .loading-icon {
    text-align: center;
  }
  /* 列表 */
  .v-data-list {
    margin: 0 0;
    padding: 30px 30px;
    li {
      list-style-type: none;
    }
    a {
      display: block;
      margin-bottom: 32px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    @keyframes gradientBG {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
    .card-top {
      position: relative;
      display: inline-block;
      vertical-align: middle;
      margin-right: 24px;
      width: 280px;
      height: 158px;
      background: #1a1a1a;
      background-size: 400% 400%;
      border-radius: 12px;
      animation: gradientBG 15s ease infinite;
      .bg-cover {
        border-radius: 12px;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
        &.bg-cover_1 {
          object-fit: fill;
        }
        &.bg-cover_2 {
          object-fit: cover;
          object-position: left top;
        }
      }
      .liveTag {
        position: absolute;
        top: 8px;
        left: 8px;
        color: #fff;
        font-size: 20px;
        z-index: 2;
        height: 32px;
        background: #000000;
        border-radius: 16px;
        opacity: 0.65;
        line-height: 20px;
        padding: 6px 10px;
        border-radius: 16px;
        z-index: 2;
        display: inline-block;
        transform: scale(0.8);
        white-space: nowrap;
        transform-origin: left;
        text-overflow: ellipsis;
        overflow: hidden;
        // width: 100%;
      }
      .live-status {
        padding: 5px;
        img {
          width: 13px;
          height: 14px;
        }
      }
      .hot {
        position: absolute;
        height: 50px;
        width: 100%;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%);
        bottom: 0;
        left: 0;
        color: #fff;
        font-size: 14px;
        z-index: 2;
        i {
          position: absolute;
          left: 14px;
          bottom: 10px;
        }
      }
    }
    .card-bottom {
      display: inline-block;
      vertical-align: middle;
      width: calc(100% - 304px);
      span {
        display: inline-block;
        vertical-align: bottom;
      }
    }
    .v-title {
      font-size: 28px;
      font-weight: 400;
      color: #1a1a1a;
      font-family: PingFangSC-Regular, PingFang SC;
      line-height: 38px;
      margin-bottom: 16px;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-inline-box;
      display: -moz-inline-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      /* autoprefixer: ignore next */
      -webkit-box-orient: vertical;
      word-break: break-all;
    }
    .v-info {
      display: flex;
      justify-content: space-between;
    }
    .v-num {
      font-size: 22px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #999999;
      line-height: 26px;
      img {
        width: 26px;
        height: 26px;
        margin-right: 6px;
        display: inline-block;
        vertical-align: bottom;
      }
      i {
        font-size: 16px;
        padding-right: 3px;
      }
      span {
        display: inline-block;
        vertical-align: bottom;
        line-height: 22px;
      }
    }
    .v-date {
      height: 26px;
      font-size: 22px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #999999;
      line-height: 26px;
    }
  }
  /* 空白页 */
  .null-page {
    text-align: center;
    .no-search {
      width: 130px;
      margin: 132px auto 23px auto;
    }
    .null-info {
      font-size: 32px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #666666;
      line-height: 45px;
    }
  }
</style>
