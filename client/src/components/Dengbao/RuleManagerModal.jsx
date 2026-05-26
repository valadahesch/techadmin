// client/src/components/Dengbao/RuleManagerModal.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/Dengbao/RuleManagement.css';

function RuleManagerModal({ itemId, itemName, onClose, onSave }) {
  const [rulesData, setRulesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [itemInfo, setItemInfo] = useState(null);
  
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
          // 加载已有规则
          const ruleGroup = data.rules_data[0];
          setRules(ruleGroup.standard || []);
          setResultText(ruleGroup.result || '');
          setResultSummary(ruleGroup.resultSummary || '');
          setActualProblem(ruleGroup.actualProblem || '');
          setActualRelatedThreats(ruleGroup.actualRelatedThreats || '');
          setActualHarmAnalysis(ruleGroup.actualHarmAnalysis || '');
          setActualRiskLevel(ruleGroup.actualRiskLevel || '');
          setActualSuggestions(ruleGroup.actualSuggestions || '');
          setIsFixable(ruleGroup.isFixable || '');
          setFixedRiskLevel(ruleGroup.fixedRiskLevel || '');
          setActualFixType(ruleGroup.actualFixType || '');
          setActualFixDescription(ruleGroup.actualFixDescription || '');
          setActualFixLocation(ruleGroup.actualFixLocation || '');
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

  // 保存规则
  const saveRules = async () => {
    setSaving(true);
    try {
      const token = getToken();
      const dataToSave = {
        rules_data: [{
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
        }]
      };
      
      const response = await fetch(`http://localhost:5000/api/assessment-items/${itemId}/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(dataToSave)
      });
      
      if (response.ok) {
        alert('规则保存成功！');
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

  // 添加规则行
  const addRuleRow = () => {
    setRules([...rules, { key: '', condition: '=', value: '' }]);
  };

  // 更新规则
  const updateRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  // 删除规则
  const removeRule = (index) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
  };

  // 字段列表（从itemInfo中获取）
  const getFieldOptions = () => {
    if (!itemInfo || !itemInfo.assessment_indicators) return [];
    return itemInfo.assessment_indicators.map(indicator => ({
      value: indicator,
      label: indicator
    }));
  };

  const operators = ['=', '≥', '≤', '>', '<', '!=', 'in', 'regex'];

  if (loading) {
    return (
      <div className="rule-modal-overlay">
        <div className="rule-modal-container">
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
          <button className="rule-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="rule-modal-body">
          {/* 规则详情表格 */}
          <div className="rule-detail-section">
            <h4>测评项详情</h4>
            <table className="rule-detail-table">
              <thead>
                <tr>
                  <th>标准类型</th>
                  <th>安全控制点</th>
                  <th>测评对象</th>
                  <th>检测项</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{itemInfo?.standard_type || '-'}</td>
                  <td>{itemInfo?.security_control || '-'}</td>
                  <td>{itemInfo?.assessment_object || '-'}</td>
                  <td className="rule-detail-cell">{itemInfo?.detection_item || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* 规则构建器 */}
          <div className="rule-builder-section">
            <div className="section-header">
              <h4>规则构建器</h4>
              <button className="btn-add-rule" onClick={addRuleRow}>+ 添加规则</button>
            </div>
            
            {/* 结果总述 */}
            <div className="result-summary-row">
              <label>结果总述：</label>
              <select value={resultSummary} onChange={(e) => setResultSummary(e.target.value)}>
                <option value="">请选择</option>
                <option value="compliant">符合</option>
                <option value="non-compliant">不符合</option>
                <option value="partially-compliant">部分符合</option>
                <option value="not-applicable">不适用</option>
              </select>
            </div>
            
            {/* 规则列表 */}
            <div className="rules-list">
              {rules.map((rule, index) => (
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
              ))}
              {rules.length === 0 && (
                <div className="empty-rules">暂无规则，点击"添加规则"开始配置</div>
              )}
            </div>
            
            {/* 判断结果 */}
            <div className="form-group">
              <label>判断结果</label>
              <textarea 
                value={resultText} 
                onChange={(e) => setResultText(e.target.value)}
                rows="3"
                className="result-textarea"
                placeholder="请输入判断结果..."
              />
            </div>
          </div>
          
          {/* 分析信息模块 */}
          <div className="analysis-section">
            <h4>分析信息</h4>
            <div className="form-row">
              <div className="form-group full-width">
                <label>实际问题</label>
                <textarea 
                  value={actualProblem} 
                  onChange={(e) => setActualProblem(e.target.value)}
                  rows="2"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>实际关联威胁</label>
                <input 
                  type="text" 
                  value={actualRelatedThreats} 
                  onChange={(e) => setActualRelatedThreats(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>实际风险等级</label>
                <input 
                  type="text" 
                  value={actualRiskLevel} 
                  onChange={(e) => setActualRiskLevel(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>实际危害分析</label>
                <textarea 
                  value={actualHarmAnalysis} 
                  onChange={(e) => setActualHarmAnalysis(e.target.value)}
                  rows="2"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>实际建议</label>
                <textarea 
                  value={actualSuggestions} 
                  onChange={(e) => setActualSuggestions(e.target.value)}
                  rows="2"
                />
              </div>
            </div>
          </div>
          
          {/* 修正信息模块 */}
          <div className="correction-section">
            <h4>修正信息</h4>
            <div className="form-row">
              <div className="form-group">
                <label>可修正</label>
                <select value={isFixable} onChange={(e) => setIsFixable(e.target.value)}>
                  <option value="">请选择</option>
                  <option value="fixable">可修正</option>
                  <option value="not-fixable">不可修正</option>
                  <option value="partially-fixable">部分可修正</option>
                </select>
              </div>
              <div className="form-group">
                <label>修正后风险等级</label>
                <select value={fixedRiskLevel} onChange={(e) => setFixedRiskLevel(e.target.value)}>
                  <option value="">请选择</option>
                  <option value="high">高风险</option>
                  <option value="medium">中风险</option>
                  <option value="low">低风险</option>
                  <option value="none">无风险</option>
                </select>
              </div>
              <div className="form-group">
                <label>实际修正类型</label>
                <select value={actualFixType} onChange={(e) => setActualFixType(e.target.value)}>
                  <option value="">请选择</option>
                  <option value="technical">技术修正</option>
                  <option value="management">管理修正</option>
                  <option value="process">流程修正</option>
                  <option value="config">配置修正</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>实际修正描述</label>
                <textarea 
                  value={actualFixDescription} 
                  onChange={(e) => setActualFixDescription(e.target.value)}
                  rows="2"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>实际修正位置</label>
                <input 
                  type="text" 
                  value={actualFixLocation} 
                  onChange={(e) => setActualFixLocation(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="rule-modal-footer">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button className="btn-save" onClick={saveRules} disabled={saving}>
            {saving ? '保存中...' : '保存规则'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RuleManagerModal;