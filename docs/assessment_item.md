# 测评项管理接口文档

## 1. 概述

测评项管理模块用于管理网络安全等级保护测评中的测评项信息，支持测评项的增删改查、多条件筛选、分页、排序和自定义列显示等功能。

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
| 获取测评项列表 | GET | `/assessment-items` | 获取测评项列表（分页、筛选、排序） |
| 获取筛选选项 | GET | `/assessment-items/filters` | 获取所有筛选选项（标准类型、测评等级、安全控制点） |
| 获取测评项详情 | GET | `/assessment-items/{id}` | 根据ID获取单个测评项详情 |
| 新增测评项 | POST | `/assessment-items` | 添加新的测评项 |
| 更新测评项 | PUT | `/assessment-items/{id}` | 修改测评项信息 |
| 删除测评项 | DELETE | `/assessment-items/{id}` | 删除测评项 |
| 获取测评指标列表 | GET | `/assessment-indicators/list` | 获取测评指标下拉列表 |

---

## 3. 数据模型

### 3.1 标准类型

标准类型支持自定义输入，系统会自动识别所有存在的类型供筛选使用。

**预定义常见类型**：
| 值 | 说明 |
|---|------|
| `安全通用要求` | 网络安全等级保护安全通用要求 |
| `服务器虚拟化` | 服务器虚拟化安全要求 |
| `云服务商` | 云服务商安全要求 |
| `工业控制` | 工业控制系统安全要求 |
| `移动互联` | 移动互联安全要求 |
| `物联网` | 物联网安全要求 |

### 3.2 测评等级

测评等级支持多选和自定义输入，系统会自动识别所有存在的等级供筛选使用。

**预定义常见等级**：
| 值 | 说明 |
|---|------|
| `等保二级` | 网络安全等级保护二级 |
| `等保三级` | 网络安全等级保护三级 |

### 3.3 测评指标

测评指标从测评指标表中查询，存储为JSON数组：

```json
["密码长度", "登录失败次数", "锁定时间"]
```

---

## 4. 接口详细说明

### 4.1 获取测评项列表

#### 接口描述
获取测评项列表，支持分页、多条件筛选、搜索和排序。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `GET` |
| 接口路径 | `/assessment-items` |
| 是否需要认证 | 是 |

#### 请求参数（Query）

| 参数名 | 类型 | 必填 | 默认值 | 说明 | 示例 |
|-------|------|-----|-------|------|------|
| page | int | 否 | 1 | 页码 | `1` |
| per_page | int | 否 | 10 | 每页数量 | `10` |
| standard_type | string | 否 | - | 标准类型筛选（精确匹配） | `安全通用要求` |
| security_control | string | 否 | - | 安全控制点筛选（精确匹配） | `身份鉴别` |
| assessment_level | string | 否 | - | 测评等级筛选（模糊匹配） | `等保三级` |
| search | string | 否 | - | 搜索关键词（安全控制点、测评对象、检测项） | `身份鉴别` |
| sort_field | string | 否 | `created_at` | 排序字段 | `created_at`、`updated_at`、`security_control` |
| sort_order | string | 否 | `desc` | 排序方式 | `asc`（升序）、`desc`（降序） |

#### 请求示例

```http
GET /api/assessment-items?page=1&per_page=10&standard_type=安全通用要求&assessment_level=等保三级&security_control=身份鉴别&search=鉴别&sort_field=created_at&sort_order=desc HTTP/1.1
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
      "standard_type": "安全通用要求",
      "security_control": "身份鉴别",
      "assessment_object": "网络设备/安全设备",
      "detection_item": "应启用登录失败处理功能，可采取结束会话、限制非法登录次数和自动退出等措施",
      "assessment_indicators": ["密码长度", "登录失败次数", "锁定时间", "连接超时时间"],
      "assessment_levels": ["等保二级"],
      "created_by": 1,
      "updated_by": 1,
      "creator_name": "admin",
      "updater_name": "admin",
      "created_at": "2026-05-25T10:00:00",
      "updated_at": "2026-05-25T10:00:00"
    },
    {
      "id": "a1b2c3d4e5f6g7h8i9j2",
      "standard_type": "安全通用要求",
      "security_control": "访问控制",
      "assessment_object": "网络设备/安全设备",
      "detection_item": "应对登录的用户分配账户和权限，并且区分管理员账户和普通用户账户",
      "assessment_indicators": ["系统管理员", "安全管理员", "审计管理员"],
      "assessment_levels": ["等保二级", "等保三级"],
      "created_by": 1,
      "updated_by": 1,
      "creator_name": "admin",
      "updater_name": "admin",
      "created_at": "2026-05-25T10:00:00",
      "updated_at": "2026-05-25T10:00:00"
    }
  ],
  "total": 16,
  "page": 1,
  "per_page": 10,
  "pages": 2
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|-----|------|------|
| items | array | 测评项列表 |
| items[].id | string | 测评项ID（20位UUID） |
| items[].standard_type | string | 标准类型 |
| items[].security_control | string | 安全控制点 |
| items[].assessment_object | string | 测评对象 |
| items[].detection_item | string | 检测项 |
| items[].assessment_indicators | array | 测评指标列表 |
| items[].assessment_levels | array | 测评等级列表 |
| items[].created_by | int | 创建人ID |
| items[].updated_by | int | 修改人ID |
| items[].creator_name | string | 创建人名称 |
| items[].updater_name | string | 修改人名称 |
| items[].created_at | string | 创建时间（ISO 8601格式） |
| items[].updated_at | string | 修改时间（ISO 8601格式） |
| total | int | 总记录数 |
| page | int | 当前页码 |
| per_page | int | 每页数量 |
| pages | int | 总页数 |

---

### 4.2 获取筛选选项

#### 接口描述
获取所有筛选选项的唯一值列表，用于前端下拉选择框。此接口从数据库全量查询，不受分页限制。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `GET` |
| 接口路径 | `/assessment-items/filters` |
| 是否需要认证 | 是 |

#### 请求示例

```http
GET /api/assessment-items/filters HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 响应示例

**成功响应 (200 OK)**

```json
{
  "standard_types": [
    "安全通用要求",
    "服务器虚拟化",
    "云服务商",
    "工业控制",
    "移动互联",
    "物联网",
    "自定义标准类型1"
  ],
  "assessment_levels": [
    "等保二级",
    "等保三级",
    "自定义等级1"
  ],
  "security_controls": [
    "身份鉴别",
    "访问控制",
    "安全审计",
    "入侵防范",
    "数据备份恢复",
    "虚拟机隔离",
    "数据安全"
  ]
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|-----|------|------|
| standard_types | array | 所有标准类型（去重） |
| assessment_levels | array | 所有测评等级（从JSON数组中提取并去重） |
| security_controls | array | 所有安全控制点（去重） |

---

### 4.3 获取测评项详情

#### 接口描述
根据测评项ID获取单个测评项的详细信息。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `GET` |
| 接口路径 | `/assessment-items/{id}` |
| 是否需要认证 | 是 |

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| id | string | 是 | 测评项ID（20位UUID） | `a1b2c3d4e5f6g7h8i9j1` |

#### 请求示例

```http
GET /api/assessment-items/a1b2c3d4e5f6g7h8i9j1 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 响应示例

**成功响应 (200 OK)**

```json
{
  "id": "a1b2c3d4e5f6g7h8i9j1",
  "standard_type": "安全通用要求",
  "security_control": "身份鉴别",
  "assessment_object": "网络设备/安全设备",
  "detection_item": "应启用登录失败处理功能，可采取结束会话、限制非法登录次数和自动退出等措施",
  "assessment_indicators": ["密码长度", "登录失败次数", "锁定时间", "连接超时时间"],
  "assessment_levels": ["等保二级"],
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
  "error": "测评项不存在"
}
```

---

### 4.4 新增测评项

#### 接口描述
添加新的测评项，ID由后端自动生成20位UUID。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `POST` |
| 接口路径 | `/assessment-items` |
| 是否需要认证 | 是 |

#### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| standard_type | string | 是 | 标准类型（支持自定义） | `安全通用要求` |
| security_control | string | 是 | 安全控制点 | `身份鉴别` |
| assessment_object | string | 是 | 测评对象 | `网络设备/安全设备` |
| detection_item | string | 是 | 检测项 | `应启用登录失败处理功能...` |
| assessment_indicators | array | 否 | 测评指标列表 | `["密码长度", "登录失败次数"]` |
| assessment_levels | array | 否 | 测评等级列表（支持自定义） | `["等保二级", "等保三级"]` |

#### 请求示例

```http
POST /api/assessment-items HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "standard_type": "安全通用要求",
  "security_control": "数据完整性",
  "assessment_object": "数据库系统",
  "detection_item": "应采用校验码技术或密码技术保证重要数据在传输过程中的完整性",
  "assessment_indicators": ["完整性算法", "是否开启完整性算法"],
  "assessment_levels": ["等保三级"]
}
```

#### 响应示例

**成功响应 (201 Created)**

```json
{
  "id": "h1i2j3k4l5m6n7o8p9q0",
  "standard_type": "安全通用要求",
  "security_control": "数据完整性",
  "assessment_object": "数据库系统",
  "detection_item": "应采用校验码技术或密码技术保证重要数据在传输过程中的完整性",
  "assessment_indicators": ["完整性算法", "是否开启完整性算法"],
  "assessment_levels": ["等保三级"],
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
  "error": "security_control 不能为空"
}
```

**失败响应 - 创建失败 (500 Internal Server Error)**

```json
{
  "error": "创建失败"
}
```

---

### 4.5 更新测评项

#### 接口描述
修改指定测评项的配置信息。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `PUT` |
| 接口路径 | `/assessment-items/{id}` |
| 是否需要认证 | 是 |

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| id | string | 是 | 测评项ID（20位UUID） | `a1b2c3d4e5f6g7h8i9j1` |

#### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| standard_type | string | 否 | 标准类型 | `服务器虚拟化` |
| security_control | string | 否 | 安全控制点 | `更新后的控制点` |
| assessment_object | string | 否 | 测评对象 | `虚拟机` |
| detection_item | string | 否 | 检测项 | `更新后的检测内容` |
| assessment_indicators | array | 否 | 测评指标列表 | `["新指标1", "新指标2"]` |
| assessment_levels | array | 否 | 测评等级列表 | `["等保二级"]` |

#### 请求示例

```http
PUT /api/assessment-items/a1b2c3d4e5f6g7h8i9j1 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "security_control": "增强的身份鉴别",
  "assessment_indicators": ["密码长度", "登录失败次数", "锁定时间", "密码有效期"],
  "assessment_levels": ["等保二级", "等保三级"]
}
```

#### 响应示例

**成功响应 (200 OK)**

```json
{
  "id": "a1b2c3d4e5f6g7h8i9j1",
  "standard_type": "安全通用要求",
  "security_control": "增强的身份鉴别",
  "assessment_object": "网络设备/安全设备",
  "detection_item": "应启用登录失败处理功能，可采取结束会话、限制非法登录次数和自动退出等措施",
  "assessment_indicators": ["密码长度", "登录失败次数", "锁定时间", "密码有效期"],
  "assessment_levels": ["等保二级", "等保三级"],
  "created_by": 1,
  "updated_by": 1,
  "creator_name": "admin",
  "updater_name": "admin",
  "created_at": "2026-05-25T10:00:00",
  "updated_at": "2026-05-25T10:35:00"
}
```

**失败响应 - 测评项不存在 (404 Not Found)**

```json
{
  "error": "测评项不存在"
}
```

---

### 4.6 删除测评项

