<template>
  <el-popover
    :disabled="isCodeViewMode"
    placement="bottom"
    trigger="click"
    popper-class="el-tiptap-popper"
    ref="popoverRef"
  >
    <div class="el-tiptap-popper__menu">
      <!-- 菜单项 -->
      <div class="el-tiptap-popper__menu__item">
        <create-table-popover @createTable="createTable" />
      </div>

      <div class="el-tiptap-popper__menu__item__separator" />

      <!-- 其他菜单项 -->
      <div
        :class="{ 'el-tiptap-popper__menu__item--disabled': !isTableActive }"
        class="el-tiptap-popper__menu__item"
        @mousedown="hidePopover"
        @click="editor.commands.addColumnBefore"
      >
        <span>{{ t('editor.extensions.Table.buttons.add_column_before') }}</span>
      </div>

      <!-- 更多菜单项... -->
    </div>

    <template #reference>
      <span>
        <command-button
          :is-active="isTableActive"
          :enable-tooltip="enableTooltip"
          :tooltip="t('editor.extensions.Table.tooltip')"
          :readonly="isCodeViewMode"
          icon="table"
        />
      </span>
    </template>
  </el-popover>
</template>

<script lang="ts">
import { defineComponent, inject, ref, unref, onUnmounted } from 'vue';
import { Editor } from '@tiptap/vue-3';
import { ElPopover } from 'element-plus';
import {
  isTableActive,
  enableMergeCells,
  enableSplitCell,
} from '@/utils/table';
import CommandButton from '../CommandButton.vue';
import CreateTablePopover from './CreateTablePopover.vue';

export default defineComponent({
  name: 'TablePopover',

  components: {
    ElPopover,
    CommandButton,
    CreateTablePopover,
  },

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

    const popoverRef = ref();

    const hidePopover = () => {
      const popoverInstance = unref(popoverRef);
      if (popoverInstance) {
        popoverInstance.hide();
      }
    };

    // 在组件卸载时隐藏 Popover
    onUnmounted(() => {
      hidePopover();
    });

    return { t, enableTooltip, isCodeViewMode, popoverRef, hidePopover };
  },

  computed: {
    isTableActive() {
      return isTableActive(this.editor.state);
    },

    enableMergeCells() {
      return enableMergeCells(this.editor.state);
    },

    enableSplitCell() {
      return enableSplitCell(this.editor.state);
    },
  },

  methods: {
    createTable({ row, col }: { row: number; col: number }): void {
      this.editor.commands.insertTable({
        rows: row,
        cols: col,
        withHeaderRow: true,
      });

      this.hidePopover();
    },
  },
});
</script>
