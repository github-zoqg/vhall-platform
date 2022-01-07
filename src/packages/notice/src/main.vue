<template>
  <div class="vmp-notice-list" v-if="noticeNum">
    <div class="vmp-notice-list-icon">
      <div class="vmp-notice-list-icon-num">{{ noticeNum }}</div>
      <div class="vmp-notice-list-icon-img" @click="isShowNotice = true">
        <img src="./images/notice-icon.png" alt="" />
      </div>
    </div>
    <div class="vmp-notice-list-container" v-if="isShowNotice">
      <div class="vmp-notice-list-container-data">
        <ul v-if="noticeList.length" v-infinite-scroll="moreLoadData">
          <li v-for="(item, index) in noticeList" :key="index">
            <div class="vmp-notice-list-container-data-time">
              {{ item.created_at | formatTime }}
            </div>
            <div class="vmp-notice-list-container-data-text">
              <span class="vmp-notice-list-container-data-text-circle">
                <i v-if="index == 0"></i>
              </span>
              <p class="vmp-notice-list-container-data-text-title">{{ item.content.content }}</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="vmp-notice-list-container-close">
        <i class="iconfont iconguanbi_icon" @click="isShowNotice = false"></i>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpNoticeList',
    filters: {
      formatTime(value) {
        return value.substring(11, 16);
      }
    },
    data() {
      return {
        noticeNum: 1,
        isShowNotice: false, //是否显示公告列表
        noticeList: [
          {
            created_at: '2010-11-12 10:10',
            content: {
              content: '111111111111111'
            }
          },
          {
            created_at: '2010-11-12 10:11',
            content: {
              content: '22222222222'
            }
          },
          {
            created_at: '2010-11-12 10:15',
            content: {
              content: '333333333'
            }
          }
        ]
      };
    },
    methods: {
      moreLoadData() {}
    }
  };
</script>
<style lang="less">
  .vmp-notice-list {
    height: 100%;
    position: relative;
    &-icon {
      &-img {
        height: 32px;
        width: 32px;
        line-height: 32px;
        border-radius: 50%;
        position: relative;
        cursor: pointer;
        img {
          height: 32px;
          width: 32px;
        }
      }
      &-num {
        position: absolute;
        top: -10px;
        right: -8px;
        border-radius: 9px;
        background: @bg-error-light;
        color: @font-error-low;
        font-size: 12px;
        padding: 0 5px;
        text-align: center;
        line-height: 17px;
        height: 17px;
        z-index: 1;
        border: solid 1px @border-tools-color;
      }
    }
    &-container {
      position: absolute;
      right: -100px;
      bottom: 50px;
      z-index: 12;
      width: 492px;
      height: 382px;
      background: transparent;
      background-image: url('./images/notice.png');
      background-size: 100% 100%;
      &-data {
        position: absolute;
        top: 108px;
        left: 60px;
        width: 352px;
        max-height: 267px;
        padding-right: 20px;
        overflow: auto;
        color: @font-light-normal;
        ul {
          list-style: none;
          height: 100%;
          li {
            display: flex;
            color: @font-light-normal;
            font-size: 14px;
            line-height: 20px;
          }
        }
        &-time {
          display: inline-block;
          width: 50px;
          text-align: left;
        }
        &-text {
          display: flex;
          position: relative;
          // padding-bottom: 16px;
          width: calc(100% - 50px);
          &-circle {
            display: inline-block;
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: #fff4f4;
            border: 1px solid #ffc5c3;
            top: 4px;
            left: -6px;
            position: absolute;
            i {
              display: inline-block;
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: @font-error;
              position: absolute;
              top: 2px;
              left: 2px;
            }
          }
          &-title {
            padding-left: 16px;
            word-break: break-word;
            padding-bottom: 16px;
            border-left: 1px dashed #ffc5c3;
            border-radius: 2px;
          }
        }
      }
      &-close {
        position: absolute;
        top: 60px;
        right: 75px;
        cursor: pointer;
        cursor: pointer;
        i {
          font-size: 12px;
          color: @font-error;
        }
      }
    }
  }
</style>
