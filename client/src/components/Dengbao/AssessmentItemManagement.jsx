// client/src/components/Dengbao/AssessmentItemManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../../styles/Dengbao/AssessmentItemManagement.css';

function AssessmentItemManagement() {
  const [items, setItems] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // 筛选选项
  const [filterOptions, setFilterOptions] = useState({
    standard_types: [],
    assessment_levels: [],
    security_controls: []
  });
  
  // 筛选条件
  const [filterStandardType, setFilterStandardType] = useState('');
  const [filterAssessmentLevel, setFilterAssessmentLevel] = useState('');
  const [filterSecurityControl, setFilterSecurityControl] = useState('');
  
  // 搜索相关
  const [searchInputValue, setSearchInputValue] = useState(''); // 输入框的值
  const [searchKeyword, setSearchKeyword] = useState(''); // 实际搜索的关键词
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  
  // 排序
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // 可见列配置
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    standard_type: true,
    security_control: true,
    assessment_object: true,
    detection_item: true,
    assessment_indicators: true,
    assessment_levels: true,
    creator_name: false,
    updater_name: true,
    created_at: false,
    updated_at: false
  });
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  
  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const getToken = () => localStorage.getItem('access_token');

  // 获取筛选选项
  const fetchFilterOptions = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/assessment-items/filters', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('获取筛选选项失败:', error);
    }
  };

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

  // 获取测评项列表
  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = `http://localhost:5000/api/assessment-items?page=${currentPage}&per_page=${pageSize}&sort_field=${sortField}&sort_order=${sortOrder}`;
      if (filterStandardType) url += `&standard_type=${encodeURIComponent(filterStandardType)}`;
      if (filterAssessmentLevel) url += `&assessment_level=${encodeURIComponent(filterAssessmentLevel)}`;
      if (filterSecurityControl) url += `&security_control=${encodeURIComponent(filterSecurityControl)}`;
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
      setIsSearching(false);
    }
  };

  // 执行搜索
  const handleSearch = () => {
    setSearchKeyword(searchInputValue);
    setCurrentPage(1);
    setIsSearching(true);
  };

  // 重置搜索
  const handleResetSearch = () => {
    setSearchInputValue('');
    setSearchKeyword('');
    setCurrentPage(1);
  };

  // 处理回车键
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchInputValue('');
    setSearchKeyword('');
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchIndicators();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [currentPage, filterStandardType, filterAssessmentLevel, filterSecurityControl, searchKeyword, sortField, sortOrder]);

  // 筛选条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStandardType, filterAssessmentLevel, filterSecurityControl, sortField, sortOrder]);

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
          fetchFilterOptions();
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
        fetchFilterOptions();
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

  // 切换排序
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // 获取排序图标
  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // 切换列可见性
  const toggleColumn = (column) => {
    setVisibleColumns({ ...visibleColumns, [column]: !visibleColumns[column] });
  };

  // 重置列可见性为默认
  const resetColumns = () => {
    setVisibleColumns({
      id: true,
      standard_type: true,
      security_control: true,
      assessment_object: true,
      detection_item: true,
      assessment_indicators: true,
      assessment_levels: true,
      creator_name: false,
      updater_name: true,
      created_at: false,
      updated_at: false
    });
  };

  // 格式化ID显示
  const formatId = (id) => {
    if (!id) return '-';
    return id.substring(0, 8) + '...';
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

  // 表格列定义
  const columns = [
    { key: 'id', label: 'ID', visible: visibleColumns.id, sortable: false, width: '100px' },
    { key: 'standard_type', label: '标准类型', visible: visibleColumns.standard_type, sortable: true },
    { key: 'security_control', label: '安全控制点', visible: visibleColumns.security_control, sortable: true },
    { key: 'assessment_object', label: '测评对象', visible: visibleColumns.assessment_object, sortable: false },
    { key: 'detection_item', label: '检测项', visible: visibleColumns.detection_item, sortable: false },
    { key: 'assessment_indicators', label: '测评指标', visible: visibleColumns.assessment_indicators, sortable: false },
    { key: 'assessment_levels', label: '测评等级', visible: visibleColumns.assessment_levels, sortable: false },
    { key: 'creator_name', label: '创建人', visible: visibleColumns.creator_name, sortable: false },
    { key: 'updater_name', label: '修改人', visible: visibleColumns.updater_name, sortable: false },
    { key: 'created_at', label: '创建时间', visible: visibleColumns.created_at, sortable: true },
    { key: 'updated_at', label: '修改时间', visible: visibleColumns.updated_at, sortable: true }
  ];

  const visibleColumnsList = columns.filter(col => col.visible);

  return (
    <div className="management-container">
      <div className="page-header">
        <h1>测评项管理</h1>
        <div className="header-buttons">
          <button className="btn-secondary" onClick={() => setShowColumnConfig(!showColumnConfig)}>
            📋 列设置
          </button>
          <button className="btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
            + 新增测评项
          </button>
        </div>
      </div>

      {/* 列配置面板 */}
      {showColumnConfig && (
        <div className="column-config-panel">
          <div className="panel-header">
            <span>选择要显示的列</span>
            <button onClick={resetColumns} className="btn-reset">重置默认</button>
            <button onClick={() => setShowColumnConfig(false)} className="btn-close">✕</button>
          </div>
          <div className="column-options">
            {columns.map(col => (
              <label key={col.key} className="column-option">
                <input
                  type="checkbox"
                  checked={visibleColumns[col.key]}
                  onChange={() => toggleColumn(col.key)}
                />
                <span>{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">总测评项</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">标准类型</span>
          <span className="stat-value">{filterOptions.standard_types.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">安全控制点</span>
          <span className="stat-value">{filterOptions.security_controls.length}</span>
        </div>
      </div>

      {/* 搜索和筛选栏 - 优化后的搜索框 */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="搜索安全控制点、测评对象、检测项..." 
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          {searchInputValue && (
            <button 
              type="button" 
              className="search-clear-btn"
              onClick={handleClearSearch}
              title="清空"
            >
              ✕
            </button>
          )}
          <button 
            type="button" 
            className="search-submit-btn"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? '搜索中...' : '🔍'}
          </button>
        </div>
        <select 
          value={filterStandardType} 
          onChange={(e) => setFilterStandardType(e.target.value)}
          className="filter-select"
        >
          <option value="">全部标准类型</option>
          {filterOptions.standard_types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select 
          value={filterAssessmentLevel} 
          onChange={(e) => setFilterAssessmentLevel(e.target.value)}
          className="filter-select"
        >
          <option value="">全部测评等级</option>
          {filterOptions.assessment_levels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        <select 
          value={filterSecurityControl} 
          onChange={(e) => setFilterSecurityControl(e.target.value)}
          className="filter-select"
        >
          <option value="">全部安全控制点</option>
          {filterOptions.security_controls.map(control => (
            <option key={control} value={control}>{control}</option>
          ))}
        </select>
      </div>

      {/* 搜索状态提示 */}
      {searchKeyword && (
        <div className="search-status">
          搜索关键词: "{searchKeyword}"
          <button onClick={handleResetSearch} className="clear-search-link">清空搜索</button>
        </div>
      )}

      {/* 数据表格 */}
      <div className="data-table">
        <table className="device-table">
          <thead>
            <tr>
              {visibleColumnsList.map(col => (
                <th key={col.key} style={{ width: col.width, minWidth: col.width }}>
                  {col.label}
                  {col.sortable && (
                    <button 
                      className="sort-btn" 
                      onClick={() => handleSort(col.key)}
                    >
                      {getSortIcon(col.key)}
                    </button>
                  )}
                </th>
              ))}
              <th style={{ width: '120px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={visibleColumnsList.length + 1} className="loading-cell">加载中...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={visibleColumnsList.length + 1} className="empty-cell">暂无数据</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  {visibleColumns.id && <td style={{ fontSize: '12px', fontFamily: 'monospace' }} title={item.id}>{formatId(item.id)}</td>}
                  {visibleColumns.standard_type && <td><span className="type-badge">{item.standard_type}</span></td>}
                  {visibleColumns.security_control && <td><strong>{item.security_control}</strong></td>}
                  {visibleColumns.assessment_object && <td>{item.assessment_object}</td>}
                  {visibleColumns.detection_item && <td className="desc-cell" title={item.detection_item}>{item.detection_item}</td>}
                  {visibleColumns.assessment_indicators && (
                    <td>
                      {item.assessment_indicators && item.assessment_indicators.length > 0 ? (
                        <span className="indicator-count">{item.assessment_indicators.length}个指标</span>
                      ) : '-'}
                    </td>
                  )}
                  {visibleColumns.assessment_levels && (
                    <td>
                      {item.assessment_levels && item.assessment_levels.map(level => (
                        <span key={level} className="level-tag">{level}</span>
                      ))}
                    </td>
                  )}
                  {visibleColumns.creator_name && <td>{item.creator_name || '-'}</td>}
                  {visibleColumns.updater_name && <td>{item.updater_name || '-'}</td>}
                  {visibleColumns.created_at && <td>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</td>}
                  {visibleColumns.updated_at && <td>{item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'}</td>}
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
          standardTypeOptions={filterOptions.standard_types}
          levelOptions={filterOptions.assessment_levels}
          indicators={indicators}
        />
      )}
    </div>
  );
}

// 多选组件（保持不变）
function MultiSelect({ options, value, onChange, placeholder, displayKey = 'name_cn', valueKey = 'id', allowCustom = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const selectedSet = new Set(value);

  const toggleOption = (optionValue) => {
    const newValue = [...value];
    if (selectedSet.has(optionValue)) {
      const index = newValue.indexOf(optionValue);
      newValue.splice(index, 1);
    } else {
      newValue.push(optionValue);
    }
    onChange(newValue);
  };

  const addCustomValue = () => {
    if (customValue && !selectedSet.has(customValue)) {
      onChange([...value, customValue]);
      setCustomValue('');
    }
  };

  const removeValue = (val) => {
    const newValue = value.filter(v => v !== val);
    onChange(newValue);
  };

  return (
    <div className="multi-select">
      <div className="multi-select-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="selected-tags">
          {value.map(val => (
            <span key={val} className="selected-tag">
              {val}
              <button type="button" onClick={(e) => { e.stopPropagation(); removeValue(val); }}>×</button>
            </span>
          ))}
          {value.length === 0 && <span className="placeholder">{placeholder}</span>}
        </div>
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="multi-select-dropdown">
          {allowCustom && (
            <div className="custom-input">
              <input 
                type="text" 
                value={customValue} 
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="输入自定义值..."
              />
              <button type="button" onClick={addCustomValue}>添加</button>
            </div>
          )}
          <div className="options-list">
            {options.map(opt => {
              const optValue = typeof opt === 'string' ? opt : opt[displayKey];
              return (
                <label key={optValue} className="option-item">
                  <input
                    type="checkbox"
                    checked={selectedSet.has(optValue)}
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
                  className="custom-input"
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
                allowCustom={false}
              />
            </div>
            <div className="form-group">
              <label>测评等级（可多选）</label>
              <MultiSelect 
                options={levelOptions}
                value={formData.assessment_levels}
                onChange={(val) => setFormData({ ...formData, assessment_levels: val })}
                placeholder="请选择测评等级"
                allowCustom={true}
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