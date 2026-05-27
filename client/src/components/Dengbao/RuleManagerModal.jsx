// client/src/components/Dengbao/RuleManagerModal.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/Dengbao/RuleManagerModal.css';

function RuleManagerModal({ itemId, itemName, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('detail'); // 'detail', 'existing', 'builder'
  const [itemInfo, setItemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 规则数据
  const [rulesData, setRulesData] = useState([]);
  const [deletedIndices, setDeletedIndices] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  
  // 规则构建器状态
  const [resultText, setResultText] = useState('');
  const [resultSummary, setResultSummary] = useState('');
  const [rules, setRules] = useState([]);
  
  // 分析信息
  const [actualProblem, setActualProblem] = useState('');
  const [actualRelatedThreats, setActualRelatedThreats] = useState('');
  const [actualHarmAnalysis, setActualHarmAnalysis] = useState('');
  const [actualRiskLevel, setActualRiskLevel] = useState('');
  const [actualSuggestions, setActualSuggestions] = useState('');
  
  // 修正信息
  const [isFixable, setIsFixable] = useState('');
  const [fixedRiskLevel, setFixedRiskLevel] = useState('');
  const [actualFixType, setActualFixType] = useState('');
  const [actualFixDescription, setActualFixDescription] = useState('');
  const [actualFixLocation, setActualFixLocation] = useState('');

  const getToken = () => localStorage.getItem('access_token');

  // 获取规则数据
  const fetchRulesData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/assessment-items/${itemId}/rules`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setItemInfo(data.item_info);
        
        if (data.rules_data && data.rules_data.length > 0) {
          setRulesData(data.rules_data);
        }
      }
    } catch (error) {
      console.error('获取规则数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRulesData();
  }, [itemId]);

  // 重置构建器表单
  const resetBuilderForm = () => {
    setRules([]);
    setResultText('');
    setResultSummary('');
    setActualProblem('');
    setActualRelatedThreats('');
    setActualHarmAnalysis('');
    setActualRiskLevel('');
    setActualSuggestions('');
    setIsFixable('');
    setFixedRiskLevel('');
    setActualFixType('');
    setActualFixDescription('');
    setActualFixLocation('');
  };

  // 编辑已有规则
  const editRule = (index) => {
    const rule = rulesData[index];
    setRules(rule.standard || []);
    setResultText(rule.result || '');
    setResultSummary(rule.resultSummary || '');
    setActualProblem(rule.actualProblem || '');
    setActualRelatedThreats(rule.actualRelatedThreats || '');
    setActualHarmAnalysis(rule.actualHarmAnalysis || '');
    setActualRiskLevel(rule.actualRiskLevel || '');
    setActualSuggestions(rule.actualSuggestions || '');
    setIsFixable(rule.isFixable || '');
    setFixedRiskLevel(rule.fixedRiskLevel || '');
    setActualFixType(rule.actualFixType || '');
    setActualFixDescription(rule.actualFixDescription || '');
    setActualFixLocation(rule.actualFixLocation || '');
    setEditingIndex(index);
    setActiveTab('builder');
  };

  // 删除已有规则（标记删除）
  const markDeleteRule = (index) => {
    if (!deletedIndices.includes(index)) {
      setDeletedIndices([...deletedIndices, index]);
    }
  };

  // 恢复删除
  const restoreRule = (index) => {
    setDeletedIndices(deletedIndices.filter(i => i !== index));
  };

  // 保存构建的规则
  const saveBuilderRule = async () => {
    const newRule = {
      standard: rules,
      result: resultText,
      resultSummary: resultSummary,
      actualProblem: actualProblem,
      actualRelatedThreats: actualRelatedThreats,
      actualHarmAnalysis: actualHarmAnalysis,
      actualRiskLevel: actualRiskLevel,
      actualSuggestions: actualSuggestions,
      isFixable: isFixable,
      fixedRiskLevel: fixedRiskLevel,
      actualFixType: actualFixType,
      actualFixDescription: actualFixDescription,
      actualFixLocation: actualFixLocation
    };

    let updatedRules;
    if (editingIndex >= 0) {
      // 更新现有规则
      updatedRules = [...rulesData];
      updatedRules[editingIndex] = newRule;
    } else {
      // 添加新规则
      updatedRules = [...rulesData, newRule];
    }

    setRulesData(updatedRules);
    resetBuilderForm();
    setEditingIndex(-1);
    setActiveTab('existing');
  };

  // 保存所有规则到后端
  const saveAllRules = async () => {
    setSaving(true);
    try {
      const token = getToken();
      // 过滤掉已删除的规则
      const rulesToSave = rulesData.filter((_, index) => !deletedIndices.includes(index));
      
      const response = await fetch(`http://localhost:5000/api/assessment-items/${itemId}/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ rules_data: rulesToSave })
      });
      
      if (response.ok) {
        alert('规则保存成功！');
        await fetchRulesData();
        setDeletedIndices([]);
        if (onSave) onSave();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || '保存失败');
      }
    } catch (error) {
      console.error('保存规则失败:', error);
      alert('保存规则失败');
    } finally {
      setSaving(false);
    }
  };

  // 添加基础规则行
  const addRuleRow = () => {
    setRules([...rules, { key: '', condition: '=', value: '' }]);
  };

  // 更新规则
  const updateRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  // 删除规则行
  const removeRule = (index) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
  };

  // 添加复合规则
  const addCompositeRule = () => {
    setRules([...rules, {
      composite: true,
      parentRelation: 'and',
      innerRelation: 'and',
      rules: []
    }]);
  };

  // 更新复合规则
  const updateCompositeRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  // 添加复合规则内的嵌套规则
  const addNestedRule = (compositeIndex) => {
    const newRules = [...rules];
    newRules[compositeIndex].rules.push({ key: '', condition: '=', value: '' });
    setRules(newRules);
  };

  // 更新嵌套规则
  const updateNestedRule = (compositeIndex, ruleIndex, field, value) => {
    const newRules = [...rules];
    newRules[compositeIndex].rules[ruleIndex][field] = value;
    setRules(newRules);
  };

  // 删除嵌套规则
  const removeNestedRule = (compositeIndex, ruleIndex) => {
    const newRules = [...rules];
    newRules[compositeIndex].rules = newRules[compositeIndex].rules.filter((_, i) => i !== ruleIndex);
    setRules(newRules);
  };

  // 获取字段选项
  const getFieldOptions = () => {
    if (!itemInfo || !itemInfo.assessment_indicators) return [];
    const indicators = typeof itemInfo.assessment_indicators === 'object'
      ? Object.entries(itemInfo.assessment_indicators)
      : (Array.isArray(itemInfo.assessment_indicators) ? itemInfo.assessment_indicators.map(i => [i, i]) : []);
    
    return indicators.map(([key, value]) => ({
      value: key,
      label: value || key
    }));
  };

  const operators = ['=', '≥', '≤', '>', '<', '!='];

  // 结果总述选项
  const resultSummaryOptions = [
    { value: 'compliant', label: '符合' },
    { value: 'partially-compliant', label: '部分符合' },
    { value: 'not-applicable', label: '不适用' },
    { value: 'non-compliant', label: '不符合' }
  ];

  // 获取结果总述显示文本
  const getResultSummaryText = (value) => {
    const option = resultSummaryOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // 可修正选项
  const fixableOptions = [
    { value: 'fixable', label: '可修正' },
    { value: 'not-fixable', label: '不可修正' },
    { value: 'partially-fixable', label: '部分可修正' }
  ];

  // 风险等级选项
  const riskLevelOptions = [
    { value: 'high', label: '高风险' },
    { value: 'medium', label: '中风险' },
    { value: 'low', label: '低风险' },
    { value: 'none', label: '无风险' }
  ];

  // 修正类型选项
  const fixTypeOptions = [
    { value: 'technical', label: '技术修正' },
    { value: 'management', label: '管理修正' },
    { value: 'process', label: '流程修正' },
    { value: 'config', label: '配置修正' },
    { value: 'other', label: '其他' }
  ];

  if (loading) {
    return (
      <div className="rule-modal-overlay" onClick={onClose}>
        <div className="rule-modal-container rule-modal-right" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rule-modal-overlay" onClick={onClose}>
      <div className="rule-modal-container rule-modal-right" onClick={(e) => e.stopPropagation()}>
        <div className="rule-modal-header">
          <h3>规则管理 - {itemName}</h3>
          <div className="header-actions">
            <button className="btn-save-all" onClick={saveAllRules} disabled={saving}>
              {saving ? '保存中...' : '保存全部'}
            </button>
            <button className="rule-modal-close" onClick={onClose}>×</button>
          </div>
        </div>
        
        {/* Tab栏 */}
        <div className="rule-tabs">
          <button 
            className={`rule-tab ${activeTab === 'detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('detail')}
          >
            📋 测评项详情
          </button>
          <button 
            className={`rule-tab ${activeTab === 'existing' ? 'active' : ''}`}
            onClick={() => setActiveTab('existing')}
          >
            📚 已有规则 ({rulesData.filter((_, i) => !deletedIndices.includes(i)).length})
          </button>
          <button 
            className={`rule-tab ${activeTab === 'builder' ? 'active' : ''}`}
            onClick={() => { resetBuilderForm(); setEditingIndex(-1); setActiveTab('builder'); }}
          >
            🏗️ 规则构建器
          </button>
        </div>
        
        <div className="rule-modal-body">
          {/* Tab 1: 测评项详情 */}
          {activeTab === 'detail' && (
            <div className="tab-content">
              <div className="detail-grid">
                <div className="detail-card">
                  <div className="detail-card-header">基本信息</div>
                  <div className="detail-card-body">
                    <div className="detail-row">
                      <div className="detail-label">ID：</div>
                      <div className="detail-value">{itemInfo?.id || '-'}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">标准类型：</div>
                      <div className="detail-value"><span className="type-badge">{itemInfo?.standard_type || '-'}</span></div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">安全控制点：</div>
                      <div className="detail-value"><strong>{itemInfo?.security_control || '-'}</strong></div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">测评对象：</div>
                      <div className="detail-value">{itemInfo?.assessment_object || '-'}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">检测项：</div>
                      <div className="detail-value">{itemInfo?.detection_item || '-'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="detail-card">
                  <div className="detail-card-header">测评指标与等级</div>
                  <div className="detail-card-body">
                    <div className="detail-row">
                      <div className="detail-label">测评指标：</div>
                      <div className="detail-value">
                        {itemInfo?.assessment_indicators && Object.keys(itemInfo.assessment_indicators).length > 0 ? (
                          <div className="indicators-list">
                            {Object.entries(itemInfo.assessment_indicators).map(([key, value]) => (
                              <span key={key} className="indicator-tag">{value}</span>
                            ))}
                          </div>
                        ) : '-'}
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">测评等级：</div>
                      <div className="detail-value">
                        {itemInfo?.assessment_levels && itemInfo.assessment_levels.length > 0 ? (
                          itemInfo.assessment_levels.map(level => (
                            <span key={level} className="level-tag">{level}</span>
                          ))
                        ) : '-'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="detail-card">
                  <div className="detail-card-header">审计信息</div>
                  <div className="detail-card-body">
                    <div className="detail-row">
                      <div className="detail-label">创建人：</div>
                      <div className="detail-value">{itemInfo?.creator_name || '-'}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">修改人：</div>
                      <div className="detail-value">{itemInfo?.updater_name || '-'}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">创建时间：</div>
                      <div className="detail-value">{itemInfo?.created_at ? new Date(itemInfo.created_at).toLocaleString() : '-'}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">修改时间：</div>
                      <div className="detail-value">{itemInfo?.updated_at ? new Date(itemInfo.updated_at).toLocaleString() : '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tab 2: 已有规则 */}
          {activeTab === 'existing' && (
            <div className="tab-content">
              {rulesData.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>暂无规则数据</p>
                  <button className="btn-primary" onClick={() => { resetBuilderForm(); setEditingIndex(-1); setActiveTab('builder'); }}>
                    创建第一条规则
                  </button>
                </div>
              ) : (
                <div className="existing-rules-list">
                  {rulesData.map((rule, index) => {
                    const isDeleted = deletedIndices.includes(index);
                    return (
                      <div key={index} className={`existing-rule-card ${isDeleted ? 'deleted' : ''}`}>
                        <div className="existing-rule-header">
                          <div className="rule-title">
                            <span className={`rule-badge ${rule.resultSummary === 'compliant' ? 'compliant' : rule.resultSummary === 'non-compliant' ? 'non-compliant' : 'partial'}`}>
                              {getResultSummaryText(rule.resultSummary)}
                            </span>
                            <span className="rule-index">规则 {index + 1}</span>
                          </div>
                          <div className="rule-actions">
                            {!isDeleted && (
                              <>
                                <button className="btn-edit-small" onClick={() => editRule(index)}>编辑</button>
                                <button className="btn-delete-small" onClick={() => markDeleteRule(index)}>删除</button>
                              </>
                            )}
                            {isDeleted && (
                              <button className="btn-restore-small" onClick={() => restoreRule(index)}>恢复</button>
                            )}
                          </div>
                        </div>
                        <div className="existing-rule-body">
                          <div className="rule-result-preview">
                            <strong>判断结果：</strong>
                            <span className="result-text">{rule.result || '-'}</span>
                          </div>
                          <div className="rule-summary">
                            <span className="summary-badge">规则数: {rule.standard?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Tab 3: 规则构建器 */}
          {activeTab === 'builder' && (
            <div className="tab-content builder-content">
              {/* 结果总述 */}
              <div className="builder-section">
                <div className="section-title">
                  <span className="section-icon">🎯</span>
                  <span>结果总述</span>
                </div>
                <div className="result-summary-selector">
                  <select value={resultSummary} onChange={(e) => setResultSummary(e.target.value)}>
                    <option value="">请选择</option>
                    {resultSummaryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* 规则构建区域 */}
              <div className="builder-section">
                <div className="section-title">
                  <span className="section-icon">⚙️</span>
                  <span>规则配置</span>
                  <div className="section-actions">
                    <button className="btn-add-rule" onClick={addRuleRow}>+ 基础规则</button>
                    <button className="btn-add-composite" onClick={addCompositeRule}>+ 复合规则</button>
                  </div>
                </div>
                <div className="rules-builder">
                  {rules.length === 0 && (
                    <div className="empty-rules">点击上方按钮添加规则</div>
                  )}
                  {rules.map((rule, index) => {
                    if (rule.composite) {
                      // 复合规则渲染
                      return (
                        <div key={index} className="composite-rule-editor">
                          <div className="composite-header">
                            <span className="composite-title">复合规则 {index + 1}</span>
                            <button className="btn-remove-rule" onClick={() => removeRule(index)}>删除规则组</button>
                          </div>
                          <div className="composite-relations">
                            <div className="relation-item">
                              <label>与父级关系：</label>
                              <select value={rule.parentRelation} onChange={(e) => updateCompositeRule(index, 'parentRelation', e.target.value)}>
                                <option value="and">AND</option>
                                <option value="or">OR</option>
                              </select>
                            </div>
                            <div className="relation-item">
                              <label>区域内关系：</label>
                              <select value={rule.innerRelation} onChange={(e) => updateCompositeRule(index, 'innerRelation', e.target.value)}>
                                <option value="and">AND</option>
                                <option value="or">OR</option>
                              </select>
                            </div>
                          </div>
                          <div className="nested-rules">
                            {rule.rules.map((nestedRule, ruleIndex) => (
                              <div key={ruleIndex} className="rule-row">
                                <select 
                                  value={nestedRule.key} 
                                  onChange={(e) => updateNestedRule(index, ruleIndex, 'key', e.target.value)}
                                  className="rule-field-select"
                                >
                                  <option value="">请选择字段</option>
                                  {getFieldOptions().map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                                <select 
                                  value={nestedRule.condition} 
                                  onChange={(e) => updateNestedRule(index, ruleIndex, 'condition', e.target.value)}
                                  className="rule-operator-select"
                                >
                                  {operators.map(op => (
                                    <option key={op} value={op}>{op}</option>
                                  ))}
                                </select>
                                <input 
                                  type="text" 
                                  value={nestedRule.value} 
                                  onChange={(e) => updateNestedRule(index, ruleIndex, 'value', e.target.value)}
                                  placeholder="请输入值"
                                  className="rule-value-input"
                                />
                                <button className="btn-remove-rule" onClick={() => removeNestedRule(index, ruleIndex)}>删除</button>
                              </div>
                            ))}
                            <button className="btn-add-nested" onClick={() => addNestedRule(index)}>+ 添加嵌套规则</button>
                          </div>
                        </div>
                      );
                    } else {
                      // 基础规则渲染
                      return (
                        <div key={index} className="rule-row">
                          <select 
                            value={rule.key} 
                            onChange={(e) => updateRule(index, 'key', e.target.value)}
                            className="rule-field-select"
                          >
                            <option value="">请选择字段</option>
                            {getFieldOptions().map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <select 
                            value={rule.condition} 
                            onChange={(e) => updateRule(index, 'condition', e.target.value)}
                            className="rule-operator-select"
                          >
                            {operators.map(op => (
                              <option key={op} value={op}>{op}</option>
                            ))}
                          </select>
                          <input 
                            type="text" 
                            value={rule.value} 
                            onChange={(e) => updateRule(index, 'value', e.target.value)}
                            placeholder="请输入值"
                            className="rule-value-input"
                          />
                          <button className="btn-remove-rule" onClick={() => removeRule(index)}>删除</button>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
              
              {/* 判断结果区域 */}
              <div className="builder-section">
                <div className="section-title">
                  <span className="section-icon">📝</span>
                  <span>判断结果</span>
                </div>
                <textarea 
                  value={resultText} 
                  onChange={(e) => setResultText(e.target.value)}
                  rows="4"
                  className="result-textarea"
                  placeholder="请输入判断结果..."
                />
              </div>
              
              {/* 分析信息区域 */}
              <div className="builder-section">
                <div className="section-title">
                  <span className="section-icon">🔍</span>
                  <span>分析信息</span>
                </div>
                <div className="form-grid">
                  <div className="form-field full-width">
                    <label>实际问题</label>
                    <textarea 
                      value={actualProblem} 
                      onChange={(e) => setActualProblem(e.target.value)}
                      rows="2"
                    />
                  </div>
                  <div className="form-field">
                    <label>实际关联威胁</label>
                    <input 
                      type="text" 
                      value={actualRelatedThreats} 
                      onChange={(e) => setActualRelatedThreats(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>实际风险等级</label>
                    <input 
                      type="text" 
                      value={actualRiskLevel} 
                      onChange={(e) => setActualRiskLevel(e.target.value)}
                    />
                  </div>
                  <div className="form-field full-width">
                    <label>实际危害分析</label>
                    <textarea 
                      value={actualHarmAnalysis} 
                      onChange={(e) => setActualHarmAnalysis(e.target.value)}
                      rows="2"
                    />
                  </div>
                  <div className="form-field full-width">
                    <label>实际建议</label>
                    <textarea 
                      value={actualSuggestions} 
                      onChange={(e) => setActualSuggestions(e.target.value)}
                      rows="2"
                    />
                  </div>
                </div>
              </div>
              
              {/* 修正信息区域 */}
              <div className="builder-section">
                <div className="section-title">
                  <span className="section-icon">🔧</span>
                  <span>修正信息</span>
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label>可修正</label>
                    <select value={isFixable} onChange={(e) => setIsFixable(e.target.value)}>
                      <option value="">请选择</option>
                      {fixableOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>修正后风险等级</label>
                    <select value={fixedRiskLevel} onChange={(e) => setFixedRiskLevel(e.target.value)}>
                      <option value="">请选择</option>
                      {riskLevelOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>实际修正类型</label>
                    <select value={actualFixType} onChange={(e) => setActualFixType(e.target.value)}>
                      <option value="">请选择</option>
                      {fixTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field full-width">
                    <label>实际修正描述</label>
                    <textarea 
                      value={actualFixDescription} 
                      onChange={(e) => setActualFixDescription(e.target.value)}
                      rows="2"
                    />
                  </div>
                  <div className="form-field full-width">
                    <label>实际修正位置</label>
                    <input 
                      type="text" 
                      value={actualFixLocation} 
                      onChange={(e) => setActualFixLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="builder-actions">
                <button className="btn-cancel" onClick={() => { resetBuilderForm(); setEditingIndex(-1); setActiveTab('existing'); }}>
                  取消
                </button>
                <button className="btn-save-rule" onClick={saveBuilderRule}>
                  {editingIndex >= 0 ? '更新规则' : '添加规则'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RuleManagerModal;