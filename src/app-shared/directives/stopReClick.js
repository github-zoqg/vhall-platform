/**
 * @description 利用css样式组织重复提交
 */
export const stopReClick = {
  name: 'stopReClick',
  option: {
    inserted: function (el, binding) {
      el.addEventListener('click', () => {
        const originStyle = el.style['pointer-events'];
        if (el.style['pointer-events'] !== 'none') {
          el.style['pointer-events'] = 'none';
          setTimeout(() => {
            el.style['pointer-events'] = originStyle;
          }, binding.value || 3000);
        }
      });
    }
  }
};
