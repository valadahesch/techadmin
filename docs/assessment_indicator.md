# 测评指标管理接口文档

## 1. 概述

测评指标管理模块用于管理网络安全等级保护测评中的指标信息，支持指标的增删改查操作。

### 1.1 基本信息

- **基础URL**: `http://localhost:5000/api`
- **认证方式**: JWT Token (Bearer Token)
- **请求格式**: `application/json`
- **响应格式**: `application/json`

### 1.2 通用请求头

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 2. 接口列表

| 接口名称 | 请求方式 | 接口路径 | 功能说明 |
|---------|---------|---------|---------|
| 获取指标列表 | GET | `/assessment-indicators` | 获取所有测评指标列表 |
| 获取指标详情 | GET | `/assessment-indicators/{id}` | 根据ID获取单个指标详情 |
| 新增指标 | POST | `/assessment-indicators` | 添加新的测评指标 |
| 更新指标 | PUT | `/assessment-indicators/{id}` | 修改指标信息 |
| 删除指标 | DELETE | `/assessment-indicators/{id}` | 删除指标 |

---

## 3. 数据模型

### 3.1 指标类型枚举

| 值 | 说明 |
|---|------|
| `checkbox` | 可选框类型（键值对配置） |
| `string` | 字符串类型 |
| `datetime` | 时间日期类型 |

### 3.2 指标数据格式（仅checkbox类型）

指标数据以JSON格式存储，为键值对形式：

```json
{
  "passwordLength": "密码长度",
  "loginFailCount": "登录失败次数",
  "lockTime": "锁定时间"
}
```

---

## 4. 接口详细说明

### 4.1 获取指标列表

#### 接口描述
获取所有测评指标列表，支持搜索和类型筛选。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `GET` |
| 接口路径 | `/assessment-indicators` |
| 是否需要认证 | 是 |

#### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| search | string | 否 | 搜索关键词（中文名称、英文名称） | `密码` |
| indicator_type | string | 否 | 指标类型筛选 | `string` |

#### 请求示例

