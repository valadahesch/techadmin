// client/src/components/Dengbao/DeviceTypeManagement.jsx
import { useState } from 'react';
import '../../styles/Dengbao/DeviceTypeManagement.css';

function DeviceTypeManagement() {
  const [deviceTypes, setDeviceTypes] = useState([
    { id: 1, name: '交换机', category: '网络设备', level: '三级', status: '启用', description: '核心网络交换设备' },
    { id: 2, name: '路由器', category: '网络设备', level: '三级', status: '启用', description: '边界路由设备' },
    { id: 3, name: '防火墙', category: '安全设备', level: '四级', status: '启用', description: '边界防护设备' },
    { id: 4, name: '服务器', category: '主机设备', level: '三级', status: '停用', description: '应用服务器' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这个设备类型吗？')) {
      setDeviceTypes(deviceTypes.filter(item => item.id !== id));
    }
  };

  const handleSave = (data) => {
    if (editingItem) {
      setDeviceTypes(deviceTypes.map(item => 
        item.id === editingItem.id ? { ...data, id: item.id } : item
      ));
    } else {
      setDeviceTypes([...deviceTypes, { ...data, id: Date.now() }]);
    }
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className="management-container">
      <div className="page-header">
        <h1>设备用途管理</h1>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
          + 新增设备类型
        </button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>设备名称</th>
              <th>设备类别</th>
              <th>等保级别</th>
              <th>状态</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {deviceTypes.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td><span className={`level-badge level-${item.level}`}>{item.level}</span></td>
                <td><span className={`status-badge ${item.status === '启用' ? 'status-active' : 'status-inactive'}`}>{item.status}</span></td>
                <td>{item.description}</td>
                <td>
                  <button className="btn-edit" onClick={() => { setEditingItem(item); setShowModal(true); }}>编辑</button>
                  <button className="btn-delete" onClick={() => handleDelete(item.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DeviceTypeModal 
          item={editingItem} 
          onSave={handleSave} 
          onClose={() => { setShowModal(false); setEditingItem(null); }} 
        />
      )}
    </div>
  );
}

function DeviceTypeModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState(
    item || { name: '', category: '', level: '三级', status: '启用', description: '' }
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? '编辑设备类型' : '新增设备类型'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="form-group">
            <label>设备名称</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>设备类别</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              <option value="">请选择</option>
              <option value="网络设备">网络设备</option>
              <option value="安全设备">安全设备</option>
              <option value="主机设备">主机设备</option>
              <option value="存储设备">存储设备</option>
            </select>
          </div>
          <div className="form-group">
            <label>等保级别</label>
            <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
              <option value="一级">一级</option>
              <option value="二级">二级</option>
              <option value="三级">三级</option>
              <option value="四级">四级</option>
            </select>
          </div>
          <div className="form-group">
            <label>状态</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="启用">启用</option>
              <option value="停用">停用</option>
            </select>
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3"></textarea>
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

export default DeviceTypeManagement;