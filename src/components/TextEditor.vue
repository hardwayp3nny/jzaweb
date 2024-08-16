<template>
  <div class="el-tiptap-editor__wrapper">
    <div
      class="title-container"
      contenteditable="true"
      @input="updateTitle"
      :text-content="title"
      placeholder="请输入文章标题"
    ></div>
    <el-tiptap
      :extensions="extensions"
      v-model:content="content"
      placeholder="Write something ..."
      class="content-editor"
    />
    <el-button type="primary" @click="uploadContent">上传</el-button>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Document,
  Text,
  Paragraph,
  Heading,
  Bold,
  Underline,
  Italic,
  Strike,
  Code,
  Link,
  Image,
  Blockquote,
  BulletList,
  OrderedList,
  TaskList,
  TextAlign,
  Indent,
  HardBreak,
  HorizontalRule,
  CodeView,
  Fullscreen,
  History,
} from 'element-tiptap';
import codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/closetag.js';

const extensions = [
  Document,
  Text,
  Paragraph,
  Heading.configure({level: 5}),
  Bold.configure({bubble: true}),
  Underline.configure({bubble: true}),
  Italic.configure({bubble: true}),
  Strike.configure({bubble: true}),
  Code,
  Link.configure({bubble: true}),
  Image,
  Blockquote,
  TextAlign,
  BulletList.configure({bubble: true}),
  OrderedList.configure({bubble: true}),
  TaskList,
  Indent,
  HardBreak,
  HorizontalRule.configure({bubble: true}),
  CodeView.configure({
    codemirror,
    codemirrorOptions: {
      styleActiveLine: true,
      autoCloseTags: true,
    },
  }),
  Fullscreen,
  History,
];

const title = ref('');  // 新增标题
const content = ref('<p>请输入文字...</p>'); // 初始内容
const router = useRouter(); // 使用 vue-router 进行导航

const updateTitle = (event) => {
  title.value = event.target.innerText; // 更新标题内容
};

const uploadContent = async () => {
  try {
    const key = `article-${Date.now()}`; // 使用当前时间戳生成唯一键名

    // 发送POST请求，将标题和内容上传到Cloudflare KV
    const response = await fetch('https://my-worker.abcdjza.workers.dev/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({title: title.value, content: content.value, key}),
    });

    if (response.ok) {
      ElMessage.success('上传成功'); // 显示上传成功的提示

      // 跳转到 TutorialsPage
      router.push({
        name: 'TutorialsPage',
      });
    } else {
      ElMessage.error('上传失败'); // 显示上传失败的提示
    }
  } catch (error) {
    console.error('Error during upload:', error); // 打印错误日志
    ElMessage.error('上传失败'); // 显示上传失败的提示
  }
};
</script>
<style scoped>
.el-tiptap-editor__wrapper {
  padding-top: 20px; /* 调整编辑器的上边距 */
  margin-bottom: 20px;
  position: relative;
}

.title-container {
  min-height: 40px; /* 设置标题容器的最小高度 */
  margin-bottom: 20px; /* 确保标题和编辑器之间有足够的间距 */
  border: 1px solid #dcdfe6; /* 设置边框 */
  padding: 10px; /* 内边距 */
  font-size: 16px; /* 字体大小 */
  font-weight: bold; /* 字体加粗 */
  background: #f5f7fa; /* 背景颜色 */
  overflow: auto; /* 处理内容溢出 */
  white-space: pre-wrap; /* 保持换行 */
}

.title-container:empty:before {
  content: attr(placeholder); /* 在空内容时显示提示文本 */
  color: #c0c4cc; /* 提示文本颜色 */
}

.content-editor {
  min-height: 300px; /* 设置编辑器的最小高度 */
  margin-bottom: 20px; /* 确保编辑器和标题之间有足够的间距 */
}
</style>