#### 接口描述
物理删除指定的测评项。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `DELETE` |
| 接口路径 | `/assessment-items/{id}` |
| 是否需要认证 | 是 |

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| id | string | 是 | 测评项ID（20位UUID） | `a1b2c3d4e5f6g7h8i9j1` |

#### 请求示例

```http
DELETE /api/assessment-items/a1b2c3d4e5f6g7h8i9j1 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 响应示例

**成功响应 (204 No Content)**

无响应体

**失败响应 (404 Not Found)**

```json
{
  "error": "测评项不存在"
}
```

---

### 4.7 获取测评指标列表

#### 接口描述
获取测评指标列表，用于前端下拉选择框（多选）。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `GET` |
| 接口路径 | `/assessment-indicators/list` |
| 是否需要认证 | 是 |

#### 请求示例

```http
GET /api/assessment-indicators/list HTTP/1.1
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
      "name_cn": "密码长度",
      "name_en": "passwordLength"
    },
    {
      "id": "a1b2c3d4e5f6g7h8i9j2",
      "name_cn": "密码有效期",
      "name_en": "passwordExpiry"
    },
    {
      "id": "a1b2c3d4e5f6g7h8i9j3",
      "name_cn": "登录失败次数",
      "name_en": "loginFailCount"
    }
  ]
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|-----|------|------|
| items | array | 测评指标列表 |
| items[].id | string | 指标ID（20位UUID） |
| items[].name_cn | string | 中文指标名称 |
| items[].name_en | string | 英文指标名称 |

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

## 6. 字段说明汇总

### 6.1 标准类型 (standard_type)

| 说明 | 是否支持自定义 |
|------|--------------|
| 标准类型，用于分类测评项 | 是，支持用户自定义输入 |

**常见值**：
- 安全通用要求
- 服务器虚拟化
- 云服务商
- 工业控制
- 移动互联
- 物联网

### 6.2 安全控制点 (security_control)

| 说明 | 是否支持自定义 |
|------|--------------|
| 安全控制点的具体名称 | 是，支持用户自定义输入 |

**常见值**：
- 身份鉴别
- 访问控制
- 安全审计
- 入侵防范
- 数据备份恢复
- 虚拟机隔离
- 数据安全

### 6.3 测评等级 (assessment_levels)

| 说明 | 格式 | 是否支持自定义 |
|------|------|--------------|
| 适用的等保等级，支持多选 | JSON数组 | 是，支持用户自定义输入 |

**常见值**：
- `["等保二级"]`
- `["等保三级"]`
- `["等保二级", "等保三级"]`

### 6.4 测评指标 (assessment_indicators)

| 说明 | 格式 | 是否支持自定义 |
|------|------|--------------|
| 关联的测评指标，支持多选 | JSON数组 | 否，从测评指标表中选择 |

**常见值**：
- `["密码长度", "登录失败次数", "锁定时间"]`
- `["系统管理员", "安全管理员", "审计管理员"]`

---

## 7. 排序字段说明

| 字段名 | 说明 | 支持排序 |
|-------|------|---------|
| created_at | 创建时间 | ✅ 是 |
| updated_at | 修改时间 | ✅ 是 |
| security_control | 安全控制点 | ✅ 是 |
| standard_type | 标准类型 | ✅ 是 |
| id | 主键ID | ❌ 否 |
| assessment_object | 测评对象 | ❌ 否 |
| detection_item | 检测项 | ❌ 否 |

---

## 8. 使用场景示例

### 8.1 场景一：筛选等保三级的测评项

```http
GET /api/assessment-items?assessment_level=等保三级
```

### 8.2 场景二：按创建时间升序排列

```http
GET /api/assessment-items?sort_field=created_at&sort_order=asc
```

### 8.3 场景三：搜索包含"身份鉴别"的测评项

```http
GET /api/assessment-items?search=身份鉴别
```

### 8.4 场景四：组合筛选（标准类型+安全控制点+测评等级）

```http
GET /api/assessment-items?standard_type=安全通用要求&security_control=身份鉴别&assessment_level=等保二级
```

### 8.5 场景五：获取所有筛选选项（前端初始化）

