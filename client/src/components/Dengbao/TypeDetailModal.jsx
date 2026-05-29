// client/src/components/Dengbao/TypeDetailModal.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/Dengbao/typeDetailModal.css';

function TypeDetailModal({ typeData, onClose, onRefresh }) {
  const [assessmentItems, setAssessmentItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberIds, setMemberIds] = useState(typeData.member_ids || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [saving, setSaving] = useState(false);

  const getToken = () => localStorage.getItem('access_token');

  // 获取所有测评项
  const fetchAllItems = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/assessment-items/list-simple', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setAllItems(data.items || []);
      }
    } catch (error) {
      console.error('获取测评项失败:', error);
    }
  };

  // 根据member_ids获取测评项详情
  const fetchAssessmentItems = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const promises = memberIds.map(id => 
        fetch(`http://localhost:5000/api/assessment-items/${id}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        }).then(res => res.json())
      );
      const items = await Promise.all(promises);
      setAssessmentItems(items.filter(item => !item.error));
    } catch (error) {
      console.error('获取测评项详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  useEffect(() => {
    if (memberIds.length > 0) {
      fetchAssessmentItems();
    } else {
      setLoading(false);
      setAssessmentItems([]);
    }
  }, [memberIds]);

  // 添加测评项
  const addMember = (item) => {
    if (!memberIds.includes(item.id)) {
      const newMemberIds = [...memberIds, item.id];
      setMemberIds(newMemberIds);
      saveMemberIds(newMemberIds);
    }
  };

  // 删除测评项（滑动删除效果）
  const removeMember = (index) => {
    const newMemberIds = memberIds.filter((_, i) => i !== index);
    setMemberIds(newMemberIds);
    saveMemberIds(newMemberIds);
  };

  // 保存成员ID到后端
  const saveMemberIds = async (newMemberIds) => {
    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/assessment-types/${typeData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          name: typeData.name,
          description: typeData.description,
          member_ids: newMemberIds,
          groups: typeData.groups
        })
      });
      
      if (response.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  // 可添加的测评项（不在当前成员中的）
  const availableItems = allItems.filter(item => !memberIds.includes(item.id));
  
  // 筛选后的可用测评项
  const filteredAvailableItems = availableItems.filter(item =>
    item.security_control?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    item.standard_type?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    item.assessment_object?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 格式化ID显示
  const formatId = (id) => {
    if (!id) return '-';
    return id.substring(0, 8) + '...';
  };

  // 获取指标数量显示
  const getIndicatorsCount = (indicators) => {
    if (!indicators) return 0;
    if (Array.isArray(indicators)) return indicators.length;
    if (typeof indicators === 'object') return Object.keys(indicators).length;
    return 0;
  };

  return (
    <div className="type-detail-overlay" onClick={onClose}>
      <div className="type-detail-container type-detail-right" onClick={(e) => e.stopPropagation()}>
        <div className="type-detail-header">
          <h3>测评类型详情 - {typeData.name}</h3>
          <button className="type-detail-close" onClick={onClose}>×</button>
        </div>
        
        <div className="type-detail-body">
          {/* 基本信息卡片 */}
          <div className="info-card">
            <div className="info-card-header">基本信息</div>
            <div className="info-card-body">
              <div className="info-row">
                <div className="info-label">ID：</div>
                <div className="info-value">{typeData.id}</div>
              </div>
              <div className="info-row">
                <div className="info-label">名称：</div>
                <div className="info-value">{typeData.name}</div>
              </div>
              <div className="info-row">
                <div className="info-label">描述：</div>
                <div className="info-value">{typeData.description || '-'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">群组：</div>
                <div className="info-value">
                  {typeData.groups && typeData.groups.length > 0 ? (
                    typeData.groups.map(group => (
                      <span key={group} className="group-badge">{group}</span>
                    ))
                  ) : '-'}
                </div>
              </div>
            </div>
          </div>
          
          {/* 测评项成员管理 */}
          <div className="members-card">
            <div className="members-card-header">
              <span>测评项成员 ({assessmentItems.length})</span>
              <button className="btn-add-member" onClick={() => setShowAddModal(true)}>
                + 添加测评项
              </button>
            </div>
            <div className="members-card-body">
              {loading ? (
                <div className="loading-state">加载中...</div>
              ) : assessmentItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>暂无测评项成员</p>
                  <button className="btn-primary" onClick={() => setShowAddModal(true)}>添加测评项</button>
                </div>
              ) : (
                <div className="members-list">
                  {assessmentItems.map((item, index) => (
                    <div key={item.id} className="member-item">
                      <div className="member-content">
                        <div className="member-info">
                          <div className="member-id" title={item.id}>{formatId(item.id)}</div>
                          <div className="member-name">
                            <span className="member-control">{item.security_control}</span>
                            <span className="member-type">{item.standard_type}</span>
                          </div>
                          <div className="member-detail">
                            <span className="member-object">测评对象：{item.assessment_object || '-'}</span>
                            <span className="member-indicators">指标数：{getIndicatorsCount(item.assessment_indicators)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="member-actions">
                        <button className="btn-slide-delete" onClick={() => removeMember(index)}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="type-detail-footer">
          <button className="btn-close-detail" onClick={onClose}>关闭</button>
        </div>
      </div>

      {/* 添加测评项弹窗 */}
      {showAddModal && (
        <AddMemberModal
          availableItems={filteredAvailableItems}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          onAdd={addMember}
          onClose={() => { setShowAddModal(false); setSearchKeyword(''); }}
        />
      )}
    </div>
  );
}

// 添加测评项弹窗
function AddMemberModal({ availableItems, searchKeyword, setSearchKeyword, onAdd, onClose }) {
  return (
    <div className="add-member-overlay" onClick={onClose}>
      <div className="add-member-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-member-header">
          <h4>添加测评项</h4>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="add-member-body">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="搜索安全控制点、标准类型、测评对象..." 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
              autoFocus
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="available-items-list">
            {availableItems.length === 0 ? (
              <div className="empty-list">暂无可添加的测评项</div>
            ) : (
              availableItems.map(item => (
                <div key={item.id} className="available-item" onClick={() => onAdd(item)}>
                  <div className="item-info">
                    <div className="item-title">{item.security_control}</div>
                    <div className="item-subtitle">
                      <span>{item.standard_type}</span>
                      <span>{item.assessment_object}</span>
                    </div>
                  </div>
                  <button className="btn-add">+ 添加</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypeDetailModal;