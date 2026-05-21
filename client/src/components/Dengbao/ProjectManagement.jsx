// client/src/components/Dengbao/ProjectManagement.jsx
import { useState } from 'react';
import '../../styles/Dengbao/ProjectManagement.css';

function ProjectManagement() {
  const [projects, setProjects] = useState([
    { id: 1, name: 'XX政务云平台测评', customer: 'XX市政务服务局', level: '三级', status: '进行中', progress: 65, startDate: '2026-04-01', endDate: '2026-06-30' },
    { id: 2, name: 'XX医院信息系统测评', customer: 'XX市人民医院', level: '三级', status: '已完成', progress: 100, startDate: '2026-02-01', endDate: '2026-04-30' },
    { id: 3, name: 'XX银行核心系统测评', customer: 'XX银行', level: '四级', status: '待启动', progress: 0, startDate: '2026-06-01', endDate: '2026-08-31' },
  ]);

  const getStatusColor = (status) => {
    const colors = {
      '进行中': 'status-progress',
      '已完成': 'status-completed',
      '待启动': 'status-pending'
    };
    return colors[status] || 'status-pending';
  };

  return (
    <div className="management-container">
      <div className="page-header">
        <h1>测评项目管理</h1>
        <button className="btn-primary">+ 新建项目</button>
      </div>

      <div className="projects-list">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <h3>{project.name}</h3>
              <span className={`project-status ${getStatusColor(project.status)}`}>{project.status}</span>
            </div>
            <div className="project-info">
              <div className="info-row">
                <span className="info-label">客户单位：</span>
                <span>{project.customer}</span>
              </div>
              <div className="info-row">
                <span className="info-label">等保级别：</span>
                <span className={`level-${project.level}`}>{project.level}</span>
              </div>
              <div className="info-row">
                <span className="info-label">项目周期：</span>
                <span>{project.startDate} 至 {project.endDate}</span>
              </div>
              <div className="progress-bar-container">
                <span className="info-label">完成进度：</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                </div>
                <span className="progress-text">{project.progress}%</span>
              </div>
            </div>
            <div className="project-actions">
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

export default ProjectManagement;