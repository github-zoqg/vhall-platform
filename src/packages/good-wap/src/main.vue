<template>
  <div class="vh-goods-wrapper">
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="$t('nav.nav_1043')"
      @load="onLoad"
      class="vh-goods_list"
    >
      <van-cell
        v-for="good in goodsList"
        :key="good.goods_id"
        class="vh-goods_item"
        @click="showDetailDialog(good)"
      >
        <div class="vh-goods_item-cover">
          <template v-for="i in good.img_list">
            <img v-if="i.is_cover == 1" :key="i.img_id" :src="i.img_url" alt="" />
          </template>
        </div>
        <div class="vh-goods_item-info">
          <div class="vh-goods_item-info__top">
            <div
              class="name"
              :class="{ showEllipse: computeFieldLength(good.name) > 15 }"
              v-text="good.name"
            ></div>
            <div
              class="describe"
              style="
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                overflow: hidden;
              "
              v-text="good.description"
            ></div>
          </div>
          <div>
            <div
              :style="{
                visibility: good.showDiscountPrice ? 'visible' : 'hidden'
              }"
              class="discount_price"
              v-text="`￥${good.price}`"
            ></div>
            <div class="other-info">
              <div v-if="good.showDiscountPrice" class="discount">
                <span class="price-tip">{{ $t('menu.menu_1006') }}</span>
                <i>￥</i>
                <span class="price" v-html="good.discountText"></span>
              </div>
              <div v-else>
                <i>￥</i>
                <span class="price" v-html="good.priceText"></span>
              </div>
              <div>
                <button class="buy" @click.stop="handleBuy(good)">
                  {{ $t('menu.menu_1007') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </van-cell>
    </van-list>
    <!-- <ul class="vh-goods_list">
      <li class="vh-goods_item" v-for="good in goodsList" :key="good.goods_id">
        <div class="good-cover">
          <img :src="good.covarImage" />
        </div>
        <div class="goods-info">
          <p class="title">{{ good.name }}</p>
          <p class="price">
            <template v-if="good.discount_price != 0">
              <span>￥{{ good.discount_price }}</span>
              <s>￥{{ good.price }}</s>
            </template>
            <template v-else>
              <span>￥{{ good.price }}</span>
            </template>
          </p>
          <p>
            <button class="check-info" @click="showDetailDialog(good)">
              {{ $t('chat.chat_1031') }}
            </button>
          </p>
        </div>
      </li>
    </ul>
    <div class="vh-loading" v-if="showLoading">{{ $t('common.common_1001') }}</div> -->
  </div>
</template>

<script>
  import { useRoomBaseServer, useGoodServer, useMenuServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { debounce } from 'lodash';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';

  export default {
    name: 'VmpGoodListWap',
    data() {
      return {
        goodsList: [],
        finished: false,
        loading: false,
        total: 0,
        num: 1,
        limit: 10,
        pos: 0,
        totalPages: 0,
        goodsListJson: []
      };
    },
    computed: {
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe';
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.goodServer = useGoodServer();
      this.menuServer = useMenuServer();
      console.log('wap this.menuServer------->', this.menuServer);
    },
    created() {
      // 自定义菜单服务事件监听
      // this.menuServer.$on('tab-switched', data => {
      //   console.log('wap tab-switched------>', this.cuid, data);
      //   /**
      //    * { cuid, menuId }
      //    */
      //   if (this.cuid == data.cuid) {
      //     this.$nextTick(() => {
      //       this.refreshScroll();
      //     });
      //   }
      // });
      this.goodServer.$on('goods_update_info', data => {
        this.queryGoodsListJson(data);
      });
    },
    mounted() {
      this.initConfig();

      this.buildDataList(this.roomBaseServer.state.goodsDefault, false);
    },
    methods: {
      // 中英文字符计算
      computeFieldLength(str) {
        var l = str.length;
        var fieldLength = 0;
        for (let i = 0; i < l; i++) {
          if ((str.charCodeAt(i) & 0xff00) !== 0) {
            fieldLength += 1;
          } else {
            fieldLength += 0.5;
          }
        }
        return Math.ceil(fieldLength);
      },
      // 格式化
      filterDiscount(val) {
        if (val.indexOf('.') > -1) {
          const i = val.slice(0, val.indexOf('.'));
          const r = val.slice(val.indexOf('.'));
          return `${i}<span class="remainder">${r}</span>`;
        } else {
          return val;
        }
      },
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          Object.assign(this.$data, widget.options);
        }
      },
      onLoad() {
        if (this.num >= this.totalPages) {
          this.finished = true;
          this.loading = false;
          return false;
        }
        this.loading = true;
        this.num++;
        this.pos = parseInt((this.num - 1) * this.limit);
        this.queryGoodsList();
      },
      /**
       * 查询商品列表
       */
      queryGoodsList() {
        this.goodServer
          .queryGoodsList({
            webinar_id: this.$route.params.id,
            pos: this.pos,
            limit: 10
          })
          .then(res => {
            if (res.code == 200 && res.data && res.data.goods_list) {
              this.buildDataList(res.data, true);
              this.loading = false;
            }
          });
      },
      /**
       * 统一构建列表
       */
      buildDataList(data, flag) {
        console.log('buildDataList------->');
        const list = data.goods_list;
        const currentGoodList = this.goodsList;
        if (list && list.length > 0) {
          list.map(item => {
            if (item.discount_price && Number(item.discount_price) > 0) {
              item.showDiscountPrice = true;
              item.discountText = this.filterDiscount(item.discount_price);
            } else {
              item.showDiscountPrice = false;
            }
            item.priceText = this.filterDiscount(item.price);
          });
        }

        if (flag) {
          this.goodsList = currentGoodList.concat(list);
        } else {
          this.goodsList = list;
        }
        this.total = data.total;
        this.totalPages = Math.ceil(this.total / this.limit);
      },
      showDetailDialog(goodsItem) {
        // 数据埋点
        window.vhallReportForWatch?.report(170029, {
          goods_id: goodsItem.goods_id,
          goods_name: encodeURIComponent(goodsItem.name)
        });
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitShowDetail', [goodsItem])
        );
      },
      handleBuy(good) {
        // 数据埋点
        window.vhallReportForWatch?.report(170030, {
          goods_id: good.goods_id,
          goods_name: encodeURIComponent(good.name)
        });
        const url = good.goods_url;
        const { system } = getBrowserType();
        if ('ios' === system) {
          console.log('当前是手机端打开-ios');
          window.location.href = url;
        } else {
          console.log('当前是手机端打开-其它');
          window.open(url, '_blank');
        }
      },
      //
      queryGoodsListJson(data) {
        console.log(data, 'queryGoodsListJson');
        // 开启自定义菜单
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitShowGoodsTab', [{ type: 5 }])
        );
        this.goodServer
          .queryGoodsListJson({
            url: data.data.cnd_url
          })
          .then(res => {
            console.log(res, 'goodsListJson');
            this.goodsListJson = res.goods_list;
            this.total = res.total;
            this.loading = false;

            if (this.num >= this.totalPages) {
              this.finished = true;
            }

            this.analogPage();
          });
      },
      // 分页模拟
      analogPage(type) {
        // console.log('analogPage', this.pos);
        // if (type == 'msg') {
        this.goodsList = this.goodsListJson.slice(0, this.pos + 10);
        this.goodsList.map(item => {
          if (item.discount_price && Number(item.discount_price) > 0) {
            item.showDiscountPrice = true;
            item.discountText = this.filterDiscount(item.discount_price);
          } else {
            item.showDiscountPrice = false;
          }
          item.priceText = this.filterDiscount(item.price);
        });
        // } else {
        //   this.goodsList = this.goodsList.concat(
        //     this.goodsListJson.slice(this.pos, this.limit + this.pos)
        //   );
        // }
      }
    }
  };
