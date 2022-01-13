<template>
  <section>
    <main>
      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">画质选择</label>
        <el-select class="vmp-media-setting-item__content"></el-select>
      </section>

      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">桌面共享</label>
        <el-select class="vmp-media-setting-item__content"></el-select>
      </section>

      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">观看端布局(视频)</label>
        <section class="vmp-media-setting-item__content"></section>
      </section>
    </main>

    <footer>
      <section>提示：</section>
      <section class="vmp-media-setting-tips">
        <p>1.PPT静态演示：适用于桌面共享时演示文档、图片等静态内容</p>
        <p>2.视频动态演示：适用于演示视频等多动画内容</p>
        <p>3. 直播中不可更改桌面共享类型</p>
      </section>
    </footer>
  </section>
</template>

<script>
  export default {};
</script>

<style></style>
