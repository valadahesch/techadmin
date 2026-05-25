// client/src/components/Dengbao/DeviceUsageManagement.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/Dengbao/DeviceUsageManagement.css';

function DeviceUsageManagement() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMandatory, setFilterMandatory] = useState('');
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 设备类型选项（从后端数据动态获取）
  const [deviceTypes, setDeviceTypes] = useState([]);

  // 获取 token
  const getToken = () => {
    return localStorage.getItem('access_token');
  };

  // 获取数据
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = 'http://localhost:5000/api/device-usage';
      const params = [];
      
      if (searchKeyword) {
        params.push('search=' + encodeURIComponent(searchKeyword));
      }
      if (filterCategory) {
        params.push('category=' + encodeURIComponent(filterCategory));
      }
      if (filterMandatory) {
        params.push('is_mandatory=' + encodeURIComponent(filterMandatory));
      }
      
      if (params.length > 0) {
        url = url + '?' + params.join('&');
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.error('未授权，请重新登录');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setDevices(data.items || []);
        
        // 从后端数据动态提取设备类型
        const types = [];
        const typeSet = {};
        for (let i = 0; i < data.items.length; i++) {
          const type = data.items[i].device_type;
          if (type && !typeSet[type]) {
            typeSet[type] = true;
            types.push(type);
          }
        }
        setDeviceTypes(types);
      } else {
        console.error('获取数据失败:', response.status);
      }
    } catch (error) {
      console.error('获取设备列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [searchKeyword, filterCategory, filterMandatory]);

  // 前端筛选数据
  const getFilteredDevices = () => {
    let filtered = [...devices];
    
    // 搜索筛选
    if (searchKeyword) {
      filtered = filtered.filter(item => 
        item.device_name.includes(searchKeyword) ||
        item.device_type.includes(searchKeyword) ||
        (item.function_cn && item.function_cn.includes(searchKeyword))
      );
    }
    
    // 设备类型筛选
    if (filterCategory) {
      filtered = filtered.filter(item => item.device_type === filterCategory);
    }
    
    // 是否必测筛选
    if (filterMandatory) {
      filtered = filtered.filter(item => item.is_mandatory === filterMandatory);
    }
    
    return filtered;
  };

  // 前端分页
  const getPaginatedDevices = () => {
    const filtered = getFilteredDevices();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return {
      items: filtered.slice(startIndex, endIndex),
      total: filtered.length
    };
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条设备信息吗？')) {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/api/device-usage/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        
        if (response.ok) {
          fetchDevices();
          // 如果当前页没有数据了，回到上一页
          const filtered = getFilteredDevices();
          const newTotalPages = Math.ceil((filtered.length - 1) / pageSize);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          } else if (newTotalPages === 0) {
            setCurrentPage(1);
          }
        } else {
          const error = await response.json();
          alert(error.error || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败');
      }
    }
  };

  const handleSave = async (data) => {
    try {
      const token = getToken();
      let url = 'http://localhost:5000/api/device-usage';
      let method = 'POST';
      
      if (editingItem) {
        url = `http://localhost:5000/api/device-usage/${editingItem.id}`;
        method = 'PUT';
      }
      
      const submitData = {
        serial_no: data.serial_no,
        device_type: data.device_type,
        device_name: data.device_name,
        function_cn: data.function_cn,
        is_mandatory: data.is_mandatory,
        status: data.status || '启用'
      };
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        fetchDevices();
        setShowModal(false);
        setEditingItem(null);
      } else {
        const error = await response.json();
        alert(error.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  // 筛选条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, filterCategory, filterMandatory]);

  // 统计数据
  const filteredDevices = getFilteredDevices();
  const paginatedData = getPaginatedDevices();
  const totalPages = Math.ceil(filteredDevices.length / pageSize);
  
  const mandatoryCount = filteredDevices.filter(d => d.is_mandatory === '是').length;
  const notMandatoryCount = filteredDevices.filter(d => d.is_mandatory === '否').length;
  
  const stats = {
    total: filteredDevices.length,
    mandatory: mandatoryCount,
    notMandatory: notMandatoryCount
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

  return (
    <div className="management-container">
      <div className="page-header">
        <h1>设备用途管理</h1>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
          + 新增设备
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">设备总数</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">必测设备</span>
          <span className="stat-value" style={{ color: '#ef4444' }}>{stats.mandatory}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">非必测设备</span>
          <span className="stat-value" style={{ color: '#f59e0b' }}>{stats.notMandatory}</span>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="搜索设备名称、类型或功能..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">全部分类</option>
          {deviceTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select 
          value={filterMandatory} 
          onChange={(e) => setFilterMandatory(e.target.value)}
          className="filter-select"
        >
          <option value="">全部设备</option>
          <option value="是">必测设备</option>
          <option value="否">非必测设备</option>
        </select>
      </div>

      {/* 数据表格 */}
      <div className="data-table">
        <table className="device-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>设备类型</th>
              <th>设备名称</th>
              <th>功能</th>
              <th>是否必测</th>
              <th>状态</th>
              <th>创建人</th>
              <th>修改人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="loading-cell">加载中...</td>
              </tr>
            ) : paginatedData.items.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-cell">暂无数据</td>
              </tr>
            ) : (
              paginatedData.items.map(item => (
                <tr key={item.id}>
                  <td>{item.serial_no}</td>
                  <td>{item.device_type}</td>
                  <td><strong>{item.device_name}</strong></td>
                  <td className="desc-cell" title={item.function_cn}>{item.function_cn}</td>
                  <td>
                    <span className={`status-badge ${item.is_mandatory === '是' ? 'status-active' : 'status-inactive'}`}>
                      {item.is_mandatory}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${item.status === '启用' ? 'status-active' : 'status-inactive'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.creator_name || '-'}</td>
                  <td>{item.updater_name || '-'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => { setEditingItem(item); setShowModal(true); }}>
                      编辑
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                      删除
                    </button>
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
            显示第 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, filteredDevices.length)} 条，共 {filteredDevices.length} 条记录
          </div>
          <div className="pagination-buttons">
            {renderPaginationButtons()}
          </div>
        </div>
      )}

      {/* 新增/编辑模态框 */}
      {showModal && (
        <DeviceUsageModal 
          item={editingItem} 
          onSave={handleSave} 
          onClose={() => { setShowModal(false); setEditingItem(null); }} 
          deviceTypes={deviceTypes}
        />
      )}
    </div>
  );
}

// 模态框组件
function DeviceUsageModal({ item, onSave, onClose, deviceTypes }) {
  const defaultFormData = {
    serial_no: '',
    device_type: '',
    device_name: '',
    function_cn: '',
    is_mandatory: '是',
    status: '启用'
  };
  
  const [formData, setFormData] = useState(item || defaultFormData);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? '编辑设备信息' : '新增设备'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="form-row">
            <div className="form-group">
              <label>序号 *</label>
              <input 
                type="number" 
                value={formData.serial_no} 
                onChange={(e) => setFormData({ ...formData, serial_no: parseInt(e.target.value) })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>设备类型 *</label>
              <select 
                value={formData.device_type} 
                onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                required
              >
                <option value="">请选择</option>
                {deviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>设备名称 *</label>
            <input 
              type="text" 
              value={formData.device_name} 
              onChange={(e) => setFormData({ ...formData, device_name: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>功能描述 *</label>
            <textarea 
              value={formData.function_cn} 
              onChange={(e) => setFormData({ ...formData, function_cn: e.target.value })} 
              rows="3"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>是否必测</label>
              <select value={formData.is_mandatory} onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.value })}>
                <option value="是">是</option>
                <option value="否">否</option>
              </select>
            </div>
            <div className="form-group">
              <label>状态</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="启用">启用</option>
                <option value="停用">停用</option>
              </select>
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

export default DeviceUsageManagement;