</script>

<style lang="less">
  .vh-goods-wrapper {
    width: 100%;
    height: 100%;
    overflow: auto;
    // background: #fff;
    .vh-goods_list {
      display: block;
      width: 100%;
      // height: 100%;
      overflow: hidden;
      padding-top: 24px;
      margin-bottom: 100px;
      touch-action: pan-y;
      /* .vh-goods_item {
        padding: 15px 30px;
        position: relative;
        .goods-info {
          display: inline-block;
          width: calc(100% - 220px);
          padding-left: 25px;
          font-size: 30px;
          .title {
            line-height: 34px;
            color: rgba(34, 34, 34, 1);
          }
          .price {
            span {
              font-weight: 500;
              color: rgba(252, 86, 89, 1);
              margin-right: 10px;
            }
            s {
              font-size: 26px;
              font-weight: 500;
              color: rgba(136, 136, 136, 1);
            }
          }
          .check-info {
            position: absolute;
            bottom: 2px;
            height: 60px;
            padding: 0 8px;
            line-height: 60px;
            font-size: 28px;
            background: rgba(252, 86, 89, 1);
            color: #fff;
            border-radius: 4px;
            cursor: pointer;
          }
        }
        .good-cover {
          vertical-align: top;
          display: inline-block;
          width: 220px;
          height: 220px;
          border-radius: 10px;
          border: 2px solid #e2e2e2;
          padding: 0px;
          img {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 10px;
            object-fit: scale-down;
          }
        }
      } */
      /* 新商品样式 */
      .van-cell::after {
        border-color: var(--theme-tab-content-good-split-bg);
      }
      .vh-goods_item {
        padding: 16px 24px;
        /* border-bottom: 1px solid #f0f0f0; */
        clear: both;
        background-color: var(--theme-tab-content-good-bg);
        &-cover {
          width: 200px;
          height: 200px;
          float: left;
          background: rgba(0, 0, 0, 1);
          border-radius: 4px;
          img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
            border-radius: 4px;
          }
        }
        &-info {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-left: 16px;
          width: calc(100% - 200px);
          .name {
            color: #262626;
            font-size: 28px;
            line-height: 38px;
            display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
            /* autoprefixer: ignore next */
            -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
            -webkit-line-clamp: 2; /** 显示的行数 **/
            overflow: hidden; /** 隐藏超出的内容 **/
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            /* autoprefixer: ignore next */
            -webkit-box-orient: vertical;
            text-align: left;
          }
          .describe {
            color: #595959;
            font-size: 24px;
            padding-top: 8px;
            line-height: 30px;
          }
          .discount_price {
            color: var(--theme-tab-content-good-discountPrice-font);
            font-size: 16px;
            height: 40px;
            display: inline-block;
            text-decoration: line-through;
          }
          .other-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            position: relative;
            .discount {
              .price-tip {
                padding: 3px 4px;
                background: var(--theme-tab-content-good-priceTag-bg);
                border-radius: 2px;
                color: var(--theme-tab-content-good-priceTag-font);
                font-size: 20px;
                line-height: 20px;
                margin-right: 8px;
              }
            }
            i {
              color: var(--theme-tab-content-good-price-font);
              font-size: 16px;
              height: 10px;
            }
            .price {
              font-size: 28px;
              color: var(--theme-tab-content-good-price-font);
            }
            .price ::v-deep > .remainder {
              font-size: 16px;
            }
            .buy {
              display: inline-block;
              padding: 9px 24px;
              min-width: 96px;
              height: 52px;
              line-height: 32px;
              border: 1px solid var(--theme-tab-content-good-buyBorder-font);
              background-color: var(--theme-tab-content-good-buy-bg) !important;
              border-radius: 32px;
              color: var(--theme-tab-content-good-buy-font);
              font-style: normal;
              font-weight: 400;
              font-size: 24px;
              text-align: center;
              background: transparent;
              position: absolute;
              right: 0;
              bottom: 0;
            }
          }
        }
        &-info__top {
          min-height: 106px;
          .name {
            color: var(--theme-tab-content-good-name-font);
          }
          .describe {
            color: var(--theme-tab-content-good-describe-font);
          }
        }
        // 废弃商品hover效果
        // &:active {
        //   background-color: var(--theme-tab-content-good-bg-active);
        //   .vh-goods_item-info {
        //     .buy {
        //       border: 1px solid var(--theme-tab-content-good-buyBorder-font-active);
        //       background-color: var(--theme-tab-content-good-buy-bg-active);
        //       color: var(--theme-tab-content-good-buy-font-active);
        //     }
        //   }
        // }
      }
    }
  }
</style>
