// client/src/components/Dengbao/AssessmentTypeManagement.jsx
import { useState } from 'react';
import '../../styles/Dengbao/AssessmentTypeManagement.css'; // 引入样式

function AssessmentTypeManagement() {
  const [assessmentTypes, setAssessmentTypes] = useState([
    { 
      id: 1, 
      code: 'AT-001', 
      name: '信息安全等级测评', 
      category: '等保测评',
      description: '依据GB/T 22239标准进行的信息安全等级保护测评',
      status: '启用',
      sortOrder: 1,
      createTime: '2026-01-15'
    },
    { 
      id: 2, 
      code: 'AT-002', 
      name: '风险评估', 
      category: '风险评估',
      description: '对信息系统进行全面的风险评估分析',
      status: '启用',
      sortOrder: 2,
      createTime: '2026-01-15'
    },
    { 
      id: 3, 
      code: 'AT-003', 
      name: '渗透测试', 
      category: '安全测试',
      description: '模拟攻击者行为进行安全渗透测试',
      status: '启用',
      sortOrder: 3,
      createTime: '2026-02-01'
    },
    { 
      id: 4, 
      code: 'AT-004', 
      name: '代码审计', 
      category: '安全测试',
      description: '对应用系统源代码进行安全审计',
      status: '停用',
      sortOrder: 4,
      createTime: '2026-02-10'
    },
    { 
      id: 5, 
      code: 'AT-005', 
      name: '应急响应', 
      category: '安全服务',
      description: '信息安全事件应急响应服务',
      status: '启用',
      sortOrder: 5,
      createTime: '2026-03-01'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这个测评类型吗？删除后相关的测评项可能会受影响。')) {
      setAssessmentTypes(assessmentTypes.filter(item => item.id !== id));
    }
  };

  const handleSave = (data) => {
    if (editingItem) {
      setAssessmentTypes(assessmentTypes.map(item => 
        item.id === editingItem.id ? { ...data, id: item.id, createTime: item.createTime } : item
      ));
    } else {
      setAssessmentTypes([...assessmentTypes, { 
        ...data, 
        id: Date.now(), 
        createTime: new Date().toISOString().split('T')[0]
      }]);
    }
    setShowModal(false);
    setEditingItem(null);
  };

  // 筛选数据
  const filteredData = assessmentTypes.filter(item => {
    const matchKeyword = searchKeyword === '' || 
      item.name.includes(searchKeyword) || 
      item.code.includes(searchKeyword) ||
      item.description.includes(searchKeyword);
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchKeyword && matchStatus;
  });

  // 统计数据
  const stats = {
    total: assessmentTypes.length,
    active: assessmentTypes.filter(item => item.status === '启用').length,
    inactive: assessmentTypes.filter(item => item.status === '停用').length
  };

  return (
    <div className="management-container">
      <div className="page-header">
        <h1>测评类型管理</h1>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
          + 新增测评类型
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">总类型数</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">已启用</span>
          <span className="stat-value" style={{ color: '#10b981' }}>{stats.active}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">已停用</span>
          <span className="stat-value" style={{ color: '#ef4444' }}>{stats.inactive}</span>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="搜索类型名称、编码或描述..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">全部状态</option>
          <option value="启用">启用</option>
          <option value="停用">停用</option>
        </select>
      </div>

      {/* 数据表格 */}
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>类型编码</th>
              <th>类型名称</th>
              <th>所属类别</th>
              <th>描述</th>
              <th>状态</th>
              <th>排序</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id}>
                <td><code className="type-code">{item.code}</code></td>
                <td><strong>{item.name}</strong></td>
                <td>{item.category}</td>
                <td className="desc-cell" title={item.description}>{item.description}</td>
                <td>
                  <span className={`status-badge ${item.status === '启用' ? 'status-active' : 'status-inactive'}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.sortOrder}</td>
                <td>{item.createTime}</td>
                <td>
                  <button className="btn-edit" onClick={() => { setEditingItem(item); setShowModal(true); }}>
                    编辑
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="empty-data">暂无数据</div>
        )}
      </div>

      {/* 新增/编辑模态框 */}
      {showModal && (
        <AssessmentTypeModal 
          item={editingItem} 
          onSave={handleSave} 
          onClose={() => { setShowModal(false); setEditingItem(null); }} 
        />
      )}
    </div>
  );
}

function AssessmentTypeModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState(
    item || { 
      code: '', 
      name: '', 
      category: '等保测评', 
      description: '', 
      status: '启用', 
      sortOrder: 1 
    }
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? '编辑测评类型' : '新增测评类型'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="form-row">
            <div className="form-group">
              <label>类型编码 *</label>
              <input 
                type="text" 
                value={formData.code} 
                onChange={(e) => setFormData({ ...formData, code: e.target.value })} 
                placeholder="例如：AT-001"
                required 
              />
            </div>
            <div className="form-group">
              <label>类型名称 *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>所属类别</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="等保测评">等保测评</option>
                <option value="风险评估">风险评估</option>
                <option value="安全测试">安全测试</option>
                <option value="安全服务">安全服务</option>
                <option value="合规审计">合规审计</option>
              </select>
            </div>
            <div className="form-group">
              <label>排序号</label>
              <input 
                type="number" 
                value={formData.sortOrder} 
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} 
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>状态</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="启用">启用</option>
                <option value="停用">停用</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              rows="3"
              placeholder="请输入测评类型的详细描述..."
            ></textarea>
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