```http
GET /api/assessment-items/filters
```

---

## 9. 注意事项

1. **认证要求**：所有接口都需要在请求头中携带有效的JWT Token
2. **ID生成**：新增测评项时ID由后端自动生成20位UUID，前端无需传递
3. **多选字段**：
   - `assessment_indicators`：测评指标，支持多选，存储为JSON数组
   - `assessment_levels`：测评等级，支持多选，存储为JSON数组
4. **自定义输入**：
   - 标准类型支持自定义输入，不限于预定义选项
   - 测评等级支持自定义输入，不限于预定义选项
   - 安全控制点支持自定义输入
5. **搜索说明**：搜索功能会匹配安全控制点、测评对象、检测项三个字段
6. **分页说明**：
   - 默认每页10条记录
   - 支持自定义每页数量（通过per_page参数）
   - 分页信息包含总记录数、总页数等
7. **筛选选项接口**：
   - `/assessment-items/filters` 从数据库全量查询，不受分页限制
   - 新增、编辑、删除后应重新调用此接口刷新筛选选项
8. **创建人/修改人**：由后端从Token中自动获取当前登录用户ID
9. **时间格式**：所有时间字段使用ISO 8601格式（`YYYY-MM-DDTHH:mm:ss`）
10. **排序说明**：排序字段和排序方式可组合使用，默认按创建时间降序排列

