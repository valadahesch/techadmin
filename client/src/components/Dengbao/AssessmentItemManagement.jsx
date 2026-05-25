// client/src/components/Dengbao/AssessmentItemManagement.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/Dengbao/AssessmentItemManagement.css';

function AssessmentItemManagement() {
  const [items, setItems] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // 筛选条件
  const [filterStandardType, setFilterStandardType] = useState('');
  const [filterAssessmentLevel, setFilterAssessmentLevel] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 标准类型选项
  const standardTypeOptions = [
    '安全通用要求',
    '服务器虚拟化',
    '云服务商',
    '工业控制',
    '移动互联',
    '物联网'
  ];

  // 测评等级选项
  const levelOptions = ['等保二级', '等保三级'];

  const getToken = () => localStorage.getItem('access_token');

  // 获取测评指标列表
  const fetchIndicators = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/assessment-indicators/list', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setIndicators(data.items || []);
      }
    } catch (error) {
      console.error('获取指标列表失败:', error);
    }
  };

  // 获取测评项列表（按修改时间降序）
  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = `http://localhost:5000/api/assessment-items?page=${currentPage}&per_page=${pageSize}`;
      if (filterStandardType) url += `&standard_type=${encodeURIComponent(filterStandardType)}`;
      if (filterAssessmentLevel) url += `&assessment_level=${encodeURIComponent(filterAssessmentLevel)}`;
      if (searchKeyword) url += `&search=${encodeURIComponent(searchKeyword)}`;

      const response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
        setTotal(data.total);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error('获取测评项列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [currentPage, filterStandardType, filterAssessmentLevel, searchKeyword]);

  // 筛选条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStandardType, filterAssessmentLevel, searchKeyword]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`确定要删除测评项 "${name}" 吗？`)) {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/api/assessment-items/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
          fetchItems();
        } else {
          alert('删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const handleSave = async (data) => {
    try {
      const token = getToken();
      const url = editingItem 
        ? `http://localhost:5000/api/assessment-items/${editingItem.id}`
        : 'http://localhost:5000/api/assessment-items';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        fetchItems();
        setShowModal(false);
        setEditingItem(null);
      } else {
        const error = await response.json();
        alert(error.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 分页按钮生成
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    buttons.push(
      <button 
        key="prev"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        上一页
      </button>
    );
    
    if (startPage > 1) {
      buttons.push(
        <button key={1} onClick={() => setCurrentPage(1)} className="pagination-btn">1</button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      buttons.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="pagination-btn">
          {totalPages}
        </button>
      );
    }
    
    buttons.push(
      <button 
        key="next"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        下一页
      </button>
    );
    
    return buttons;
  };

  return (
    <div className="management-container">
      <div className="page-header">
        <h1>测评项管理</h1>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
          + 新增测评项
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">总测评项</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">标准类型</span>
          <span className="stat-value">{standardTypeOptions.length}</span>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="搜索安全控制点、测评对象、检测项..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <select 
          value={filterStandardType} 
          onChange={(e) => setFilterStandardType(e.target.value)}
          className="filter-select"
        >
          <option value="">全部标准类型</option>
          {standardTypeOptions.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select 
          value={filterAssessmentLevel} 
          onChange={(e) => setFilterAssessmentLevel(e.target.value)}
          className="filter-select"
        >
          <option value="">全部测评等级</option>
          {levelOptions.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      {/* 数据表格 */}
      <div className="data-table">
        <table className="device-table">
          <thead>
            <tr>
              <th>标准类型</th>
              <th>安全控制点</th>
              <th>测评对象</th>
              <th>检测项</th>
              <th>测评指标</th>
              <th>测评等级</th>
              <th>创建人</th>
              <th>修改人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="loading-cell">加载中...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="9" className="empty-cell">暂无数据</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td><span className="type-badge">{item.standard_type}</span></td>
                  <td><strong>{item.security_control}</strong></td>
                  <td>{item.assessment_object}</td>
                  <td className="desc-cell" title={item.detection_item}>{item.detection_item}</td>
                  <td>
                    {item.assessment_indicators && item.assessment_indicators.length > 0 ? (
                      <span className="indicator-count">{item.assessment_indicators.length}个指标</span>
                    ) : '-'}
                  </td>
                  <td>
                    {item.assessment_levels && item.assessment_levels.map(level => (
                      <span key={level} className="level-tag">{level}</span>
                    ))}
                  </td>
                  <td><span className="user-name">{item.creator_name || '-'}</span></td>
                  <td><span className="user-name">{item.updater_name || '-'}</span></td>
                  <td>
                    <button className="btn-edit" onClick={() => { setEditingItem(item); setShowModal(true); }}>编辑</button>
                    <button className="btn-delete" onClick={() => handleDelete(item.id, item.security_control)}>删除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页组件 */}
      {!loading && totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            显示第 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, total)} 条，共 {total} 条记录
          </div>
          <div className="pagination-buttons">
            {renderPaginationButtons()}
          </div>
        </div>
      )}

      {/* 新增/编辑模态框 */}
      {showModal && (
        <AssessmentItemModal 
          item={editingItem} 
          onSave={handleSave} 
          onClose={() => { setShowModal(false); setEditingItem(null); }} 
          standardTypeOptions={standardTypeOptions}
          levelOptions={levelOptions}
          indicators={indicators}
        />
      )}
    </div>
  );
}

