// client/src/components/Dengbao/AssessmentItemManagement.jsx
import { useState } from 'react';
import '../../styles/Dengbao/AssessmentItemManagement.css';

function AssessmentItemManagement() {
  const [items, setItems] = useState([
    { id: 1, name: '防火墙配置检查', type: '配置核查', method: '人工检查', standard: '应配置访问控制策略', score: 10 },
    { id: 2, name: '漏洞扫描', type: '漏洞检测', method: '工具扫描', standard: '应定期进行漏洞扫描', score: 15 },
    { id: 3, name: '日志审计', type: '日志分析', method: '人工检查', standard: '应启用日志审计功能', score: 10 },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  return (
    <div className="management-container">
      <div className="page-header">
        <h1>测评项管理</h1>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
          + 新增测评项
        </button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>测评项名称</th>
              <th>测评类型</th>
              <th>测评方法</th>
              <th>判定标准</th>
              <th>分值</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td><span className="type-badge">{item.type}</span></td>
                <td>{item.method}</td>
                <td className="desc-cell">{item.standard}</td>
                <td>{item.score}</td>
                <td>
                  <button className="btn-edit">编辑</button>
                  <button className="btn-delete">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssessmentItemManagement;