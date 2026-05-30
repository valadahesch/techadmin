// client/src/components/Dengbao/ProjectManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Dengbao/Project/projectManagement.css';

function ProjectManagement() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // 筛选条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // 排序
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // 可见列配置
  const [visibleColumns, setVisibleColumns] = useState({
    project_no: true,
    company_name: true,
    contact_person: true,
    contact_phone: true,
    status: true,
    asset_count: true,
    remark: false,
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

  // 获取项目列表
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = `http://localhost:5000/api/projects?page=${currentPage}&per_page=${pageSize}&sort_field=${sortField}&sort_order=${sortOrder}`;
      if (searchKeyword) url += `&search=${encodeURIComponent(searchKeyword)}`;
      if (filterStatus) url += `&status=${encodeURIComponent(filterStatus)}`;

      const response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.items || []);
        setTotal(data.total);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error('获取项目列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchKeyword, filterStatus, sortField, sortOrder]);

  // 筛选条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, filterStatus, sortField, sortOrder]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`确定要删除项目 "${name}" 吗？删除后相关的资产也会被删除！`)) {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
          fetchProjects();
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
        ? `http://localhost:5000/api/projects/${editingItem.id}`
        : 'http://localhost:5000/api/projects';
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
        fetchProjects();
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

  // 跳转到资产管理页面
  const goToAssets = (projectId) => {
    navigate(`/dengbao/project-assets`);
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

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // 获取状态徽章样式
  const getStatusClass = (status) => {
    const classes = {
      '进行中': 'status-progress',
      '已完成': 'status-completed',
      '待启动': 'status-pending'
    };
    return classes[status] || 'status-pending';
  };

  // 分页按钮
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    buttons.push(<button key="prev" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">上一页</button>);
    
    if (startPage > 1) {
      buttons.push(<button key={1} onClick={() => setCurrentPage(1)} className="pagination-btn">1</button>);
      if (startPage > 2) buttons.push(<span key="dots1" className="pagination-dots">...</span>);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(<button key={i} onClick={() => setCurrentPage(i)} className={`pagination-btn ${currentPage === i ? 'active' : ''}`}>{i}</button>);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) buttons.push(<span key="dots2" className="pagination-dots">...</span>);
      buttons.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="pagination-btn">{totalPages}</button>);
    }
    
    buttons.push(<button key="next" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">下一页</button>);
    
    return buttons;
  };

  const columns = [
    { key: 'project_no', label: '项目编号', visible: visibleColumns.project_no, sortable: true },
    { key: 'company_name', label: '单位名称', visible: visibleColumns.company_name, sortable: true },
    { key: 'contact_person', label: '联系人', visible: visibleColumns.contact_person, sortable: true },
    { key: 'contact_phone', label: '联系方式', visible: visibleColumns.contact_phone, sortable: false },
    { key: 'status', label: '状态', visible: visibleColumns.status, sortable: true },
    { key: 'asset_count', label: '资产数量', visible: visibleColumns.asset_count, sortable: true },
    { key: 'remark', label: '备注', visible: visibleColumns.remark, sortable: false },
    { key: 'creator_name', label: '创建人', visible: visibleColumns.creator_name, sortable: true },
    { key: 'updater_name', label: '修改人', visible: visibleColumns.updater_name, sortable: true },
    { key: 'created_at', label: '创建时间', visible: visibleColumns.created_at, sortable: true },
    { key: 'updated_at', label: '修改时间', visible: visibleColumns.updated_at, sortable: true }
  ];

  const visibleColumnsList = columns.filter(col => col.visible);

  const formatId = (id) => id ? id.substring(0, 8) + '...' : '-';

  return (
    <div className="project-page-container">
      <div className="page-header">
        <h1>项目管理</h1>
        <div className="header-buttons">
          <button className="btn-secondary" onClick={() => setShowColumnConfig(!showColumnConfig)}>📋 列设置</button>
          <button className="btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>+ 新建项目</button>
        </div>
      </div>

      {showColumnConfig && (
        <div className="column-config-panel">
          <div className="panel-header"><span>选择要显示的列</span><button onClick={() => setVisibleColumns({...visibleColumns, project_no: true, company_name: true, contact_person: true, contact_phone: true, status: true, asset_count: true, remark: false, creator_name: false, updater_name: false, created_at: false, updated_at: false})} className="btn-reset">重置默认</button><button onClick={() => setShowColumnConfig(false)} className="btn-close">✕</button></div>
          <div className="column-options">{columns.map(col => (<label key={col.key} className="column-option"><input type="checkbox" checked={visibleColumns[col.key]} onChange={() => setVisibleColumns({...visibleColumns, [col.key]: !visibleColumns[col.key]})} /><span>{col.label}</span></label>))}</div>
        </div>
      )}

      <div className="stats-summary">
        <div className="stat-item"><span className="stat-label">项目总数</span><span className="stat-value">{total}</span></div>
        <div className="stat-item"><span className="stat-label">进行中</span><span className="stat-value">{projects.filter(p => p.status === '进行中').length}</span></div>
        <div className="stat-item"><span className="stat-label">已完成</span><span className="stat-value">{projects.filter(p => p.status === '已完成').length}</span></div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper"><input type="text" placeholder="搜索项目编号、单位名称、联系人、备注..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="search-input" /><span className="search-icon">🔍</span></div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select"><option value="">全部状态</option><option value="进行中">进行中</option><option value="已完成">已完成</option><option value="待启动">待启动</option></select>
      </div>

      <div className="data-table">
        <table className="project-table">
          <thead><tr><th style={{width:'80px'}}>ID</th>{visibleColumnsList.map(col => (<th key={col.key}>{col.label}{col.sortable && <button className="sort-btn" onClick={() => handleSort(col.key)}>{getSortIcon(col.key)}</button>}</th>))}<th style={{width:'160px'}}>操作</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={visibleColumnsList.length + 2} className="loading-cell">加载中...</td></tr> : projects.length === 0 ? <tr><td colSpan={visibleColumnsList.length + 2} className="empty-cell">暂无数据</td></tr> : projects.map(item => (<tr key={item.id}>
            <td className="id-cell" title={item.id}>{formatId(item.id)}</td>
            {visibleColumns.project_no && <td><strong>{item.project_no}</strong></td>}
            {visibleColumns.company_name && <td>{item.company_name}</td>}
            {visibleColumns.contact_person && <td>{item.contact_person}</td>}
            {visibleColumns.contact_phone && <td>{item.contact_phone}</td>}
            {visibleColumns.status && <td><span className={`status-badge ${getStatusClass(item.status)}`}>{item.status}</span></td>}
            {visibleColumns.asset_count && <td>{item.asset_count || 0}</td>}
            {visibleColumns.remark && <td className="desc-cell" title={item.remark}>{item.remark || '-'}</td>}
            {visibleColumns.creator_name && <td>{item.creator_name || '-'}</td>}
            {visibleColumns.updater_name && <td>{item.updater_name || '-'}</td>}
            {visibleColumns.created_at && <td>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</td>}
            {visibleColumns.updated_at && <td>{item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'}</td>}
            <td><button className="btn-asset" onClick={() => goToAssets(item.id)}>📦 资产</button><button className="btn-edit" onClick={() => { setEditingItem(item); setShowModal(true); }}>编辑</button><button className="btn-delete" onClick={() => handleDelete(item.id, item.project_no)}>删除</button></td>
          </tr>))}</tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (<div className="pagination-container"><div className="pagination-info">显示第 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, total)} 条，共 {total} 条记录</div><div className="pagination-buttons">{renderPaginationButtons()}</div></div>)}

      {showModal && (<ProjectModal item={editingItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditingItem(null); }} />)}
    </div>
  );
}

