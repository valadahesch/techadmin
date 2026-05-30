// client/src/components/Dengbao/AssessmentRecordModal.jsx
import React, { useState } from 'react';
import '../../../styles/Dengbao/Project/projectAssets.css';

function AssessmentRecordModal({ asset, onSave, onClose }) {
  const [record, setRecord] = useState(asset?.assessment_record || {
    test_date: '',
    tester: '',
    test_result: '',
    conclusion: '',
    suggestions: '',
    attachments: []
  });

  const [activeTab, setActiveTab] = useState('basic');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="record-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="record-modal-header">
          <h2>测评记录 - {asset.device_name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="record-tabs">
          <button 
            className={`record-tab ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            基本信息
          </button>
          <button 
            className={`record-tab ${activeTab === 'result' ? 'active' : ''}`}
            onClick={() => setActiveTab('result')}
          >
            测评结果
          </button>
          <button 
            className={`record-tab ${activeTab === 'suggestion' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestion')}
          >
            整改建议
          </button>
        </div>

        <div className="record-modal-body">
          <form onSubmit={(e) => { e.preventDefault(); onSave(record); }}>
            {activeTab === 'basic' && (
              <div className="record-section">
                <div className="info-card">
                  <div className="info-card-header">设备基本信息</div>
                  <div className="info-card-body">
                    <div className="info-row">
                      <div className="info-label">设备名称：</div>
                      <div className="info-value">{asset.device_name}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">设备类型：</div>
                      <div className="info-value">{asset.device_type || '-'}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">主机地址：</div>
                      <div className="info-value">{asset.host_address || '-'}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">硬件型号：</div>
                      <div className="info-value">{asset.hardware_model || '-'}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">软件版本：</div>
                      <div className="info-value">{asset.software_version || '-'}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">重要程度：</div>
                      <div className="info-value">{asset.importance || '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-header">测评信息</div>
                  <div className="info-card-body">
                    <div className="form-group">
                      <label>测试日期</label>
                      <input 
                        type="date" 
                        value={record.test_date || ''} 
                        onChange={(e) => setRecord({...record, test_date: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>测试人员</label>
                      <input 
                        type="text" 
                        value={record.tester || ''} 
                        onChange={(e) => setRecord({...record, tester: e.target.value})} 
                        placeholder="请输入测试人员姓名"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'result' && (
              <div className="record-section">
                <div className="info-card">
                  <div className="info-card-header">测评结果</div>
                  <div className="info-card-body">
                    <div className="form-group">
                      <label>测试结果</label>
                      <textarea 
                        value={record.test_result || ''} 
                        onChange={(e) => setRecord({...record, test_result: e.target.value})} 
                        rows="5" 
                        placeholder="请输入测试结果..."
                      />
                    </div>
                    <div className="form-group">
                      <label>测评结论</label>
                      <textarea 
                        value={record.conclusion || ''} 
                        onChange={(e) => setRecord({...record, conclusion: e.target.value})} 
                        rows="3" 
                        placeholder="请输入测评结论..."
                      />
                    </div>
                    <div className="form-group">
                      <label>符合情况</label>
                      <select 
                        value={record.compliance || ''} 
                        onChange={(e) => setRecord({...record, compliance: e.target.value})}
                      >
                        <option value="">请选择</option>
                        <option value="compliant">符合</option>
                        <option value="non-compliant">不符合</option>
                        <option value="partially-compliant">部分符合</option>
                        <option value="not-applicable">不适用</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'suggestion' && (
              <div className="record-section">
                <div className="info-card">
                  <div className="info-card-header">整改建议</div>
                  <div className="info-card-body">
                    <div className="form-group">
                      <label>整改建议</label>
                      <textarea 
                        value={record.suggestions || ''} 
                        onChange={(e) => setRecord({...record, suggestions: e.target.value})} 
                        rows="5" 
                        placeholder="请输入整改建议..."
                      />
                    </div>
                    <div className="form-group">
                      <label>整改期限</label>
                      <input 
                        type="date" 
                        value={record.deadline || ''} 
                        onChange={(e) => setRecord({...record, deadline: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>整改负责人</label>
                      <input 
                        type="text" 
                        value={record.responsible || ''} 
                        onChange={(e) => setRecord({...record, responsible: e.target.value})} 
                        placeholder="请输入整改负责人"
                      />
                    </div>
                    <div className="form-group">
                      <label>整改状态</label>
                      <select 
                        value={record.status || ''} 
                        onChange={(e) => setRecord({...record, status: e.target.value})}
                      >
                        <option value="">请选择</option>
                        <option value="pending">待整改</option>
                        <option value="in-progress">整改中</option>
                        <option value="completed">已完成</option>
                        <option value="verified">已验证</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="submit" className="btn-primary">保存记录</button>
              <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssessmentRecordModal;