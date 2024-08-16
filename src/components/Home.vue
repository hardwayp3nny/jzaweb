<template>
  <a-layout style="min-height: 100vh; padding: 0 24px">
    <a-layout-content>
      <div style="text-align: center; margin: 20px">
        <a-typography-title level="1">Welcome to Our Platform</a-typography-title>
        <a-typography-paragraph>
          Explore the latest processor rewards and performance data.
        </a-typography-paragraph>
        <div>
          <a-button type="primary" style="margin: 10px">
            <router-link to="/processor-rewards">View Processor Rewards</router-link>
          </a-button>
          <a-button type="primary" style="margin: 10px">
            <router-link to="/tutorials">Our Tutorials</router-link>
          </a-button>
        </div>
        <a-card title="Processor Reward Chart" style="margin-top: 20px">
          <a-tabs :activeKey="selectedProcessor" @change="setSelectedProcessor">
            <a-tab-pane v-for="name in processorNames" :key="name" :tab="name">
              <Line :data="generateChartData()" :options="chartOptions" />
            </a-tab-pane>
          </a-tabs>
        </a-card>
        <a-spin v-if="loading" tip="Loading..." />
        <a-alert v-else-if="error" :message="error.message" type="error" />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';  // 引入日期适配器
import { Button, Card, Tabs, Typography, Spin, Alert, Layout } from 'ant-design-vue';
import axios from 'axios';

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend, Filler);

export default {
  name: 'HomePage',
  components: {
    Line,
    'a-button': Button,
    'a-card': Card,
    'a-tabs': Tabs,
    'a-tab-pane': Tabs.TabPane,
    'a-typography-title': Typography.Title,
    'a-typography-paragraph': Typography.Paragraph,
    'a-spin': Spin,
    'a-alert': Alert,
    'a-layout': Layout,
    'a-layout-content': Layout.Content,
  },
  setup() {
    const data = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const selectedProcessor = ref(null);

    const fetchData = async () => {
      try {
        const response = await axios.get('https://my-worker.abcdjza.workers.dev/data/processor-data', {timeout: 5000});
        console.log('API response:', response.data);
        data.value = response.data;
        if (response.data.processorData && response.data.processorData.length > 0) {
          selectedProcessor.value = response.data.processorData[0].processors[0].name;
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        error.value = err;
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchData);

    const processorNames = computed(() =>
        data.value ? Array.from(new Set(data.value.processorData.flatMap(item => item.processors.map(p => p.name)))) : []
    );

    const generateChartData = () => ({
      labels: data.value.processorData.map(item => new Date(item.datetime)),
      datasets: processorNames.value.map((name, index) => {
        const isSelected = selectedProcessor.value === name;
        const color = getRandomColor(index);
        return {
          label: name,
          data: data.value.processorData.map(item => {
            const processor = item.processors.find(p => p.name === name);
            return processor ? parseFloat(processor.reward) : null;
          }),
          borderColor: isSelected ? color : 'rgba(128, 128, 128, 0.5)',
          backgroundColor: isSelected ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.1)` : 'rgba(128, 128, 128, 0.1)',
          fill: isSelected ? 'start' : false,
          spanGaps: true,
          borderWidth: isSelected ? 3 : 1,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        };
      }),
    });

    const chartOptions = {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {unit: 'hour'},
          title: {display: true, text: 'Time'},
          grid: {display: false},
        },
        y: {
          title: {display: true, text: 'Reward IO/hour'},
          grid: {color: 'rgba(200, 200, 200, 0.3)'},
        },
      },
      plugins: {
        legend: {display: false},
        tooltip: {
          mode: 'index',
          intersect: false,
          filter: function (tooltipItem) {
            return tooltipItem.datasetIndex === processorNames.value.indexOf(selectedProcessor.value);
          },
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
            },
          },
        },
      },
      elements: {
        line: {tension: 0.4},
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: false,
      },
    };

    const setSelectedProcessor = (key) => {
      selectedProcessor.value = key;
    };

    return {
      data,
      loading,
      error,
      selectedProcessor,
      processorNames,
      generateChartData,
      chartOptions,
      setSelectedProcessor,
    };
  },
};

function getRandomColor(index) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  ];
  return colors[index % colors.length];
}
</script>

<style scoped>
@import '../assets/styles.css';

.chart-container {
  margin-top: 20px;
}
</style>
