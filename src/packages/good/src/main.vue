<template>
  <div class="vh-goods" :class="{ subscribe_goods: isSubscribe }">
    <div
      v-for="good in goodsList"
      :key="good.goods_id"
      class="vh-goods_item"
      :class="isSubscribe ? 'subscribe_item' : 'watch-page'"
      @click="showDetailDialog(good)"
    >
      <div class="vh-goods_item-cover">
        <template v-for="i in good.img_list">
          <img v-if="i.is_cover == 1" :key="i.img_id" :src="i.img_url" alt="" />
        </template>
      </div>
      <div class="vh-goods_item-info">
        <span class="name">{{ good.name }}</span>
        <div class="describe">{{ good.description }}</div>
        <span v-if="good.showDiscountPrice" class="discount_price">￥{{ good.price }}</span>
        <div class="other-info">
          <div v-if="good.showDiscountPrice" class="discount">
            <span class="price-tip">{{ $t('menu.menu_1006') }}</span>
            <i>￥</i>
            <span class="price" v-html="good.discoutText"></span>
          </div>
          <div v-else>
            <i>￥</i>
            <span class="price" v-html="good.priceText"></span>
          </div>
          <div>
            <button class="buy" @click.stop="handleBuy(good.goods_url)">
              {{ $t('menu.menu_1007') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showBottom && total > 10" class="goods-load">
      <span class="load-icon"></span>
      {{ bottomText }}
    </div>
    <div v-if="goodItem && openGoodInfo" class="good-pop-wrap">
      <div class="good-pop">
        <div class="good-head">
          <span class="title">{{ $t('menu.menu_1008') }}</span>
          <span class="close vh-iconfont vh-line-close" @click.stop="handleClose"></span>
        </div>
        <div class="pop-info">
          <div class="left-info">
            <img :src="defaultImg" class="first-post" />
            <div class="pics">
              <template v-for="(i, index) in goodItem.img_list">
                <div
                  v-if="!i.nopic"
                  :key="index"
                  class="img-wrap"
                  :class="{ active: selectDefaultImgIndex == index }"
                >
                  <img
                    :src="i.img_url"
                    alt=""
                    class="has-img"
                    @click.stop="chooseDefaultImg(index)"
                  />
                </div>
                <div v-else :key="index" class="default-pic">{{ $t('menu.menu_1011') }}</div>
              </template>
            </div>
          </div>
          <div class="right-info">
            <span class="name">{{ goodItem.name }}</span>
            <div class="describe">{{ goodItem.description }}</div>
            <div class="price-info">
              <template v-if="goodItem.discount_price">
                <span class="tip">{{ $t('menu.menu_1006') }}</span>
                <i>￥</i>
                <span class="price" v-html="goodItem.discoutText"></span>
              </template>
              <span
                class="dis_count"
                :class="{ nodiscount: !goodItem.discount_price }"
                v-html="goodItem.discount_price ? goodItem.priceText : '￥' + goodItem.priceText"
              ></span>
            </div>
            <div class="bottom-link">
              <button class="buy" @click.stop="handleBuy(goodItem.goods_url)">
                {{ $t('menu.menu_1007') }}
              </button>
              <span v-if="goodItem.shop_url" class="link" @click.stop="link(goodItem.shop_url)">
                {{ $t('menu.menu_1009') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { useRoomBaseServer, useGoodServer } from 'middle-domain';
  import { debounce } from 'lodash';

  export default {
    name: 'VmpGoodList',
    data() {
      return {
        goodsList: [],
        goodItem: null,
        openGoodInfo: false,
        defaultImg: '',
        selectDefaultImgIndex: 0,
        pos: 0,
        limit: 10,
        total: 0,
        pageLock: false,
        showBottom: false,
        bottomText: ''
      };
    },
    computed: {
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe';
      }
    },
    // watch: {
    //   goodsInfo: {
    //     handler(val) {
    //       if (val && val.goods_list) {
    //         this.handleGoodsInfo(val);
    //       }
    //     },
    //     immediate: true,
    //     deep: true
    //   }
    // },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.goodServer = useGoodServer();
      console.log('this.goodServer------->', this.goodServer);
    },
    mounted() {
      this.webinar_id = this.roomBaseServer.state.watchInitData.webinar.id;
      this.buildDataList(this.roomBaseServer.state.goodsDefault, false);
      this.clearBottomInfo();
      this.bindEventListener();
    },
    methods: {
      // 检测字符
      bLength(str) {
        var l = str.length;
        var blen = 0;
        for (let i = 0; i < l; i++) {
          if ((str.charCodeAt(i) & 0xff00) !== 0) {
            blen += 1;
          } else {
            blen += 0.5;
          }
        }
        return Math.ceil(blen);
      },
      bindEventListener() {
        // if (this.pagetype == 'watch') {
        const wrap = document.querySelector('.vh-goods');
        if (!wrap) return;
        wrap.addEventListener('scroll', this.scrollLoadGoodsList);
        // } else {
        // 分页
        // this.$VhallEventBus.$on(this.$VhallEventType.InteractTools.ROOM_GOODS_TURN_PAGE, () => {
        //   if (this.pos + this.limit >= this.total) return;
        //   this.queryGoodsList();
        // });
        // }
      },
      scrollLoadGoodsList: debounce(function (e) {
        const clientHeight = e.target.clientHeight;
        const scrollHeight = e.target.scrollHeight;
        const scrollTop = e.target.scrollTop;
        if (clientHeight + scrollTop >= scrollHeight) {
          this.queryGoodsList();
        }
      }, 300),
      filterDiscout(val) {
        if (val.indexOf('.') > -1) {
          const i = val.slice(0, val.indexOf('.'));
          const r = val.slice(val.indexOf('.'));
          return `${i}<span class="remainder">${r}</span>`;
        } else {
          return val;
        }
      },
      handleClose() {
        this.openGoodInfo = false;
      },
      showDetailDialog(val) {
        const data = val;
        if (data && data.img_list.length < 4) {
          const defaults = 4 - data.img_list.length;
          for (let i = 0; i < defaults; i++) {
            data.img_list.push({
              img_id: 0,
              img_url: '',
              is_cover: 0,
              nopic: true
            });
          }
        }
        this.goodItem = data;
        this.openGoodInfo = true;
        for (let i = 0; i < data.img_list.length; i++) {
          if (data.img_list[i].is_cover == 1) {
            this.defaultImg = data.img_list[i].img_url;
            this.selectDefaultImgIndex = i;
          }
        }
      },
      link(val) {
        window.open(val);
      },
      handleBuy(val) {
        window.open(val);
      },
      chooseDefaultImg(index) {
        this.defaultImg = this.goodItem.img_list[index].img_url;
        this.selectDefaultImgIndex = index;
      },
      queryGoodsList() {
        if (this.pageLock || this.pos + this.limit >= this.total) {
          return false;
        }
        this.pageLock = true;
        this.showBottom = true;
        this.bottomText = this.$t('common.common_1001');
        this.goodServer
          .queryGoodsList({
            webinar_id: this.webinar_id,
            pos: this.pos + this.limit,
            limit: this.limit
          })
          .then(res => {
            if (res.code == 200 && res.data.goods_list) {
              this.buildDataList(res.data, true);
              this.clearBottomInfo();
            }
            this.pageLock = false;
          })
          .catch(() => {
            this.clearBottomInfo();
            this.pageLock = false;
          });
      },
      /**
       * 统一构建列表
       */
      buildDataList(data, flag) {
        console.log('buildDataList------->', data);
        const list = data.goods_list;
        const currentGoodList = this.goodsList;
        if (list && list.length > 0) {
          list.forEach(item => {
            if (item.discount_price && Number(item.discount_price) > 0) {
              item.showDiscountPrice = true;
              item.discoutText = this.filterDiscout(item.discount_price);
            } else {
              item.showDiscountPrice = false;
            }
            item.priceText = this.filterDiscout(item.price);
          });
        }
        if (flag) {
          this.goodsList = currentGoodList.concat(list);
        } else {
          this.goodsList = list;
        }
        this.total = data.total;
        this.pos = data.pos;
        this.limit = data.limit;
      },
      clearBottomInfo() {
        if (this.pos + this.limit >= this.total) {
          this.bottomText = this.$t('nav.nav_1043');
          this.showBottom = true;
        } else {
          this.bottomText = '';
          this.showBottom = false;
        }
      }
    },
    destroyed() {
      console.log('good 组件列表销毁---------->');

      // 移除滚动监听
      const wrap = document.querySelector('.vh-goods');
      if (wrap) {
        wrap.removeEventListener('scroll', this.scrollLoadGoodsList);
      }
    }
  };
</script>

<style lang="less">
  .vh-goods {
    width: 100%;
    height: 100%;
    overflow-y: scroll;

    .vh-goods_item {
      height: 100px;
      border-bottom: 1px solid @border-bormal;
      display: flex;
      flex-direction: row;
      cursor: pointer;
      padding: 16px;
      &-cover {
        width: 100px;
        height: 100px;
        margin-right: 8px;
        background: @font-light-normal;
        border-radius: 4px;
        overflow: hidden;
        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: scale-down;
          border-radius: 4px;
        }
      }
      &-info {
        // width: 100%;
        height: 100px;
        font-size: 12px;
        position: relative;
        .name {
          display: block;
          width: 100%;
          font-size: 14px;
          color: @font-dark-normal;
          line-height: 22px;
          overflow: hidden;
          text-align: left;
        }
        .describe {
          width: 200px;
          height: 18px;
          line-height: 18px;
          font-size: 12px;
          color: #999999;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .discount_price {
          display: inline-block;
          width: 100%;
          color: @font-light-low;
          line-height: 16px;
          text-decoration: line-through;
          text-align: left;
          position: absolute;
          bottom: 24px;
          left: 0px;
        }
        .other-info {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          width: 100%;
          height: 28px;
          position: absolute;
          bottom: 0px;
          .price {
            color: @font-dark-normal;
            line-height: 20px;
            font-size: 16px;
            .remainder {
              font-size: 10px;
            }
          }
          i {
            color: #fff;
            font-size: 12px;
          }
          .price-tip {
            display: inline-block;
            width: 36px;
            height: 17px;
            padding: 0px 4px;
            background: #fff0f0;
            border-radius: 2px;
            line-height: 18px;
            font-size: 10px;
            color: #fb3a32;
            margin-right: 2px;
          }
          .buy {
            display: inline-block;
            width: 52px;
            border-radius: 20px;
            border: 1px solid #cccccc;
            background: transparent;
            color: #fff;
            padding: 4px 0;
            cursor: pointer;
            &:hover {
              background: #fb3a32;
              border: 1px solid #fb3a32;
            }
          }
        }
        .discount {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .showEllipse::after {
          display: block;
          width: 15px;
          content: '...';
          position: absolute;
          bottom: 0;
          right: 0;
          background: #2a2a2a;
        }
      }
      &:hover {
        background: #3c3c3c;
        border-bottom: 1px solid @bg-dark-section;
        .vh-goods_item {
          &-info {
            .showEllipse::after {
              background: #3c3c3c;
            }
          }
        }
      }
    }

    &.subscribe_goods {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      padding: 16px 24px 24px;
      .vh-goods_item {
        background: #fff;
        &-info {
          .other-info {
            i {
              color: #fb3a32;
            }
            .price {
              color: #fb3a32;
            }
            .buy {
              border: 1px solid #fb3a32;
              color: #fb3a32;
              &:hover {
                color: #fff;
              }
            }
          }
        }
        &:hover {
          background: #f1f1f1;
        }
      }
      .subscribe_item {
        width: 458px;
        height: 200px;
        background: #fff;
        padding: 0px;
        padding-right: 24px;
        border-radius: 4px;
        border: none;
        .vh-goods_item-cover {
          width: 200px;
          height: 200px;
          background: #f7f7f7;
          border-top-right-radius: 0px;
          border-bottom-right-radius: 0px;
          overflow: hidden;
          display: inline-block;
          img {
            display: block;
            width: 200px;
            height: 200px;
            object-fit: scale-down;
            border-top-right-radius: 0px;
            border-bottom-right-radius: 0px;
            transition: all 0.4s;
            &:hover {
              transform: scale(1.2);
            }
          }
        }
        .vh-goods_item-info {
          display: inline-block;
          height: 100%;
          color: @font-light-normal;
          box-sizing: border-box;
          padding-top: 24px;
          position: relative;
          .name {
            color: @font-light-normal;
          }
          .describe {
            width: 100%;
            height: 36px;
            line-height: 18px;
            word-break: break-word;
            font-size: 12px;
            color: #666;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            /* autoprefixer: ignore next */
            -webkit-box-orient: vertical;
            white-space: normal;
            margin-top: 4px;
          }
          .discount_price {
            bottom: 48px;
          }
          .other-info {
            bottom: 24px;
            .price,
            i {
              color: #fb3a32;
            }
            .price {
              ::v-deep > .remainder {
                font-size: 10px;
              }
            }
            .buy {
              border: 1px solid #fb3a32;
              color: #fb3a32;
            }
            .discount_price {
              color: @font-light-low;
            }
          }
          &:hover {
            .name {
              color: #fb3a32;
            }
            .other-info div .buy {
              background: #fb3a32;
              color: #fff;
            }
          }
        }
        &:hover {
          background: #fff;
          border-radius: 4px;
          cursor: pointer;
          border: none;
          .vh-goods_item-info .other-info .buy {
            border: 1px solid #fb3a32;
            background: #fff;
          }
        }
      }
    }
    .good-pop-wrap {
      position: fixed;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 40;
    }
    .good-pop {
      margin: 15vh auto 0px auto;
      width: 636px;
      height: 372px;
      background: #ffffff;
      box-shadow: 0px 8px 16px 0px rgba(51, 51, 51, 0.24), 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      box-sizing: border-box;
      padding: 24px 32px;
    }
    .good-head {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-bottom: 20px;
      .title {
        font-size: 20px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #1a1a1a;
        line-height: 24px;
      }
      .close {
        display: block;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        &:hover {
          cursor: pointer;
        }
      }
    }
    .pop-info {
      &:after {
        clear: both;
      }
      .left-info {
        width: 240px;
        display: inline-block;
        margin-right: 16px;
        .first-post {
          display: block;
          width: 240px;
          height: 218px;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .pics {
          width: 240px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          .img-wrap,
          .has-no-img {
            display: inline-block;
            width: 52px;
            height: 52px;
            border-radius: 4px;
            border: 1px solid #fff;
            &:hover {
              cursor: pointer;
              border: 1px solid #fb3a32;
            }
          }
          .active {
            border: 1px solid #fb3a32;
          }
          .has-img {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 4px;
          }
          .default-pic {
            width: 54px;
            height: 54px;
            background: #e6e6e6;
            border-radius: 4px;
            text-align: center;
            font-size: 12px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: @font-light-low;
            line-height: 54px;
          }
        }
      }
      .right-info {
        vertical-align: top;
        height: 280px;
        position: relative;
        float: right;
        width: 316px;
        .name {
          width: 100%;
          font-size: 18px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #1a1a1a;
          line-height: 22px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          text-align: left;
          margin-bottom: 12px;
        }
        .describe {
          display: inline-block;
          height: 140px;
          line-height: 18px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #666666;
          word-break: break-word;
          width: 300px;
          margin-bottom: 0px;
          text-align: left;
        }
        .price-info {
          font-family: PingFangSC-Regular, PingFang SC;
          width: 100%;
          font-weight: 400;
          display: flex;
          flex-direction: row;
          align-items: center;
          position: absolute;
          bottom: 50px;
          left: 0px;
          span {
            display: inline-block;
          }
          .tip {
            display: inline-block;
            width: 36px;
            height: 17px;
            background: #fff0f0;
            border-radius: 2px;
            color: #fb3a32;
            margin-right: 10px;
            font-size: 10px;
            padding: 3px;
            border-radius: 4px;
            text-align: center;
          }
          i {
            color: #fb3a32;
            font-size: 12px;
          }
          .price {
            font-size: 16px;
            color: #fb3a32;
            line-height: 20px;
            .remainder {
              font-size: 10px;
            }
          }
          .dis_count {
            font-size: 12px;
            color: #999999;
            line-height: 16px;
            text-decoration: line-through;
            margin-left: 10px;
          }
          .nodiscount {
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #fb3a32;
            line-height: 20px;
            text-decoration: none;
            .remainder {
              font-size: 10px;
            }
          }
        }
        .bottom-link {
          text-align: left;
          position: absolute;
          bottom: 0px;
          left: 0px;
          width: 200px;
          .buy {
            display: inline-block;
            width: 120px;
            height: 40px;
            background: #fb3a32;
            border-radius: 20px;
            font-size: 14px;
            color: #ffffff;
            line-height: 20px;
            border: none;
            outline: none;
          }
          .link {
            margin-left: 10px;
            font-size: 14px;
            line-height: 20px;
            color: #666666;
            &:hover {
              cursor: pointer;
              color: #3562fa;
            }
          }
        }
      }
    }
    .goods-load {
      width: 100%;
      height: 20px;
      text-align: center;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #999999;
      line-height: 20px;
      margin-top: 10px;
    }
  }

  @media screen and (max-width: 1366px) {
    .vh-goods {
      &.subscribe_goods {
        width: 780px;
        .subscribe_item {
          width: 410px;
          height: 200px;
          margin-bottom: 16px;
          .vh-goods_item-info {
            width: 200px;
          }
        }
      }
    }
  }

  @media screen and (min-width: 1367px) and (max-width: 1600px) {
    .vh-goods {
      &.subscribe_goods {
        width: 930px;
        .subscribe_item {
          width: 430px;
          height: 200px;
          margin-bottom: 16px;
          .vh-goods_item-info {
            width: 225px;
          }
          &:nth-child(2n) {
            margin-left: 16px;
          }
        }
      }
    }
  }
  @media screen and (min-width: 1601px) and (max-width: 1920px) {
    .vh-goods {
      &.subscribe_goods {
        width: 1480px;
        .subscribe_item {
          width: 450px;
          height: 200px;
          margin-bottom: 16px;
          .vh-goods_item-info {
            width: 250px;
          }
          &:nth-child(3n + 2) {
            margin: 0px 16px;
          }
        }
      }
    }
  }
  @media screen and (min-width: 1921px) {
    .vh-goods {
      &.subscribe_goods {
        width: 1480px;
        .subscribe_item {
          width: 450px;
          height: 200px;
          margin-bottom: 16px;
          .vh-goods_item-info {
            width: 250px;
          }
          &:nth-child(3n + 2) {
            margin: 0px 16px;
          }
        }
      }
    }
  }
</style>
