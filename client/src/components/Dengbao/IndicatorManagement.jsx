// client/src/components/Dengbao/IndicatorManagement.jsx
import { useState } from 'react';
import '../../styles/Dengbao/IndicatorManagement.css';

function IndicatorManagement() {
  const [indicators, setIndicators] = useState([
    { id: 1, code: 'S1-A1', name: '访问控制', category: '安全通信网络', weight: 15, standard: '应符合GB/T 22239-2019要求' },
    { id: 2, code: 'S1-A2', name: '身份鉴别', category: '安全通信网络', weight: 20, standard: '采用口令、生物特征等鉴别技术' },
    { id: 3, code: 'S2-B1', name: '入侵防范', category: '安全区域边界', weight: 25, standard: '部署入侵检测/防御系统' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这个测评指标吗？')) {
      setIndicators(indicators.filter(item => item.id !== id));
    }
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
          <span className="stat-label">平均权重</span>
          <span className="stat-value">{Math.round(indicators.reduce((sum, i) => sum + i.weight, 0) / indicators.length)}</span>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>指标编码</th>
              <th>指标名称</th>
              <th>所属类别</th>
              <th>权重</th>
              <th>标准要求</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {indicators.map(item => (
              <tr key={item.id}>
                <td><code>{item.code}</code></td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.weight}</td>
                <td className="desc-cell">{item.standard}</td>
                <td>
                  <button className="btn-edit" onClick={() => { setEditingItem(item); setShowModal(true); }}>编辑</button>
                  <button className="btn-delete" onClick={() => handleDelete(item.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IndicatorManagement;