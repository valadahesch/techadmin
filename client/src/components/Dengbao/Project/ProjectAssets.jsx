// client/src/components/Dengbao/ProjectAssetsPage.jsx
import React, { useState, useEffect } from 'react';
import AssessmentRecordModal from './AssessmentRecordModal';
import '../../../styles/Dengbao/Project/projectAssets.css';

function ProjectAssets() {
  const [projectAssets, setProjectAssets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentRecordAsset, setCurrentRecordAsset] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState({});
  
  // 新增资产表单数据
  const [newAssetForm, setNewAssetForm] = useState({
    project_id: '',
    assessment_type_id: '',
    serial_no: 1,
    device_name: '',
    host_address: '',
    hardware_model: '',
    software_version: '',
    is_virtual: '否',
    domain: '',
    device_type: '',
    importance: '中',
    quantity: 1
  });
  
  // 筛选条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterDeviceType, setFilterDeviceType] = useState('');
  const [filterImportance, setFilterImportance] = useState('');
  
  // 可见列配置
  const [visibleColumns, setVisibleColumns] = useState({
    serial_no: true,
    device_name: true,
    host_address: true,
    hardware_model: false,
    software_version: false,
    is_virtual: false,
    domain: false,
    device_type: true,
    importance: true,
    quantity: true,
    assessment_type: true,
    assessment_record: true,
    creator_name: false,
    updater_name: false,
    created_at: false,
    updated_at: false
  });
  const [showColumnConfig, setShowColumnConfig] = useState(false);

  const getToken = () => localStorage.getItem('access_token');

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/projects?page=1&per_page=1000', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.items || []);
      }
    } catch (error) {
      console.error('获取项目列表失败:', error);
    }
  };

  // 获取测评类型列表
  const fetchAssessmentTypes = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/assessment-types/simple', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setAssessmentTypes(data.items || []);
      }
    } catch (error) {
      console.error('获取测评类型失败:', error);
    }
  };

  // 获取所有项目资产
  const fetchAllProjectAssets = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/project-assets', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (response.ok) {
        const data = await response.json();
        // 为每个资产添加测评类型名称
        const processedData = data.items.map(item => {
          const assetsWithTypeName = item.assets.map(asset => {
            const type = assessmentTypes.find(t => t.id === asset.assessment_type_id);
            return { ...asset, assessment_type_name: type?.name || '-' };
          });
          return {
            ...item,
            assets: assetsWithTypeName
          };
        });
        setProjectAssets(processedData);
        
        // 默认展开所有项目
        const expanded = {};
        processedData.forEach(item => {
          expanded[item.project.id] = true;
        });
        setExpandedProjects(expanded);
      }
    } catch (error) {
      console.error('获取项目资产失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchAssessmentTypes();
  }, []);

  useEffect(() => {
    if (assessmentTypes.length > 0) {
      fetchAllProjectAssets();
    }
  }, [assessmentTypes]);

  // 切换项目展开/收起
  const toggleProject = (projectId) => {
    setExpandedProjects({
      ...expandedProjects,
      [projectId]: !expandedProjects[projectId]
    });
  };

  // 展开所有项目
  const expandAll = () => {
    const expanded = {};
    projectAssets.forEach(item => {
      expanded[item.project.id] = true;
    });
    setExpandedProjects(expanded);
  };

  // 收起所有项目
  const collapseAll = () => {
    const expanded = {};
    projectAssets.forEach(item => {
      expanded[item.project.id] = false;
    });
    setExpandedProjects(expanded);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`确定要删除资产 "${name}" 吗？`)) {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/api/project-assets/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
          fetchAllProjectAssets();
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
        ? `http://localhost:5000/api/project-assets/${editingItem.id}`
        : 'http://localhost:5000/api/project-assets';
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
        fetchAllProjectAssets();
        setShowModal(false);
        setEditingItem(null);
        resetNewAssetForm();
      } else {
        const error = await response.json();
        alert(error.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleSaveRecord = async (record) => {
    if (!currentRecordAsset) return;
    
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/project-assets/${currentRecordAsset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          ...currentRecordAsset,
          assessment_record: record
        })
      });

      if (response.ok) {
        fetchAllProjectAssets();
        setShowRecordModal(false);
        setCurrentRecordAsset(null);
      } else {
        alert('保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 重置新增表单
  const resetNewAssetForm = () => {
    setNewAssetForm({
      project_id: '',
      assessment_type_id: '',
      serial_no: 1,
      device_name: '',
      host_address: '',
      hardware_model: '',
      software_version: '',
      is_virtual: '否',
      domain: '',
      device_type: '',
      importance: '中',
      quantity: 1
    });
  };

  // 打开新增弹窗
  const openAddModal = () => {
    // 获取当前最大序号
    const currentProjectAssets = projectAssets.find(p => p.project.id === newAssetForm.project_id);
    const maxSerial = currentProjectAssets 
      ? Math.max(...currentProjectAssets.assets.map(a => a.serial_no), 0) 
      : 0;
    setNewAssetForm({
      ...newAssetForm,
      serial_no: maxSerial + 1
    });
    setEditingItem(null);
    setShowModal(true);
  };

  // 打开编辑弹窗
  const openEditModal = (asset) => {
    setEditingItem(asset);
    setShowModal(true);
  };

  const getImportanceClass = (importance) => {
    const classes = { 
      '高': 'importance-high', 
      '中': 'importance-medium', 
      '低': 'importance-low' 
    };
    return classes[importance] || 'importance-medium';
  };

  // 筛选资产（所有项目中的资产）
  const getFilteredProjectAssets = () => {
    if (!searchKeyword && !filterDeviceType && !filterImportance) {
      return projectAssets;
    }
    
    return projectAssets.map(projectAsset => ({
      ...projectAsset,
      assets: projectAsset.assets.filter(asset => {
        if (searchKeyword && !asset.device_name.toLowerCase().includes(searchKeyword.toLowerCase()) &&
            !(asset.host_address || '').toLowerCase().includes(searchKeyword.toLowerCase())) {
          return false;
        }
        if (filterDeviceType && asset.device_type !== filterDeviceType) return false;
        if (filterImportance && asset.importance !== filterImportance) return false;
        return true;
      })
    })).filter(item => item.assets.length > 0);
  };

  const columns = [
    { key: 'serial_no', label: '序号', visible: visibleColumns.serial_no },
    { key: 'device_name', label: '设备名称', visible: visibleColumns.device_name },
    { key: 'host_address', label: '主机地址', visible: visibleColumns.host_address },
    { key: 'hardware_model', label: '硬件型号', visible: visibleColumns.hardware_model },
    { key: 'software_version', label: '软件版本', visible: visibleColumns.software_version },
    { key: 'is_virtual', label: '虚拟化设备', visible: visibleColumns.is_virtual },
    { key: 'domain', label: '域名', visible: visibleColumns.domain },
    { key: 'device_type', label: '设备类型', visible: visibleColumns.device_type },
    { key: 'importance', label: '重要程度', visible: visibleColumns.importance },
    { key: 'quantity', label: '数量', visible: visibleColumns.quantity },
    { key: 'assessment_type', label: '测评类型', visible: visibleColumns.assessment_type },
    { key: 'assessment_record', label: '测评记录', visible: visibleColumns.assessment_record },
    { key: 'creator_name', label: '创建人', visible: visibleColumns.creator_name },
    { key: 'updater_name', label: '修改人', visible: visibleColumns.updater_name },
    { key: 'created_at', label: '创建时间', visible: visibleColumns.created_at },
    { key: 'updated_at', label: '修改时间', visible: visibleColumns.updated_at }
  ];

  const visibleColumnsList = columns.filter(col => col.visible);
  const filteredProjectAssets = getFilteredProjectAssets();

  const formatId = (id) => {
    if (!id) return '-';
    return id.substring(0, 8) + '...';
  };

  // 设备类型选项
  const deviceTypeOptions = ['网络设备', '安全设备', '服务器', '存储设备', '终端设备', '虚拟设备'];
  const importanceOptions = ['高', '中', '低'];

  return (
    <div className="project-assets-page">
      <div className="page-header">
        <h1>项目资产管理</h1>
        <div className="header-buttons">
          <button className="btn-secondary" onClick={expandAll}>📂 展开全部</button>
          <button className="btn-secondary" onClick={collapseAll}>📁 收起全部</button>
          <button className="btn-secondary" onClick={() => setShowColumnConfig(!showColumnConfig)}>📋 列设置</button>
          <button className="btn-primary" onClick={openAddModal}>+ 新增资产</button>
        </div>
      </div>

      {showColumnConfig && (
        <div className="column-config-panel">
          <div className="panel-header">
            <span>选择要显示的列</span>
            <button onClick={() => setVisibleColumns({
              serial_no: true, device_name: true, host_address: true, 
              hardware_model: false, software_version: false, is_virtual: false, 
              domain: false, device_type: true, importance: true, quantity: true, 
              assessment_type: true, assessment_record: true, 
              creator_name: false, updater_name: false, created_at: false, updated_at: false
            })} className="btn-reset">重置默认</button>
            <button onClick={() => setShowColumnConfig(false)} className="btn-close">✕</button>
          </div>
          <div className="column-options">
            {columns.map(col => (
              <label key={col.key} className="column-option">
                <input 
                  type="checkbox" 
                  checked={visibleColumns[col.key]} 
                  onChange={() => setVisibleColumns({...visibleColumns, [col.key]: !visibleColumns[col.key]})} 
                />
                <span>{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">项目总数</span>
          <span className="stat-value">{projectAssets.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">资产总数</span>
          <span className="stat-value">{projectAssets.reduce((sum, p) => sum + p.assets.length, 0)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">设备类型</span>
          <span className="stat-value">{deviceTypeOptions.length}</span>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="搜索设备名称、主机地址..." 
            value={searchKeyword} 
            onChange={(e) => setSearchKeyword(e.target.value)} 
            className="search-input" 
          />
          <span className="search-icon">🔍</span>
        </div>
        <select 
          value={filterDeviceType} 
          onChange={(e) => setFilterDeviceType(e.target.value)} 
          className="filter-select"
        >
          <option value="">全部设备类型</option>
          {deviceTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <select 
          value={filterImportance} 
          onChange={(e) => setFilterImportance(e.target.value)} 
          className="filter-select"
        >
          <option value="">全部重要程度</option>
          {importanceOptions.map(imp => <option key={imp} value={imp}>{imp}</option>)}
        </select>
      </div>

      <div className="projects-assets-container">
        {loading ? (
          <div className="loading-state">加载中...</div>
        ) : filteredProjectAssets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>暂无资产数据</p>
            <button className="btn-primary" onClick={openAddModal}>新增资产</button>
          </div>
        ) : (
          filteredProjectAssets.map(projectAsset => (
            <div key={projectAsset.project.id} className="project-asset-group">
              <div 
                className="project-header"
                onClick={() => toggleProject(projectAsset.project.id)}
              >
                <div className="project-info">
                  <span className="expand-icon">{expandedProjects[projectAsset.project.id] ? '📂' : '📁'}</span>
                  <span className="project-name">{projectAsset.project.company_name}</span>
                  <span className="project-no">({projectAsset.project.project_no})</span>
                  <span className="asset-count-badge">{projectAsset.assets.length} 个资产</span>
                </div>
                <div className="project-meta">
                  <span className="project-status">{projectAsset.project.status}</span>
                  <span className="project-contact">{projectAsset.project.contact_person}</span>
                </div>
              </div>
              
              {expandedProjects[projectAsset.project.id] && (
                <div className="assets-table-wrapper">
                  <table className="asset-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>ID</th>
                        {visibleColumnsList.map(col => (
                          <th key={col.key}>{col.label}</th>
                        ))}
                        <th style={{ width: '200px' }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectAsset.assets.length === 0 ? (
                        <tr>
                          <td colSpan={visibleColumnsList.length + 2} className="empty-cell">暂无资产，点击"新增资产"添加</td>
                        </tr>
                      ) : (
                        projectAsset.assets.map(asset => (
                          <tr key={asset.id}>
                            <td className="id-cell" title={asset.id}>{formatId(asset.id)}</td>
                            {visibleColumns.serial_no && <td>{asset.serial_no}</td>}
                            {visibleColumns.device_name && <td><strong>{asset.device_name}</strong></td>}
                            {visibleColumns.host_address && <td>{asset.host_address || '-'}</td>}
                            {visibleColumns.hardware_model && <td>{asset.hardware_model || '-'}</td>}
                            {visibleColumns.software_version && <td>{asset.software_version || '-'}</td>}
                            {visibleColumns.is_virtual && <td>{asset.is_virtual || '否'}</td>}
                            {visibleColumns.domain && <td>{asset.domain || '-'}</td>}
                            {visibleColumns.device_type && <td>{asset.device_type || '-'}</td>}
                            {visibleColumns.importance && (
                              <td>
                                <span className={`importance-badge ${getImportanceClass(asset.importance)}`}>
                                  {asset.importance}
                                </span>
                              </td>
                            )}
                            {visibleColumns.quantity && <td>{asset.quantity || 1}</td>}
                            {visibleColumns.assessment_type && <td>{asset.assessment_type_name || '-'}</td>}
                            {visibleColumns.assessment_record && (
                              <td>
                                <button 
                                  className="btn-record" 
                                  onClick={() => { 
                                    setCurrentRecordAsset(asset); 
                                    setShowRecordModal(true); 
                                  }}
                                >
                                  📝 测评记录
                                </button>
                              </td>
                            )}
                            {visibleColumns.creator_name && <td>{asset.creator_name || '-'}</td>}
                            {visibleColumns.updater_name && <td>{asset.updater_name || '-'}</td>}
                            {visibleColumns.created_at && <td>{asset.created_at ? new Date(asset.created_at).toLocaleString() : '-'}</td>}
                            {visibleColumns.updated_at && <td>{asset.updated_at ? new Date(asset.updated_at).toLocaleString() : '-'}</td>}
                            <td>
                              <button className="btn-edit" onClick={() => openEditModal(asset)}>编辑</button>
                              <button className="btn-delete" onClick={() => handleDelete(asset.id, asset.device_name)}>删除</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 新增/编辑资产模态框 */}
      {showModal && (
        <AssetModal 
          item={editingItem} 
          onSave={handleSave} 
          onClose={() => { 
            setShowModal(false); 
            setEditingItem(null); 
            resetNewAssetForm();
          }} 
          projects={projects}
          assessmentTypes={assessmentTypes}
          deviceTypeOptions={deviceTypeOptions}
          importanceOptions={importanceOptions}
          newAssetForm={newAssetForm}
          setNewAssetForm={setNewAssetForm}
          projectAssets={projectAssets}
        />
      )}

      {/* 测评记录弹窗 */}
      {showRecordModal && currentRecordAsset && (
        <AssessmentRecordModal
          asset={currentRecordAsset}
          onSave={handleSaveRecord}
          onClose={() => { 
            setShowRecordModal(false); 
            setCurrentRecordAsset(null); 
          }}
        />
      )}
    </div>
  );
}

// 资产模态框
function AssetModal({ item, onSave, onClose, projects, assessmentTypes, deviceTypeOptions, importanceOptions, newAssetForm, setNewAssetForm, projectAssets }) {
  const [formData, setFormData] = useState(
    item || {
      project_id: newAssetForm.project_id,
      assessment_type_id: newAssetForm.assessment_type_id,
      serial_no: newAssetForm.serial_no,
      device_name: newAssetForm.device_name,
      host_address: newAssetForm.host_address,
      hardware_model: newAssetForm.hardware_model,
      software_version: newAssetForm.software_version,
      is_virtual: newAssetForm.is_virtual,
      domain: newAssetForm.domain,
      device_type: newAssetForm.device_type,
      importance: newAssetForm.importance,
      quantity: newAssetForm.quantity
    }
  );

  // 当选择项目时，自动计算序号
  const handleProjectChange = (projectId) => {
    const selectedProject = projectAssets.find(p => p.project.id === projectId);
    const maxSerial = selectedProject && selectedProject.assets.length > 0
      ? Math.max(...selectedProject.assets.map(a => a.serial_no))
      : 0;
    setFormData({
      ...formData,
      project_id: projectId,
      serial_no: maxSerial + 1
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? '编辑资产' : '新增资产'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="form-row">
            <div className="form-group">
              <label>所属项目 *</label>
              <select 
                value={formData.project_id} 
                onChange={(e) => item ? setFormData({...formData, project_id: e.target.value}) : handleProjectChange(e.target.value)}
                required
              >
                <option value="">请选择项目</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.company_name} ({project.project_no})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>测评类型</label>
              <select 
                value={formData.assessment_type_id} 
                onChange={(e) => setFormData({...formData, assessment_type_id: e.target.value})}
              >
                <option value="">请选择</option>
                {assessmentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>序号 *</label>
              <input 
                type="number" 
                value={formData.serial_no} 
                onChange={(e) => setFormData({...formData, serial_no: parseInt(e.target.value)})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>设备名称 *</label>
              <input 
                type="text" 
                value={formData.device_name} 
                onChange={(e) => setFormData({...formData, device_name: e.target.value})} 
                required 
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>主机地址</label>
              <input 
                type="text" 
                value={formData.host_address} 
                onChange={(e) => setFormData({...formData, host_address: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>硬件型号</label>
              <input 
                type="text" 
                value={formData.hardware_model} 
                onChange={(e) => setFormData({...formData, hardware_model: e.target.value})} 
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>软件版本</label>
              <input 
                type="text" 
                value={formData.software_version} 
                onChange={(e) => setFormData({...formData, software_version: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>虚拟化设备</label>
              <select 
                value={formData.is_virtual} 
                onChange={(e) => setFormData({...formData, is_virtual: e.target.value})}
              >
                <option value="是">是</option>
                <option value="否">否</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>域名</label>
              <input 
                type="text" 
                value={formData.domain} 
                onChange={(e) => setFormData({...formData, domain: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>设备类型</label>
              <select 
                value={formData.device_type} 
                onChange={(e) => setFormData({...formData, device_type: e.target.value})}
              >
                <option value="">请选择</option>
                {deviceTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>重要程度</label>
              <select 
                value={formData.importance} 
                onChange={(e) => setFormData({...formData, importance: e.target.value})}
              >
                {importanceOptions.map(imp => <option key={imp} value={imp}>{imp}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>数量</label>
              <input 
                type="number" 
                value={formData.quantity} 
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} 
                min="1" 
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

export default ProjectAssets;