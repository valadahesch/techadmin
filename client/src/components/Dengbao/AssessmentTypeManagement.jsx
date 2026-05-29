// client/src/components/Dengbao/AssessmentTypeManagement.jsx
// 修改搜索相关部分

import React, { useState, useEffect } from 'react';
import TypeDetailModal from './TypeDetailModal';
import '../../styles/Dengbao/AssessmentTypeManagement.css';

function AssessmentTypeManagement() {
  const getGroupColorIndex = (groupName) => {
    // 使用简单的哈希算法生成固定索引
    let hash = 0;
    for (let i = 0; i < groupName.length; i++) {
      hash = ((hash << 5) - hash) + groupName.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % 10; // 10种颜色循环使用
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentDetailItem, setCurrentDetailItem] = useState(null);
  
  // 筛选条件
  const [searchInputValue, setSearchInputValue] = useState('');  // 输入框的值
  const [searchKeyword, setSearchKeyword] = useState('');        // 实际搜索的关键词
  const [isSearching, setIsSearching] = useState(false);         // 搜索中状态
  const [filterGroup, setFilterGroup] = useState('');
  const [groupOptions, setGroupOptions] = useState([]);
  
  // 排序
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // 可见列配置
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    description: true,
    member_count: true,
    groups: true,
    creator_name: false,
    updater_name: false,
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

  // 获取群组选项
  const fetchGroupOptions = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/assessment-types/groups', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setGroupOptions(data);
      }
    } catch (error) {
      console.error('获取群组选项失败:', error);
    }
  };

  // 获取数据
  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = `http://localhost:5000/api/assessment-types?page=${currentPage}&per_page=${pageSize}&sort_field=${sortField}&sort_order=${sortOrder}`;
      if (searchKeyword) url += `&search=${encodeURIComponent(searchKeyword)}`;
      if (filterGroup) url += `&group=${encodeURIComponent(filterGroup)}`;

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
      console.error('获取数据失败:', error);
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
  };

  useEffect(() => {
    fetchGroupOptions();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [currentPage, filterGroup, searchKeyword, sortField, sortOrder]);

  // 筛选条件变化时重置到第一页（不包括搜索关键词变化，因为搜索需要手动触发）
  useEffect(() => {
    setCurrentPage(1);
  }, [filterGroup, sortField, sortOrder]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`确定要删除测评类型 "${name}" 吗？`)) {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/api/assessment-types/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
          fetchItems();
          fetchGroupOptions();
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
        ? `http://localhost:5000/api/assessment-types/${editingItem.id}`
        : 'http://localhost:5000/api/assessment-types';
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
        fetchGroupOptions();
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

  // 重置列可见性
  const resetColumns = () => {
    setVisibleColumns({
      name: true,
      description: true,
      member_count: true,
      groups: true,
      creator_name: false,
      updater_name: false,
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
    { key: 'name', label: '名称', visible: visibleColumns.name, sortable: true },
    { key: 'description', label: '描述', visible: visibleColumns.description, sortable: false },
    { key: 'member_count', label: '测评项数量', visible: visibleColumns.member_count, sortable: false },
    { key: 'groups', label: '群组', visible: visibleColumns.groups, sortable: false },
    { key: 'creator_name', label: '创建人', visible: visibleColumns.creator_name, sortable: true },
    { key: 'updater_name', label: '修改人', visible: visibleColumns.updater_name, sortable: true },
    { key: 'created_at', label: '创建时间', visible: visibleColumns.created_at, sortable: true },
    { key: 'updated_at', label: '修改时间', visible: visibleColumns.updated_at, sortable: true }
  ];

  const visibleColumnsList = columns.filter(col => col.visible);

  return (
    <div className="assessment-type-container">
      <div className="page-header">
        <h1>测评类型管理</h1>
        <div className="header-buttons">
          <button className="btn-secondary" onClick={() => setShowColumnConfig(!showColumnConfig)}>
            📋 列设置
          </button>
          <button className="btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
            + 新增测评类型
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

      {/* 统计卡片 */}
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">总类型数</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">群组数量</span>
          <span className="stat-value">{groupOptions.length}</span>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="搜索名称、描述、群组、创建人、修改人..." 
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
          <button 
            className="search-btn" 
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? '搜索中...' : '搜索'}
          </button>
        </div>
        <select 
          value={filterGroup} 
          onChange={(e) => setFilterGroup(e.target.value)}
          className="filter-select"
        >
          <option value="">全部群组</option>
          {groupOptions.map(group => (
            <option key={group} value={group}>{group}</option>
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
        <table className="type-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              {visibleColumnsList.map(col => (
                <th key={col.key}>
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
              <th style={{ width: '160px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={visibleColumnsList.length + 2} className="loading-cell">加载中...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={visibleColumnsList.length + 2} className="empty-cell">暂无数据</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td className="id-cell" title={item.id}>{formatId(item.id)}</td>
                  {visibleColumns.name && <td><strong>{item.name}</strong></td>}
                  {visibleColumns.description && <td className="desc-cell" title={item.description}>{item.description || '-'}</td>}
                  {visibleColumns.member_count && <td>{item.member_ids?.length || 0}</td>}
                  {visibleColumns.groups && (
                    <td>
                      {item.groups && item.groups.length > 0 ? (
                        item.groups.map(group => (
                          <span key={group} className={`group-tag color-${getGroupColorIndex(group)}`}>
                            {group}
                          </span>
                        ))
                      ) : '-'}
                    </td>
                  )}
                  {visibleColumns.creator_name && <td>{item.creator_name || '-'}</td>}
                  {visibleColumns.updater_name && <td>{item.updater_name || '-'}</td>}
                  {visibleColumns.created_at && <td>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</td>}
                  {visibleColumns.updated_at && <td>{item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'}</td>}
                  <td>
                    <button className="btn-detail" onClick={() => { setCurrentDetailItem(item); setShowDetailModal(true); }}>详情</button>
                    <button className="btn-edit" onClick={() => { setEditingItem(item); setShowModal(true); }}>编辑</button>
                    <button className="btn-delete" onClick={() => handleDelete(item.id, item.name)}>删除</button>
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
        <AssessmentTypeModal 
          item={editingItem} 
          onSave={handleSave} 
          onClose={() => { setShowModal(false); setEditingItem(null); }} 
          groupOptions={groupOptions}
        />
      )}

      {/* 详情弹窗 */}
      {showDetailModal && currentDetailItem && (
        <TypeDetailModal
          typeData={currentDetailItem}
          onClose={() => { setShowDetailModal(false); setCurrentDetailItem(null); }}
          onRefresh={fetchItems}
        />
      )}
    </div>
  );
}

// 新增/编辑模态框组件（保持不变）
function AssessmentTypeModal({ item, onSave, onClose, groupOptions }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    groups: item?.groups || []
  });
  const [customGroup, setCustomGroup] = useState('');
  const [showCustomGroup, setShowCustomGroup] = useState(false);

  const handleGroupsChange = (value) => {
    if (value === 'custom') {
      setShowCustomGroup(true);
    } else {
      setShowCustomGroup(false);
      const newGroups = formData.groups.includes(value)
        ? formData.groups.filter(g => g !== value)
        : [...formData.groups, value];
      setFormData({ ...formData, groups: newGroups });
    }
  };

  const addCustomGroup = () => {
    if (customGroup && !formData.groups.includes(customGroup)) {
      setFormData({ ...formData, groups: [...formData.groups, customGroup] });
      setCustomGroup('');
      setShowCustomGroup(false);
    }
  };

  const removeGroup = (group) => {
    setFormData({ ...formData, groups: formData.groups.filter(g => g !== group) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? '编辑测评类型' : '新增测评类型'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="form-group">
            <label>名称 *</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required 
            />
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>群组（可多选）</label>
            <div className="groups-selector">
              {groupOptions.map(group => (
                <label key={group} className="group-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.groups.includes(group)}
                    onChange={() => handleGroupsChange(group)}
                  />
                  <span>{group}</span>
                </label>
              ))}
              <label className="group-checkbox">
                <input
                  type="checkbox"
                  checked={showCustomGroup}
                  onChange={() => handleGroupsChange('custom')}
                />
                <span>自定义...</span>
              </label>
            </div>
            {showCustomGroup && (
              <div className="custom-group-input">
                <input 
                  type="text" 
                  placeholder="输入群组名称"
                  value={customGroup}
                  onChange={(e) => setCustomGroup(e.target.value)}
                />
                <button type="button" onClick={addCustomGroup}>添加</button>
              </div>
            )}
            {formData.groups.length > 0 && (
              <div className="selected-groups">
                {formData.groups.map(group => (
                  <span key={group} className="selected-group">
                    {group}
                    <button type="button" onClick={() => removeGroup(group)}>×</button>
                  </span>
                ))}
              </div>
            )}
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

export default AssessmentTypeManagement;