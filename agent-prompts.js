/**
 * 指标权重方法推荐系统 - Agent提示词模板
 * 包含用户需求分析Agent、数据解析Agent和方法推荐Agent的提示词模板
 */

/**
 * 用户需求分析Agent提示词模板
 * 输入：用户问卷数据
 * 输出：结构化的用户需求特征
 */
const userNeedsAnalysisPrompt = `
你是一位用户需求分析专家，请分析以下问卷数据，提取关键需求特征。分析过程中请考虑任务维度、数据维度、用户维度和环境维度四个核心维度：

### 问卷数据：
{{questionnaireData}}

### 分析要求：
1. 提取用户的核心需求特征
2. 评估用户对各个维度的要求程度
3. 识别潜在的限制条件
4. 总结用户优先级

### 维度分析指南：
- 任务维度：关注评价领域、目标性质、问题复杂度和应用范围
- 数据维度：关注指标数量、变量类型、数据质量和可用数据类型
- 用户维度：关注用户偏好、知识水平、风险承受能力和特殊需求
- 环境维度：关注专家资源、时间约束、计算资源和环境限制

### 输出格式：
{
  "taskDimension": {
    "domain": "评价领域",
    "purpose": "评价目的",
    "evaluationNature": "评价目标性质(描述性/预测性/优化性)",
    "complexity": "问题复杂度(高/中/低)",
    "applicationScope": "结果应用范围",
    "academicRigor": "学术严谨性要求(高/中/低)"
  },
  "dataDimension": {
    "indicatorCount": "指标数量(少量/中等/大量)",
    "variableType": "变量类型(定量/定性/混合)",
    "dataStructure": "数据结构描述",
    "dataQualityIssues": ["数据质量问题1", "数据质量问题2"],
    "availableDataTypes": ["已有数据类型1", "已有数据类型2"],
    "missingDataSituation": "缺失数据情况(无/少量/大量)"
  },
  "userDimension": {
    "precision": "精确度要求(高/中/低)",
    "structure": "指标体系结构",
    "relation": "指标间关系",
    "methodPreference": "方法偏好(主观/客观/组合)",
    "knowledgeLevel": "知识水平(初级/中级/高级/专家)",
    "riskTolerance": "风险承受能力(低/中/高)",
    "specialRequirements": ["特殊需求1", "特殊需求2"],
    "interpretabilityNeed": "可解释性需求(高/中/低)",
    "preferredUserType": "用户类型描述"
  },
  "environmentDimension": {
    "expertiseLevel": "专家资源情况(充足/有限/无)",
    "timeConstraint": "时间限制(紧迫/适中/充裕)",
    "computingResource": "计算资源限制(有限/充足/高级)",
    "environmentConstraints": ["环境约束1", "环境约束2"],
    "costProfile": "成本约束(严格/适中/宽松)"
  },
  "requirements": {
    "objectivity": "客观性要求(1-10)",
    "interpretability": "可解释性要求(1-10)",
    "efficiency": "效率要求(1-10)",
    "stability": "稳定性要求(1-10)",
    "complexity": "复杂度接受度(1-10)",
    "transparency": "透明度要求(1-10)"
  },
  "constraints": ["限制条件1", "限制条件2"],
  "priorities": ["优先级1", "优先级2"]
}
`;

/**
 * 数据解析Agent提示词模板
 * 输入：数据文件内容
 * 输出：结构化的数据特征描述
 */
