// 限制按钮重复点击
export const preventReClick = {
  name: 'preventReClick',
  option: {
    inserted: function (el, binding) {
      el.addEventListener('click', () => {
        if (!el.disabled) {
          el.disabled = true;
          setTimeout(() => {
            el.disabled = false;
          }, binding.value || 3000);
        }
      });
    }
  }
};
