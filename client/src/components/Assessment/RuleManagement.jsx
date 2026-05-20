import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function RuleManagement() {
  const { hasPermission } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      // TODO: 替换为真实的 API 调用
      // const data = await getRules();
      
      // 模拟数据
      const mockData = [
        {
          id: 1,
          name: '密码复杂度要求',
          category: 'authentication',
          score: 8.5,
          requirement: '密码长度至少8位，包含大小写字母、数字和特殊字符',
          status: 'active',
          standard: 'GB/T 22239-2019'
        },
        {
          id: 2,
          name: '登录失败处理',
          category: 'authentication',
          score: 7.5,
          requirement: '连续5次登录失败后锁定账号30分钟',
          status: 'active',
          standard: 'GB/T 22239-2019'
        },
        {
          id: 3,
          name: '数据备份策略',
          category: 'data_security',
          score: 9.0,
          requirement: '每日增量备份，每周全量备份，备份数据异地存储',
          status: 'active',
          standard: 'ISO 27001'
        },
        {
          id: 4,
          name: '访问控制策略',
          category: 'access_control',
          score: 8.0,
          requirement: '实施最小权限原则，定期审查权限分配',
          status: 'inactive',
          standard: 'GB/T 22239-2019'
        }
      ];
      
      setRules(mockData);
    } catch (err) {
      console.error('Failed to load rules:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (ruleData) => {
    try {
      if (editingRule) {
        // TODO: 更新规则
        // await updateRule(editingRule.id, ruleData);
        alert('规则更新成功（演示模式）');
      } else {
        // TODO: 创建规则
        // await createRule(ruleData);
        alert('规则创建成功（演示模式）');
      }
      await loadRules();
      setModalVisible(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定删除该规则吗？')) {
      try {
        // TODO: 删除规则
        // await deleteRule(id);
        alert('规则删除成功（演示模式）');
        await loadRules();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const getCategoryText = (category) => {
    const texts = {
      authentication: '认证安全',
      data_security: '数据安全',
      access_control: '访问控制',
      audit: '审计日志',
      network_security: '网络安全'
    };
    return texts[category] || category;
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.requirement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || rule.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(rules.map(r => r.category))];

  return (
    <div className="management-container">
      <div className="header">
        <h1>规则管理</h1>
        <button className="btn-add" onClick={() => {
          setEditingRule(null);
          setModalVisible(true);
        }}>+ 新建规则</button>
      </div>

      {/* 搜索和过滤 */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索规则..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? '全部分类' : getCategoryText(cat)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="rules-list">
          {filteredRules.map(rule => (
            <div key={rule.id} className="rule-card">
              <div className="rule-card-header">
                <div>
                  <h3>{rule.name}</h3>
                  <div className="rule-meta">
                    <span className="category-badge">{getCategoryText(rule.category)}</span>
                    <span className="score-badge">评分: {rule.score}</span>
                    <span className={`status-badge ${rule.status === 'active' ? 'active' : 'inactive'}`}>
                      {rule.status === 'active' ? '已启用' : '已禁用'}
                    </span>
                  </div>
                </div>
                <div className="rule-actions">
                  <button className="btn-edit" onClick={() => {
                    setEditingRule(rule);
                    setModalVisible(true);
                  }}>编辑</button>
                  <button className="btn-delete" onClick={() => handleDelete(rule.id)}>删除</button>
                </div>
              </div>
              <div className="rule-card-body">
                <div className="rule-requirement">
                  <strong>要求：</strong>
                  <p>{rule.requirement}</p>
                </div>
                <div className="rule-standard">
                  <strong>标准依据：</strong>
                  <span>{rule.standard}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalVisible && (
        <RuleModal
          rule={editingRule}
          categories={categories.filter(c => c !== 'all')}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          getCategoryText={getCategoryText}
        />
      )}
    </div>
  );
}

// 规则表单组件
function RuleModal({ rule, categories, onClose, onSave, getCategoryText }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    score: '',
    requirement: '',
    status: 'active',
    standard: ''
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        category: rule.category,
        score: rule.score,
        requirement: rule.requirement,
        status: rule.status,
        standard: rule.standard
      });
    }
  }, [rule]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      alert('规则名称和分类不能为空');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>{rule ? '编辑规则' : '新建规则'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>规则名称 *</label>
            <input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>分类 *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">请选择</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{getCategoryText(cat)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>评分 (0-10)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>标准依据</label>
            <input
              value={formData.standard}
              onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
              placeholder="例如：GB/T 22239-2019"
            />
          </div>
          <div className="form-group">
            <label>具体要求</label>
            <textarea
              rows="4"
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              placeholder="详细描述规则的具体要求"
            />
          </div>
          <div className="form-group">
            <label>状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
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

export default RuleManagement;