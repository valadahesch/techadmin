// client/src/components/Dengbao/IndicatorManagement.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/Dengbao/IndicatorManagement.css';

function IndicatorManagement() {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const getToken = () => localStorage.getItem('access_token');

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = 'http://localhost:5000/api/assessment-indicators';
      const params = [];
      if (searchKeyword) params.push('search=' + encodeURIComponent(searchKeyword));
      if (filterType) params.push('indicator_type=' + encodeURIComponent(filterType));
      if (params.length > 0) url += '?' + params.join('&');

      const response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (response.ok) {
        const data = await response.json();
        setIndicators(data.items || []);
      }
    } catch (error) {
      console.error('获取指标列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, [searchKeyword, filterType]);

  // 筛选条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, filterType]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`确定要删除指标 "${name}" 吗？`)) {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/api/assessment-indicators/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
          fetchIndicators();
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
        ? `http://localhost:5000/api/assessment-indicators/${editingItem.id}`
        : 'http://localhost:5000/api/assessment-indicators';
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
        fetchIndicators();
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

  // 前端分页
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return {
      items: indicators.slice(startIndex, endIndex),
      total: indicators.length
    };
  };

  const paginatedData = getPaginatedData();
  const totalPages = Math.ceil(indicators.length / pageSize);

  // 分页按钮生成（与设备用途管理页面一致）
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    // 上一页按钮
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
    
    // 第一页
    if (startPage > 1) {
      buttons.push(
        <button key={1} onClick={() => setCurrentPage(1)} className="pagination-btn">
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }
    
    // 中间页码
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
    
    // 最后一页
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
    
    // 下一页按钮
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

  const getTypeLabel = (type) => {
    const labels = { 'checkbox': '可选框', 'string': '字符串', 'datetime': '时间日期' };
    return labels[type] || type;
  };

  return (
    <div className="management-container">
      <div className="page-header">
        <h1>测评指标管理</h1>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
          + 新增指标
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">总指标数</span>
          <span className="stat-value">{indicators.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">可选框</span>
          <span className="stat-value">{indicators.filter(i => i.indicator_type === 'checkbox').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">字符串</span>
          <span className="stat-value">{indicators.filter(i => i.indicator_type === 'string').length}</span>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="搜索中文或英文名称..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">全部类型</option>
          <option value="checkbox">可选框</option>
          <option value="string">字符串</option>
          <option value="datetime">时间日期</option>
        </select>
      </div>

      <div className="data-table">
        <table className="device-table">
          <thead>
            <tr>
              <th>中文名称</th>
              <th>英文名称</th>
              <th>指标类型</th>
              <th>指标数据</th>
              <th>创建人</th>
              <th>修改人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="loading-cell">加载中...</td></tr>
            ) : paginatedData.items.length === 0 ? (
              <tr><td colSpan="7" className="empty-cell">暂无数据</td></tr>
            ) : (
              paginatedData.items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.name_cn}</strong></td>
                  <td>{item.name_en || '-'}</td>
                  <td><span className="type-badge">{getTypeLabel(item.indicator_type)}</span></td>
                  <td className="desc-cell">
                    {item.indicator_data ? Object.keys(item.indicator_data).length + ' 项配置' : '-'}
                  </td>
                  <td>{item.creator_name || '-'}</td>
                  <td>{item.updater_name || '-'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => { setEditingItem(item); setShowModal(true); }}>编辑</button>
                    <button className="btn-delete" onClick={() => handleDelete(item.id, item.name_cn)}>删除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页组件 - 与设备用途管理页面保持一致 */}
      {!loading && totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            显示第 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, indicators.length)} 条，共 {indicators.length} 条记录
          </div>
          <div className="pagination-buttons">
            {renderPaginationButtons()}
          </div>
        </div>
      )}

      {showModal && (
        <IndicatorModal 
          item={editingItem} 
          onSave={handleSave} 
          onClose={() => { setShowModal(false); setEditingItem(null); }} 
        />
      )}
    </div>
  );
}

// 指标数据编辑组件（键值对）
function IndicatorDataEditor({ value, onChange, indicatorType }) {
  const [data, setData] = useState(value || {});

  const updateData = (key, val) => {
    const newData = { ...data, [key]: val };
    setData(newData);
    onChange(newData);
  };

  const addNewField = () => {
    const key = prompt('请输入字段名（英文）:');
    if (key && !data[key]) {
      updateData(key, '');
    } else if (key && data[key]) {
      alert('字段名已存在');
    }
  };

  const removeField = (key) => {
    if (window.confirm(`确定要删除字段 "${key}" 吗？`)) {
      const newData = { ...data };
      delete newData[key];
      setData(newData);
      onChange(newData);
    }
  };

  if (indicatorType !== 'checkbox') {
    return <div className="indicator-data-hint">该类型无需配置指标数据</div>;
  }

  return (
    <div className="indicator-data-editor">
      <div className="editor-header">
        <span>键值对配置</span>
        <button type="button" className="btn-add-field" onClick={addNewField}>+ 添加字段</button>
      </div>
      <div className="editor-fields">
        {Object.keys(data).length === 0 ? (
          <div className="empty-fields">暂无配置，点击"添加字段"开始配置</div>
        ) : (
          Object.entries(data).map(([key, val]) => (
            <div key={key} className="field-row">
              <div className="field-key">{key}</div>
              <input 
                type="text" 
                value={val || ''} 
                onChange={(e) => updateData(key, e.target.value)}
                placeholder="请输入值"
                className="field-value"
              />
              <button type="button" className="btn-remove-field" onClick={() => removeField(key)}>删除</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function IndicatorModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    indicator_type: item?.indicator_type || 'checkbox',
    name_cn: item?.name_cn || '',
    name_en: item?.name_en || '',
    indicator_data: item?.indicator_data || {}
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? '编辑指标' : '新增指标'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="form-row">
            <div className="form-group">
              <label>指标类型 *</label>
              <select 
                value={formData.indicator_type} 
                onChange={(e) => setFormData({ ...formData, indicator_type: e.target.value })}
                required
              >
                <option value="checkbox">可选框</option>
                <option value="string">字符串</option>
                <option value="datetime">时间日期</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>中文指标名称 *</label>
              <input 
                type="text" 
                value={formData.name_cn} 
                onChange={(e) => setFormData({ ...formData, name_cn: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label>英文指标名称</label>
              <input 
                type="text" 
                value={formData.name_en} 
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              />
            </div>
          </div>
          
          <IndicatorDataEditor 
            value={formData.indicator_data}
            onChange={(data) => setFormData({ ...formData, indicator_data: data })}
            indicatorType={formData.indicator_type}
          />
          
          <div className="modal-actions">
            <button type="submit" className="btn-primary">保存</button>
            <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IndicatorManagement;