const dataAnalysisPrompt = `
你是一位数据分析专家，请分析以下数据特征，并对数据的结构、质量和特性进行全面评估：

### 数据特征：
{{dataFeatures}}

### 分析要求：
1. 全面评估数据质量和完整性
2. 识别数据结构和变量特点
3. 分析数据分布和相关性
4. 识别数据限制和潜在问题
5. 评估数据对不同权重方法的适用性

### 维度分析指南：
- 关注指标数量范围(少量/中等/大量)
- 明确变量类型分布(定量/定性/混合)
- 评估数据质量要求(高/中/低)
- 分析缺失值容忍度(高/中/低)

### 输出格式：
{
  "dataStructure": {
    "indicatorCount": "指标数量",
    "indicatorTypes": ["指标类型1", "指标类型2"],
    "indicatorRelations": "指标间关系描述",
    "hierarchyLevels": "层次结构描述",
    "variableTypes": "变量类型分布(定量/定性/混合)",
    "indicatorCountRange": "指标数量范围描述(少量/中等/大量)"
  },
  "dataQuality": {
    "completeness": "完整性评分(1-10)",
    "reliability": "可靠性评分(1-10)",
    "consistency": "一致性评分(1-10)",
    "missingValuePattern": "缺失值分布模式",
    "outlierSituation": "异常值情况",
    "dataQualityRequirement": "数据质量要求(高/中/低)",
    "missingDataTolerance": "缺失数据容忍度(高/中/低)"
  },
  "distributionFeatures": {
    "sampleSize": "样本量特征",
    "distribution": "分布特征(正态/偏态/多峰等)",
    "variability": "变异性描述",
    "normalityTest": "正态性评估"
  },
  "correlationFeatures": {
    "overallCorrelation": "总体相关性评估",
    "multicollinearityIssues": "多重共线性问题",
    "significantCorrelations": ["显著相关的指标对"]
  },
  "limitations": ["限制1", "限制2"],
  "dataRequirements": {
    "sampleSizeRequirement": "样本量需求",
    "distributionRequirement": "分布要求",
    "qualityThreshold": "质量阈值要求"
  },
  "methodSuitability": {
    "objectiveMethodSuitability": "适合客观方法程度(1-10)",
    "subjectiveMethodSuitability": "适合主观方法程度(1-10)",
    "hybridMethodSuitability": "适合混合方法程度(1-10)"
  }
}
`;

/**
 * 规则匹配Agent提示词模板 - 新增
 * 输入：用户需求特征、数据特征和权重方法库
 * 输出：基于规则匹配的候选方法列表（前N个）
 */
