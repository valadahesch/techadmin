// client/src/components/Dengbao/RuleManagerModal.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/Dengbao/RuleManagerModal.css';

function RuleManagerModal({ itemId, itemName, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('detail');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 测评项详情数据
  const [itemInfo, setItemInfo] = useState(null);
  
  // 已有规则数据
  const [existingRules, setExistingRules] = useState([]);
  const [deletedRules, setDeletedRules] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  
  // 规则构建器数据
  const [currentRuleType, setCurrentRuleType] = useState('basic');
  const [builderRules, setBuilderRules] = useState([]);
  const [resultText, setResultText] = useState('');
  const [resultSummary, setResultSummary] = useState('');
  
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
  const operators = ['=', '≥', '≤', '>', '<', '!=', 'in', 'regex'];

  // 字段翻译映射
  const fieldTranslations = {
    "passwordLength": "密码长度",
    "passwordExpiry": "密码有效期",
    "charTypes": "密码字符串类型数量",
    "loginFailCount": "登录失败次数",
    "lockTime": "锁定时间",
    "timeout": "连接超时时间",
    "loginMethod": "登录协议类型",
    "sysAdmin": "系统管理员",
    "securityAdmin": "安全管理员",
    "auditAdmin": "审计管理员",
    "logFunction": "日志功能是否开启",
    "backupMethod": "日志备份模式",
    "logBackupCycle": "日志备份周期",
    "logHalfYear": "日志是否满半年",
    "logContent": "日志内容",
    "logEarliestTime": "最早的日志时间",
    "dataBackup": "数据备份是否开启",
    "backupStrategy": "数据备份方式",
    "configBackupCycle": "配置备份周期",
    "configBackupTime": "配置备份时间",
    "configRestoreTest": "配置备份恢复测试",
    "remoteBackup": "远程备份是否开启",
    "backupLocation": "异地备份地址",
    "backupDistance": "异地备份距离，单位KM",
    "remoteBackupMethod": "异地备份模式",
    "ipsModule": "IPS模块是否开启",
    "ipsUpdateStrategy": "IPS模块更新模式",
    "ipsVersion": "IPS模块版本",
    "ipsUpdateDate": "IPS更新日期",
    "avModule": "是否开启AV模块",
    "avUpdateStrategy": "AV模块更新规则",
    "avVersion": "AV模块版本",
    "avUpdateDate": "AV更新日期",
    "vulnScanResult": "是否有高风险",
    "confidentialityAlgo": "是否开启保密性算法",
    "integrityAlgo": "是否开启完整性算法",
    "confidentialityAlgoDetail": "保密性算法",
    "integrityAlgoDetail": "完整性算法",
    "deploymentMode": "部署模式",
    "sourceAddressRange": "管理源地址限制",
    "trustVerify": "可信验证",
    "trustedHost": "是否设置可信主机",
    "twoFactorAuth": "二次验证是否开启",
    "secondAuthMethod": "二次验证类型",
    "securityMark": "安全标记",
    "securityMarkDetails": "安全标记具体措施",
    "defaultAllow": "默认允许",
    "notApplicable": "不适用",
    "isFixable": "可修正",
    "fixedRiskLevel": "修正后风险等级",
    "actualFixType": "实际修正类型",
    "actualFixDescription": "实际修正描述",
    "actualFixLocation": "实际修正位置"
  };

  const valueTranslations = {
    "audit": "日志审计备份",
    "manual": "手动备份",
    "notBacked": "审计记录未备份",
    "newAudit": "设备上线不足半年（日志审计备份）",
    "newManual": "设备上线不足半年（手动备份）",
    "newNotBacked": "设备上线不足半年（未备份）",
    "highRisk": "有高风险",
    "noHighRisk": "没有高风险",
    "abandon": "放弃漏扫",
    "standalone": "单机部署",
    "bypass": "旁路部署",
    "ha": "HA部署",
    "True": "是",
    "False": "否",
    "true": "是",
    "false": "否",
    "fixable": "可修正",
    "not-fixable": "不可修正",
    "partially-fixable": "部分可修正",
    "high": "高风险",
    "medium": "中风险",
    "low": "低风险",
    "none": "无风险",
    "technical": "技术修正",
    "management": "管理修正",
    "process": "流程修正",
    "config": "配置修正",
    "other": "其他"
  };

  const fieldConfig = {
    inputFields: [
      "passwordLength", "charTypes", "loginFailCount", "lockTime", "timeout",
      "sysAdmin", "securityAdmin", "auditAdmin", "logContent", "logEarliestTime",
      "backupStrategy", "backupLocation", "backupDistance", "remoteBackupMethod",
      "ipsUpdateStrategy", "ipsVersion", "avUpdateStrategy", "avVersion",
      "confidentialityAlgoDetail", "integrityAlgoDetail", "sourceAddressRange", "secondAuthMethod",
      "logBackupCycle", "configBackupCycle", "configBackupTime",
      "ipsUpdateDate", "avUpdateDate", "securityMarkDetails",
      "passwordExpiry", "actualFixLocation", "actualRelatedThreats", "actualRiskLevel"
    ],
    booleanFields: [
      "logFunction", "dataBackup", "configRestoreTest", "remoteBackup",
      "ipsModule", "avModule", "trustVerify", "twoFactorAuth", "securityMark",
      "confidentialityAlgo", "integrityAlgo", "trustedHost", "logHalfYear"
    ],
    loginMethodField: ["loginMethod"],
    backupMethodField: ["backupMethod"],
    deploymentModeField: ["deploymentMode"],
    vulnScanResultField: ["vulnScanResult"],
    selectFields: ["isFixable", "fixedRiskLevel", "actualFixType"],
    textareaFields: ["actualProblem", "actualHarmAnalysis", "actualSuggestions", "actualFixDescription", "resultText"],
    textInputFields: ["actualRelatedThreats", "actualRiskLevel", "actualFixLocation"],
    specialFields: ["notApplicable", "defaultAllow"]
  };

  const fieldOptions = {
    booleanOptions: [
      { value: "true", label: "是" },
      { value: "false", label: "否" }
    ],
    loginMethod: ["HTTPS", "HTTP", "SSH", "Telnet", "本地"],
    backupMethod: [
      { value: "audit", label: "日志审计备份" },
      { value: "manual", label: "手动备份" },
      { value: "notBacked", label: "审计记录未备份" },
      { value: "newAudit", label: "设备上线不足半年（日志审计备份）" },
      { value: "newManual", label: "设备上线不足半年（手动备份）" },
      { value: "newNotBacked", label: "设备上线不足半年（未备份）" }
    ],
    deploymentMode: [
      { value: "standalone", label: "单机部署" },
      { value: "bypass", label: "旁路部署" },
      { value: "ha", label: "HA部署" }
    ],
    vulnScanResult: [
      { value: "highRisk", label: "有高风险" },
      { value: "noHighRisk", label: "没有高风险" },
      { value: "abandon", label: "放弃漏扫" }
    ],
    isFixable: [
      { value: "fixable", label: "可修正" },
      { value: "not-fixable", label: "不可修正" },
      { value: "partially-fixable", label: "部分可修正" }
    ],
    fixedRiskLevel: [
      { value: "high", label: "高风险" },
      { value: "medium", label: "中风险" },
      { value: "low", label: "低风险" },
      { value: "none", label: "无风险" }
    ],
    actualFixType: [
      { value: "technical", label: "技术修正" },
      { value: "management", label: "管理修正" },
      { value: "process", label: "流程修正" },
      { value: "config", label: "配置修正" },
      { value: "other", label: "其他" }
    ]
  };

  const translateField = (key) => fieldTranslations[key] || key;
  const translateValue = (val) => {
    if (val === null || val === undefined) return val;
    const str = String(val);
    return valueTranslations[str] || str;
  };

  // 获取字段选项
  const getFieldOptionsList = () => {
    if (!itemInfo || !itemInfo.assessment_indicators) return [];
    return itemInfo.assessment_indicators.map(indicator => ({
      value: indicator,
      label: translateField(indicator)
    }));
  };

  // 获取数据
  const fetchData = async () => {
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
          const ruleGroup = data.rules_data[0];
          setExistingRules(ruleGroup.standard || []);
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
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [itemId]);

  // 规则构建器方法
  const addBuilderRule = () => {
    setBuilderRules([...builderRules, { key: '', condition: '=', value: '' }]);
  };

  const updateBuilderRule = (index, field, value) => {
    const newRules = [...builderRules];
    newRules[index][field] = value;
    setBuilderRules(newRules);
  };

  const removeBuilderRule = (index) => {
    setBuilderRules(builderRules.filter((_, i) => i !== index));
  };

  // 将构建器规则添加到详情
  const addToExistingRules = () => {
    if (builderRules.length === 0) {
      alert('请先在规则构建器中添加规则');
      return;
    }
    
    const newRules = [...existingRules, ...builderRules];
    setExistingRules(newRules);
    setBuilderRules([]);
    setActiveTab('rules');
  };

  // 规则详情方法
  const markForDelete = (index) => {
    if (!deletedRules.includes(index)) {
      setDeletedRules([...deletedRules, index]);
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
  };

  const saveEdit = (index, newRule) => {
    const newRules = [...existingRules];
    newRules[index] = newRule;
    setExistingRules(newRules);
    setEditingIndex(-1);
  };

  // 保存所有规则
  const saveAllRules = async () => {
    setSaving(true);
    try {
      const finalRules = existingRules.filter((_, idx) => !deletedRules.includes(idx));
      
      const token = getToken();
      const dataToSave = {
        rules_data: [{
          standard: finalRules,
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
      console.error('保存失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const getResultBadgeClass = (summary) => {
    switch(summary) {
      case 'compliant': return 'result-summary-compliant';
      case 'non-compliant': return 'result-summary-non-compliant';
      case 'partially-compliant': return 'result-summary-partially-compliant';
      case 'not-applicable': return 'result-summary-not-applicable';
      default: return '';
    }
  };

  const getResultBadgeText = (summary) => {
    switch(summary) {
      case 'compliant': return '符合';
      case 'non-compliant': return '不符合';
      case 'partially-compliant': return '部分符合';
      case 'not-applicable': return '不适用';
      default: return summary;
    }
  };

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
            <button className="btn-save-header" onClick={saveAllRules} disabled={saving}>
              {saving ? '保存中...' : '💾 保存'}
            </button>
            <button className="rule-modal-close" onClick={onClose}>×</button>
          </div>
        </div>
        
        {/* Tab页切换 */}
        <div className="rule-tabs">
          <button 
            className={`rule-tab ${activeTab === 'detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('detail')}
          >
            📋 测评项详情
          </button>
          <button 
            className={`rule-tab ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            📝 规则详情 ({existingRules.filter((_, i) => !deletedRules.includes(i)).length})
          </button>
          <button 
            className={`rule-tab ${activeTab === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('builder')}
          >
            🔧 规则构建器
          </button>
        </div>
        
        <div className="rule-modal-body">
          {/* Tab 1: 测评项详情 */}
          {activeTab === 'detail' && (
            <div className="tab-content">
              <div className="content-card">
                <div className="card-header">规则详情</div>
                <div className="card-body">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th width="80">序号</th>
                        <th width="150">标准类型</th>
                        <th width="150">安全控制点</th>
                        <th>测评对象</th>
                        <th>检测项</th>
                        <th>检测指标</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>{itemInfo?.standard_type || '-'}</td>
                        <td>{itemInfo?.security_control || '-'}</td>
                        <td>{itemInfo?.assessment_object || '-'}</td>
                        <td className="detection-item-cell">{itemInfo?.detection_item || '-'}</td>
                        <td>
                          {itemInfo?.assessment_indicators?.map((indicator, idx) => (
                            <span key={idx} className="badge badge-primary me-1">
                              {translateField(indicator)}
                            </span>
                          ))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Tab 2: 规则详情 */}
          {activeTab === 'rules' && (
            <div className="tab-content">
              <div className="content-card">
                <div className="card-header">
                  已有规则
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('builder')}>
                    + 新增规则
                  </button>
                </div>
                <div className="card-body">
                  <div className="existing-rules-container">
                    {existingRules.filter((_, i) => !deletedRules.includes(i)).length === 0 ? (
                      <div className="empty-state">
                        <i className="bi bi-inbox"></i>
                        <h3>暂无规则</h3>
                        <p>当前没有保存的规则，请使用规则构建器创建新规则。</p>
                      </div>
                    ) : (
                      existingRules.map((rule, idx) => {
                        if (deletedRules.includes(idx)) return null;
                        const isEditing = editingIndex === idx;
                        
                        return (
                          <div key={idx} className={`existing-rule-card ${isEditing ? 'edit-mode' : ''}`}>
                            <div className="existing-rule-header">
                              <div className="rule-group-title">
                                <span>规则组 {idx + 1}</span>
                                <span className="basic-rule-indicator">基础规则</span>
                              </div>
                              <div className="rule-actions-container">
                                {!isEditing ? (
                                  <>
                                    <button className="btn btn-sm btn-warning" onClick={() => startEdit(idx)}>
                                      ✏️ 编辑
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => markForDelete(idx)}>
                                      🗑️ 删除
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button className="btn btn-sm btn-success" onClick={() => cancelEdit()}>
                                      ✅ 取消
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="existing-rule-body">
                              {isEditing ? (
                                <EditRuleForm 
                                  rule={rule}
                                  onSave={(newRule) => saveEdit(idx, newRule)}
                                  onCancel={cancelEdit}
                                  fieldOptions={getFieldOptionsList()}
                                  operators={operators}
                                  translateField={translateField}
                                />
                              ) : (
                                <>
                                  <table className="existing-rule-table">
                                    <thead>
                                      <tr><th>字段</th><th>条件</th><th>值</th></tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td className="existing-rule-key">{translateField(rule.key)}</td>
                                        <td className="existing-rule-condition">{rule.condition}</td>
                                        <td className="existing-rule-value">{translateValue(rule.value)}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  {resultText && (
                                    <div className="existing-rule-result">
                                      <strong>判断结果:</strong> {resultText}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              
              {/* 分析信息和修正信息模块 */}
              <div className="analysis-module">
                <div className="analysis-module-header">
                  <i className="bi bi-clipboard-data"></i>
                  <h5>分析信息</h5>
                </div>
                <div className="analysis-fields-grid">
                  <div className="analysis-field-group full-width-field">
                    <label>判断结果</label>
                    <textarea className="form-control" rows="3" value={resultText} onChange={(e) => setResultText(e.target.value)} placeholder="请输入判断结果..."></textarea>
                  </div>
                  <div className="analysis-field-group full-width-field">
                    <label>实际问题</label>
                    <textarea className="form-control" rows="2" value={actualProblem} onChange={(e) => setActualProblem(e.target.value)} placeholder="请输入实际问题..."></textarea>
                  </div>
                  <div className="analysis-field-group">
                    <label>实际关联威胁</label>
                    <input type="text" className="form-control" value={actualRelatedThreats} onChange={(e) => setActualRelatedThreats(e.target.value)} placeholder="请输入实际关联威胁..."/>
                  </div>
                  <div className="analysis-field-group">
                    <label>实际危害分析</label>
                    <textarea className="form-control" rows="2" value={actualHarmAnalysis} onChange={(e) => setActualHarmAnalysis(e.target.value)} placeholder="请输入实际危害分析..."></textarea>
                  </div>
                  <div className="analysis-field-group">
                    <label>实际风险等级</label>
                    <input type="text" className="form-control" value={actualRiskLevel} onChange={(e) => setActualRiskLevel(e.target.value)} placeholder="请输入实际风险等级..."/>
                  </div>
                  <div className="analysis-field-group">
                    <label>实际建议</label>
                    <textarea className="form-control" rows="2" value={actualSuggestions} onChange={(e) => setActualSuggestions(e.target.value)} placeholder="请输入实际建议..."></textarea>
                  </div>
                </div>
              </div>
              
              <div className="correction-module">
                <div className="correction-module-header">
                  <i className="bi bi-tools"></i>
                  <h5>修正信息</h5>
                </div>
                <div className="correction-fields-grid">
                  <div className="correction-field-group">
                    <label>可修正</label>
                    <select className="form-select" value={isFixable} onChange={(e) => setIsFixable(e.target.value)}>
                      <option value="">请选择</option>
                      <option value="fixable">可修正</option>
                      <option value="not-fixable">不可修正</option>
                      <option value="partially-fixable">部分可修正</option>
                    </select>
                  </div>
                  <div className="correction-field-group">
                    <label>修正后风险等级</label>
                    <select className="form-select" value={fixedRiskLevel} onChange={(e) => setFixedRiskLevel(e.target.value)}>
                      <option value="">请选择</option>
                      <option value="high">高风险</option>
                      <option value="medium">中风险</option>
                      <option value="low">低风险</option>
                      <option value="none">无风险</option>
                    </select>
                  </div>
                  <div className="correction-field-group">
                    <label>实际修正类型</label>
                    <select className="form-select" value={actualFixType} onChange={(e) => setActualFixType(e.target.value)}>
                      <option value="">请选择</option>
                      <option value="technical">技术修正</option>
                      <option value="management">管理修正</option>
                      <option value="process">流程修正</option>
                      <option value="config">配置修正</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div className="correction-field-group correction-description-field">
                    <label>实际修正描述</label>
                    <textarea className="form-control" rows="2" value={actualFixDescription} onChange={(e) => setActualFixDescription(e.target.value)} placeholder="请输入实际修正描述..."></textarea>
                  </div>
                  <div className="correction-field-group">
                    <label>实际修正位置</label>
                    <input type="text" className="form-control" value={actualFixLocation} onChange={(e) => setActualFixLocation(e.target.value)} placeholder="请输入实际修正位置..."/>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tab 3: 规则构建器 */}
          {activeTab === 'builder' && (
            <div className="tab-content">
              <div className="content-card">
                <div className="card-header">
                  规则构建器
                  <button className="btn btn-primary btn-sm" onClick={addToExistingRules}>
                    ➡️ 添加到规则详情
                  </button>
                </div>
                <div className="card-body">
                  <div className="result-summary-container">
                    <span className="result-summary-label">结果总述：</span>
                    <select className="form-select" value={resultSummary} onChange={(e) => setResultSummary(e.target.value)} style={{ width: 'auto' }}>
                      <option value="">符合情况</option>
                      <option value="compliant">符合</option>
                      <option value="non-compliant">不符合</option>
                      <option value="partially-compliant">部分符合</option>
                      <option value="not-applicable">不适用</option>
                    </select>
                  </div>
                  
                  <div className="rule-type-selector">
                    <div 
                      className={`rule-type-btn ${currentRuleType === 'basic' ? 'active' : ''}`}
                      onClick={() => setCurrentRuleType('basic')}
                    >
                      <i className="bi bi-list-check"></i> 基础规则
                    </div>
                    <div 
                      className={`rule-type-btn composite-rule-btn ${currentRuleType === 'composite' ? 'active' : ''}`}
                      onClick={() => setCurrentRuleType('composite')}
                    >
                      <i className="bi bi-diagram-3"></i> 复合规则
                    </div>
                  </div>
                  
                  <div className="rule-builder">
                    <div id="rulesContainer">
                      {builderRules.map((rule, idx) => (
                        <div key={idx} className="rule-row">
                          <div className="rule-field">
                            <select className="form-select" value={rule.key} onChange={(e) => updateBuilderRule(idx, 'key', e.target.value)}>
                              <option value="">请选择字段</option>
                              {getFieldOptionsList().map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="rule-operator">
                            <select className="form-select" value={rule.condition} onChange={(e) => updateBuilderRule(idx, 'condition', e.target.value)}>
                              {operators.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                          </div>
                          <div className="rule-value">
                            <input type="text" className="form-control" value={rule.value} onChange={(e) => updateBuilderRule(idx, 'value', e.target.value)} placeholder="请输入值"/>
                          </div>
                          <div className="rule-actions">
                            <button className="btn btn-danger btn-sm" onClick={() => removeBuilderRule(idx)}>删除</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between mt-4">
                      <button className="btn btn-success" onClick={addBuilderRule}>
                        <i className="bi bi-plus-lg"></i> 添加规则
                      </button>
                    </div>
                  </div>
                  
                  {/* 分析信息模块 */}
                  <div className="analysis-module">
                    <div className="analysis-module-header">
                      <i className="bi bi-clipboard-data"></i>
                      <h5>分析信息</h5>
                    </div>
                    <div className="analysis-fields-grid">
                      <div className="analysis-field-group full-width-field">
                        <label>判断结果</label>
                        <textarea className="form-control" rows="3" value={resultText} onChange={(e) => setResultText(e.target.value)} placeholder="请输入判断结果..."></textarea>
                      </div>
                      <div className="analysis-field-group full-width-field">
                        <label>实际问题</label>
                        <textarea className="form-control" rows="2" value={actualProblem} onChange={(e) => setActualProblem(e.target.value)} placeholder="请输入实际问题..."></textarea>
                      </div>
                      <div className="analysis-field-group">
                        <label>实际关联威胁</label>
                        <input type="text" className="form-control" value={actualRelatedThreats} onChange={(e) => setActualRelatedThreats(e.target.value)} placeholder="请输入实际关联威胁..."/>
                      </div>
                      <div className="analysis-field-group">
                        <label>实际危害分析</label>
                        <textarea className="form-control" rows="2" value={actualHarmAnalysis} onChange={(e) => setActualHarmAnalysis(e.target.value)} placeholder="请输入实际危害分析..."></textarea>
                      </div>
                      <div className="analysis-field-group">
                        <label>实际风险等级</label>
                        <input type="text" className="form-control" value={actualRiskLevel} onChange={(e) => setActualRiskLevel(e.target.value)} placeholder="请输入实际风险等级..."/>
                      </div>
                      <div className="analysis-field-group">
                        <label>实际建议</label>
                        <textarea className="form-control" rows="2" value={actualSuggestions} onChange={(e) => setActualSuggestions(e.target.value)} placeholder="请输入实际建议..."></textarea>
                      </div>
                    </div>
                  </div>
                  
                  {/* 修正信息模块 */}
                  <div className="correction-module">
                    <div className="correction-module-header">
                      <i className="bi bi-tools"></i>
                      <h5>修正信息</h5>
                    </div>
                    <div className="correction-fields-grid">
                      <div className="correction-field-group">
                        <label>可修正</label>
                        <select className="form-select" value={isFixable} onChange={(e) => setIsFixable(e.target.value)}>
                          <option value="">请选择</option>
                          <option value="fixable">可修正</option>
                          <option value="not-fixable">不可修正</option>
                          <option value="partially-fixable">部分可修正</option>
                        </select>
                      </div>
                      <div className="correction-field-group">
                        <label>修正后风险等级</label>
                        <select className="form-select" value={fixedRiskLevel} onChange={(e) => setFixedRiskLevel(e.target.value)}>
                          <option value="">请选择</option>
                          <option value="high">高风险</option>
                          <option value="medium">中风险</option>
                          <option value="low">低风险</option>
                          <option value="none">无风险</option>
                        </select>
                      </div>
                      <div className="correction-field-group">
                        <label>实际修正类型</label>
                        <select className="form-select" value={actualFixType} onChange={(e) => setActualFixType(e.target.value)}>
                          <option value="">请选择</option>
                          <option value="technical">技术修正</option>
                          <option value="management">管理修正</option>
                          <option value="process">流程修正</option>
                          <option value="config">配置修正</option>
                          <option value="other">其他</option>
                        </select>
                      </div>
                      <div className="correction-field-group correction-description-field">
                        <label>实际修正描述</label>
                        <textarea className="form-control" rows="2" value={actualFixDescription} onChange={(e) => setActualFixDescription(e.target.value)} placeholder="请输入实际修正描述..."></textarea>
                      </div>
                      <div className="correction-field-group">
                        <label>实际修正位置</label>
                        <input type="text" className="form-control" value={actualFixLocation} onChange={(e) => setActualFixLocation(e.target.value)} placeholder="请输入实际修正位置..."/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 编辑规则表单组件
function EditRuleForm({ rule, onSave, onCancel, fieldOptions, operators, translateField }) {
  const [formData, setFormData] = useState({ ...rule });

  return (
    <div className="edit-rule-form">
      <div className="edit-rule-row">
        <label>字段</label>
        <select value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })}>
          <option value="">请选择字段</option>
          {fieldOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="edit-rule-row">
        <label>条件</label>
        <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })}>
          {operators.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
      </div>
      <div className="edit-rule-row">
        <label>值</label>
        <input type="text" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="请输入值"/>
      </div>
      <div className="edit-rule-actions">
        <button className="btn btn-sm btn-success" onClick={() => onSave(formData)}>保存</button>
        <button className="btn btn-sm btn-secondary" onClick={onCancel}>取消</button>
      </div>
    </div>
  );
}

export default RuleManagerModal;