<template>
  <div class="vmp-notfound">
    <div class="left-section">
      <div class="inner-content">
        <h1 class="heading">404</h1>
        <p class="subheading">{{ $t('message.message_1013') }}</p>
        <p class="headingNotice">
          无法访问本页的原因：
          <br />
          服务器过热导致网站可能出现故障！
          <br />
          所访问的页面不存在或者已被管理员删除！
          <br />
        </p>
        <p class="index-btn">
          <router-link to="/">
            <button type="button" class="el-button el-button--primary is-round">
              <span>返回首页</span>
            </button>
          </router-link>
        </p>
      </div>
    </div>
    <div class="right-section">
      <img src="@/app-shared/assets/img/404.svg" alt="" class="svgImg" />
    </div>
  </div>
</template>
<style lang="less">
  .vmp-notfound {
    min-width: 700px;
    position: relative;
    margin: 0 auto;
    width: 52%;
    height: 100vh;
    display: flex;
    flex-direction: row;
    justify-content: space-around;

    .left-section {
      width: 40%;
      .inner-content {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);

        .heading {
          font-size: 80px;
          font-weight: 600;
          line-height: 112px;
        }
        .subheading {
          height: 22px;
          font-size: 16px;
          color: #1a1a1a;
        }
        .headingNotice {
          margin-top: 16px;
          width: 266px;
          font-size: 14px;
          color: #999;
        }
        .index-btn {
          margin-top: 32px;
          text-align: left;
        }
      }
    }
    .right-section {
      width: 50%;
      .svgImg {
        position: absolute;
        top: 25%;
        max-width: 100%;
        max-height: 100%;
      }
    }
  }
</style>