const ruleBasedMatchingPrompt = `
你是一位权重方法规则匹配专家，请基于以下数据进行权重方法的规则匹配，考虑任务维度、数据维度、用户维度和环境维度四个核心维度：

### 用户需求特征:
{{userNeeds}}

### 数据特征:
{{dataFeatures}}

### 权重方法库:
{{weightMethods}}

### 匹配规则说明:

## 任务维度匹配规则:
请基于方法的dimensionalAttributes.taskDimension属性进行评分：
1. 评价领域匹配规则：
   - 用户领域包含在方法的suitableDomains中 = 高匹配度(8-10分)
   - 用户领域相关但不完全匹配 = 中匹配度(5-7分)
   - 用户领域与方法领域无关 = 低匹配度(0-4分)

2. 评价目标性质匹配规则：
   - 用户目标与方法purposeSuitability一致 = 高匹配度(8-10分)
   - 部分相关 = 中匹配度(5-7分)
   - 不相关 = 低匹配度(0-4分)

3. 问题复杂度匹配规则：
   - 用户问题复杂度与方法complexityHandling一致 = 高匹配度(8-10分)
   - 方法复杂度处理能力高于问题复杂度 = 中高匹配度(6-8分)
   - 方法复杂度处理能力低于问题复杂度 = 低匹配度(0-4分)

4. 学术严谨性匹配规则：
   - 用户需求学术性高且方法academicRigor高 = 高匹配度(8-10分)
   - 用户应用场景与方法学术严谨度适配 = 中匹配度(5-7分)
   - 明显不匹配 = 低匹配度(0-4分)

## 数据维度匹配规则:
请基于方法的dimensionalAttributes.dataDimension属性进行评分：
1. 指标数量匹配规则：
   - 用户指标数量在方法indicatorCountRange范围内 = 高匹配度(8-10分)
   - 略微超出范围 = 中匹配度(5-7分)
   - 大幅超出范围 = 低匹配度(0-4分)

2. 变量类型匹配规则：
   - 用户变量类型包含在方法variableTypeHandling中 = 高匹配度(8-10分)
   - 部分支持 = 中匹配度(5-7分)
   - 不支持 = 低匹配度(0-4分)

3. 数据质量匹配规则：
   - 用户数据质量满足方法dataQualityRequirement = 高匹配度(8-10分)
   - 部分满足 = 中匹配度(5-7分)
   - 不满足 = 低匹配度(0-4分)

4. 缺失值处理能力匹配：
   - 用户数据缺失情况与方法missingDataTolerance匹配 = 高匹配度(8-10分)
   - 部分匹配 = 中匹配度(5-7分)
   - 不匹配 = 低匹配度(0-4分)

## 用户维度匹配规则:
请基于方法的dimensionalAttributes.userDimension属性进行评分：
1. 方法偏好匹配规则：
   - 用户偏好类型与preferredUserType匹配 = 高匹配度(8-10分)
   - 部分匹配 = 中匹配度(5-7分)
   - 不匹配 = 低匹配度(0-4分)

2. 知识水平匹配规则：
   - 用户知识水平满足方法knowledgeRequirement = 高匹配度(8-10分)
   - 用户知识水平略低于要求 = 中匹配度(5-7分)
   - 用户知识水平远低于要求 = 低匹配度(0-4分)

3. 可解释性匹配规则：
   - 用户对可解释性需求与方法interpretability匹配 = 高匹配度(8-10分)
   - 部分匹配 = 中匹配度(5-7分)
   - 不匹配 = 低匹配度(0-4分)

4. 风险承受能力匹配规则：
   - 用户风险承受能力与方法riskProfile匹配 = 高匹配度(8-10分)
   - 部分匹配 = 中匹配度(5-7分)
   - 不匹配 = 低匹配度(0-4分)

## 环境维度匹配规则:
请基于方法的dimensionalAttributes.environmentDimension属性进行评分：
1. 专家资源匹配规则：
   - 用户专家资源水平满足方法expertRequirement = 高匹配度(8-10分)
   - 专家资源略低于要求 = 中匹配度(5-7分)
   - 专家资源远低于要求 = 低匹配度(0-4分)

2. 时间约束匹配规则：
   - 用户时间约束与方法timeRequirement匹配 = 高匹配度(8-10分)
   - 用户时间略紧但勉强可行 = 中匹配度(5-7分)
   - 用户时间明显不足 = 低匹配度(0-4分)

3. 计算资源匹配规则：
   - 用户计算资源满足方法computingRequirement = 高匹配度(8-10分)
   - 计算资源略低于要求 = 中匹配度(5-7分)
   - 计算资源远低于要求 = 低匹配度(0-4分)

4. 成本适配性匹配规则：
   - 用户预算约束与方法costProfile匹配 = 高匹配度(8-10分)
   - 成本略高但可接受 = 中匹配度(5-7分)
   - 成本明显超出预算 = 低匹配度(0-4分)

### 维度权重指导:
根据问题画像特点，为四个维度分配重要性权重：
- 如果用户明确表达方法偏好，用户维度权重应提高
- 如果存在明显资源限制(如缺乏专家)，环境维度权重应提高
- 如果数据特征非常特殊(如高维数据)，数据维度权重应提高
- 默认情况下，四个维度权重可平均分配

### 必要条件检查:
以下情况应直接降低方法得分至3分以下：
- 方法expertRequirement为"高"但用户专家资源为"无"
- 方法timeRequirement为"高"但用户时间约束为"快速"
- 方法dataQualityRequirement为"高"但数据质量存在严重问题

### 匹配要求:
1. 为每个方法基于四个维度的规则计算规则匹配得分(0-10分)
2. 考虑各维度匹配情况计算总规则得分
3. 选出规则得分最高的前3个方法作为候选

### 输出格式:
{
  "ruleScoringResults": [
    {
      "methodName": "方法名称",
      "dimensionalScores": {
        "taskDimensionMatch": 0-10分,
        "dataDimensionMatch": 0-10分,
        "userDimensionMatch": 0-10分,
        "environmentDimensionMatch": 0-10分
      },
      "detailedScores": {
        "domainMatch": 0-10分,
        "purposeMatch": 0-10分,
        "complexityMatch": 0-10分,
        "indicatorCountMatch": 0-10分,
        "variableTypeMatch": 0-10分,
        "preferenceMatch": 0-10分,
        "knowledgeMatch": 0-10分,
        "expertiseMatch": 0-10分,
        "timeMatch": 0-10分,
        "computingResourceMatch": 0-10分
      },
      "totalRuleScore": 0-10分,
      "matchingExplanation": "规则匹配原因简述",
      "recommendationReason": "方法在[维度]方面表现突出，特别适合[具体特征]。虽然在[弱点维度]存在一定局限性，但考虑到[优势因素]，整体仍具有较高适用性。"
    }
  ],
  "dimensionalAnalysis": {
    "taskDimensionKey": "对方法选择影响最大的任务维度因素",
    "dataDimensionKey": "对方法选择影响最大的数据维度因素",
    "userDimensionKey": "对方法选择影响最大的用户维度因素",
    "environmentDimensionKey": "对方法选择影响最大的环境维度因素"
  },
  "topCandidates": ["方法1", "方法2", "方法3"]
}
`;

