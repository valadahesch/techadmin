// client/src/components/Dengbao/RuleManagement.jsx
import { useState } from 'react';
import '../../styles/Dengbao/RuleManagement.css';

function RuleManagement() {
  const [rules, setRules] = useState([
    { id: 1, name: '密码复杂度规则', condition: '密码长度≥8位，包含数字、字母、特殊字符', result: '符合/不符合', severity: '高' },
    { id: 2, name: '会话超时规则', condition: '空闲会话超时时间≤15分钟', result: '符合/不符合', severity: '中' },
    { id: 3, name: '登录失败处理', condition: '连续5次失败锁定账号30分钟', result: '符合/不符合', severity: '高' },
  ]);

  return (
    <div className="management-container">
      <div className="page-header">
        <h1>测评规则管理</h1>
        <button className="btn-primary">+ 新增规则</button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>规则名称</th>
              <th>判定条件</th>
              <th>预期结果</th>
              <th>严重级别</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule.id}>
                <td>{rule.name}</td>
                <td>{rule.condition}</td>
                <td>{rule.result}</td>
                <td><span className={`severity-${rule.severity === '高' ? 'high' : 'medium'}`}>{rule.severity}</span></td>
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

export default RuleManagement;