// client/src/components/Dengbao/ProjectLeakScanPage.jsx
import React, { useState } from 'react';
import '../../styles/projectPages.css';

function ProjectLeakScanPage() {
  const [scanTasks] = useState([
    { id: 1, name: '核心交换机漏洞扫描', target: '10.0.0.1', status: '已完成', risk: '中危', time: '2026-05-28 10:30' },
    { id: 2, name: '防火墙安全检测', target: '10.0.0.2', status: '进行中', risk: '-', time: '2026-05-29 09:00' },
    { id: 3, name: 'Web应用漏洞扫描', target: '10.0.1.10', status: '待执行', risk: '-', time: '-' },
  ]);

  const getRiskClass = (risk) => {
    const classes = { '高危': 'risk-high', '中危': 'risk-medium', '低危': 'risk-low' };
    return classes[risk] || '';
  };

  return (
    <div className="project-page-container">
      <div className="page-header"><h1>漏扫管理</h1><button className="btn-primary">+ 新建扫描任务</button></div>
      <div className="project-selector"><label>选择项目：</label><select><option>XX政务云平台等保测评</option><option>XX医院信息系统等保测评</option><option>XX银行核心系统等保测评</option></select></div>
      <div className="stats-summary">
        <div className="stat-item"><span className="stat-label">扫描任务</span><span className="stat-value">{scanTasks.length}</span></div>
        <div className="stat-item"><span className="stat-label">已完成</span><span className="stat-value">{scanTasks.filter(t => t.status === '已完成').length}</span></div>
        <div className="stat-item"><span className="stat-label">进行中</span><span className="stat-value">{scanTasks.filter(t => t.status === '进行中').length}</span></div>
      </div>
      <div className="search-bar"><div className="search-input-wrapper"><input type="text" placeholder="搜索任务名称、目标地址..." className="search-input" /><span className="search-icon">🔍</span></div>
      <select className="filter-select"><option value="">全部状态</option><option>已完成</option><option>进行中</option><option>待执行</option></select></div>
      <div className="data-table"><table className="leakscan-table"><thead><tr><th>任务名称</th><th>扫描目标</th><th>状态</th><th>风险等级</th><th>扫描时间</th><th>操作</th></tr></thead>
      <tbody>{scanTasks.map(task => (<tr key={task.id}><td><strong>{task.name}</strong></td><td>{task.target}</td><td><span className={`status-badge ${task.status === '已完成' ? 'status-completed' : task.status === '进行中' ? 'status-progress' : 'status-pending'}`}>{task.status}</span></td>
      <td><span className={`risk-badge ${getRiskClass(task.risk)}`}>{task.risk}</span></td><td>{task.time}</td>
      <td><button className="btn-view-small">查看报告</button><button className="btn-edit-small">编辑</button><button className="btn-delete-small">删除</button></td></tr>))}</tbody></table></div>
    </div>
  );
}

export default ProjectLeakScanPage;