```http
GET /api/assessment-indicators?search=密码&indicator_type=string HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 响应示例

**成功响应 (200 OK)**

```json
{
  "items": [
    {
      "id": "a1b2c3d4e5f6g7h8i9j1",
      "indicator_type": "string",
      "name_cn": "密码长度",
      "name_en": "passwordLength",
      "indicator_data": null,
      "created_by": 1,
      "updated_by": 1,
      "creator_name": "admin",
      "updater_name": "admin",
      "created_at": "2026-05-25T10:00:00",
      "updated_at": "2026-05-25T10:00:00"
    },
    {
      "id": "a1b2c3d4e5f6g7h8i9j2",
      "indicator_type": "checkbox",
      "name_cn": "安全配置项",
      "name_en": "securityConfig",
      "indicator_data": {
        "ipsModule": "是否开启",
        "avModule": "是否开启"
      },
      "created_by": 1,
      "updated_by": 1,
      "creator_name": "admin",
      "updater_name": "admin",
      "created_at": "2026-05-25T10:00:00",
      "updated_at": "2026-05-25T10:00:00"
    }
  ],
  "total": 48
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|-----|------|------|
| items | array | 指标列表 |
| items[].id | string | 指标ID（20位UUID） |
| items[].indicator_type | string | 指标类型（checkbox/string/datetime） |
| items[].name_cn | string | 中文指标名称 |
| items[].name_en | string | 英文指标名称 |
| items[].indicator_data | object/null | 指标数据（仅checkbox类型有值） |
| items[].created_by | int | 创建人ID |
| items[].updated_by | int | 修改人ID |
| items[].creator_name | string | 创建人名称 |
| items[].updater_name | string | 修改人名称 |
| items[].created_at | string | 创建时间 |
| items[].updated_at | string | 更新时间 |
| total | int | 总记录数 |

---

### 4.2 获取指标详情

#### 接口描述
根据指标ID获取单个指标的详细信息。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `GET` |
| 接口路径 | `/assessment-indicators/{id}` |
| 是否需要认证 | 是 |

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| id | string | 是 | 指标ID（20位UUID） | `a1b2c3d4e5f6g7h8i9j1` |

#### 请求示例

```http
GET /api/assessment-indicators/a1b2c3d4e5f6g7h8i9j1 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 响应示例

**成功响应 (200 OK)**

```json
{
  "id": "a1b2c3d4e5f6g7h8i9j1",
  "indicator_type": "string",
  "name_cn": "密码长度",
  "name_en": "passwordLength",
  "indicator_data": null,
  "created_by": 1,
  "updated_by": 1,
  "creator_name": "admin",
  "updater_name": "admin",
  "created_at": "2026-05-25T10:00:00",
  "updated_at": "2026-05-25T10:00:00"
}
```

**失败响应 (404 Not Found)**

```json
{
  "error": "指标不存在"
}
```

---

### 4.3 新增指标

#### 接口描述
添加新的测评指标，ID由后端自动生成20位UUID。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `POST` |
| 接口路径 | `/assessment-indicators` |
| 是否需要认证 | 是 |

#### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| indicator_type | string | 是 | 指标类型 | `checkbox` |
| name_cn | string | 是 | 中文指标名称 | `安全配置项` |
| name_en | string | 否 | 英文指标名称 | `securityConfig` |
| indicator_data | object | 否 | 指标数据（checkbox类型必填） | `{"ipsModule": "是否开启"}` |

#### 请求示例

**字符串类型指标**

```http
POST /api/assessment-indicators HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "indicator_type": "string",
  "name_cn": "新指标名称",
  "name_en": "newIndicator"
}
```

**可选框类型指标**

```http
POST /api/assessment-indicators HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "indicator_type": "checkbox",
  "name_cn": "安全配置项",
  "name_en": "securityConfig",
  "indicator_data": {
    "ipsModule": "IPS模块是否开启",
    "avModule": "AV模块是否开启"
  }
}
```

#### 响应示例

**成功响应 (201 Created)**

```json
{
  "id": "x1y2z3a4b5c6d7e8f9g0",
  "indicator_type": "checkbox",
  "name_cn": "安全配置项",
  "name_en": "securityConfig",
  "indicator_data": {
    "ipsModule": "IPS模块是否开启",
    "avModule": "AV模块是否开启"
  },
  "created_by": 1,
  "updated_by": 1,
  "creator_name": "admin",
  "updater_name": "admin",
  "created_at": "2026-05-25T10:30:00",
  "updated_at": "2026-05-25T10:30:00"
}
```

**失败响应 - 缺少必填字段 (400 Bad Request)**

```json
{
  "error": "name_cn 不能为空"
}
```

**失败响应 - 创建失败 (500 Internal Server Error)**

```json
{
  "error": "创建失败"
}
```

---

### 4.4 更新指标

#### 接口描述
修改指定指标的配置信息。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `PUT` |
| 接口路径 | `/assessment-indicators/{id}` |
| 是否需要认证 | 是 |

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| id | string | 是 | 指标ID（20位UUID） | `a1b2c3d4e5f6g7h8i9j1` |

#### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| indicator_type | string | 否 | 指标类型 | `checkbox` |
| name_cn | string | 否 | 中文指标名称 | `更新后的名称` |
| name_en | string | 否 | 英文指标名称 | `updatedName` |
| indicator_data | object | 否 | 指标数据 | `{"newField": "新值"}` |

#### 请求示例

```http
PUT /api/assessment-indicators/a1b2c3d4e5f6g7h8i9j1 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name_cn": "更新后的密码长度",
  "indicator_data": {
    "newField": "新配置项"
  }
}
```

#### 响应示例

**成功响应 (200 OK)**

```json
{
  "id": "a1b2c3d4e5f6g7h8i9j1",
  "indicator_type": "string",
  "name_cn": "更新后的密码长度",
  "name_en": "passwordLength",
  "indicator_data": {
    "newField": "新配置项"
  },
  "created_by": 1,
  "updated_by": 1,
  "creator_name": "admin",
  "updater_name": "admin",
  "created_at": "2026-05-25T10:00:00",
  "updated_at": "2026-05-25T10:35:00"
}
```

**失败响应 - 指标不存在 (404 Not Found)**

```json
{
  "error": "指标不存在"
}
```

---

### 4.5 删除指标

#### 接口描述
物理删除指定的测评指标。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `DELETE` |
| 接口路径 | `/assessment-indicators/{id}` |
| 是否需要认证 | 是 |

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| id | string | 是 | 指标ID（20位UUID） | `a1b2c3d4e5f6g7h8i9j1` |

#### 请求示例

```http
DELETE /api/assessment-indicators/a1b2c3d4e5f6g7h8i9j1 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 响应示例

**成功响应 (204 No Content)**

无响应体

**失败响应 (404 Not Found)**

```json
{
  "error": "指标不存在"
}
```

---

## 5. 错误码说明

| 状态码 | 说明 | 处理建议 |
|-------|------|---------|
| 200 | 请求成功 | - |
| 201 | 创建成功 | - |
| 204 | 删除成功 | - |
| 400 | 请求参数错误 | 检查必填字段是否完整 |
| 401 | 未授权 | 检查Token是否有效或已过期 |
| 404 | 资源不存在 | 检查请求的ID是否正确 |
| 500 | 服务器内部错误 | 联系后端开发人员 |

