import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'xlsx';
import './LeakScan.css';

function LeakScan() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    scannerType: 'nsfocus_host',
    accessPoint: 'access_point_2',
    filterNonAsset: 'true',
    networkStats: '',
    terminalStats: '',
    serverStats: '',
    webStats: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
      console.log('文件已选择:', file.name, '大小:', file.size);
    } else {
      showToast('请上传 ZIP 格式的文件！', 'error');
      e.target.value = '';
      setSelectedFile(null);
    }
  };

  const validateWebStats = () => {
    const isWebScanner = formData.scannerType.includes('_web');
    const webStatsValue = formData.webStats.trim();
    
    if (isWebScanner && !webStatsValue) {
      showToast('Web漏扫必须填写业务应用系统信息！', 'error');
      return false;
    }
    return true;
  };

  const getAuthToken = () => {
    const token = localStorage.getItem('access_token');
    console.log('获取到的 token:', token ? token.substring(0, 50) + '...' : 'null');
    if (!token) {
      showToast('请先登录', 'error');
      return null;
    }
    return token;
  };

  // 使用 axios 替代 fetch 以便更好地处理文件上传
  const handleExtract = async () => {
    if (!selectedFile) {
      showToast('请选择要上传的漏扫文件！', 'error');
      return;
    }

    if (!validateWebStats()) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      return;
    }

    setLoading(true);
    
    const formDataObj = new FormData();
    formDataObj.append('scan_file', selectedFile);
    formDataObj.append('scanner_type', formData.scannerType);
    formDataObj.append('access_point', formData.accessPoint);
    formDataObj.append('filter_non_asset', formData.filterNonAsset);
    formDataObj.append('network_stats', formData.networkStats);
    formDataObj.append('terminal_stats', formData.terminalStats);
    formDataObj.append('server_stats', formData.serverStats);
    formDataObj.append('web_stats', formData.webStats);

    // 打印请求信息用于调试
    console.log('发送请求到后端...');
    console.log('API URL: http://localhost:5000/api/leak-scan/extract');
    console.log('Token存在:', !!token);
    console.log('表单数据:', {
      scanner_type: formData.scannerType,
      access_point: formData.accessPoint,
      filter_non_asset: formData.filterNonAsset,
      file_name: selectedFile.name
    });

    try {
      const response = await fetch('http://localhost:5000/api/leak-scan/extract', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });
      
      console.log('响应状态:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('错误响应:', errorData);
        throw new Error(errorData.error || `请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('成功响应:', data);
      
      if (data.success) {
        setResultData(data.results || []);
        setShowResult(true);
        showToast(data.message || '数据提取成功！');
      } else {
        throw new Error(data.error || '提取失败');
      }
    } catch (error) {
      console.error('提取失败详细错误:', error);
      showToast('数据提取失败：' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyData = () => {
    if (resultData.length === 0) {
      showToast('没有数据可复制！', 'error');
      return;
    }

    let data = '接入点\t设备名称\tIP\t系统及版本\t安全漏洞级别\t安全漏洞名称\t整改建议\n';
    resultData.forEach(item => {
      data += `${item.access_point || ''}\t${item.hostname || ''}\t${item.ip || ''}\t${item.system_version || ''}\t${item.vulnerability_level || ''}\t${item.vulnerability_name || ''}\t${item.suggestion || ''}\n`;
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(data)
        .then(() => showToast('数据已成功复制到剪贴板！'))
        .catch(() => fallbackCopy(data));
    } else {
      fallbackCopy(data);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      showToast('数据已成功复制到剪贴板！');
    } catch (err) {
      showToast('复制失败，请手动复制！', 'error');
    }
    document.body.removeChild(textArea);
  };

  const exportToExcel = () => {
    if (resultData.length === 0) {
      showToast('没有数据可导出！', 'error');
      return;
    }

    try {
      const headers = ['接入点', '设备名称', 'IP', '系统及版本', '安全漏洞级别', '安全漏洞名称', '整改建议'];
      const data = [headers];
      
      resultData.forEach(item => {
        data.push([
          item.access_point || '',
          item.hostname || '',
          item.ip || '',
          item.system_version || '',
          item.vulnerability_level || '',
          item.vulnerability_name || '',
          item.suggestion || ''
        ]);
      });
      
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '漏扫数据');
      
      ws['!cols'] = [
        { wch: 12 }, { wch: 20 }, { wch: 15 },
        { wch: 25 }, { wch: 12 }, { wch: 45 }, { wch: 30 }
      ];
      
      const fileName = `漏扫数据提取结果_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast('Excel文件导出成功！');
      
    } catch (error) {
      console.error('导出Excel失败:', error);
      showToast('导出Excel失败: ' + error.message, 'error');
    }
  };

  const linkToProject = async () => {
    if (resultData.length === 0) {
      showToast('没有数据可关联！', 'error');
      return;
    }
    
    const token = getAuthToken();
    if (!token) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/leak-scan/link-to-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          results: resultData,
          scan_params: {
            scanner_type: formData.scannerType,
            access_point: formData.accessPoint,
            filter_non_asset: formData.filterNonAsset,
            network_stats: formData.networkStats,
            terminal_stats: formData.terminalStats,
            server_stats: formData.serverStats,
            web_stats: formData.webStats
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '关联失败');
      }
      
      const data = await response.json();
      showToast(data.message || '结果已成功关联到项目！');
    } catch (error) {
      console.error('关联失败:', error);
      showToast('关联失败: ' + error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      scannerType: 'nsfocus_host',
      accessPoint: 'access_point_2',
      filterNonAsset: 'true',
      networkStats: '',
      terminalStats: '',
      serverStats: '',
      webStats: ''
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setResultData([]);
    setShowResult(false);
  };

  return (
    <div className="leak-scan-page">
      <div className="leak-scan-container">
        <header className="leak-scan-header">
          <h1>漏扫文件数据提取系统</h1>
          <div className="button-group">
            <button className="btn-extract" onClick={handleExtract} disabled={loading}>
              {loading ? '提取中...' : '数据提取'}
            </button>
            <button className="btn-copy" onClick={copyData}>复制数据</button>
            <button className="btn-export" onClick={exportToExcel}>导出到Excel</button>
            <button className="btn-reset" onClick={resetForm}>重置</button>
          </div>
        </header>
        
        <section className="config-section">
          <div className="form-group">
            <label>选择漏扫类型</label>
            <select name="scannerType" value={formData.scannerType} onChange={handleInputChange}>
              <option value="nsfocus_host">绿盟主机漏扫</option>
              <option value="feifan_host">非凡主机漏扫</option>
              <option value="nsfocus_web">绿盟Web漏扫</option>
              <option value="feifan_web">非凡Web漏扫</option>
            </select>
            <div className="form-hint">请选择要处理的漏扫文件类型</div>
          </div>
          
          <div className="form-group">
            <label>上传漏扫文件 (ZIP格式)</label>
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".zip" 
              onChange={handleFileChange}
            />
            <div className="form-hint">请上传ZIP格式的漏扫报告文件</div>
            {selectedFile && <div className="file-info">已选择: {selectedFile.name}</div>}
          </div>

          <div className="form-group">
            <label>选择接入点数量</label>
            <select name="accessPoint" value={formData.accessPoint} onChange={handleInputChange}>
              <option value="access_point_2">1个出口(A/B接入点)</option>
              <option value="access_point_4">2个出口(A/B/C/D接入点)</option>
            </select>
            <div className="form-hint">请选择接入点数量</div>
          </div>
          
          <div className="form-group">
            <label>是否过滤非资产漏扫信息</label>
            <select name="filterNonAsset" value={formData.filterNonAsset} onChange={handleInputChange}>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
            <div className="form-hint">选择True将过滤非资产相关的漏扫信息，False将保留所有信息</div>
          </div>
        </section>
        
        <section className="stats-grid">
          <div className="stat-box">
            <div className="stat-title">运行统计-网络和安全设备</div>
            <textarea 
              className="stat-textarea"
              name="networkStats"
              value={formData.networkStats}
              onChange={handleTextareaChange}
              placeholder="请在此输入网络和安全设备的运行统计数据..."
              rows={6}
            />
            <div className="textarea-hint">可编辑区域 - 支持多行输入</div>
          </div>
          
          <div className="stat-box">
            <div className="stat-title">运行统计-运维终端</div>
            <textarea 
              className="stat-textarea"
              name="terminalStats"
              value={formData.terminalStats}
              onChange={handleTextareaChange}
              placeholder="请在此输入运维终端的运行统计数据..."
              rows={6}
            />
            <div className="textarea-hint">可编辑区域 - 支持多行输入</div>
          </div>
          
          <div className="stat-box">
            <div className="stat-title">运行统计-服务器</div>
            <textarea 
              className="stat-textarea"
              name="serverStats"
              value={formData.serverStats}
              onChange={handleTextareaChange}
              placeholder="请在此输入服务器的运行统计数据..."
              rows={6}
            />
            <div className="textarea-hint">可编辑区域 - 支持多行输入</div>
          </div>
          
          <div className="stat-box business-box">
            <div className="stat-title">业务应用系统(主机提取无需填写)</div>
            <textarea 
              className={`stat-textarea ${formData.scannerType.includes('_web') && !formData.webStats.trim() ? 'error' : ''}`}
              name="webStats"
              value={formData.webStats}
              onChange={handleTextareaChange}
              placeholder="请在此输入业务应用系统信息..."
              rows={6}
            />
            <div className="textarea-hint">主机提取无需填写此区域</div>
            {formData.scannerType.includes('_web') && !formData.webStats.trim() && (
              <div className="textarea-error">Web漏扫必须填写业务应用系统信息</div>
            )}
          </div>
        </section>
        
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>数据提取中，请稍候...</p>
          </div>
        )}
        
        {showResult && resultData.length > 0 && (
          <section className="result-section">
            <div className="result-header">
              <div className="result-title">
                提取结果 (共 {resultData.length} 条记录)
              </div>
              <div className="result-actions">
                <button className="btn-link-project" onClick={linkToProject}>
                  将结果关联到项目
                </button>
              </div>
            </div>
            
            <div className="table-wrapper">
              <table className="result-table">
                <thead>
                  <tr>
                    <th>接入点</th>
                    <th>设备名称</th>
                    <th>IP</th>
                    <th>系统及版本</th>
                    <th>安全漏洞级别</th>
                    <th>安全漏洞名称</th>
                    <th>整改建议</th>
                  </tr>
                </thead>
                <tbody>
                  {resultData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.access_point || '-'}</td>
                      <td>{item.hostname || '-'}</td>
                      <td>{item.ip || '-'}</td>
                      <td>{item.system_version || '-'}</td>
                      <td>
                        <span className={`vulnerability-level level-${getLevelClass(item.vulnerability_level)}`}>
                          {item.vulnerability_level || '-'}
                        </span>
                      </td>
                      <td>{item.vulnerability_name || '-'}</td>
                      <td>{item.suggestion || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        
        <footer className="leak-scan-footer">
          <p>漏扫文件数据提取系统 &copy; 2025</p>
        </footer>
      </div>
      
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function getLevelClass(level) {
  if (!level) return 'info';
  if (level.includes('高危')) return 'high';
  if (level.includes('中危')) return 'medium';
  if (level.includes('低危')) return 'low';
  return 'info';
}

export default LeakScan;