<template>
  <div class="vmp-aside-menu">
    <component
      v-for="item of menus"
      :ref="el => (el, item)"
      :is="item.component"
      :key="item.id"
      :id="item.id"
      :class="[selectId === item.id ? 'selected' : '', item.disable ? 'disable' : '']"
      :options="item.options"
      v-on:click="handleClick($event, item)"
    ></component>
  </div>
</template>
<script>
  export default {
    name: 'VmpAsideMenu',
    data() {
      return {
        selectId: '',
        menus: []
      };
    },
    methods: {
      handleClick: function () {}
    }
  };
</script>
