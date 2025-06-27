/**
 * LLM服务 - 负责调用Deepseek API
 * 
 * 文件结构:
 * 1. 导入和常量
 * 2. 工具函数
 * 3. 导出的独立函数
 * 4. LLMService 类
 *    - 基础API调用
 *    - 用户需求分析
 *    - 数据特征分析
 *    - 推荐方法流程
 *    - 三阶段推荐核心流程
 */

// =============== 1. 导入和常量 ===============
import { API_CONFIG } from './config.js';
import { 
  userNeedsAnalysisPrompt, 
  dataAnalysisPrompt, 
  methodRecommendationPrompt,
  ruleBasedMatchingPrompt,
  semanticAnalysisPrompt
} from './agent-prompts.js';

// 三阶段推荐流程的阶段名称常量
const RECOMMENDATION_STAGES = {
  RULE_MATCHING: 'RULE_MATCHING',
  SEMANTIC_ANALYSIS: 'SEMANTIC_ANALYSIS',
  FINAL_SCORING: 'FINAL_SCORING'
};

// 控制台输出颜色定义
const CONSOLE_COLORS = {
  STAGE: 'background: #4b0082; color: white; padding: 2px 5px; border-radius: 3px;',
  SUBSTAGE: 'background: #8a2be2; color: white; padding: 2px 5px; border-radius: 3px;',
  RESULT: 'background: #00008b; color: white; padding: 2px 5px; border-radius: 3px;',
  ERROR: 'background: #b22222; color: white; padding: 2px 5px; border-radius: 3px;',
};

// =============== 2. 工具函数 ===============

/**
 * 用于生成提示词时过滤掉权重方法的数学模型和计算示例
 * @param {Array} methods - 原始权重方法数组
 * @returns {Array} 过滤后的权重方法数组
 */
function filterMethodsForPrompt(methods) {
  console.log(`过滤${methods.length}个权重方法的数学模型和计算示例`);
  return methods.map(method => {
    // 创建方法的浅拷贝
    const filteredMethod = { ...method };
    
    // 删除数学模型和计算示例字段
    delete filteredMethod.mathematicalModel;
    delete filteredMethod.calculationExample;
    
    return filteredMethod;
  });
}

/**
 * 解析LLM响应中的JSON内容
 * @param {string} response - LLM的原始响应文本
 * @param {string} context - 解析上下文(用于日志)
 * @returns {Object} 解析出的JSON对象
 */
function parseJsonFromLLMResponse(response, context = '') {
  try {
    // 处理可能包含Markdown代码块的情况
    let jsonStr = response;
    if (response.includes('```json')) {
      jsonStr = response.split('```json')[1].split('```')[0].trim();
      console.log(`从Markdown JSON代码块中提取内容 (${context})`);
    } else if (response.includes('```')) {
      jsonStr = response.split('```')[1].split('```')[0].trim();
      console.log(`从Markdown代码块中提取内容 (${context})`);
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`%c解析LLM响应失败 (${context})`, CONSOLE_COLORS.ERROR, error);
    throw new Error(`解析响应失败 (${context}): ${error.message}`);
  }
}

// =============== 3. 导出的独立函数 ===============

/**
 * 调用Deepseek API
 * @param {string} prompt - 提示词内容
 * @param {number} temperature - 温度参数，控制输出随机性
 * @returns {Promise<string>} - 返回LLM响应文本
 */
