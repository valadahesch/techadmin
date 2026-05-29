// client/src/components/Dengbao/ProjectManagementPage.jsx
import React, { useState } from 'react';
import '../../styles/projectPages.css';

function ProjectManagementPage() {
  const [projects, setProjects] = useState([
    { id: 1, name: 'XX政务云平台等保测评', customer: 'XX市政务服务局', level: '三级', status: '进行中', progress: 65 },
    { id: 2, name: 'XX医院信息系统等保测评', customer: 'XX市人民医院', level: '三级', status: '已完成', progress: 100 },
    { id: 3, name: 'XX银行核心系统等保测评', customer: 'XX银行', level: '四级', status: '待启动', progress: 0 },
  ]);

  const getStatusClass = (status) => {
    const classes = {
      '进行中': 'status-progress',
      '已完成': 'status-completed',
      '待启动': 'status-pending'
    };
    return classes[status] || 'status-pending';
  };

  const getLevelClass = (level) => {
    const classes = {
      '二级': 'level-two',
      '三级': 'level-three',
      '四级': 'level-four'
    };
    return classes[level] || 'level-three';
  };

  return (
    <div className="project-page-container">
      <div className="page-header">
        <h1>项目管理</h1>
        <button className="btn-primary">+ 新建项目</button>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">项目总数</span>
          <span className="stat-value">{projects.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">进行中</span>
          <span className="stat-value">{projects.filter(p => p.status === '进行中').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">已完成</span>
          <span className="stat-value">{projects.filter(p => p.status === '已完成').length}</span>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <input type="text" placeholder="搜索项目名称、客户单位..." className="search-input" />
          <span className="search-icon">🔍</span>
        </div>
        <select className="filter-select">
          <option value="">全部状态</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
          <option value="待启动">待启动</option>
        </select>
      </div>

      <div className="projects-list">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-card-header">
              <h3>{project.name}</h3>
              <span className={`project-status ${getStatusClass(project.status)}`}>{project.status}</span>
            </div>
            <div className="project-card-body">
              <div className="project-info">
                <div className="info-item">
                  <span className="info-label">客户单位：</span>
                  <span>{project.customer}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">等保级别：</span>
                  <span className={`level-badge ${getLevelClass(project.level)}`}>{project.level}</span>
                </div>
              </div>
              <div className="progress-section">
                <div className="progress-label">完成进度</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                </div>
                <div className="progress-value">{project.progress}%</div>
              </div>
            </div>
            <div className="project-card-footer">
              <button className="btn-view">查看详情</button>
              <button className="btn-edit">编辑</button>
              <button className="btn-delete">删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectManagementPage;