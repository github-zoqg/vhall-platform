<template>
  <div class="vmp-download-wrap">
    <div class="vmp-download-chrome">
      <img src="../assets/images/chome_update.png" alt="" />
      <div class="vmp-download__right-donwload">
        <p>请使用Chrome浏览器74以上版本或使用Safari浏览器13.0.4以上版本</p>
        <a
          href="https://static01-class.e.vhall.com/vhallclass/browser/81.0.4044.92_chrome_installer.zip"
        >
          点击下载
        </a>
      </div>
    </div>
  </div>
</template>
<script>
  export default {};
</script>
<style lang="less">
  .vmp-download-wrap {
    height: 100%;
    width: 100%;
    position: relative;
    .vmp-download-chrome {
      display: inline-block;
      vertical-align: middle;
      margin: auto;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -370px;
      margin-top: -78px;
      width: 740px;
      height: 156px;
      img {
        width: 156px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 27px;
      }
      .vmp-download__right-donwload {
        display: inline-block;
        vertical-align: middle;
        p {
          font-size: 21px;
          color: #444;
          width: 539px;
        }
        a {
          width: 120px;
          height: 40px;
          display: block;
          background-color: #fb3a32;
          border-radius: 4px;
          text-decoration: none;
          color: #ffffff;
          font-size: 16px;
          line-height: 40px;
          text-align: center;
          cursor: pointer;
          margin-top: 12px;
        }
      }
    }
  }
</style>