export async function callLLM(prompt, temperature = API_CONFIG.TEMPERATURE) {
  try {
    console.log(`调用Deepseek API，提示词长度: ${prompt.length}，温度: ${temperature}`);
    
    const response = await fetch(API_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        model: API_CONFIG.MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: temperature,
        max_tokens: API_CONFIG.MAX_TOKENS
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API错误: ${response.status}, ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log("API响应成功");
    
    // 根据Deepseek API响应格式提取内容
    return data.choices[0].message.content;
  } catch (error) {
    console.error(`%cLLM API调用失败`, CONSOLE_COLORS.ERROR, error);
    throw new Error(`API调用失败: ${error.message}`);
  }
}

/**
 * 处理用户需求分析
 * @param {Object} questionnaireData - 问卷数据
 * @param {string} promptTemplate - 提示词模板
 * @returns {Promise<Object>} - 解析后的JSON结果
 */
export async function processUserNeeds(questionnaireData, promptTemplate) {
  // 将问卷数据填入提示词模板
  const prompt = promptTemplate.replace(
    '{{questionnaireData}}', 
    JSON.stringify(questionnaireData, null, 2)
  );
  
  // 调用API获取结果
  const result = await callLLM(prompt);
  
  // 解析JSON结果
  return parseJsonFromLLMResponse(result, '用户需求分析');
}

/**
 * 处理数据特征分析
 * @param {string} dataContent - 数据内容
 * @param {string} promptTemplate - 提示词模板
 * @returns {Promise<Object>} - 解析后的JSON结果
 */
export async function processDataFeatures(dataContent, promptTemplate) {
  // 将数据内容填入提示词模板
  const prompt = promptTemplate.replace('{{dataContent}}', dataContent);
  
  // 调用API获取结果
  const result = await callLLM(prompt);
  
  // 解析JSON结果
  return parseJsonFromLLMResponse(result, '数据特征分析');
}

/**
 * 处理方法推荐
 * @param {Object} userNeeds - 用户需求特征
 * @param {Object} dataFeatures - 数据特征
 * @param {Array} weightMethods - 权重方法库
 * @param {string} promptTemplate - 提示词模板
 * @returns {Promise<Array>} - 解析后的推荐结果
 */
export async function processMethodRecommendation(userNeeds, dataFeatures, weightMethods, promptTemplate) {
  // 过滤权重方法库，移除数学模型和计算示例
  const filteredWeightMethods = filterMethodsForPrompt(weightMethods);
  console.log("已过滤权重方法库中的数学模型和计算示例");
  
  // 将数据填入提示词模板
  const prompt = promptTemplate
    .replace('{{userNeeds}}', JSON.stringify(userNeeds, null, 2))
    .replace('{{dataFeatures}}', JSON.stringify(dataFeatures, null, 2))
    .replace('{{weightMethods}}', JSON.stringify(filteredWeightMethods, null, 2));
  
  // 调用API获取结果
  const result = await callLLM(prompt);
  
  // 解析结果
  const parsedResponse = parseJsonFromLLMResponse(result, '方法推荐');
  return parsedResponse.recommendations || [];
}

// =============== 4. LLMService 类 ===============

/**
 * LLM服务类 - 提供完整的推荐流程实现
 */
export class LLMService {
  
  // -------- 基础API调用 --------
  
  constructor() {
    // 使用配置文件中的API配置
    this.apiConfig = API_CONFIG;
  }

  /**
   * 调用LLM API
   * @param {string} prompt - 提示词
   * @param {number} temperature - 温度参数
   * @returns {Promise<string>} - API响应内容
   */
  async callLLM(prompt, temperature = 0.7) {
    try {
      console.log(`调用Deepseek API，提示词长度: ${prompt.length}，温度: ${temperature}`);
      
      const response = await fetch(this.apiConfig.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiConfig.API_KEY}`
        },
        body: JSON.stringify({
          model: this.apiConfig.MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: temperature,
          max_tokens: this.apiConfig.MAX_TOKENS
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API错误: ${response.status}, ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      console.log("API响应成功");
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`%cLLM API调用失败`, CONSOLE_COLORS.ERROR, error);
      throw new Error(`API调用失败: ${error.message}`);
    }
  }
  
  // -------- 用户需求分析 --------

  /**
   * 分析用户需求
   * @param {Object} questionnaireData - 问卷数据
   * @returns {Promise<Object>} - 结构化的用户需求分析结果
   */
  async analyzeUserNeeds(questionnaireData) {
    try {
      console.log(`%c开始分析用户需求`, CONSOLE_COLORS.STAGE);
      
      if (!questionnaireData) {
        throw new Error("问卷数据为空");
      }
      
      const prompt = userNeedsAnalysisPrompt.replace(
        '{{questionnaireData}}',
        JSON.stringify(questionnaireData, null, 2)
      );
      
      console.log("生成的提示词长度:", prompt.length);
      
      const response = await this.callLLM(prompt, 0.3);
      console.log("收到LLM响应，长度:", response.length);
      
      const parsedResponse = parseJsonFromLLMResponse(response, '用户需求分析');
      console.log(`%c用户需求分析结果`, CONSOLE_COLORS.RESULT, parsedResponse);
      
      return parsedResponse;
    } catch (error) {
      console.error(`%c用户需求分析失败`, CONSOLE_COLORS.ERROR, error);
      throw new Error(`用户需求分析失败: ${error.message}`);
    }
  }
  
  // -------- 数据特征分析 --------
  
  /**
   * 分析数据特征
   * @param {Object} dataFeatures - 初步数据特征
   * @returns {Promise<Object>} - 增强的数据特征分析结果
   */
  async analyzeDataFeatures(dataFeatures) {
    try {
      console.log(`%c开始分析数据特征`, CONSOLE_COLORS.STAGE);
      
      if (!dataFeatures) {
        throw new Error("数据特征为空");
      }
      
      const prompt = dataAnalysisPrompt.replace(
        '{{dataFeatures}}',
        JSON.stringify(dataFeatures, null, 2)
      );
      
      const response = await this.callLLM(prompt, 0.3);
      
      const parsedResponse = parseJsonFromLLMResponse(response, '数据特征分析');
      console.log(`%c数据特征分析结果`, CONSOLE_COLORS.RESULT, parsedResponse);
      
      return parsedResponse;
    } catch (error) {
      console.error(`%c数据特征分析失败`, CONSOLE_COLORS.ERROR, error);
      throw new Error(`数据特征分析失败: ${error.message}`);
    }
  }
  
  // -------- 推荐方法流程 --------

  /**
   * 推荐方法 - 原始单阶段推荐
   * @param {Object} userNeedsAnalysis - 用户需求分析结果
   * @param {Object} dataAnalysis - 数据特征分析结果
   * @param {Array} weightMethods - 权重方法库
   * @returns {Promise<Array>} - 推荐方法列表
   */
  async recommendMethods(userNeedsAnalysis, dataAnalysis, weightMethods) {
    try {
      console.log(`%c执行原始推荐方法`, CONSOLE_COLORS.STAGE);
      console.log("用户需求:", userNeedsAnalysis);
      console.log("数据特征:", dataAnalysis);
      
      const filteredWeightMethods = filterMethodsForPrompt(weightMethods);
      
      const prompt = methodRecommendationPrompt
        .replace('{{userNeedsAnalysis}}', JSON.stringify(userNeedsAnalysis, null, 2))
        .replace('{{dataAnalysis}}', JSON.stringify(dataAnalysis, null, 2))
        .replace('{{weightMethods}}', JSON.stringify(filteredWeightMethods, null, 2));
      
      const response = await this.callLLM(prompt, 0.3);
      
      const parsedResponse = parseJsonFromLLMResponse(response, '方法推荐');
      console.log(`%c方法推荐结果`, CONSOLE_COLORS.RESULT, parsedResponse);
      
      return parsedResponse.recommendations || [];
    } catch (error) {
      console.error(`%c方法推荐失败`, CONSOLE_COLORS.ERROR, error);
      throw new Error(`方法推荐失败: ${error.message}`);
    }
  }

  // -------- 三阶段推荐核心流程 --------
  
  /**
   * 执行基于规则的匹配（第一阶段）
   * @param {Object} userNeeds - 用户需求特征
   * @param {Object} dataFeatures - 数据特征
   * @param {Array} weightMethods - 权重方法库
   * @returns {Promise<Object>} - 规则匹配结果，包含前N个候选方法
   */
  async performRuleBasedMatching(userNeeds, dataFeatures, weightMethods) {
    try {
      console.log(`%c第一阶段：执行基于规则的匹配`, CONSOLE_COLORS.STAGE);
      
      // 过滤权重方法库，移除数学模型和计算示例
      const filteredWeightMethods = filterMethodsForPrompt(weightMethods);
      console.log(`过滤后权重方法数量: ${filteredWeightMethods.length}`);
      
      // 构造四维度特征对象 - 增强
      const dimensionalUserNeeds = {
        taskDimension: userNeeds.taskDimension || {},
        dataDimension: userNeeds.dataDimension || {},
        userDimension: userNeeds.userDimension || {},
        environmentDimension: userNeeds.environmentDimension || {},
        requirements: userNeeds.requirements || {},
        constraints: userNeeds.constraints || [],
        priorities: userNeeds.priorities || []
      };
      
      const dimensionalDataFeatures = {
        dataStructure: dataFeatures.dataStructure || {},
        dataQuality: dataFeatures.dataQuality || {},
        distributionFeatures: dataFeatures.distributionFeatures || {},
        correlationFeatures: dataFeatures.correlationFeatures || {},
        limitations: dataFeatures.limitations || [],
        dataRequirements: dataFeatures.dataRequirements || {},
        suitability: dataFeatures.suitability || {}
      };
      
      console.log("%c规则匹配输入 - 用户需求", CONSOLE_COLORS.SUBSTAGE, dimensionalUserNeeds);
      console.log("%c规则匹配输入 - 数据特征", CONSOLE_COLORS.SUBSTAGE, dimensionalDataFeatures);
      
      // 为每个方法添加维度属性以供规则匹配 - 新增
      const enhancedWeightMethods = filteredWeightMethods.map(method => {
        // 如果方法没有dimensionalAttributes，添加一个空对象
        if (!method.dimensionalAttributes) {
          method.dimensionalAttributes = {
            taskDimension: {},
            dataDimension: {},
            userDimension: {},
            environmentDimension: {}
          };
        }
        return method;
      });
      
      // 构造提示词
      const prompt = ruleBasedMatchingPrompt
        .replace('{{userNeeds}}', JSON.stringify(dimensionalUserNeeds, null, 2))
        .replace('{{dataFeatures}}', JSON.stringify(dimensionalDataFeatures, null, 2))
        .replace('{{weightMethods}}', JSON.stringify(enhancedWeightMethods, null, 2));
      
      console.log(`%c发送规则匹配请求`, CONSOLE_COLORS.SUBSTAGE);
      console.log(`规则匹配提示词长度: ${prompt.length}`);
      
      // 调用LLM
      const startTime = performance.now();
      const response = await this.callLLM(prompt, 0.2); // 使用低温度提高一致性
      const endTime = performance.now();
      
      console.log(`%c规则匹配LLM响应 (耗时: ${((endTime - startTime)/1000).toFixed(2)}秒)`, CONSOLE_COLORS.SUBSTAGE);
      console.log(`LLM原始响应长度: ${response.length}`);
      
      // 在控制台显示LLM响应的摘要
      const responseSummary = response.length > 500 
        ? response.substring(0, 200) + '\n...\n' + response.substring(response.length - 200)
        : response;
      console.log(`%c规则匹配LLM响应摘要:`, CONSOLE_COLORS.RESULT, responseSummary);
      
      // 解析结果
      const parsedResponse = parseJsonFromLLMResponse(response, '规则匹配');
      console.log(`%c规则匹配结果`, CONSOLE_COLORS.RESULT, parsedResponse);
      
      // 增强：确保规则匹配结果包含所有必要字段
      if (!parsedResponse.topCandidates) {
        console.log(`%c修复缺失的topCandidates字段`, CONSOLE_COLORS.SUBSTAGE);
        parsedResponse.topCandidates = 
          parsedResponse.ruleScoringResults 
            ? parsedResponse.ruleScoringResults
                .sort((a, b) => b.totalRuleScore - a.totalRuleScore)
                .slice(0, 3)
                .map(result => result.methodName)
            : [];
      }
      
      return parsedResponse;
    } catch (error) {
      console.error(`%c规则匹配失败`, CONSOLE_COLORS.ERROR, error);
      throw new Error(`规则匹配失败: ${error.message}`);
    }
  }

  /**
   * 解析语义分析结果
   * @param {string} response - LLM响应文本
   * @param {string} methodName - 方法名称
   * @returns {Object} - 解析后的语义分析结果
   */
  parseSemanticAnalysisResult(response, methodName) {
    try {
      console.log(`%c解析方法"${methodName}"的语义分析结果`, CONSOLE_COLORS.SUBSTAGE);
      
      const result = parseJsonFromLLMResponse(response, `语义分析-${methodName}`);
      
      // 添加方法名称
      result.methodName = methodName;
      console.log(`%c方法"${methodName}"语义分析结果`, CONSOLE_COLORS.RESULT, {
        方法名称: methodName,
        语义匹配分数: result.semanticMatchScore,
        匹配解释: result.matchExplanation,
        优势数量: result.advantages?.length || 0,
        风险数量: result.risks?.length || 0,
        适合度: result.suitabilityLevel
      });
      
      return result;
    } catch (error) {
      console.error(`%c解析语义分析结果失败 (${methodName})`, CONSOLE_COLORS.ERROR, error);
      // 返回默认结果
      return {
        methodName: methodName,
        semanticMatchScore: 5,
        matchExplanation: "解析结果失败，使用默认评分",
        advantages: ["无法解析优势"],
        risks: ["无法解析风险"],
        implementationAdvice: ["无法提供实施建议"],
        suitabilityLevel: "中"
      };
    }
  }

  /**
   * 执行语义分析（第二阶段）
   * @param {Array} candidateMethods - 候选方法名称列表
   * @param {Object} problemProfile - 问题画像（包含四个维度特征）
   * @param {Array} weightMethods - 完整权重方法库
   * @returns {Promise<Array>} - 语义分析结果
   */
  async performSemanticAnalysis(candidateMethods, problemProfile, weightMethods) {
    try {
      console.log(`%c第二阶段：执行语义分析`, CONSOLE_COLORS.STAGE);
      console.log(`候选方法:`, candidateMethods);
      console.log(`问题画像:`, problemProfile);
      
      const semanticResults = [];
      
      // 获取候选方法的完整信息
      const candidateMethodDetails = weightMethods
        .filter(method => candidateMethods.includes(method.name));
      
      console.log(`找到 ${candidateMethodDetails.length} 个候选方法的详细信息`);
      
      // 对每个候选方法进行语义分析
      for (let i = 0; i < candidateMethodDetails.length; i++) {
        const method = candidateMethodDetails[i];
        console.log(`%c分析方法 ${i+1}/${candidateMethodDetails.length}: ${method.name}`, CONSOLE_COLORS.SUBSTAGE);
        
        // 构建语义分析提示词
        let prompt = semanticAnalysisPrompt;
        
        // 替换问题画像占位符
        for (const dimension of ['taskDimension', 'dataDimension', 'userDimension', 'environmentDimension']) {
          for (const prop in problemProfile[dimension]) {
            const placeholder = `{{P.${dimension}.${prop}}}`;
            const value = problemProfile[dimension][prop];
            const displayValue = Array.isArray(value) ? value.join(", ") : value;
            prompt = prompt.replace(new RegExp(placeholder, 'g'), displayValue || "未指定");
          }
        }
        
        // 替换方法属性占位符
        for (const prop in method) {
          const placeholder = `{{M.${prop}}}`;
          const value = method[prop];
          if (placeholder.includes('{{M.') && prompt.includes(placeholder)) {
            const displayValue = Array.isArray(value) ? value.join(", ") : value;
            prompt = prompt.replace(new RegExp(placeholder, 'g'), displayValue || "未提供");
          }
        }
        
        console.log(`语义分析提示词构建完成，长度: ${prompt.length}`);
        
        // 调用LLM
        console.log(`%c发送方法"${method.name}"的语义分析请求`, CONSOLE_COLORS.SUBSTAGE);
        const startTime = performance.now();
        const llmResponse = await this.callLLM(prompt, 0.4); // 使用适中的温度
        const endTime = performance.now();
        
        console.log(`%c方法"${method.name}"的语义分析响应 (耗时: ${((endTime - startTime)/1000).toFixed(2)}秒)`, CONSOLE_COLORS.SUBSTAGE);
        console.log(`LLM原始响应长度: ${llmResponse.length}`);
        
        // 在控制台显示LLM响应的摘要
        const responseSummary = llmResponse.length > 500 
          ? llmResponse.substring(0, 200) + '\n...\n' + llmResponse.substring(llmResponse.length - 200)
          : llmResponse;
        console.log(`%c语义分析LLM响应摘要:`, CONSOLE_COLORS.RESULT, responseSummary);
        
        // 解析结果
        const semanticResult = this.parseSemanticAnalysisResult(llmResponse, method.name);
        semanticResults.push(semanticResult);
        
        console.log(`方法"${method.name}"的语义分析完成，得分: ${semanticResult.semanticMatchScore}`);
      }
      
      console.log(`%c语义分析阶段完成，共分析 ${semanticResults.length} 个方法`, CONSOLE_COLORS.RESULT, semanticResults);
      return semanticResults;
    } catch (error) {
      console.error(`%c语义分析失败`, CONSOLE_COLORS.ERROR, error);
      throw new Error(`语义分析失败: ${error.message}`);
    }
  }

  /**
   * 计算最终综合评分并排序（第三阶段）
   * @param {Object} ruleResults - 规则匹配结果
   * @param {Array} semanticResults - 语义分析结果
   * @param {number} alpha - 规则匹配权重(默认0.6)
   * @returns {Array} - 排序后的最终推荐结果
   */
  calculateFinalScores(ruleResults, semanticResults, alpha = 0.6) {
    console.log(`%c第三阶段：计算综合评分与排序`, CONSOLE_COLORS.STAGE);
    console.log(`规则匹配权重: ${alpha}, 语义分析权重: ${1-alpha}`);
    
    const finalResults = [];
    
    // 将规则结果和语义结果合并
    for (const ruleResult of ruleResults.ruleScoringResults) {
      const methodName = ruleResult.methodName;
      const semanticResult = semanticResults.find(r => r.methodName === methodName);
      
      if (semanticResult) {
        // 计算综合得分
        const ruleScore = ruleResult.totalRuleScore;
        const semanticScore = semanticResult.semanticMatchScore;
        const hybridScore = (alpha * ruleScore) + ((1 - alpha) * semanticScore);
        
        console.log(`%c方法"${methodName}"的评分计算`, CONSOLE_COLORS.SUBSTAGE, {
          规则得分: ruleScore,
          语义得分: semanticScore,
          综合得分: hybridScore
        });
        
        // 确定匹配程度
        let matchingDegree;
        if (hybridScore >= 8) matchingDegree = "高";
        else if (hybridScore >= 6) matchingDegree = "中";
        else matchingDegree = "低";
        
        // 添加到最终结果
        finalResults.push({
          method: methodName,
          hybridScore,
          ruleScore,
          semanticScore,
          matchingDegree,
          reason: semanticResult.matchExplanation,
          advantages: semanticResult.advantages,
          considerations: semanticResult.risks,
          implementationSteps: semanticResult.implementationAdvice,
          // 添加维度评分
          dimensionalScores: {
            taskDimensionMatch: ruleResult.dimensionalScores?.taskDimensionMatch || 0,
            dataDimensionMatch: ruleResult.dimensionalScores?.dataDimensionMatch || 0,
            userDimensionMatch: ruleResult.dimensionalScores?.userDimensionMatch || 0,
            environmentDimensionMatch: ruleResult.dimensionalScores?.environmentDimensionMatch || 0
          }
        });
      }
    }
    
    // 按综合得分排序
    const sortedResults = finalResults.sort((a, b) => b.hybridScore - a.hybridScore);
    
    console.log(`%c最终排序结果`, CONSOLE_COLORS.RESULT, sortedResults);
    console.table(sortedResults.map(r => ({
      方法: r.method, 
      综合得分: r.hybridScore.toFixed(2), 
      规则得分: r.ruleScore.toFixed(2), 
      语义得分: r.semanticScore.toFixed(2), 
      匹配度: r.matchingDegree
    })));
    
    return sortedResults;
  }

  /**
   * 执行三阶段推荐流程
   * @param {Object} userNeeds - 用户需求特征
   * @param {Object} dataFeatures - 数据特征
   * @param {Array} weightMethods - 权重方法库
   * @returns {Promise<Object>} - 最终推荐结果
   */
  async performThreeStageRecommendation(userNeeds, dataFeatures, weightMethods) {
    try {
      console.log(`%c开始执行三阶段推荐流程`, CONSOLE_COLORS.STAGE);
      const startTotalTime = performance.now();
      
      // 阶段1：规则匹配
      const startRuleTime = performance.now();
      const ruleMatchingResults = await this.performRuleBasedMatching(userNeeds, dataFeatures, weightMethods);
      const candidateMethods = ruleMatchingResults.topCandidates;
      const endRuleTime = performance.now();
      console.log(`%c阶段1：规则匹配完成 (耗时: ${((endRuleTime - startRuleTime)/1000).toFixed(2)}秒)`, CONSOLE_COLORS.RESULT);
      console.log(`规则匹配得到的候选方法:`, candidateMethods);
      
      // 构建问题画像 - 用于语义分析
      const problemProfile = {
        taskDimension: userNeeds.taskDimension || {},
        dataDimension: userNeeds.dataDimension || {},
        userDimension: userNeeds.userDimension || {},
        environmentDimension: userNeeds.environmentDimension || {}
      };
      
      // 阶段2：语义分析 - 使用新的语义分析方法
      const startSemanticTime = performance.now();
      const semanticResults = await this.performSemanticAnalysis(candidateMethods, problemProfile, weightMethods);
      const endSemanticTime = performance.now();
      console.log(`%c阶段2：语义分析完成 (耗时: ${((endSemanticTime - startSemanticTime)/1000).toFixed(2)}秒)`, CONSOLE_COLORS.RESULT);
      
      // 定义规则匹配和语义分析的权重系数
      const alpha = 0.6; // 规则匹配权重
      
      // 阶段3：综合评分与排序 - 使用新的综合评分方法
      const startScoringTime = performance.now();
      const finalRecommendations = this.calculateFinalScores(ruleMatchingResults, semanticResults, alpha);
      const endScoringTime = performance.now();
      console.log(`%c阶段3：综合评分与排序完成 (耗时: ${((endScoringTime - startScoringTime)/1000).toFixed(2)}秒)`, CONSOLE_COLORS.RESULT);
      
      // 构建最终返回结果
      const finalResults = {
        finalRecommendations: finalRecommendations,
        dimensionalAnalysis: ruleMatchingResults.dimensionalAnalysis || {
          taskDimensionInfluence: "未提供任务维度关键因素",
          dataDimensionInfluence: "未提供数据维度关键因素",
          userDimensionInfluence: "未提供用户维度关键因素",
          environmentDimensionInfluence: "未提供环境维度关键因素"
        },
        rankingExplanation: `综合评分使用规则匹配(${alpha*100}%)和语义分析(${(1-alpha)*100}%)加权计算得出`,
        alpha: alpha // 添加权重系数
      };
      
      const endTotalTime = performance.now();
      console.log(`%c三阶段推荐流程完成 (总耗时: ${((endTotalTime - startTotalTime)/1000).toFixed(2)}秒)`, CONSOLE_COLORS.STAGE);
      
      return finalResults;
    } catch (error) {
      console.error(`%c三阶段推荐流程失败`, CONSOLE_COLORS.ERROR, error);
      throw new Error(`三阶段推荐流程失败: ${error.message}`);
    }
  }
} 