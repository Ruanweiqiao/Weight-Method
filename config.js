/**
 * API配置文件
 * 注意: 在生产环境中，API密钥应当存储在安全的环境变量或后端服务中
 */

export const API_CONFIG = {
  // 控制是否使用LLM服务
  USE_LLM: true,  // 设置为false可以使用本地模拟数据而不调用API
  
  // Deepseek API配置
  API_KEY: "sk-18397678caa64a7780a0aaf8750711e7",
  API_URL: "https://api.deepseek.com/v1/chat/completions", // Deepseek API 端点
  MODEL: "deepseek-chat", // Deepseek 的模型名称
  
  // 调用参数
  TEMPERATURE: 0.1,
  MAX_TOKENS: 2000
};

// 提示：在实际部署时，请不要将API密钥直接硬编码在前端代码中
// 建议创建一个简单的后端服务来处理API调用，或使用环境变量和安全的服务来存储密钥 