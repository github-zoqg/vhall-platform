<template>
  <div class="chapter-wrap">
    <ul v-if="support && chapterData.length != 0">
      <li v-for="(item, index) in chapterData" :key="index">
        <div
          class="chapter-info"
          :data-time="item.createTime"
          @click.stop="changeTime(item.createTime)"
          :class="{ active: select == item.createTime }"
        >
          <span class="title">{{ index + 1 }}.{{ $t(item.title) }}</span>
          <span class="time">{{ item.createTime | filterTime }}</span>
        </div>
        <template v-if="item.sub.length > 0">
          <div
            class="step-info"
            v-for="(sub, i) in item.sub"
            :key="item.cid + '-step' + i"
            @click.stop="changeTime(sub.createTime)"
            :class="{ active: select == sub.createTime }"
          >
            <span class="title">{{ index + 1 }}-{{ i + 1 }}.{{ $tdefault(sub.title) }}</span>
            <span class="time">{{ sub.createTime | filterTime }}</span>
          </div>
        </template>
      </li>
    </ul>
    <span v-else class="posit">
      <img src="./img/null.png" alt="" />
      <div class="font_sty">{{ this.$t('appointment.appointment_1019') }}</div>
    </span>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import { isMse } from '../../wap-player/src/js/utils';
  export default {
    name: 'VmpChapterWap',
    data() {
      return {
        select: '',
        moment: null,
        support: true,
        chapterData: {},
        webinarData: {}
      };
    },
    // props: ['chapterData', 'webinarData'],
    filters: {
      filterTime: val => {
        const result = parseInt(val);
        let hour = Math.floor(result / 3600);
        let minute = Math.floor((result / 60) % 60);
        let second = Math.floor(result % 60);
        if (hour == 0) {
          hour = '00';
        } else if (hour < 10) {
          hour = '0' + hour;
        }
        if (minute == 0) {
          minute = '00';
        } else if (minute < 10) {
          minute = '0' + minute;
        }
        if (second == 0) {
          second = '00';
        } else if (second < 10) {
          second = '0' + second;
        }
        return hour + ':' + minute + ':' + second;
      }
    },
    beforeCreate() {
      this.webinarData = useRoomBaseServer().state.watchInitDate;
    },
    created() {
      // this.acceptChapterData();
      this.moment = this.$moment;
      if (
        this.webinarData.record &&
        this.webinarData.record.encrypt_status == 2 &&
        !isMse().supportMSE
      ) {
        this.support = false;
      }
    },
    methods: {
      // 更改播放器时间
      changeTime(t) {
        this.select = t;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitChangePlayTime', [t]));
        // this.$emit('changPlayTime', t);
      },
      // 接受章节数据
      acceptChapterData(data) {
        this.chapterData = data || [
          {
            slideIndex: 1,
            stepIndex: 0,
            title: '目录',
            sub: [],
            createTime: 8.759,
            docId: '0a9798f6'
          },
          {
            slideIndex: 2,
            stepIndex: 0,
            title: '工作职责\u000b',
            sub: [],
            createTime: 8.982,
            docId: '0a9798f6'
          },
          {
            slideIndex: 3,
            stepIndex: 0,
            title: '工作内容（一）\u000b',
            sub: [],
            createTime: 9.167,
            docId: '0a9798f6'
          },
          {
            slideIndex: 4,
            stepIndex: 0,
            title: '工作内容（二）\u000b',
            sub: [],
            createTime: 9.343,
            docId: '0a9798f6'
          },
          {
            slideIndex: 5,
            stepIndex: 0,
            title: '工作内容（三）\u000b',
            sub: [],
            createTime: 9.509,
            docId: '0a9798f6'
          },
          {
            slideIndex: 6,
            stepIndex: 0,
            title: '工作内容（四）\u000b',
            sub: [],
            createTime: 9.668,
            docId: '0a9798f6'
          },
          {
            slideIndex: 7,
            stepIndex: 0,
            title: '工作内容（五）\u000b',
            sub: [],
            createTime: 9.894,
            docId: '0a9798f6'
          },
          {
            slideIndex: 8,
            stepIndex: 0,
            title: '工作内容（六）\u000b',
            sub: [],
            createTime: 10.764,
            docId: '0a9798f6'
          },
          {
            slideIndex: 9,
            stepIndex: 0,
            title: '问题',
            sub: [],
            createTime: 11.095,
            docId: '0a9798f6'
          },
          {
            slideIndex: 10,
            stepIndex: 0,
            title: '未来工作规划',
            sub: [],
            createTime: 14.335,
            docId: '0a9798f6'
          },
          {
            slideIndex: 11,
            stepIndex: 0,
            title: 'THANKS',
            sub: [],
            createTime: 14.796,
            docId: '0a9798f6'
          }
        ];
      }
    }
  };
</script>
<style lang="less" scoped>
  .chapter-wrap {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 20px;
    ul {
      display: block;
      width: 100%;
      height: 100%;
      overflow-y: scroll;
      touch-action: pan-y;
      box-sizing: border-box;
      padding: 0px 30px 30px;
      font-size: 30px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #555;
    }
    li {
      display: block;
      width: 100%;
      min-height: 80px;

      .active {
        color: #fb3a32;
      }
      div {
        height: 100%;
        width: 100%;
        line-height: 80px;
      }
    }
    .chapter-info {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
    }
    .title {
      display: inline-block;
      width: 75%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      word-break: break-all;
      vertical-align: middle;
    }
    .time {
      display: inline-block;
      width: 20%;
    }
  }
  .step-info {
    margin-left: 25px;
  }
  .posit {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 260px;
    }
    .font_sty {
      font-size: 30px;
      color: #8c8c8c;
      text-align: center;
    }
  }
</style>
