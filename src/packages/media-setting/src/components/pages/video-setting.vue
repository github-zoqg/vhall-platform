<template>
  <section class="vmp-media-setting-video">
    <main>
      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">摄像头</label>
        <section class="vmp-media-setting-item__content">
          <el-radio-group v-model="selectedVideoType" @change="onVideoTypeChange">
            <el-radio label="camera">摄像头</el-radio>
            <el-radio label="picture">图片</el-radio>
          </el-radio-group>
        </section>
      </section>

      <section v-if="selectedVideoType === 'camera'" class="vmp-media-setting-item">
        <el-select class="vmp-media-setting-item__content"></el-select>
      </section>

      <section v-if="selectedVideoType === 'picture'">picture</section>
    </main>
    <footer v-show="selectedVideoType === 'camera'">
      <section>看不到摄像头画面？试试以下方法：</section>
      <p>1. 请允许浏览器使用摄像头权限</p>
      <p>2. 确认摄像头没有被其他程序占用</p>
      <p>3. 选择外置摄像头或者更换电脑</p>
    </footer>
  </section>
</template>

<script>
  export default {
    data() {
      return {
        selectedVideoType: 'camera'
      };
    },
    methods: {
      onVideoTypeChange(value) {
        this.selectedVideoType = value;
      }
    }
  };
</script>
