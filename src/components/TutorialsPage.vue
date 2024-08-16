<template>
  <div class="page-container">
    <aside class="sidebar">
      <h2>文章列表</h2>
      <div v-if="orderedKeys.length > 0">
        <div v-for="key in orderedKeys" :key="key" class="draggable-item">
          <a @click="selectArticle(key)" class="article-link">{{ allContents[key]?.title || 'Untitled' }}</a>
        </div>
      </div>
    </aside>

    <div class="content-container">
      <main class="content-area" v-if="selectedArticle">
        <div v-html="selectedArticle.content"></div>
      </main>
      <aside class="right-sidebar">
        <h3>文章导航</h3>
        <div v-if="headers.length === 0">
          <p>没有检测到标题。</p>
        </div>
        <ul>
          <li v-for="header in headers" :key="header.id" :class="{ active: activeHeader === header.id }">
            <a @click="scrollToHeader(header.id)" class="header-link">{{ header.text }}</a>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const allContents = ref({});  // 用于存储文章内容
const orderedKeys = ref([]);  // 用于存储文章的键顺序
const selectedArticle = ref(null);  // 当前选中的文章
const headers = ref([]);  // 用于存储文章中的大标题
const activeHeader = ref(null);  // 用于存储当前激活的标题

onMounted(async () => {
  try {
    const response = await fetch('https://my-worker.abcdjza.workers.dev/list-contents');
    if (response.ok) {
      const data = await response.json();
      if (typeof data === 'object' && Object.keys(data).length > 0) {
        allContents.value = data;
        orderedKeys.value = Object.keys(data);
        if (orderedKeys.value.length > 0) {
          selectArticle(orderedKeys.value[0]);
        }
      }
    } else {
      console.error('Failed to fetch contents:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching contents:', error);
  }

  // 添加滚动监听器以更新活动标题
  window.addEventListener('scroll', onScroll);
});

function onScroll() {
  const headersWithOffsets = headers.value.map(header => {
    const element = document.getElementById(header.id);
    return { ...header, offsetTop: element?.offsetTop };
  });

  const currentScroll = window.scrollY + 100;  // 视情况调整这个值

  const currentHeader = headersWithOffsets.reverse().find(header => currentScroll >= header.offsetTop);

  if (currentHeader) {
    activeHeader.value = currentHeader.id;
  }
}

function convertLinksToImages(content) {
  const imageLinkRegex = /<a target="_blank" rel="noopener noreferrer nofollow" href="(https:\/\/rio-ai-lab\.notion\.site\/image\/https%3A%2F%2Fprod-files-secure\.s3\.us-west-2\.amazonaws\.com[^\s"]+\.png\?[^"]*cache=v2)">[^<]+<\/a>/g;
  return content.replace(imageLinkRegex, (match, url) => {
    return `<p><a target="_blank" rel="noopener noreferrer nofollow" href="${url}"><img src="${url}" alt="Image" style="max-width: 80%; height: auto; display: block; margin: 20px auto;" /></a></p>`;
  });
}

function extractHeaders(content) {
  // 匹配 <h1> 或 <h2> 标签中，以中文数字开头的标题，标题可以有 <strong> 标签包裹也可以没有
  const headerRegex = /<h[1-6]>(<strong>)?([一二三四五六七八九十]+、\s*[^\n<]*)(<\/strong>)?<\/h[1-6]>/g;
  const headersArray = [];
  let match;
  let id = 1;

  // 使用正则表达式匹配所有符合条件的标题
  while ((match = headerRegex.exec(content)) !== null) {
    headersArray.push({
      id: `header-${id++}`,
      text: match[2].trim()  // 提取标题文本，并去除多余的空格
    });
  }

  console.log("Extracted Headers: ", headersArray);  // 调试输出提取的标题
  return headersArray;
}

const selectArticle = (key) => {
  const article = allContents.value[key] || { title: "No Title", content: "No Content" };
  let processedContent = convertLinksToImages(article.content);

  // 提取标题并添加ID属性
  headers.value = extractHeaders(processedContent);
  headers.value.forEach(header => {
    // 在内容中的相应标题上添加ID
    processedContent = processedContent.replace(
      new RegExp(`<h[1-6]>(<strong>)?${header.text}(<\/strong>)?<\/h[1-6]>`, 'g'),
      `<h2 id="${header.id}">${header.text}</h2>`
    );
  });

  selectedArticle.value = {
    ...article,
    content: processedContent,
  };

  // 确保滚动监听器已到位
  setTimeout(() => {
    onScroll();
  }, 0);
};

const scrollToHeader = (headerId) => {
  const headerElement = document.getElementById(headerId);
  if (headerElement) {
    headerElement.scrollIntoView({ behavior: 'smooth' });
  } else {
    console.error('Header element not found for ID:', headerId);
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  height: 100vh;
  width: 100%; /* 占满整个页面 */
  overflow-y: auto; /* 将滚动条放到最外层 */
}

.sidebar {
  width: 300px; /* 增加宽度 */
  background-color: #f5f5f5;
  padding: 30px; /* 增加内边距 */
  overflow-y: auto;
  border-right: 1px solid #ddd;
  font-size: 18px; /* 增加字体大小 */
}

.content-container {
  display: flex;
  flex: 1;
}

.content-area {
  flex: 1;
  padding: 20px;
  margin-right: 250px; /* 调整此处为右侧边栏留出空间 */
  font-size: 23px;
  line-height: 1.5;
}

.right-sidebar {
  width: 250px; /* 增加宽度 */
  background-color: #f9f9f9;
  padding: 25px; /* 增加内边距 */
  border-left: 1px solid #ddd;
  position: fixed; /* 固定右侧边栏位置 */
  right: 20px; /* 将右侧边栏向左移动 */
  top: 50%;
  transform: translateY(-50%); /* 使右侧边栏居中 */
  font-size: 18px; /* 增加字体大小 */
}

.right-sidebar h3 {
  margin-top: 0;
}

.right-sidebar ul {
  list-style-type: none;
  padding: 0;
}

.right-sidebar li {
  margin-bottom: 15px; /* 增加列表项之间的间距 */
  position: relative; /* 使伪元素（分割线）相对于li定位 */
}

.right-sidebar li::before {
  content: '';
  position: absolute;
  left: -15px; /* 调整分割线位置 */
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: transparent; /* 默认透明 */
  transition: background-color 0.3s ease;
}

.right-sidebar li.active::before {
  background-color: #1e90ff; /* 激活时的颜色 */
}

.header-link {
  color: #409EFF;
  text-decoration: none;
  cursor: pointer;
}

.header-link:hover {
  text-decoration: underline;
}

.draggable-item {
  margin-bottom: 15px; /* 增加每个项目的间距 */
  padding: 15px; /* 增加内边距 */
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.article-link {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

.article-link:hover {
  color: #409EFF;
}

/* 高亮当前激活的标题链接 */
.active .header-link {
  color: #1e90ff;
  font-weight: bold;
  border-left: 4px solid #1e90ff;
  padding-left: 8px;
}
</style>
