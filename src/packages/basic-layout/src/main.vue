<template>
  <!-- 基础布局 -->
  <div class="vmp-basic-layout">
    <div class="vmp-basic-hd">
      <slot name="vmp-header"></slot>
    </div>
    <div class="vmp-basic-bd">
      <!-- 左侧容器 -->
      <div class="vmp-basic-left" id="leftAside"></div>
      <!-- 中间区域 -->
      <div class="vmp-basic-center">
        <slot name="vmp-center"></slot>
      </div>

      <!-- 右侧区域 -->
      <div class="vmp-basic-right">
        <div class="vmp-basic-right__hd">
          <slot name="vmp-right-hd"></slot>
        </div>
        <div class="vmp-basic-right__bd">
          <slot name="vmp-right-bd"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'VmpBasicLayout',

    componentName: 'VmpBasicLayout',

    props: {
      width: {
        type: String,
        default: '300px'
      }
    }
  };
</script>