// 优化后的多选组件
function MultiSelect({ options, value, onChange, placeholder, displayKey = 'name_cn', valueKey = 'id' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const selectedSet = new Set(value || []);

  const toggleOption = (optionValue) => {
    const newValue = [...(value || [])];
    if (selectedSet.has(optionValue)) {
      const index = newValue.indexOf(optionValue);
      newValue.splice(index, 1);
    } else {
      newValue.push(optionValue);
    }
    onChange(newValue);
  };

  const addCustomValue = () => {
    if (customValue && customValue.trim() && !selectedSet.has(customValue.trim())) {
      onChange([...(value || []), customValue.trim()]);
      setCustomValue('');
    }
  };

  const removeValue = (val, e) => {
    e.stopPropagation();
    const newValue = (value || []).filter(v => v !== val);
    onChange(newValue);
  };

  return (
    <div className="multi-select">
      <div className="multi-select-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="selected-tags">
          {(value || []).length === 0 ? (
            <span className="placeholder">{placeholder}</span>
          ) : (
            (value || []).map(val => (
              <span key={val} className="selected-tag">
                {val}
                <button type="button" onClick={(e) => removeValue(val, e)}>×</button>
              </span>
            ))
          )}
        </div>
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="multi-select-dropdown">
          <div className="custom-input">
            <input 
              type="text" 
              value={customValue} 
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="输入自定义值，点击添加..."
              onKeyPress={(e) => e.key === 'Enter' && addCustomValue()}
            />
            <button type="button" onClick={addCustomValue}>添加</button>
          </div>
          <div className="options-list">
            {options.map(opt => {
              const optValue = opt[displayKey] || opt;
              const isChecked = selectedSet.has(optValue);
              return (
                <label key={optValue} className="option-item" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOption(optValue)}
                  />
                  <span>{optValue}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AssessmentItemModal({ item, onSave, onClose, standardTypeOptions, levelOptions, indicators }) {
  const [formData, setFormData] = useState({
    standard_type: item?.standard_type || '',
    security_control: item?.security_control || '',
    assessment_object: item?.assessment_object || '',
    detection_item: item?.detection_item || '',
    assessment_indicators: item?.assessment_indicators || [],
    assessment_levels: item?.assessment_levels || []
  });
  const [customStandardType, setCustomStandardType] = useState('');
  const [showCustomStandard, setShowCustomStandard] = useState(false);

  const handleStandardTypeChange = (value) => {
    if (value === 'custom') {
      setShowCustomStandard(true);
      setFormData({ ...formData, standard_type: '' });
    } else {
      setShowCustomStandard(false);
      setFormData({ ...formData, standard_type: value });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? '编辑测评项' : '新增测评项'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="form-row">
            <div className="form-group">
              <label>标准类型 *</label>
              <select 
                value={showCustomStandard ? 'custom' : formData.standard_type}
                onChange={(e) => handleStandardTypeChange(e.target.value)}
                required
              >
                <option value="">请选择</option>
                {standardTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
                <option value="custom">自定义...</option>
              </select>
              {showCustomStandard && (
                <input 
                  type="text" 
                  placeholder="请输入自定义标准类型"
                  value={customStandardType}
                  onChange={(e) => {
                    setCustomStandardType(e.target.value);
                    setFormData({ ...formData, standard_type: e.target.value });
                  }}
                  className="custom-input-mt"
                  required
                />
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>安全控制点 *</label>
              <input 
                type="text" 
                value={formData.security_control} 
                onChange={(e) => setFormData({ ...formData, security_control: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label>测评对象 *</label>
              <input 
                type="text" 
                value={formData.assessment_object} 
                onChange={(e) => setFormData({ ...formData, assessment_object: e.target.value })}
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label>检测项 *</label>
            <textarea 
              value={formData.detection_item} 
              onChange={(e) => setFormData({ ...formData, detection_item: e.target.value })}
              rows="3"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>测评指标（可多选）</label>
              <MultiSelect 
                options={indicators}
                value={formData.assessment_indicators}
                onChange={(val) => setFormData({ ...formData, assessment_indicators: val })}
                placeholder="请选择测评指标"
                displayKey="name_cn"
                valueKey="name_cn"
              />
            </div>
            <div className="form-group">
              <label>测评等级（可多选）</label>
              <MultiSelect 
                options={levelOptions}
                value={formData.assessment_levels}
                onChange={(val) => setFormData({ ...formData, assessment_levels: val })}
                placeholder="请选择测评等级"
                displayKey="name_cn"
                valueKey="name_cn"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-primary">保存</button>
            <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssessmentItemManagement;