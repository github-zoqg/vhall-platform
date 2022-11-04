<template>
  <div class="vh-goods-wrapper-detail">
    <!-- 遮罩层 -->
    <div class="vh-goods-detail-mask" v-if="show"></div>
    <!-- 商品详情面板 -->
    <div class="vh-goods-detail-layout" v-if="show">
      <div class="vh-goods-wrapper-detail-contents">
        <div class="vh-goods-wrapper-detail-imgs">
          <van-swipe @change="onChange">
            <van-swipe-item v-for="(i, index) in info.img_list" :key="index">
              <img :src="i.img_url" alt="" class="has-img" />
            </van-swipe-item>
            <template #indicator>
              <div class="custom-indicator">{{ current + 1 }}/{{ info.img_list.length }}</div>
            </template>
          </van-swipe>
          <p class="btn-close" @click="handleClose">
            <i class="vh-iconfont vh-line-close"></i>
          </p>
        </div>
        <div class="vh-goods-wrapper-detail-info">
          <div class="vh-goods-wrapper-detail-info-price">
            <span class="price-tip">{{ $t('menu.menu_1006') }}</span>
            <i>￥</i>
            <span class="price" v-html="info.discountText"></span>
            <span class="price-through">
              <i>￥</i>
              <span v-html="info.priceText"></span>
            </span>
          </div>
          <div class="price-title">{{ info.name }}</div>
          <div class="price-des">{{ info.description }}</div>
        </div>
      </div>
      <div class="vh-goods-wrapper-detail-btn">
        <span v-if="info.shop_url" @click.stop="handleBuy('shop_url')">
          {{ $t('menu.menu_1009') }}
        </span>
        <span @click.stop="handleBuy('goods_url')">{{ $t('menu.menu_1007') }}</span>
      </div>
    </div>
    <!-- 复制口令 -->
    <van-popup v-model="showTaoTip" class="tao-wrap">
      <i class="vh-iconfont vh-line-close" @click="showTaoTip = false"></i>
      <div class="tao-password">
        <span>{{ $t('webinar.webinar_1013') }}</span>
        <span>{{ info.tao_password }}</span>
        <span>{{ $t('webinar.webinar_1014') }}</span>
      </div>
    </van-popup>
  </div>
</template>

<script>
  import { useGoodServer } from 'middle-domain';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
  export default {
    name: 'VmpGoodsDetail',
    data() {
      return {
        show: false,
        showTaoTip: false,
        info: {},
        current: 0,
        isExist: true
      };
    },
    // mounted() {
    //   console.log('mounted wap VmpGoodDetail---------->', this.info);
    // },
    methods: {
      /**
       * 事件驱动api: 输出
       * 打开商品详情, 入参商品详情信息
       */
      open(data) {
        console.log('detail---------->', data);
        this.info = data;
        this.show = true;
      },
      /**
       * 购买
       */
      handleBuy(type) {
        useGoodServer()
          .getGoodDetail({
            webinar_id: this.$route.params.id,
            goods_id: this.info.goods_id
          })
          .then(res => {
            if (res.code == 200) {
              // 数据埋点
              window.vhallReportForWatch?.report(170030, {
                goods_id: this.info.goods_id,
                goods_name: encodeURIComponent(this.info.name)
              });
              let url = '';
              if (type == 'goods_url') {
                url = res.data.goods_url;
              } else {
                url = res.data.shop_url;
              }
              if (res.data.tao_password) {
                this.showTaoTip = true;
              } else {
                if (window.vhallReport) {
                  window.vhallReport.report('GOOD_RECOMMEND', {
                    event: dayjs().format('YYYY-MM-DD hh:mm'),
                    market_tools_id: this.info.goods_id,
                    market_tools_status: 1 // 购买
                  });
                }
                const { system } = getBrowserType();
                if ('ios' === system) {
                  console.log('当前是手机端打开-ios');
                  window.location.href = url;
                } else {
                  console.log('当前是手机端打开-其它');
                  window.open(url);
                }
              }
            } else {
              this.$toast(this.$t('nav.nav_1056'));
              this.handleClose();
            }
          });
      },
      handleClose() {
        this.show = false;
        this.current = 0;
      },
      onChange(index) {
        this.current = index;
      }
    }
  };
</script>

