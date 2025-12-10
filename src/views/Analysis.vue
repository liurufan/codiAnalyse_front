<template>
  <div class="analysis-page">
    <div class="container">
      <!-- 头部 -->
      <div class="header">
        <div class="header-content">
          <h1 class="page-title">软件供应链安全分析</h1>
          <p class="page-subtitle">上传源代码文件，进行全面的安全分析</p>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧：上传区域 -->
        <div class="upload-section">
          <div class="upload-card">
            <div class="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="upload-title">上传源代码</h3>
            <p class="upload-desc">支持 ZIP 格式压缩包</p>
            
            <div class="upload-area" 
                 :class="{ 'is-dragover': isDragOver, 'has-file': selectedFile }"
                 @drop="handleDrop"
                 @dragover.prevent="isDragOver = true"
                 @dragleave="isDragOver = false"
                 @click="triggerFileInput">
              <input 
                ref="fileInput"
                type="file" 
                accept=".zip"
                @change="handleFileSelect"
                style="display: none"
              />
              <div v-if="!selectedFile" class="upload-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p class="upload-text">点击或拖拽文件到此处</p>
                <p class="upload-hint">支持 ZIP 格式</p>
              </div>
              <div v-else class="file-info">
                <div class="file-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="file-details">
                  <p class="file-name">{{ selectedFile.name }}</p>
                  <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <button class="remove-file-btn" @click.stop="removeFile">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <button 
              class="analyze-btn" 
              :disabled="!selectedFile || isAnalyzing"
              @click="startAnalysis">
              <span v-if="!isAnalyzing">开始分析</span>
              <span v-else class="analyzing-text">
                <span class="spinner"></span>
                分析中...
              </span>
            </button>
          </div>
        </div>

        <!-- 右侧：进度和结果区域 -->
        <div class="results-section">
          <!-- 进度条 -->
          <div class="progress-card" v-if="isAnalyzing || analysisComplete">
            <h3 class="section-title">分析进度</h3>
            <div class="progress-steps">
              <div 
                v-for="(step, index) in analysisSteps" 
                :key="index"
                class="progress-step"
                :class="{
                  'is-completed': step.status === 'completed',
                  'is-active': step.status === 'active',
                  'is-pending': step.status === 'pending'
                }">
                <div class="step-indicator">
                  <div class="step-icon" v-if="step.status === 'completed'">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="step-icon" v-else-if="step.status === 'active'">
                    <div class="step-spinner"></div>
                  </div>
                  <div class="step-number" v-else>{{ index + 1 }}</div>
                </div>
                <div class="step-content">
                  <p class="step-name">{{ step.name }}</p>
                  <p class="step-desc">{{ step.description }}</p>
                </div>
                <div class="step-connector" v-if="index < analysisSteps.length - 1"></div>
              </div>
            </div>
          </div>

          <!-- 输出结果 -->
          <div class="output-card" v-if="outputs.length > 0">
            <h3 class="section-title">分析结果</h3>
            <div class="output-list">
              <div 
                v-for="(output, index) in outputs" 
                :key="index"
                class="output-item">
                <div class="output-header">
                  <div class="output-step-info">
                    <span class="output-step-name">{{ output.stepName }}</span>
                    <span class="output-time">{{ output.timestamp }}</span>
                  </div>
                  <button 
                    class="expand-btn"
                    @click="toggleOutput(index)">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      :class="{ 'expanded': expandedOutputs[index] }">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div 
                  class="output-content"
                  :class="{ 'is-expanded': expandedOutputs[index] }"
                  v-if="expandedOutputs[index]">
                  <pre class="json-output">{{ formatJSON(output.data) }}</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div class="empty-state" v-if="!isAnalyzing && !analysisComplete">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="empty-text">上传文件并开始分析</p>
            <p class="empty-hint">分析结果将显示在这里</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const isAnalyzing = ref(false)
const analysisComplete = ref(false)
const expandedOutputs = ref<Record<number, boolean>>({})

interface AnalysisStep {
  name: string
  description: string
  status: 'pending' | 'active' | 'completed'
}

interface Output {
  stepName: string
  timestamp: string
  data: any
}

const analysisSteps = ref<AnalysisStep[]>([
  { name: '文件解析', description: '正在解析上传的文件...', status: 'pending' },
  { name: '依赖分析', description: '分析项目依赖关系...', status: 'pending' },
  { name: '漏洞扫描', description: '扫描已知安全漏洞...', status: 'pending' },
  { name: '许可证检查', description: '检查开源许可证合规性...', status: 'pending' },
  { name: '风险评估', description: '生成综合风险评估报告...', status: 'pending' }
])

