// client/src/components/Dengbao/AssessmentRecordModal.jsx
import React, { useState, useEffect } from 'react';
import '../../../styles/Dengbao/Project/projectAssets.css';

function AssessmentRecordModal({ asset, onSave, onClose }) {
  const [loading, setLoading] = useState(true);
  const [indicators, setIndicators] = useState([]);
  const [recordData, setRecordData] = useState({});
  const [saving, setSaving] = useState(false);

  const getToken = () => localStorage.getItem('access_token');

  // 获取测评类型关联的测评指标
  const fetchIndicators = async () => {
    if (!asset.assessment_type_id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/assessment-indicators/by-type/${asset.assessment_type_id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (response.ok) {
        const data = await response.json();
        // 存储指标信息，包含 name_cn（中文显示）和 name_en（英文存储）
        const indicatorsList = data.indicators || [];
        setIndicators(indicatorsList);
        
        // 初始化表单数据，使用英文key存储
        const savedRecord = asset.assessment_record || {};
        const initialData = {};
        indicatorsList.forEach(indicator => {
          // 如果已有保存的数据，使用保存的值，否则为空
          initialData[indicator.name_en] = savedRecord[indicator.name_en] || '';
        });
        setRecordData(initialData);
      }
    } catch (error) {
      console.error('获取测评指标失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, [asset.assessment_type_id]);

  // 更新字段值（使用英文key存储）
  const handleFieldChange = (nameEn, value) => {
    setRecordData({
      ...recordData,
      [nameEn]: value
    });
  };

  // 保存测评记录
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/project-assets/${asset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          ...asset,
          assessment_record: recordData
        })
      });

      if (response.ok) {
        alert('测评记录保存成功！');
        onSave(recordData);
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

  // 根据指标类型渲染输入组件
  const renderField = (indicator) => {
    const value = recordData[indicator.name_en] || '';
    const displayName = indicator.name_cn || indicator.name_en;
    
    switch (indicator.type) {
      case 'checkbox':
        // 可选框类型，渲染为键值对选项
        const options = indicator.options || {};
        const optionKeys = Object.keys(options);
        
        if (optionKeys.length > 0) {
          return (
            <select 
              value={value} 
              onChange={(e) => handleFieldChange(indicator.name_en, e.target.value)}
              className="record-select"
            >
              <option value="">请选择</option>
              {optionKeys.map(key => (
                <option key={key} value={key}>{options[key]}</option>
              ))}
            </select>
          );
        }
        return (
          <select 
            value={value} 
            onChange={(e) => handleFieldChange(indicator.name_en, e.target.value)}
            className="record-select"
          >
            <option value="">请选择</option>
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
        );
      
      case 'datetime':
        return (
          <input 
            type="datetime-local" 
            value={value} 
            onChange={(e) => handleFieldChange(indicator.name_en, e.target.value)}
            className="record-input"
          />
        );
      
      default:
        return (
          <textarea 
            value={value} 
            onChange={(e) => handleFieldChange(indicator.name_en, e.target.value)}
            className="record-textarea"
            rows="3"
            placeholder={`请输入${displayName}...`}
          />
        );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="record-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="record-modal-header">
          <h2>测评记录 - {asset.device_name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="record-modal-body">
          {loading ? (
            <div className="record-loading">加载测评指标中...</div>
          ) : indicators.length === 0 ? (
            <div className="record-empty">
              <div className="empty-icon">📋</div>
              <p>该资产未关联测评类型或测评类型暂无测评指标</p>
              <p className="empty-hint">请先在"测评类型管理"中配置关联的测评项和测评指标</p>
            </div>
          ) : (
            <div className="record-fields">
              {/* 设备基本信息卡片 */}
              <div className="info-card">
                <div className="info-card-header">设备基本信息</div>
                <div className="info-card-body">
                  <div className="info-row">
                    <div className="info-label">设备名称：</div>
                    <div className="info-value">{asset.device_name}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">设备类型：</div>
                    <div className="info-value">{asset.device_type || '-'}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">主机地址：</div>
                    <div className="info-value">{asset.host_address || '-'}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">重要程度：</div>
                    <div className="info-value">{asset.importance || '-'}</div>
                  </div>
                </div>
              </div>
              
              {/* 测评指标填写区域 */}
              <div className="info-card">
                <div className="info-card-header">测评指标</div>
                <div className="info-card-body">
                  {indicators.map((indicator, index) => (
                    <div key={index} className="record-field-group">
                      <label className="record-field-label">
                        {indicator.name_cn || indicator.name_en}
                        {indicator.type === 'checkbox' && <span className="field-type-badge">单选</span>}
                        {indicator.type === 'datetime' && <span className="field-type-badge">日期时间</span>}
                        {indicator.type === 'string' && <span className="field-type-badge">文本</span>}
                      </label>
                      {renderField(indicator)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="record-modal-footer">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={saving || loading}
          >
            {saving ? '保存中...' : '保存记录'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssessmentRecordModal;