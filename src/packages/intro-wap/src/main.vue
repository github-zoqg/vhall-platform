<template>
  <section class="vmp-intro">
    <section class="vmp-intro-block">
      <header class="vmp-intro-block__headtitle">中台开发预留账号（互动直播）</header>
      <main class="vmp-intro-block__detail">
        <p>
          <i class="vh-iconfont vh-line-time" />
          开始时间 2022-01-12 18:55
        </p>
        <p>
          <i class="vh-iconfont vh-line-user"></i>
          在线人数
        </p>
      </main>
    </section>

    <section class="vmp-intro-block vmp-intro-block-content">
      <header class="vmp-intro-block__title">活动简介</header>
      <main v-html="introductionContent"></main>
    </section>

    <aside>
      <a
        class="vmp-intro-link"
        v-show="showCopyRight"
        href="https://www.vhall.com/saas"
        target="_blank"
      >
        微吼提供技术支持
      </a>
      <!-- 暂时借用dom -->
      <vmp-air-container :cuid="cuid"></vmp-air-container>
    </aside>
  </section>
</template>

<script>
  export default {
    name: 'VmpIntroWap',
    data() {
      return {
        showCopyRight: true
      };
    },
    computed: {
      introductionContent() {
        return '<p style="font-size:15px">test test test</p>';
      }
    }
  };
</script>

<style lang="less">
  .vmp-intro {
    font-size: 36px;
    background-color: #f2f2f2;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;

    .vmp-intro-block {
      padding: 0.4rem;
      background-color: #fff;

      &:not(:first-child) {
        margin-top: 20px;
      }

      &-content {
        flex: 1 1 auto;
      }

      &__headtitle {
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-all;
        font-weight: bold;
        line-height: 48px;
        color: @font-hover-low;
        .delay-icon {
          display: inline-block;
          width: 116px;
          height: 50px;
          vertical-align: bottom;
        }
      }

      &__title {
        font-weight: bold;
        font-size: 32px;
        line-height: 48px;
        color: @font-hover-low;
        display: flex;
        align-items: center;
        padding-left: 14px;
        position: relative;
        margin-bottom: 20px;

        &::before {
          content: '';
          position: absolute;
          left: 0px;
          width: 4px;
          height: 30px;
          background: @font-error;
        }
      }

      &__detail {
        p {
          i {
            margin-right: 8px;
          }

          height: 40px;
          font-size: 28px;
          font-family: PingFangSC;
          font-weight: 400;
          color: @bg-end-normal;
          line-height: 40px;
          margin-top: 15px;
          display: flex;
          align-items: center;
        }
      }
    }

    aside {
      flex: 0 0 auto;

      .vmp-intro-link {
        width: 100%;
        height: 100px;
        font-size: 28px;
        font-weight: 400;
        color: rgba(129, 129, 129, 1);
        line-height: 100px;
        text-align: center;
        display: block;
      }
    }
  }
</style>
