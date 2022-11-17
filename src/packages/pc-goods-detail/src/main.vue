<template>
  <div class="VmpGoodDetailPc" v-if="show">
    <div class="good-pop">
      <div class="good-head">
        <span class="title">{{ $t('menu.menu_1008') }}</span>
        <span class="close vh-iconfont vh-line-close" @click.stop="handleClose"></span>
      </div>
      <div class="pop-info">
        <div class="left-info">
          <img :src="defaultImg" class="first-post" />
          <div class="pics">
            <template v-for="(i, index) in info.img_list">
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
          <span class="name">{{ info.name }}</span>
          <div class="describe">{{ info.description }}</div>
          <div class="price-info">
            <span class="tip" v-if="info.discoutText">{{ $t('menu.menu_1006') }}</span>
            <i>￥</i>
            <span class="price" v-html="info.discoutText ? info.discoutText : info.price"></span>
            <span
              class="dis_count"
              v-if="info.discoutText"
              :class="{ nodiscount: !info.discount_price }"
              v-html="info.discount_price ? '￥' + info.priceText : '￥' + info.priceText"
            ></span>
          </div>
          <div class="bottom-link">
            <button class="buy" @click.stop="handleBuy(info)">
              {{ $t('menu.menu_1007') }}
            </button>
            <span v-if="info.shop_url" class="link" @click.stop="link(info.shop_url)">
              {{ $t('menu.menu_1009') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { useGoodServer } from 'middle-domain';
  export default {
    name: 'VmpGoodDetailPc',
    data() {
      return {
        show: false, //是否显示
        info: {}, //商品详情
        defaultImg: '',
        selectDefaultImgIndex: 0
      };
    },
    methods: {
      /**
       * 事件驱动api: 输出
       * 打开商品详情, 入参商品详情信息
       */
      open(data) {
        console.log('detail---------->', data);
        this.info = data;
        this.show = true;
        this.chooseDefaultImg(0);
      },
      handleClose() {
        this.show = false;
      },
      /**
       * 访问店铺
       */
      link(val) {
        useGoodServer()
          .getGoodDetail({
            webinar_id: this.$route.params.id,
            goods_id: this.info.goods_id
          })
          .then(res => {
            if (res.code == 200) {
              window.open(res.data.shop_url);
            } else {
              this.$message.warning(this.$t('nav.nav_1056'));
              this.handleClose();
            }
          });
      },
      /**
       * 购买
       */
      handleBuy(info) {
        useGoodServer()
          .getGoodDetail({
            webinar_id: this.$route.params.id,
            goods_id: this.info.goods_id
          })
          .then(res => {
            if (res.code == 200) {
              window.open(res.data.goods_url);
              // 数据埋点
              window.vhallReportForWatch?.report(170030, {
                goods_id: info.goods_id,
                goods_name: encodeURIComponent(info.name)
              });
            } else {
              this.$message.warning(this.$t('nav.nav_1056'));
              this.handleClose();
            }
          });
      },
      chooseDefaultImg(index) {
        this.defaultImg = this.info.img_list[index].img_url;
        this.selectDefaultImgIndex = index;
      }
    }
  };
</script>

<style lang="less">
  .VmpGoodDetailPc {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 200;
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
          font-weight: 500;
          color: #1a1a1a;
          line-height: 22px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          /* autoprefixer: ignore next */
          -webkit-box-orient: vertical;
          text-align: left;
          margin-bottom: 12px;
        }
        .describe {
          display: inline-block;
          height: 140px;
          line-height: 18px;
          font-size: 14px;
          color: #666666;
          word-break: break-word;
          width: 300px;
          margin-bottom: 0px;
          text-align: left;
        }
        .price-info {
          width: 100%;
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
  }
</style>