<style lang="less">
  .vh-goods-wrapper-detail {
    // 淘口令
    .tao-wrap {
      width: 670px;
      min-height: 477px;
      border-radius: 32px;
      background: rgba(255, 255, 255, 1);
      overflow: hidden;
      padding: 40px 44px 42px 44px;
      .vh-line-close {
        position: absolute;
        right: 36px;
        top: 33px;
        color: rgba(140, 140, 140, 1);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .tao-password {
        display: flex;
        flex-direction: column;
        span {
          line-height: 40px;
          &:nth-child(1) {
            width: 100%;
            font-weight: 400;
            font-size: 32px;
            line-height: 45px;
            color: #262626;
            line-height: 45px;
            margin: 0 0 40px 0;
            text-align: center;
          }
          &:nth-child(2) {
            border: 2px solid rgba(0, 0, 0, 0.45);
            padding: 20px;
            width: 582px;
            min-height: 212px;
            margin: 0 auto 20px;
            border-radius: 8px;
            color: #262626;
            font-style: normal;
            font-weight: 400;
            font-size: 28px;
            word-break: break-all;
            line-height: 40px;
          }
          &:nth-child(3) {
            text-align: left;
            margin: 0 auto;
            width: 556px;
            height: 80px;
            font-size: 28px;
            font-weight: 400;
            color: #595959;
            line-height: 40px;
          }
        }
      }
    }
    .van-swipe__track {
      width: 100%;
    }
  }
  .vh-goods-detail-mask {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    background: var(--theme-tab-content-good-detail-mask-bg);
    mix-blend-mode: normal;
    opacity: 0.7;
  }
  .vh-goods-detail-layout {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 1114px;
    z-index: 2101;
    border-radius: 32px 32px 0 0;
    margin-bottom: env(safe-area-inset-bottom);
    .vh-goods-wrapper-detail-imgs {
      height: 720px;
      border-radius: 32px 32px 0 0;
      position: relative;
      .btn-close {
        z-index: 99;
        position: absolute;
        right: 30px;
        top: 30px;
        width: 48px;
        height: 48px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        line-height: 48px;
        text-align: center;
        color: white;
        i {
          font-size: 24px;
        }
      }
      .has-img {
        width: 100%;
        height: 100%;
        object-fit: scale-down;
        transform: translate3d(0, 0, 0);
        border-radius: 32px 32px 0 0;
      }
      .van-swipe-item {
        width: 100%;
        height: 720px;
        display: flex;
        background: rgba(0, 0, 0, 1);
      }
      .custom-indicator {
        position: absolute;
        bottom: 24px;
        right: 24px;
        width: 91px;
        height: 44px;
        line-height: 44px;
        background: rgba(0, 0, 0, 0.45);
        border-radius: 22px;
        font-style: normal;
        font-weight: 400;
        font-size: 28px;
        text-align: center;
        color: #ffffff;
      }
    }
    .vh-goods-wrapper-detail-info {
      padding: 24px 32px;
      overflow-y: auto;
      height: 254px;
      background: var(--theme-tab-content-good-detail-content-bg);
      &-price {
        height: 40px;
        line-height: 40px;
        .price-tip {
          padding: 3px 4px;
          background: var(--theme-tab-content-good-priceTag-bg);
          border-radius: 2px;
          color: var(--theme-tab-content-good-priceTag-font);
          font-size: 20px;
          line-height: 20px;
          margin-right: 8px;
        }
        i {
          color: #fb2626;
          font-size: 10px;
        }
        .price {
          font-size: 28px;
          color: #fb2626;
        }
        .price ::v-deep > .remainder {
          font-size: 10px;
        }
        .price-through {
          font-size: 20px;
          color: var(--theme-tab-content-good-discountPrice-font);
          padding-left: 8px;
          text-decoration: line-through;
          i {
            color: var(--theme-tab-content-good-discountPrice-font);
          }
        }
        .price-through ::v-deep > .remainder {
          font-size: 10px;
        }
      }
      .price-title {
        padding-top: 24px;
        font-weight: 500;
        font-size: 28px;
        line-height: 39px;
        color: var(--theme-tab-content-good-name-font);
        line-height: 39px;
      }
      .price-des {
        padding-top: 2px;
        font-style: normal;
        font-weight: 400;
        font-size: 24px;
        word-break: break-all;
        line-height: 34px;
        color: var(--theme-tab-content-good-describe-font);
      }
    }
    .vh-goods-wrapper-detail-btn {
      text-align: right;
      width: 100%;
      height: 140px;
      background: var(--theme-tab-content-good-detail-content-bg);
      padding-top: 24px;
      padding-bottom: 38px;
      box-shadow: 0px -1px 0px var(--theme-tab-content-good-detail-btn-shadow-color);
      span {
        display: inline-block;
        width: 200px;
        height: 80px;
        line-height: 82px;
        text-align: center;
        border-radius: 40px;
        &:first-child {
          background: var(--theme-tab-content-good-detail-btn-store-bg);
          color: var(--theme-tab-content-good-detail-btn-store-font);
          border: 1px solid var(--theme-tab-content-good-detail-btn-store-border);
          margin-right: 16px;
        }
        &:last-child {
          background: var(--theme-tab-content-good-detail-btn-buy-bg);
          color: var(--theme-tab-content-good-detail-btn-buy-font);
          border: 1px solid var(--theme-tab-content-good-detail-btn-buy-border);
          margin-right: 24px;
        }
      }
    }
  }
</style>