// 项目模态框
function ProjectModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    project_no: item?.project_no || '',
    company_name: item?.company_name || '',
    contact_person: item?.contact_person || '',
    contact_phone: item?.contact_phone || '',
    status: item?.status || '进行中',
    remark: item?.remark || ''
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? '编辑项目' : '新建项目'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="form-row"><div className="form-group"><label>项目编号 *</label><input type="text" value={formData.project_no} onChange={(e) => setFormData({...formData, project_no: e.target.value})} required /></div></div>
          <div className="form-row"><div className="form-group"><label>单位名称 *</label><input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} required /></div></div>
          <div className="form-row"><div className="form-group"><label>联系人 *</label><input type="text" value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} required /></div>
          <div className="form-group"><label>联系方式 *</label><input type="text" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} required /></div></div>
          <div className="form-row"><div className="form-group"><label>状态</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}><option value="进行中">进行中</option><option value="已完成">已完成</option><option value="待启动">待启动</option></select></div></div>
          <div className="form-group"><label>备注</label><textarea value={formData.remark} onChange={(e) => setFormData({...formData, remark: e.target.value})} rows="3" /></div>
          <div className="modal-actions"><button type="submit" className="btn-primary">保存</button><button type="button" className="btn-secondary" onClick={onClose}>取消</button></div>
        </form>
      </div>
    </div>
  );
}

export default ProjectManagement;