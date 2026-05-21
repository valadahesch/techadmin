// client/src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react';
import '../styles/dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAssessments: 0,
    completedAssessments: 0,
    highRiskLeaks: 0,
    mediumRiskLeaks: 0,
    lowRiskLeaks: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 从后端API获取实际统计数据
    // 目前使用模拟数据
    setTimeout(() => {
      setStats({
        totalAssessments: 24,
        completedAssessments: 18,
        highRiskLeaks: 3,
        mediumRiskLeaks: 12,
        lowRiskLeaks: 28,
        recentActivities: [
          { id: 1, action: '完成系统等级测评', time: '2026-05-21 10:30', user: 'admin' },
          { id: 2, action: '新增用户权限配置', time: '2026-05-20 15:20', user: 'admin' },
          { id: 3, action: '扫描发现高危漏洞', time: '2026-05-19 09:15', user: 'security' },
          { id: 4, action: '生成安全评估报告', time: '2026-05-18 16:45', user: 'auditor' },
        ]
      });
      setLoading(false);
    }, 500);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-icon ${color}`}>
          <Icon size={24} />
        </div>
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-title">{title}</div>
      {trend && <div className="stat-trend">{trend}</div>}
    </div>
  );

  if (loading) {
    return <div className="loading-container">加载中...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* 欢迎区域 */}
      <div className="welcome-section">
        <div>
          <h1>欢迎回来，{user?.username || '用户'}！</h1>
          <p>今天是 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
        </div>
        <div className="welcome-stats">
          <div className="welcome-stat-item">
            <span className="stat-label">待办任务</span>
            <span className="stat-number-badge">3</span>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="stats-grid">
        <StatCard 
          title="测评项目总数" 
          value={stats.totalAssessments} 
          icon={FileText}
          color="blue"
          trend="本月新增 4 个"
        />
        <StatCard 
          title="已完成测评" 
          value={stats.completedAssessments} 
          icon={CheckCircle}
          color="green"
          trend={`完成率 ${Math.round(stats.completedAssessments / stats.totalAssessments * 100)}%`}
        />
        <StatCard 
          title="高危漏洞" 
          value={stats.highRiskLeaks} 
          icon={AlertTriangle}
          color="red"
          trend="需要立即处理"
        />
        <StatCard 
          title="系统健康度" 
          value="78%" 
          icon={Activity}
          color="purple"
          trend="较上周提升 5%"
        />
      </div>

      {/* 风险分布 */}
      <div className="risk-section">
        <div className="section-header">
          <h2><Shield size={20} /> 漏洞风险分布</h2>
          <a href="/leak-scan" className="view-all">查看详情 →</a>
        </div>
        <div className="risk-bars">
          <div className="risk-item">
            <div className="risk-label">高危</div>
            <div className="risk-bar-container">
              <div className="risk-bar high" style={{ width: `${(stats.highRiskLeaks / (stats.highRiskLeaks + stats.mediumRiskLeaks + stats.lowRiskLeaks)) * 100}%` }}></div>
            </div>
            <div className="risk-count">{stats.highRiskLeaks}</div>
          </div>
          <div className="risk-item">
            <div className="risk-label">中危</div>
            <div className="risk-bar-container">
              <div className="risk-bar medium" style={{ width: `${(stats.mediumRiskLeaks / (stats.highRiskLeaks + stats.mediumRiskLeaks + stats.lowRiskLeaks)) * 100}%` }}></div>
            </div>
            <div className="risk-count">{stats.mediumRiskLeaks}</div>
          </div>
          <div className="risk-item">
            <div className="risk-label">低危</div>
            <div className="risk-bar-container">
              <div className="risk-bar low" style={{ width: `${(stats.lowRiskLeaks / (stats.highRiskLeaks + stats.mediumRiskLeaks + stats.lowRiskLeaks)) * 100}%` }}></div>
            </div>
            <div className="risk-count">{stats.lowRiskLeaks}</div>
          </div>
        </div>
      </div>

      {/* 近期活动 */}
      <div className="activities-section">
        <div className="section-header">
          <h2><Clock size={20} /> 近期活动</h2>
          <span className="time-range">最近7天</span>
        </div>
        <div className="activities-list">
          {stats.recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <div className="activity-action">{activity.action}</div>
                <div className="activity-meta">
                  <span className="activity-user">{activity.user}</span>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="quick-actions">
        <div className="section-header">
          <h2><TrendingUp size={20} /> 快捷操作</h2>
        </div>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => window.location.href = '/assessment'}>
            新建测评
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/leak-scan'}>
            开始扫描
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/users'}>
            用户管理
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/reports'}>
            生成报告
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;