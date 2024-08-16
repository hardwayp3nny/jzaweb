<template>
  <a-layout style="min-height: 100vh; padding: 24px">
    <a-layout-content>
      <a-typography-title level="2">Processor Rewards</a-typography-title>
      <a-table :dataSource="data" :columns="columns" rowKey="name" style="margin-bottom: 24px" />

      <a-card title="ROI 计算器" style="margin-top: 24px">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="8">
            <a-select
              style="width: 100%"
              placeholder="选择处理器"
              v-model:value="selectedProcessor"
              @change="handleProcessorChange"
            >
              <a-select-option v-for="processor in data" :key="processor.name" :value="processor.name">
                {{ processor.name }}
              </a-select-option>
            </a-select>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-input-number
              style="width: 100%"
              placeholder="输入购买价格 (RMB)"
              v-model:value="purchasePrice"
            />
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-button type="primary" @click="calculateRoi" block>计算 ROI</a-button>
          </a-col>
        </a-row>
      </a-card>

      <a-card v-if="selectedProcessorData" title="处理器详情" style="margin-top: 24px">
        <p>处理器名称: {{ selectedProcessorData.name }}</p>
        <p>IO 奖励: {{ selectedProcessorData.reward.toFixed(6) }}</p>
        <p>USDT 奖励: {{ (selectedProcessorData.reward * selectedProcessorData.ioPrice).toFixed(2) }}</p>
        <p>CNY 奖励: {{ (selectedProcessorData.reward * selectedProcessorData.ioPrice * selectedProcessorData.usdCnyRate).toFixed(2) }}</p>
        <p v-if="estimatedRoi !== null">预计回本周期: {{ estimatedRoi }} 天</p>
      </a-card>

      <a-spin v-if="loading" size="large" tip="Loading..." />
      <a-alert v-else-if="error" message="Error" :description="error" type="error" showIcon />
    </a-layout-content>
  </a-layout>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Table, Typography, Spin, Alert, InputNumber, Select, Button, Card, Row, Col } from 'ant-design-vue';

export default {
  name: 'ProcessorRewardsPage',
  components: {
    'a-table': Table,
    'a-typography-title': Typography.Title,
    'a-spin': Spin,
    'a-alert': Alert,
    'a-input-number': InputNumber,
    'a-select': Select,
    'a-select-option': Select.Option,
    'a-button': Button,
    'a-card': Card,
    'a-row': Row,
    'a-col': Col,
  },
  setup() {
    const data = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const selectedProcessor = ref(null);
    const selectedProcessorData = ref(null);
    const purchasePrice = ref(null);
    const estimatedRoi = ref(null);

    const columns = [
      {
        title: 'Processor Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'IO Reward',
        dataIndex: 'reward',
        key: 'reward',
        render: (reward) => reward.toFixed(6),
      },
      {
        title: 'USDT Reward',
        dataIndex: 'usdtReward',
        key: 'usdtReward',
        customRender: ({record}) => (record.reward * record.ioPrice).toFixed(2),
      },
      {
        title: 'CNY Reward',
        dataIndex: 'cnyReward',
        key: 'cnyReward',
        customRender: ({record}) => (record.reward * record.ioPrice * record.usdCnyRate).toFixed(2),
      },
    ];

    const fetchData = async () => {
      try {
        const response = await axios.get('https://my-worker.abcdjza.workers.dev/data/processor-data');
        const {ioPrice, usdCnyRate, processorData} = response.data;
        const latestData = processorData[processorData.length - 1].processors.map((processor) => ({
          ...processor,
          ioPrice,
          usdCnyRate,
        }));
        data.value = latestData;
      } catch (err) {
        console.error('Error fetching data:', err);
        error.value = err.response ? err.response.data : 'Error fetching data';
      } finally {
        loading.value = false;
      }
    };

    const handleProcessorChange = (value) => {
      selectedProcessor.value = value;
      selectedProcessorData.value = data.value.find((p) => p.name === value);
      estimatedRoi.value = null; // 重置 Estimated ROI
    };

    const calculateRoi = () => {
      if (!selectedProcessor.value || !purchasePrice.value) {
        alert('请选择处理器并输入购买价格');
        return;
      }

      if (!selectedProcessorData.value) {
        alert('未找到所选处理器');
        return;
      }

      const cnyReward = selectedProcessorData.value.reward * selectedProcessorData.value.ioPrice * selectedProcessorData.value.usdCnyRate;

      // 计算 Estimated ROI (天数)
      const estimatedRoiValue = (purchasePrice.value / (cnyReward * 24)).toFixed(2);
      estimatedRoi.value = estimatedRoiValue;
    };

    onMounted(fetchData);

    return {
      data,
      loading,
      error,
      selectedProcessor,
      selectedProcessorData,
      purchasePrice,
      estimatedRoi,
      columns,
      calculateRoi,
      handleProcessorChange,
    };
  },
};
</script>

<style scoped>
@import '../assets/styles.css';

.a-layout-content {
  background: #fff;
  padding: 24px;
  margin: 0;
  min-height: 280px;
}
</style>
