<template>
  <el-tooltip
    :content="tooltip"
    :show-after="350"
    :disabled="!enableTooltip || readonly"
    effect="dark"
    placement="top"
  >
    <div :class="commandButtonClass" @mousedown.prevent @click="onClick">
      <v-icon :name="icon" />
    </div>
  </el-tooltip>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ElTooltip } from 'element-plus';
import { noop } from '@/utils/shared';
import VIcon from '../Icon/Icon.vue';

export default defineComponent({
  components: {
    ElTooltip,
    VIcon,
  },
  props: {
    icon: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: String,
      required: true,
    },
    enableTooltip: {
      type: Boolean,
      required: true,
    },
    command: {
      type: Function,
      default: noop,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    commandButtonClass(): object {
      return {
        'el-tiptap-editor__command-button': true,
        'el-tiptap-editor__command-button--active': this.isActive,
        'el-tiptap-editor__command-button--readonly': this.readonly,
      };
    },
  },

  methods: {
    onClick() {
      if (!this.readonly) {
        try {
          this.command();
        } catch (error) {
          console.error('Command execution failed:', error);
        }
      }
    },
  },
});
</script>

<style scoped>
.el-tiptap-editor__command-button {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
}

.el-tiptap-editor__command-button--active {
  background-color: #409eff;
  color: #fff;
}

.el-tiptap-editor__command-button--readonly {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
