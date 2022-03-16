<template>
  <section class="check-end">
    <div>
      <div class="check-end-icon success" v-if="isCheckSuccess">
        <i class="vh-iconfont vh-line-circle-check" />
        <div class="check-end-text">设备检测正常</div>
      </div>
      <div class="check-end-icon fail" v-else>
        <i class="vh-iconfont vh-line-warning-outline" />
        <div class="check-end-text">设备检测异常</div>
      </div>
    </div>

    <div class="vh-check-result">
      <header class="vh-check-result__item">
        <span>检测项目</span>
        <span>检测结果</span>
      </header>

      <main>
        <div v-for="item of checkList" :key="item.name" class="vh-check-result__item">
          <span>{{ item.text }}</span>
          <span :class="item.status">
            <span>{{ item.status === 'success' ? '正常' : '异常' }}</span>
          </span>
        </div>
      </main>
    </div>

    <footer class="vh-footer">
      <section v-if="!isCheckSuccess" class="vh-footer_result-help">
        <a target="_blank" href="https://e.vhall.com/v3/lives/room/624923410?type=ctrl">
          {{ $t('setting.setting_1029') }}
        </a>
      </section>

      <section class="vh-fotter_result-btn">
        <el-button round v-if="!isCheckSuccess" @click="restart" class="confirm">
          重新检测
        </el-button>
        <el-button class="fr" round type="primary" v-if="isCheckSuccess" @click="finish">
          {{ roleName == 1 ? '去直播' : '马上互动' }}
        </el-button>
      </section>
    </footer>
  </section>
</template>

<script>
  import { useRoomBaseServer } from 'middle-domain';

  export default {
    name: 'check-result',
    props: {
      checkList: {
        type: Array,
        default: () => []
      },
      selectedVideoDeviceId: {
        type: String,
        default: ''
      },
      selectedAudioInputDeviceId: {
        type: String,
        default: ''
      },
      selectedAudioOutputDeviceId: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        roleName: 1
      };
    },
    computed: {
      isCheckSuccess() {
        return this.checkList.every(item => item.status === 'success');
      }
    },
    created() {
      const { watchInitData } = useRoomBaseServer().state;
      this.roleName = watchInitData?.join_info?.role_name;
    },
    methods: {
      restart() {
        this.$emit('next', { result: 'fail' });
      },
      finish() {
        this.$emit('next', { result: 'success' });
      }
    }
  };
</script>

<style lang="less">
  .check-end {
    width: 330px;

    .check-end-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      & > .vh-iconfont {
        font-size: 48px;
      }
      & > .check-end-text {
        font-size: 16px;
        margin-top: 10px;
      }
      &.success {
        color: #14ba6a;
      }
      &.fail {
        color: #fa9932;
      }
    }

    .vh-check-result {
      margin-top: 32px;
      text-align: center;
      height: 150px;

      &__item {
        margin: 0 auto;
        display: flex;
        width: 330px;
        height: 40px;
        color: #1a1a1a;
        line-height: 40px;
        font-size: 12px;
        &:nth-child(odd) {
          background: #e2e2e2;
        }
        &:nth-child(even) {
          background: #f5f5f5;
          border-top: 1px solid #ffffff;
        }
        & > span {
          &:first-child {
            padding-left: 40px;
            text-align: left;
          }
          &:nth-child(2) {
            padding-left: 120px;
            text-align: left;
          }
          flex: 1;
          & > span {
            & > .iconfont {
              vertical-align: bottom;
              padding-right: 2px;
            }
          }
          &.error {
            color: #fa9932;
          }
          &.success {
            color: #14ba6a;
          }
        }
      }
    }
    .vh-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: absolute;
      bottom: 16px;
      width: 330px;

      .vh-check-help {
        position: absolute;
        left: 55px;
        bottom: 32px;
        &:hover {
          text-decoration: underline;
        }
      }

      .vh-footer_result-help {
        a {
          font-size: 14px;
          color: #666;
          &:hover {
            color: #3562fa;
          }
        }
      }

      .vh-footer__result-btn {
        position: absolute;
        bottom: 4px;
        right: 32px;
      }
      .vh-fotter_result-btn {
        width: 100%;
        overflow: hidden;
        .fr {
          float: right;
        }
      }
    }
  }
</style>