/**
 * 方法推荐Agent提示词模板
 * 输入：用户需求特征和数据特征
 * 输出：推荐的权重方法
 */
const methodRecommendationPrompt = `
你是一位权重方法推荐专家，请基于以下分析结果推荐合适的权重计算方法：

### 用户需求分析：
{{userNeedsAnalysis}}

### 数据特征分析：
{{dataAnalysis}}

### 权重方法库：
{{weightMethods}}

### 推荐要求：
1. 综合考虑用户需求和数据特征
2. 评估每个方法的适用性
3. 选择最适合的前3个方法
4. 提供详细的推荐理由

### 输出格式：
{
  "recommendations": [
    {
      "method": "方法名称",
      "suitability": "高/中/低",
      "reason": "推荐理由",
      "advantages": ["优势1", "优势2"],
      "implementation": "实施建议",
      "scores": {
        "userNeedsMatch": "用户需求匹配度(1-10)",
        "dataFeatureMatch": "数据特征匹配度(1-10)",
        "overallScore": "总体评分(1-10)"
      }
    }
  ],
  "rationale": "推荐逻辑说明"
}
`;

/**
 * 语义分析提示词模板 - 新增
 * 输入：问题画像和候选方法
 * 输出：语义匹配分析结果
 */
const semanticAnalysisPrompt = `
你是一位权重方法推荐专家。请分析以下问题画像与候选方法的匹配情况：

### 问题画像:
任务维度: 
- 评价领域: {{P.taskDimension.domain}}
- 评价目标性质: {{P.taskDimension.evaluationNature}}
- 问题复杂度: {{P.taskDimension.complexity}}
- 应用范围: {{P.taskDimension.applicationScope}}

数据维度: 
- 指标数量: {{P.dataDimension.indicatorCount}}
- 变量类型: {{P.dataDimension.variableType}}
- 数据质量问题: {{P.dataDimension.dataQualityIssues}}
- 可用数据类型: {{P.dataDimension.availableDataTypes}}

用户维度: 
- 精确度要求: {{P.userDimension.precision}}
- 指标结构: {{P.userDimension.structure}}
- 指标关系: {{P.userDimension.relation}}
- 方法偏好: {{P.userDimension.methodPreference}}
- 知识水平: {{P.userDimension.knowledgeLevel}}
- 风险承受能力: {{P.userDimension.riskTolerance}}
- 特殊需求: {{P.userDimension.specialRequirements}}

环境维度: 
- 专家资源: {{P.environmentDimension.experts}}
- 时间约束: {{P.environmentDimension.timeConstraint}}
- 计算资源: {{P.environmentDimension.computingResource}}
- 环境约束: {{P.environmentDimension.environmentConstraints}}

### 候选方法:
- 方法名称: {{M.name}}
- 方法类别: {{M.type}}
- 数学原理简述: {{M.detail}}
- 适用条件: {{M.suitConditions}}
- 优点: {{M.advantages}}
- 局限性: {{M.limitations}}
- 实施步骤: {{M.implementationSteps}}

### 分析要求:
1. 分析此方法与问题画像的语义匹配程度
2. 评估方法对问题的适用性
3. 说明方法的优势和潜在风险
4. 提供实施建议和注意事项

### 分析指南:
- 考虑方法特性与问题需求的本质契合度，而不仅是表面匹配
- 权衡方法优势与局限性在当前情境下的实际影响
- 评估实施此方法可能遇到的实际挑战
- 考虑用户背景和环境限制对方法适用性的影响

### 输出格式:
请输出一个JSON对象，包含以下字段:
{
  "semanticMatchScore": 1-10分(数字),
  "matchExplanation": "详细解释方法与问题的匹配程度",
  "advantages": ["在此问题情境下的优势1", "优势2", ...],
  "risks": ["潜在风险1", "风险2", ...],
  "implementationAdvice": ["实施建议1", "建议2", ...],
  "suitabilityLevel": "高/中/低"
}
`;

// 统一导出所有提示词模板
export {
  userNeedsAnalysisPrompt,
  dataAnalysisPrompt,
  methodRecommendationPrompt,
  ruleBasedMatchingPrompt,
  semanticAnalysisPrompt
}; 