## 10. 数据库及初始化数据
```sql
CREATE TABLE assessment_item (
    id VARCHAR(20) PRIMARY KEY COMMENT '20位UUID主键',
    standard_type VARCHAR(100) NOT NULL COMMENT '标准类型',
    security_control VARCHAR(200) NOT NULL COMMENT '安全控制点',
    assessment_object VARCHAR(200) NOT NULL COMMENT '测评对象',
    detection_item TEXT NOT NULL COMMENT '检测项',
    assessment_indicators TEXT COMMENT '测评指标（JSON数组）',
    assessment_levels TEXT COMMENT '测评等级（JSON数组）',
    created_by INT COMMENT '创建人ID',
    updated_by INT COMMENT '修改人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 测评项模拟数据
INSERT INTO `assessment_item` (`id`, `standard_type`, `security_control`, `assessment_object`, `detection_item`, `assessment_indicators`, `assessment_levels`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
-- 安全通用要求 - 二级测评项
('a1b2c3d4e5f6g7h8i9j1', '安全通用要求', '身份鉴别', '网络设备/安全设备', '应启用登录失败处理功能，可采取结束会话、限制非法登录次数和自动退出等措施', '["密码长度", "登录失败次数", "锁定时间", "连接超时时间"]', '["等保二级"]', 1, 1, NOW(), NOW()),

('a1b2c3d4e5f6g7h8i9j2', '安全通用要求', '访问控制', '网络设备/安全设备', '应对登录的用户分配账户和权限，并且区分管理员账户和普通用户账户', '["系统管理员", "安全管理员", "审计管理员"]', '["等保二级", "等保三级"]', 1, 1, NOW(), NOW()),

('a1b2c3d4e5f6g7h8i9j3', '安全通用要求', '安全审计', '网络设备/安全设备', '应启用安全审计功能，审计覆盖到每个用户，对重要的用户行为和重要安全事件进行审计', '["日志功能是否开启", "日志内容", "日志备份模式"]', '["等保二级"]', 1, 1, NOW(), NOW()),

('a1b2c3d4e5f6g7h8i9j4', '安全通用要求', '入侵防范', '网络设备/安全设备', '应能检测到对网络设备的攻击行为，并能记录攻击源IP、攻击类型、攻击目标等信息', '["IPS模块是否开启", "IPS模块版本", "IPS更新日期"]', '["等保三级"]', 1, 1, NOW(), NOW()),

-- 安全通用要求 - 三级测评项
('b1c2d3e4f5g6h7i8j9k1', '安全通用要求', '数据备份恢复', '服务器/数据库', '应提供重要数据的本地数据备份与恢复功能，并且对备份数据进行定期恢复测试', '["数据备份是否开启", "数据备份方式", "配置备份周期", "配置备份恢复测试"]', '["等保三级"]', 1, 1, NOW(), NOW()),

('b1c2d3e4f5g6h7i8j9k2', '安全通用要求', '远程管理', '网络设备/安全设备', '应通过安全的方式对设备进行远程管理，采用SSH等加密协议，防止管理信息被监听', '["登录协议类型", "部署模式", "管理源地址限制"]', '["等保二级", "等保三级"]', 1, 1, NOW(), NOW()),

-- 服务器虚拟化
('c1d2e3f4g5h6i7j8k9l1', '服务器虚拟化', '虚拟机隔离', '虚拟化平台', '应保证虚拟机之间、虚拟机与宿主机之间的隔离性，防止虚拟机逃逸', '["可信验证", "安全标记", "安全标记具体措施"]', '["等保三级"]', 1, 1, NOW(), NOW()),

('c1d2e3f4g5h6i7j8k9l2', '服务器虚拟化', '资源管理', '虚拟化平台', '应对虚拟机的创建、启动、暂停、恢复、迁移等操作进行权限控制', '["系统管理员", "安全管理员"]', '["等保二级", "等保三级"]', 1, 1, NOW(), NOW()),

-- 云服务商
('d1e2f3g4h5i6j7k8l9m1', '云服务商', '数据安全', '云平台', '应对存储在云平台上的用户数据进行加密保护，包括传输加密和存储加密', '["保密性算法", "完整性算法", "是否开启保密性算法", "是否开启完整性算法"]', '["等保三级"]', 1, 1, NOW(), NOW()),

('d1e2f3g4h5i6j7k8l9m2', '云服务商', '访问控制', '云平台', '应提供云平台管理员的权限分离机制，不同管理员拥有不同的管理权限', '["系统管理员", "安全管理员", "审计管理员"]', '["等保二级", "等保三级"]', 1, 1, NOW(), NOW()),

-- 工业控制
('e1f2g3h4i5j6k7l8m9n1', '工业控制', '边界防护', '工控网络', '应在工业控制系统网络边界部署安全防护设备，实现区域隔离和访问控制', '["防火墙", "网闸", "部署模式"]', '["等保三级"]', 1, 1, NOW(), NOW()),

('e1f2g3h4i5j6k7l8m9n2', '工业控制', '实时性要求', '工控系统', '应保证安全措施不影响工业控制系统的实时性要求', '["连接超时时间"]', '["等保二级"]', 1, 1, NOW(), NOW()),

-- 移动互联
('f1g2h3i4j5k6l7m8n9o1', '移动互联', '移动设备管理', '移动终端', '应对移动设备进行统一管理，包括设备注册、设备锁定、数据擦除等功能', '["可信验证", "二次验证是否开启", "二次验证类型"]', '["等保三级"]', 1, 1, NOW(), NOW()),

('f1g2h3i4j5k6l7m8n9o2', '移动互联', '应用安全', '移动应用', '应对移动应用进行安全检测，防止恶意代码植入和数据泄露', '["是否有高风险", "可信验证"]', '["等保二级", "等保三级"]', 1, 1, NOW(), NOW()),

-- 物联网
('g1h2i3j4k5l6m7n8o9p1', '物联网', '感知层安全', '物联网感知设备', '应对物联网感知设备进行身份鉴别，防止设备被仿冒', '["密码长度", "登录失败次数", "锁定时间"]', '["等保三级"]', 1, 1, NOW(), NOW()),

('g1h2i3j4k5l6m7n8o9p2', '物联网', '数据传输安全', '物联网网络', '应对感知层与网络层之间的数据传输进行加密保护，防止数据被窃听和篡改', '["保密性算法", "完整性算法", "是否开启保密性算法", "是否开启完整性算法"]', '["等保二级", "等保三级"]', 1, 1, NOW(), NOW());
```