const outputs = ref<Output[]>([])

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0]
    if (file.name.endsWith('.zip')) {
      selectedFile.value = file
    }
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatJSON = (data: any): string => {
  return JSON.stringify(data, null, 2)
}

const toggleOutput = (index: number) => {
  expandedOutputs.value[index] = !expandedOutputs.value[index]
}

const startAnalysis = async () => {
  if (!selectedFile.value) return

  isAnalyzing.value = true
  analysisComplete.value = false
  outputs.value = []
  expandedOutputs.value = {}

  // 重置所有步骤状态
  analysisSteps.value.forEach(step => {
    step.status = 'pending'
  })

  // 模拟分析过程
  for (let i = 0; i < analysisSteps.value.length; i++) {
    // 激活当前步骤
    analysisSteps.value[i].status = 'active'
    
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 完成当前步骤
    analysisSteps.value[i].status = 'completed'
    
    // 生成输出结果
    const output: Output = {
      stepName: analysisSteps.value[i].name,
      timestamp: new Date().toLocaleTimeString('zh-CN'),
      data: {
        step: analysisSteps.value[i].name,
        status: 'completed',
        findings: Math.floor(Math.random() * 10) + 1,
        details: {
          processed: Math.floor(Math.random() * 100) + 50,
          issues: Math.floor(Math.random() * 5),
          warnings: Math.floor(Math.random() * 3)
        }
      }
    }
    
    outputs.value.push(output)
    expandedOutputs.value[outputs.value.length - 1] = false
  }

  isAnalyzing.value = false
  analysisComplete.value = true
}
</script>

<style scoped>
.analysis-page {
  min-height: 100vh;
  background: #0a0a0a;
  color: #e5e5e5;
  padding: 24px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 32px;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
}

.page-subtitle {
  font-size: 1rem;
  color: #9ca3af;
  margin: 0;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.upload-section,
.results-section {
  display: flex;
  flex-direction: column;
}

.upload-card {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
}

.upload-icon {
  color: #667eea;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.upload-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.upload-desc {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0 0 24px 0;
}

.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 48px 24px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 24px;
  background: #0f0f0f;
}

.upload-area:hover {
  border-color: #667eea;
  background: #151515;
}

.upload-area.is-dragover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.upload-area.has-file {
  border-color: #4ade80;
  border-style: solid;
  padding: 24px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #6b7280;
}

.upload-text {
  font-size: 1rem;
  font-weight: 500;
  color: #e5e5e5;
  margin: 0;
}

.upload-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.file-icon {
  color: #667eea;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 4px 0;
  word-break: break-all;
}

.file-size {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.remove-file-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #e5e5e5;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.analyze-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.analyze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.analyzing-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-card,
.output-card {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 24px 0;
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.progress-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  padding-bottom: 24px;
}

.progress-step:last-child {
  padding-bottom: 0;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.progress-step.is-pending .step-indicator {
  background: #2a2a2a;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #6b7280;
}

.progress-step.is-active .step-indicator {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #667eea;
  color: #ffffff;
}

.progress-step.is-completed .step-indicator {
  background: #10b981;
  border: 2px solid #10b981;
  color: #ffffff;
}

.step-number {
  font-size: 0.875rem;
  font-weight: 600;
}

.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.step-content {
  flex: 1;
}

.step-name {
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.progress-step.is-pending .step-name {
  color: #6b7280;
}

.step-desc {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.step-connector {
  position: absolute;
  left: 15px;
  top: 32px;
  width: 2px;
  height: calc(100% - 16px);
  background: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.progress-step.is-completed + .progress-step .step-connector {
  background: linear-gradient(to bottom, #10b981, rgba(255, 255, 255, 0.1));
}

.output-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.output-item {
  background: #0f0f0f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.output-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.output-step-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.output-step-name {
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff;
}

.output-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.expand-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s;
}

.expand-btn:hover {
  color: #ffffff;
}

.expand-btn svg {
  transition: transform 0.2s;
}

.expand-btn svg.expanded {
  transform: rotate(180deg);
}

.output-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s;
}

.output-content.is-expanded {
  max-height: 500px;
}

.json-output {
  margin: 0;
  padding: 16px;
  background: #0a0a0a;
  color: #e5e5e5;
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-x: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  color: #6b7280;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 500;
  color: #9ca3af;
  margin: 24px 0 8px 0;
}

.empty-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}
</style>