---

## 6. 预置数据说明

系统预置了48条测评指标数据，指标类型均为`string`，包含以下类别的指标：

| 类别 | 指标示例 |
|-----|---------|
| 密码安全 | 密码长度、密码有效期、登录失败次数等 |
| 管理员配置 | 系统管理员、安全管理员、审计管理员等 |
| 日志审计 | 日志功能、备份模式、备份周期等 |
| 数据备份 | 备份方式、备份周期、异地备份等 |
| IPS/AV模块 | 模块开关、更新模式、版本等 |
| 加密算法 | 保密性算法、完整性算法等 |
| 其他配置 | 部署模式、可信验证、二次验证等 |

---

## 7. 数据库及初始化数据

```sql
CREATE TABLE assessment_indicator (
    id VARCHAR(20) PRIMARY KEY COMMENT '20位UUID主键',
    indicator_type VARCHAR(20) NOT NULL COMMENT '指标类型',
    name_cn VARCHAR(200) NOT NULL COMMENT '中文指标名称',
    name_en VARCHAR(200) COMMENT '英文指标名称',
    indicator_data TEXT COMMENT '指标数据（JSON格式）',
    created_by INT COMMENT '创建人ID',
    updated_by INT COMMENT '修改人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 测评指标数据插入
INSERT INTO `assessment_indicator` (`id`, `indicator_type`, `name_cn`, `name_en`, `indicator_data`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
('a1b2c3d4e5f6g7h8i9j1', 'string', '密码长度', 'passwordLength', NULL, 1, 1, NOW(), NOW()),
('a1b2c3d4e5f6g7h8i9j2', 'string', '密码有效期', 'passwordExpiry', NULL, 1, 1, NOW(), NOW()),
('a1b2c3d4e5f6g7h8i9j3', 'string', '密码字符串类型数量', 'charTypes', NULL, 1, 1, NOW(), NOW()),
('a1b2c3d4e5f6g7h8i9j4', 'string', '登录失败次数', 'loginFailCount', NULL, 1, 1, NOW(), NOW()),
('a1b2c3d4e5f6g7h8i9j5', 'string', '锁定时间', 'lockTime', NULL, 1, 1, NOW(), NOW()),
('a1b2c3d4e5f6g7h8i9j6', 'string', '连接超时时间', 'timeout', NULL, 1, 1, NOW(), NOW()),
('a1b2c3d4e5f6g7h8i9j7', 'string', '登录协议类型', 'loginMethod', NULL, 1, 1, NOW(), NOW()),
('a1b2c3d4e5f6g7h8i9j8', 'string', '系统管理员', 'sysAdmin', NULL, 1, 1, NOW(), NOW()),
('a1b2c3d4e5f6g7h8i9j9', 'string', '安全管理员', 'securityAdmin', NULL, 1, 1, NOW(), NOW()),
('b1c2d3e4f5g6h7i8j9k1', 'string', '审计管理员', 'auditAdmin', NULL, 1, 1, NOW(), NOW()),
('b1c2d3e4f5g6h7i8j9k2', 'string', '日志功能是否开启', 'logFunction', NULL, 1, 1, NOW(), NOW()),
('b1c2d3e4f5g6h7i8j9k3', 'string', '日志备份模式', 'backupMethod', NULL, 1, 1, NOW(), NOW()),
('b1c2d3e4f5g6h7i8j9k4', 'string', '日志备份周期', 'logBackupCycle', NULL, 1, 1, NOW(), NOW()),
('b1c2d3e4f5g6h7i8j9k5', 'string', '日志是否满半年', 'logHalfYear', NULL, 1, 1, NOW(), NOW()),
('b1c2d3e4f5g6h7i8j9k6', 'string', '日志内容', 'logContent', NULL, 1, 1, NOW(), NOW()),
('b1c2d3e4f5g6h7i8j9k7', 'string', '最早的日志时间', 'logEarliestTime', NULL, 1, 1, NOW(), NOW()),
('b1c2d3e4f5g6h7i8j9k8', 'string', '数据备份是否开启', 'dataBackup', NULL, 1, 1, NOW(), NOW()),
('b1c2d3e4f5g6h7i8j9k9', 'string', '数据备份方式', 'backupStrategy', NULL, 1, 1, NOW(), NOW()),
('c1d2e3f4g5h6i7j8k9l1', 'string', '配置备份周期', 'configBackupCycle', NULL, 1, 1, NOW(), NOW()),
('c1d2e3f4g5h6i7j8k9l2', 'string', '配置备份时间', 'configBackupTime', NULL, 1, 1, NOW(), NOW()),
('c1d2e3f4g5h6i7j8k9l3', 'string', '配置备份恢复测试', 'configRestoreTest', NULL, 1, 1, NOW(), NOW()),
('c1d2e3f4g5h6i7j8k9l4', 'string', '远程备份是否开启', 'remoteBackup', NULL, 1, 1, NOW(), NOW()),
('c1d2e3f4g5h6i7j8k9l5', 'string', '异地备份地址', 'backupLocation', NULL, 1, 1, NOW(), NOW()),
('c1d2e3f4g5h6i7j8k9l6', 'string', '异地备份距离，单位KM', 'backupDistance', NULL, 1, 1, NOW(), NOW()),
('c1d2e3f4g5h6i7j8k9l7', 'string', '异地备份模式', 'remoteBackupMethod', NULL, 1, 1, NOW(), NOW()),
('c1d2e3f4g5h6i7j8k9l8', 'string', 'IPS模块是否开启', 'ipsModule', NULL, 1, 1, NOW(), NOW()),
('c1d2e3f4g5h6i7j8k9l9', 'string', 'IPS模块更新模式', 'ipsUpdateStrategy', NULL, 1, 1, NOW(), NOW()),
('d1e2f3g4h5i6j7k8l9m1', 'string', 'IPS模块版本', 'ipsVersion', NULL, 1, 1, NOW(), NOW()),
('d1e2f3g4h5i6j7k8l9m2', 'string', 'IPS更新日期', 'ipsUpdateDate', NULL, 1, 1, NOW(), NOW()),
('d1e2f3g4h5i6j7k8l9m3', 'string', '是否开启AV模块', 'avModule', NULL, 1, 1, NOW(), NOW()),
('d1e2f3g4h5i6j7k8l9m4', 'string', 'AV模块更新规则', 'avUpdateStrategy', NULL, 1, 1, NOW(), NOW()),
('d1e2f3g4h5i6j7k8l9m5', 'string', 'AV模块版本', 'avVersion', NULL, 1, 1, NOW(), NOW()),
('d1e2f3g4h5i6j7k8l9m6', 'string', 'AV更新日期', 'avUpdateDate', NULL, 1, 1, NOW(), NOW()),
('d1e2f3g4h5i6j7k8l9m7', 'string', '是否有高风险', 'vulnScanResult', NULL, 1, 1, NOW(), NOW()),
('d1e2f3g4h5i6j7k8l9m8', 'string', '是否开启保密性算法', 'confidentialityAlgo', NULL, 1, 1, NOW(), NOW()),
('d1e2f3g4h5i6j7k8l9m9', 'string', '是否开启完整性算法', 'integrityAlgo', NULL, 1, 1, NOW(), NOW()),
('e1f2g3h4i5j6k7l8m9n1', 'string', '保密性算法', 'confidentialityAlgoDetail', NULL, 1, 1, NOW(), NOW()),
('e1f2g3h4i5j6k7l8m9n2', 'string', '完整性算法', 'integrityAlgoDetail', NULL, 1, 1, NOW(), NOW()),
('e1f2g3h4i5j6k7l8m9n3', 'string', '部署模式', 'deploymentMode', NULL, 1, 1, NOW(), NOW()),
('e1f2g3h4i5j6k7l8m9n4', 'string', '管理源地址限制', 'sourceAddressRange', NULL, 1, 1, NOW(), NOW()),
('e1f2g3h4i5j6k7l8m9n5', 'string', '可信验证', 'trustVerify', NULL, 1, 1, NOW(), NOW()),
('e1f2g3h4i5j6k7l8m9n6', 'string', '是否设置可信主机', 'trustedHost', NULL, 1, 1, NOW(), NOW()),
('e1f2g3h4i5j6k7l8m9n7', 'string', '二次验证是否开启', 'twoFactorAuth', NULL, 1, 1, NOW(), NOW()),
('e1f2g3h4i5j6k7l8m9n8', 'string', '二次验证类型', 'secondAuthMethod', NULL, 1, 1, NOW(), NOW()),
('e1f2g3h4i5j6k7l8m9n9', 'string', '安全标记', 'securityMark', NULL, 1, 1, NOW(), NOW()),
('f1g2h3i4j5k6l7m8n9o1', 'string', '安全标记具体措施', 'securityMarkDetails', NULL, 1, 1, NOW(), NOW()),
('f1g2h3i4j5k6l7m8n9o2', 'string', '默认允许', 'defaultAllow', NULL, 1, 1, NOW(), NOW()),
('f1g2h3i4j5k6l7m8n9o3', 'string', '不适用', 'notApplicable', NULL, 1, 1, NOW(), NOW());
```