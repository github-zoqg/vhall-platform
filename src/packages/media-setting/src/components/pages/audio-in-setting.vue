<template>
  <section>
    <main>
      <section>
        <el-select></el-select>
      </section>
      <section>
        <preview-audio></preview-audio>
      </section>
    </main>
    <footer>
      <section>
        <p>对着麦克风讲话，看不到音量条波动？</p>
        <p>试试以下方法：</p>
      </section>
      <p>1. 请允许浏览器使用麦克风权限</p>
      <p>2. 确认麦克风没有被其他程序占用</p>
      <p>3. 选择外置麦克风或者更换电脑</p>
    </footer>
  </section>
</template>

<script>
  import PreviewAudio from '../preview-audio.vue';
  export default {
    components: {
      PreviewAudio
    }
  };
</script>

<style></style>
