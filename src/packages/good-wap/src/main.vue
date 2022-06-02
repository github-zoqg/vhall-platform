<template>
  <div class="vh-goods-wrapper">
    <ul class="vh-goods_list">
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
    <div class="vh-loading" v-if="showLoading">{{ $t('common.common_1001') }}</div>
    <!-- 商品详情 -->
    <!-- <goods-info
      v-if="openGoodInfo && goodItem"
      :info="goodItem"
      @close="openGoodInfo = false"
    ></goods-info> -->
  </div>
</template>

<script>
  import { useRoomBaseServer, useGoodServer, useMenuServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import { debounce } from 'lodash';
  import BScroll from '@better-scroll/core';
  import Pullup from '@better-scroll/pull-up';
  BScroll.use(Pullup);
  // import goodsInfo from './detail';

  export default {
    name: 'VmpGoodListWap',
    // components: {
    //   goodsInfo
    // },
    data() {
      return {
        goodsList: [],
        scroll: null,
        // openGoodInfo: false,
        // goodItem: null,
        showLoading: false,
        total: 0,
        limit: 10,
        pos: 0
      };
    },
    // props: ['goodList', 'goodsListInfo'],
    // watch: {
    //   // goodList: {
    //   //   handler(val) {
    //   //     if (val) {
    //   //       this.list = val;
    //   //     }
    //   //   },
    //   //   immediate: true,
    //   //   deep: true
    //   // },
    //   // goodsListInfo: {
    //   //   handler(val) {
    //   //     if (val) {
    //   //       this.total = val.total;
    //   //       this.limit = 10;
    //   //       this.pos = val.pos;
    //   //     }
    //   //   },
    //   //   immediate: true,
    //   //   deep: true
    //   // },
    //   // goodsList: {
    //   //   handler(val) {
    //   //     console.log('wap watch goodsList------------->', val);
    //   //     this.$nextTick(() => {
    //   //       this.scroll && this.scroll.refresh();
    //   //     });
    //   //   }
    //   // }
    // },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.goodServer = useGoodServer();
      this.menuServer = useMenuServer();
      console.log('wap this.menuServer------->', this.menuServer);
    },
    created() {
      // 自定义菜单服务事件监听
      this.menuServer.$on('tab-switched', data => {
        console.log('wap tab-switched------>', this.cuid, data);
        /**
         * { cuid, menuId }
         */
        if (this.cuid == data.cuid) {
          this.$nextTick(() => {
            this.refreshScroll();
          });
        }
      });
    },
    mounted() {
      this.initConfig();

      // 初始化滚动
      this.handlerScroll();

      // this.webinar_id = this.roomBaseServer.state.watchInitData.webinar.id;
      this.buildDataList(this.roomBaseServer.state.goodsDefault, false);
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          Object.assign(this.$data, widget.options);
        }
      },
      /**
       * 对外提供的更新滚动条的方法
       */
      refreshScroll() {
        console.log('refreshScroll-------->', this.scroll);
        if (this.scroll) {
          this.scroll.refresh();
        }
      },
      /**
       * 构建列表成功之后的回调, 让列表计算高滚动
       */
      handlerScroll() {
        const wrapper = document.querySelector('.vh-goods-wrapper');
        window['GoodScroll'] = this.scroll = new BScroll(wrapper, {
          pullUpLoad: true,
          bindToWrapper: true,
          scrollX: false,
          scrollY: true,
          bounce: true,
          click: true,
          tap: 'tap'
        });
        this.handleBindScrollEvent();
        console.log('handlerInitScroll-------->', this.scroll);
      },
      handleBindScrollEvent() {
        window.addEventListener(
          'resize',
          debounce(() => {
            this.refreshScroll();
          }, 200)
        );
        this.scroll.on('pullingUp', () => {
          // console.log('handleBindScrollEvent pullingUp--------->');
          this.queryGoodsList();
        });
      },
      /**
       * 查询商品列表
       */
      queryGoodsList() {
        if (this.showLoading || this.pos + this.limit >= this.total) {
          return false;
        }

        this.showLoading = true;

        this.goodServer
          .queryGoodsList({
            webinar_id: this.$route.params.id,
            pos: this.pos + this.limit,
            limit: 10
          })
          .then(res => {
            if (res.code == 200 && res.data && res.data.goods_list) {
              this.buildDataList(res.data, true);
              this.showLoading = false;
              this.scroll.finishPullUp();
            }
          })
          .catch(e => {
            console.error('queryGoodsList--------->', e);
            this.showLoading = false;
            this.scroll.finishPullUp();
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
          list.forEach(item => {
            const covarImage = item.img_list.find(ele => ele.is_cover == 1);
            item.covarImage = covarImage ? covarImage.img_url : item.img_list[0].img_url;
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

        this.$nextTick(() => {
          console.log('buildDataList nextTick-------->');
          this.refreshScroll();
        });
      },
      showDetailDialog(goodsItem) {
        // this.openGoodInfo = true;
        // this.goodItem = good;

        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitShowDetail', [goodsItem])
        );
      }
    }
  };
</script>

<style lang="less">
  .vh-goods-wrapper {
    width: 100%;
    height: 100%;
    background: #fff;
    overflow: auto;
    .vh-goods_list {
      display: block;
      width: 100%;
      overflow: hidden;
      touch-action: pan-y;
      .vh-goods_item {
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
            bottom: 15px;
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
      }
    }
  }
</style>
