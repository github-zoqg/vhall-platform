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
            <button class="buy" @click.stop="handleBuy(good)">
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
  </div>
</template>

<script>
  import { useRoomBaseServer, useGoodServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { debounce } from 'lodash';

  export default {
    name: 'VmpGoodList',
    data() {
      return {
        goodsList: [],
        // goodItem: null,
        // openGoodInfo: false,
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
      // bLength(str) {
      //   var l = str.length;
      //   var blen = 0;
      //   for (let i = 0; i < l; i++) {
      //     if ((str.charCodeAt(i) & 0xff00) !== 0) {
      //       blen += 1;
      //     } else {
      //       blen += 0.5;
      //     }
      //   }
      //   return Math.ceil(blen);
      // },
      bindEventListener() {
        // if (this.pagetype == 'watch') {
        const wrap = document.querySelector('.vh-goods');
        if (!wrap) return;
        console.log('商品.....');
        if (this.isSubscribe) {
          window.addEventListener('scroll', this.scrollLoadGoodsList, true);
        } else {
          wrap.addEventListener('scroll', this.scrollLoadGoodsList, true);
        }
      },
      scrollLoadGoodsList: debounce(function (e) {
        if (this.isSubscribe) {
          console.log('预约页，看看商品滚动看看触发了没');
          const currentY = document.body.clientHeight + window.scrollY;
          const fullY = document.body.scrollHeight;
          const hasOverflowY = Math.floor(currentY) === Math.floor(fullY); // 排除小数位干扰
          // console.log('当前情况', currentY, fullY);
          if (!hasOverflowY) return;
          // console.log('当前情况2', this.total, this.pos, this.total);
          if (this.total !== 0 && this.pos >= this.total) return;
          this.queryGoodsList();
        } else {
          console.log('直播页，看看商品滚动看看触发了没');
          const clientHeight = e.target.clientHeight;
          const scrollHeight = e.target.scrollHeight;
          const scrollTop = e.target.scrollTop;
          if (clientHeight + scrollTop >= scrollHeight) {
            // console.log('商品滚动看看触发了没111111');
            this.queryGoodsList();
          } else {
            // console.log('商品滚动看看触发了没2222');
          }
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
      /**
       * 显示商品详情
       */
      showDetailDialog(goodsItem) {
        const data = goodsItem;
        // 数据埋点
        window.vhallReportForWatch?.report(170029, {
          goods_id: goodsItem.goods_id,
          goods_name: encodeURIComponent(goodsItem.name)
        });
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
        // 事件通知
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitShowDetail', [data]));
      },
      handleBuy(good) {
        // 数据埋点
        window.vhallReportForWatch?.report(170030, {
          goods_id: good.goods_id,
          goods_name: encodeURIComponent(good.name)
        });
        window.open(good.goods_url);
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
        if (this.isSubscribe) {
          window.removeEventListener('scroll', this.scrollLoadGoodsList);
        } else {
          wrap.removeEventListener('scroll', this.scrollLoadGoodsList);
        }
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
        width: calc(100% - 100px);
        .name {
          display: block;
          width: 100%;
          font-size: 14px;
          color: @font-dark-normal;
          line-height: 20px;
          overflow: hidden;
          text-align: left;
        }
        .describe {
          width: 200px;
          height: 18px;
          line-height: 20px;
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
        .buy {
          background: #fb3a32;
          border: 1px solid #fb3a32;
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
            line-height: 20px;
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
            /*  .name {
              color: #fb3a32;
            } */
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
    .goods-load {
      width: 100%;
      height: 20px;
      text-align: center;
      font-size: 14px;
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
        width: 1228px;
        .subscribe_item {
          width: 450px;
          height: 200px;
          margin-bottom: 16px;
          .vh-goods_item-info {
            width: 250px;
          }
          &:nth-child(2n) {
            margin-left: 16px;
          }
          /* &:nth-child(3n + 2) {
            margin: 0px 16px;
          } */
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
