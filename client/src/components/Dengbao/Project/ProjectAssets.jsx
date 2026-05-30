// client/src/components/Dengbao/ProjectAssetsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../../styles/Dengbao/Project/projectManagement.css';

function ProjectAssets() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentRecordAsset, setCurrentRecordAsset] = useState(null);
  
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

  // 获取项目信息
  const fetchProjectInfo = async () => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setProjectInfo(data);
      }
    } catch (error) {
      console.error('获取项目信息失败:', error);
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

  // 获取资产列表
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/project-assets/${projectId}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (response.ok) {
        const data = await response.json();
        // 为每个资产添加测评类型名称
        const assetsWithTypeName = data.items.map(asset => {
          const type = assessmentTypes.find(t => t.id === asset.assessment_type_id);
          return { ...asset, assessment_type_name: type?.name || '-' };
        });
        setAssets(assetsWithTypeName);
      }
    } catch (error) {
      console.error('获取资产列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectInfo();
      fetchAssessmentTypes();
    }
  }, [projectId]);

  useEffect(() => {
    if (assessmentTypes.length > 0) {
      fetchAssets();
    }
  }, [assessmentTypes]);

  // 筛选资产
  const filteredAssets = assets.filter(asset => {
    if (searchKeyword && !asset.device_name.toLowerCase().includes(searchKeyword.toLowerCase()) &&
        !(asset.host_address || '').toLowerCase().includes(searchKeyword.toLowerCase())) {
      return false;
    }
    if (filterDeviceType && asset.device_type !== filterDeviceType) return false;
    if (filterImportance && asset.importance !== filterImportance) return false;
    return true;
  });

  const handleDelete = async (id, name) => {
    if (window.confirm(`确定要删除资产 "${name}" 吗？`)) {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/api/project-assets/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
          fetchAssets();
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

      const submitData = {
        ...data,
        project_id: projectId
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
        fetchAssets();
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
        fetchAssets();
        setShowRecordModal(false);
        setCurrentRecordAsset(null);
      } else {
        alert('保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 获取下一个序号
  const getNextSerialNo = () => {
    if (assets.length === 0) return 1;
    const maxSerial = Math.max(...assets.map(a => a.serial_no));
    return maxSerial + 1;
  };

  const getImportanceClass = (importance) => {
    const classes = { 
      '高': 'importance-high', 
      '中': 'importance-medium', 
      '低': 'importance-low' 
    };
    return classes[importance] || 'importance-medium';
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

  const formatId = (id) => {
    if (!id) return '-';
    return id.substring(0, 8) + '...';
  };

  // 设备类型选项
  const deviceTypeOptions = ['网络设备', '安全设备', '服务器', '存储设备', '终端设备', '虚拟设备'];
  const importanceOptions = ['高', '中', '低'];

  return (
    <div className="project-assets-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="btn-back" onClick={() => navigate('/dengbao/project-management')}>← 返回</button>
          <h1 style={{ marginLeft: '16px' }}>项目资产 - {projectInfo?.company_name || '加载中...'}</h1>
        </div>
        <div className="header-buttons">
          <button className="btn-secondary" onClick={() => setShowColumnConfig(!showColumnConfig)}>📋 列设置</button>
          <button className="btn-primary" onClick={() => { 
            setEditingItem(null); 
            setShowModal(true);
          }}>+ 新增资产</button>
        </div>
      </div>

      {showColumnConfig && (
        <div className="column-config-panel">
          <div className="panel-header">
            <span>选择要显示的列</span>
            <button 
              onClick={() => setVisibleColumns({
                serial_no: true, device_name: true, host_address: true, 
                hardware_model: false, software_version: false, is_virtual: false, 
                domain: false, device_type: true, importance: true, quantity: true, 
                assessment_type: true, assessment_record: true, 
                creator_name: false, updater_name: false, created_at: false, updated_at: false
              })} 
              className="btn-reset"
            >
              重置默认
            </button>
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
          <span className="stat-label">资产总数</span>
          <span className="stat-value">{assets.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">网络设备</span>
          <span className="stat-value">{assets.filter(a => a.device_type === '网络设备').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">安全设备</span>
          <span className="stat-value">{assets.filter(a => a.device_type === '安全设备').length}</span>
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

      <div className="data-table">
        <table className="asset-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              {visibleColumnsList.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th style={{ width: '180px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumnsList.length + 2} className="loading-cell">加载中...</td>
              </tr>
            ) : filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnsList.length + 2} className="empty-cell">暂无数据</td>
              </tr>
            ) : (
              filteredAssets.map(item => (
                <tr key={item.id}>
                  <td className="id-cell" title={item.id}>{formatId(item.id)}</td>
                  {visibleColumns.serial_no && <td>{item.serial_no}</td>}
                  {visibleColumns.device_name && <td><strong>{item.device_name}</strong></td>}
                  {visibleColumns.host_address && <td>{item.host_address || '-'}</td>}
                  {visibleColumns.hardware_model && <td>{item.hardware_model || '-'}</td>}
                  {visibleColumns.software_version && <td>{item.software_version || '-'}</td>}
                  {visibleColumns.is_virtual && <td>{item.is_virtual || '否'}</td>}
                  {visibleColumns.domain && <td>{item.domain || '-'}</td>}
                  {visibleColumns.device_type && <td>{item.device_type || '-'}</td>}
                  {visibleColumns.importance && (
                    <td>
                      <span className={`importance-badge ${getImportanceClass(item.importance)}`}>
                        {item.importance}
                      </span>
                    </td>
                  )}
                  {visibleColumns.quantity && <td>{item.quantity || 1}</td>}
                  {visibleColumns.assessment_type && <td>{item.assessment_type_name || '-'}</td>}
                  {visibleColumns.assessment_record && (
                    <td>
                      <button 
                        className="btn-record" 
                        onClick={() => { 
                          setCurrentRecordAsset(item); 
                          setShowRecordModal(true); 
                        }}
                      >
                        📝 查看记录
                      </button>
                    </td>
                  )}
                  {visibleColumns.creator_name && <td>{item.creator_name || '-'}</td>}
                  {visibleColumns.updater_name && <td>{item.updater_name || '-'}</td>}
                  {visibleColumns.created_at && <td>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</td>}
                  {visibleColumns.updated_at && <td>{item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'}</td>}
                  <td>
                    <button 
                      className="btn-edit" 
                      onClick={() => { 
                        setEditingItem(item); 
                        setShowModal(true); 
                      }}
                    >
                      编辑
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(item.id, item.device_name)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 新增/编辑资产模态框 */}
      {showModal && (
        <AssetModal 
          item={editingItem} 
          onSave={handleSave} 
          onClose={() => { 
            setShowModal(false); 
            setEditingItem(null); 
          }} 
          assessmentTypes={assessmentTypes}
          deviceTypeOptions={deviceTypeOptions}
          importanceOptions={importanceOptions}
          nextSerialNo={getNextSerialNo()}
        />
      )}

      {/* 测评记录弹窗 */}
      {showRecordModal && currentRecordAsset && (
        <RecordModal
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
function AssetModal({ item, onSave, onClose, assessmentTypes, deviceTypeOptions, importanceOptions, nextSerialNo }) {
  const [formData, setFormData] = useState({
    serial_no: item?.serial_no || nextSerialNo,
    device_name: item?.device_name || '',
    host_address: item?.host_address || '',
    hardware_model: item?.hardware_model || '',
    software_version: item?.software_version || '',
    is_virtual: item?.is_virtual || '否',
    domain: item?.domain || '',
    device_type: item?.device_type || '',
    importance: item?.importance || '中',
    quantity: item?.quantity || 1,
    assessment_type_id: item?.assessment_type_id || ''
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? '编辑资产' : '新增资产'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="form-row">
            <div className="form-group">
              <label>序号</label>
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
          <div className="modal-actions">
            <button type="submit" className="btn-primary">保存</button>
            <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 测评记录弹窗
function RecordModal({ asset, onSave, onClose }) {
  const [record, setRecord] = useState(asset?.assessment_record || {
    test_date: '',
    tester: '',
    test_result: '',
    conclusion: '',
    suggestions: ''
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>测评记录 - {asset.device_name}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(record); }}>
          <div className="form-row">
            <div className="form-group">
              <label>测试日期</label>
              <input 
                type="date" 
                value={record.test_date || ''} 
                onChange={(e) => setRecord({...record, test_date: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>测试人员</label>
              <input 
                type="text" 
                value={record.tester || ''} 
                onChange={(e) => setRecord({...record, tester: e.target.value})} 
              />
            </div>
          </div>
          <div className="form-group">
            <label>测试结果</label>
            <textarea 
              value={record.test_result || ''} 
              onChange={(e) => setRecord({...record, test_result: e.target.value})} 
              rows="3" 
              placeholder="请输入测试结果..."
            />
          </div>
          <div className="form-group">
            <label>测评结论</label>
            <textarea 
              value={record.conclusion || ''} 
              onChange={(e) => setRecord({...record, conclusion: e.target.value})} 
              rows="2" 
              placeholder="请输入测评结论..."
            />
          </div>
          <div className="form-group">
            <label>整改建议</label>
            <textarea 
              value={record.suggestions || ''} 
              onChange={(e) => setRecord({...record, suggestions: e.target.value})} 
              rows="2" 
              placeholder="请输入整改建议..."
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-primary">保存记录</button>
            <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectAssets;