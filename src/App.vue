<template>
  <a-layout style="min-height: 100vh">
    <!-- Top Navigation Bar -->
    <a-layout-header style="background: #001529; padding: 0 16px; display: flex; justify-content: space-between; align-items: center;">
      <div class="logo">
        <h1 style="color: white; margin: 0;">IO.net</h1>
      </div>
      <a-menu theme="dark" mode="horizontal" :selectedKeys="[currentRoute]" style="flex: 1; margin-left: 16px;">
        <a-menu-item key="/">
          <router-link to="/">Home</router-link>
        </a-menu-item>
        <a-menu-item key="/processor-rewards">
          <router-link to="/processor-rewards">Processor Rewards</router-link>
        </a-menu-item>
        <a-menu-item key="/tutorials">
          <router-link to="/tutorials">TutorialsPage</router-link>
        </a-menu-item>
        <a-menu-item key="/texteditor">
          <router-link to="/texteditor">TextEditor</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content style="padding: 24px; margin-top: 16px;">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </a-layout-content>
  </a-layout>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Layout, Menu } from 'ant-design-vue';

export default defineComponent({
  components: {
    ALayout: Layout,
    ALayoutContent: Layout.Content,
    ALayoutHeader: Layout.Header,
    AMenu: Menu,
    AMenuItem: Menu.Item,
  },
  setup() {
    const route = useRoute();
    const currentRoute = ref(route.path);

    watch(() => route.path, (newPath) => {
      currentRoute.value = newPath;
    });

    return {
      currentRoute,
    };
  },
});
</script>

<style scoped>
.logo h1 {
  color: white;
  font-size: 24px;
  margin: 0;
}

.ant-layout-header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.ant-menu-item {
  margin: 0 16px;
}

.ant-menu-item a {
  color: white;
  font-weight: 500;
}

.ant-menu-item a:hover {
  color: #40a9ff;
}

.ant-menu-item-selected a {
  color: #1890ff;
  font-weight: bold;
}
</style>
