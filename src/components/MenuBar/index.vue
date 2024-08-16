<template>
  <div class="el-tiptap-editor__menu-bar">
    <component
      v-for="(spec, i) in generateCommandButtonComponentSpecs()"
      :key="'command-button' + i"
      :is="spec.component"
      :enable-tooltip="enableTooltip"
      v-bind="spec.componentProps"
      :readonly="isCodeViewMode"
      v-on="spec.componentEvents || {}"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onUnmounted } from 'vue';
import { Editor } from '@tiptap/core';

export default defineComponent({
  name: 'Menubar',
  props: {
    editor: {
      type: Editor,
      required: true,
    },
  },

  setup() {
    const t = inject('t');
    const enableTooltip = inject('enableTooltip', true);
    const isCodeViewMode = inject('isCodeViewMode', false);

    // 监听路由切换或者组件卸载，确保清理状态
    onUnmounted(() => {
      // 如果有全局事件监听器或其他状态，需要在此清理
      console.log('Menubar component has been unmounted');
    });

    return { t, enableTooltip, isCodeViewMode };
  },

  methods: {
    generateCommandButtonComponentSpecs() {
      const extensionManager = this.editor.extensionManager;
      return extensionManager.extensions.reduce((acc, extension) => {
        const { button } = extension.options;
        if (!button || typeof button !== 'function') return acc;

        const menuBtnComponentSpec = button({
          editor: this.editor,
          t: this.t,
          extension,
        });

        if (Array.isArray(menuBtnComponentSpec)) {
          return [...acc, ...menuBtnComponentSpec];
        }

        return [...acc, menuBtnComponentSpec];
      }, []);
    },
  },
});
</script>
