import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import ProcessorRewards from '../components/ProcessorRewards.vue';
import TutorialsPage from '../components/TutorialsPage.vue';
import TextEditor from '../components/TextEditor.vue';


const routes = [
  { path: '/', component: Home },
  { path: '/processor-rewards', component: ProcessorRewards },
  { path: '/tutorials', component: TutorialsPage, name: 'TutorialsPage'},
  { path: '/texteditor',component: TextEditor },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
