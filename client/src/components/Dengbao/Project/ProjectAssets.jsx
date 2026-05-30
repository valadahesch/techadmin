// client/src/components/Dengbao/ProjectAssetsPage.jsx
import React, { useState } from 'react';
import '../../../styles/Dengbao/Project/projectPages.css';

function ProjectAssets() {
  const [assets] = useState([
    { id: 1, name: '核心交换机', type: '网络设备', model: 'S12708', ip: '10.0.0.1', status: '在线' },
    { id: 2, name: '防火墙', type: '安全设备', model: 'USG6650', ip: '10.0.0.2', status: '在线' },
    { id: 3, name: 'Web服务器', type: '服务器', model: '华为2288H', ip: '10.0.1.10', status: '在线' },
    { id: 4, name: '数据库服务器', type: '服务器', model: '浪潮NF5280M5', ip: '10.0.1.20', status: '离线' },
  ]);

  return (
    <div className="project-page-container">
      <div className="page-header"><h1>项目资产</h1><button className="btn-primary">+ 新增资产</button></div>
      <div className="project-selector"><label>选择项目：</label><select><option>XX政务云平台等保测评</option><option>XX医院信息系统等保测评</option><option>XX银行核心系统等保测评</option></select></div>
      <div className="stats-summary">
        <div className="stat-item"><span className="stat-label">资产总数</span><span className="stat-value">{assets.length}</span></div>
        <div className="stat-item"><span className="stat-label">在线设备</span><span className="stat-value">{assets.filter(a => a.status === '在线').length}</span></div>
        <div className="stat-item"><span className="stat-label">离线设备</span><span className="stat-value">{assets.filter(a => a.status === '离线').length}</span></div>
      </div>
      <div className="search-bar"><div className="search-input-wrapper"><input type="text" placeholder="搜索资产名称、IP地址..." className="search-input" /><span className="search-icon">🔍</span></div>
      <select className="filter-select"><option value="">全部类型</option><option>网络设备</option><option>安全设备</option><option>服务器</option></select>
      <select className="filter-select"><option value="">全部状态</option><option>在线</option><option>离线</option></select></div>
      <div className="data-table"><table className="assets-table"><thead><tr><th>资产名称</th><th>资产类型</th><th>型号</th><th>IP地址</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>{assets.map(asset => (<tr key={asset.id}><td><strong>{asset.name}</strong></td><td>{asset.type}</td><td>{asset.model}</td><td>{asset.ip}</td><td><span className={`status-badge ${asset.status === '在线' ? 'status-online' : 'status-offline'}`}>{asset.status}</span></td>
      <td><button className="btn-edit-small">编辑</button><button className="btn-delete-small">删除</button></td></tr>))}</tbody></table></div>
    </div>
  );
}

export default ProjectAssets;