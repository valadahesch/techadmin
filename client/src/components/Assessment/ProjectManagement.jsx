import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function ProjectManagement() {
  const { hasPermission } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // TODO: 替换为真实的 API 调用
      // const data = await getProjects();
      
      // 模拟数据
      const mockData = [
        {
          id: 1,
          name: '等保2.0测评项目',
          code: 'DJCP-2024-001',
          customer: '某银行',
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          status: 'active',
          progress: 65,
          description: '网络安全等级保护测评'
        },
        {
          id: 2,
          name: 'ISO27001认证',
          code: 'ISO-2024-002',
          customer: '某科技公司',
          startDate: '2024-02-01',
          endDate: '2024-08-31',
          status: 'active',
          progress: 40,
          description: '信息安全管理体系认证'
        },
        {
          id: 3,
          name: '风险评估项目',
          code: 'RA-2024-003',
          customer: '某政府部门',
          startDate: '2024-03-01',
          endDate: '2024-05-31',
          status: 'completed',
          progress: 100,
          description: '信息安全风险评估'
        }
      ];
      
      setProjects(mockData);
    } catch (err) {
      console.error('Failed to load projects:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (projectData) => {
    try {
      if (editingProject) {
        // TODO: 更新项目
        // await updateProject(editingProject.id, projectData);
        alert('项目更新成功（演示模式）');
      } else {
        // TODO: 创建项目
        // await createProject(projectData);
        alert('项目创建成功（演示模式）');
      }
      await loadProjects();
      setModalVisible(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定删除该项目吗？')) {
      try {
        // TODO: 删除项目
        // await deleteProject(id);
        alert('项目删除成功（演示模式）');
        await loadProjects();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const getStatusText = (status) => {
    const texts = {
      active: '进行中',
      completed: '已完成',
      paused: '已暂停'
    };
    return texts[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#3b82f6',
      completed: '#10b981',
      paused: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="management-container">
      <div className="header">
        <h1>项目管理</h1>
        <button className="btn-add" onClick={() => {
          setEditingProject(null);
          setModalVisible(true);
        }}>+ 新建项目</button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <div>
                  <h3>{project.name}</h3>
                  <div className="project-code">{project.code}</div>
                </div>
                <div className="project-actions">
                  <button className="btn-edit" onClick={() => {
                    setEditingProject(project);
                    setModalVisible(true);
                  }}>编辑</button>
                  <button className="btn-delete" onClick={() => handleDelete(project.id)}>删除</button>
                </div>
              </div>
              <div className="project-card-body">
                <div className="project-info">
                  <div className="info-row">
                    <span className="label">客户：</span>
                    <span>{project.customer}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">周期：</span>
                    <span>{project.startDate} 至 {project.endDate}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">状态：</span>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(project.status) }}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">进度：</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                      <span className="progress-text">{project.progress}%</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="label">描述：</span>
                    <span>{project.description}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalVisible && (
        <ProjectModal
          project={editingProject}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// 项目表单组件
function ProjectModal({ project, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    customer: '',
    startDate: '',
    endDate: '',
    status: 'active',
    description: ''
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        code: project.code,
        customer: project.customer,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        description: project.description
      });
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('项目名称和编码不能为空');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{project ? '编辑项目' : '新建项目'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>项目名称 *</label>
            <input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>项目编码 *</label>
            <input
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>客户名称</label>
            <input
              name="customer"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>开始日期</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>结束日期</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">进行中</option>
              <option value="completed">已完成</option>
              <option value="paused">已暂停</option>
            </select>
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="modal-buttons">
            <button type="button" onClick={onClose}>取消</button>
            <button type="submit">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectManagement;