# 设备用途管理接口文档

## 1. 概述

设备用途管理模块用于管理网络安全等级保护测评中的设备信息，包括设备类型、设备名称、功能描述、是否必测等信息的增删改查操作。

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
| 获取设备列表 | GET | `/device-usage` | 获取所有设备用途列表 |
| 获取设备详情 | GET | `/device-usage/{id}` | 根据ID获取单个设备详情 |
| 新增设备 | POST | `/device-usage` | 添加新的设备用途 |
| 更新设备 | PUT | `/device-usage/{id}` | 修改设备用途信息 |
| 删除设备 | DELETE | `/device-usage/{id}` | 软删除设备（状态改为停用） |
| 获取设备类型 | GET | `/device-usage/device-types` | 获取所有设备类型列表 |
| 批量新增 | POST | `/device-usage/batch` | 批量添加设备用途 |

---

## 3. 接口详细说明

### 3.1 获取设备列表

#### 接口描述
获取所有设备用途列表，支持搜索和筛选。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `GET` |
| 接口路径 | `/device-usage` |
| 是否需要认证 | 是 |

#### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| search | string | 否 | 搜索关键词（设备名称、设备类型、功能） | `防火墙` |
| category | string | 否 | 设备类型筛选 | `安全设备` |
| is_mandatory | string | 否 | 是否必测（是/否） | `是` |

#### 请求示例

```http
GET /api/device-usage?search=防火墙&category=安全设备&is_mandatory=是 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 响应示例

**成功响应 (200 OK)**

```json
{
  "items": [
    {
      "id": "a1b2c3d4e5f6g7h8i9j0",
      "serial_no": 11,
      "device_type": "安全设备",
      "device_name": "防火墙",
      "function_cn": "访问控制，具备IPS、AV防病毒模块",
      "is_mandatory": "是",
      "status": "启用",
      "created_at": "2026-05-25T10:00:00",
      "updated_at": "2026-05-25T10:00:00"
    },
    {
      "id": "l2m3n4o5p6q7r8s9t0u1",
      "serial_no": 12,
      "device_type": "安全设备",
      "device_name": "WAF",
      "function_cn": "WEB应用安全防护",
      "is_mandatory": "是",
      "status": "启用",
      "created_at": "2026-05-25T10:00:00",
      "updated_at": "2026-05-25T10:00:00"
    }
  ],
  "total": 2
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|-----|------|------|
| items | array | 设备列表 |
| items[].id | string | 设备ID（20位UUID） |
| items[].serial_no | int | 序号 |
| items[].device_type | string | 设备类型 |
| items[].device_name | string | 设备名称 |
| items[].function_cn | string | 功能描述 |
| items[].is_mandatory | string | 是否必测（是/否） |
| items[].status | string | 状态（启用/停用） |
| items[].created_at | string | 创建时间 |
| items[].updated_at | string | 更新时间 |
| total | int | 总记录数 |

---

### 3.2 获取设备详情

#### 接口描述
根据设备ID获取单个设备的详细信息。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `GET` |
| 接口路径 | `/device-usage/{id}` |
| 是否需要认证 | 是 |

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| id | string | 是 | 设备ID（20位UUID） | `a1b2c3d4e5f6g7h8i9j0` |

#### 请求示例

```http
GET /api/device-usage/a1b2c3d4e5f6g7h8i9j0 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 响应示例

**成功响应 (200 OK)**

```json
{
  "id": "a1b2c3d4e5f6g7h8i9j0",
  "serial_no": 11,
  "device_type": "安全设备",
  "device_name": "防火墙",
  "function_cn": "访问控制，具备IPS、AV防病毒模块",
  "is_mandatory": "是",
  "status": "启用",
  "created_at": "2026-05-25T10:00:00",
  "updated_at": "2026-05-25T10:00:00"
}
```

**失败响应 (404 Not Found)**

```json
{
  "error": "设备信息不存在"
}
```

---

### 3.3 新增设备

#### 接口描述
添加新的设备用途信息，ID由后端自动生成20位UUID。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `POST` |
| 接口路径 | `/device-usage` |
| 是否需要认证 | 是 |

#### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| serial_no | int | 是 | 序号（必须唯一） | `61` |
| device_type | string | 是 | 设备类型 | `安全设备` |
| device_name | string | 是 | 设备名称 | `新一代防火墙` |
| function_cn | string | 是 | 功能描述 | `智能威胁检测与防御` |
| is_mandatory | string | 否 | 是否必测，默认"是" | `是` |
| status | string | 否 | 状态，默认"启用" | `启用` |

#### 请求示例

```http
POST /api/device-usage HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "serial_no": 61,
  "device_type": "安全设备",
  "device_name": "新一代防火墙",
  "function_cn": "智能威胁检测与防御",
  "is_mandatory": "是",
  "status": "启用"
}
```

#### 响应示例

**成功响应 (201 Created)**

```json
{
  "id": "x1y2z3a4b5c6d7e8f9g0",
  "serial_no": 61,
  "device_type": "安全设备",
  "device_name": "新一代防火墙",
  "function_cn": "智能威胁检测与防御",
  "is_mandatory": "是",
  "status": "启用",
  "created_at": "2026-05-25T10:30:00",
  "updated_at": "2026-05-25T10:30:00"
}
```

**失败响应 - 序号已存在 (409 Conflict)**

```json
{
  "error": "序号已存在"
}
```

**失败响应 - 缺少必填字段 (400 Bad Request)**

```json
{
  "error": "serial_no 不能为空"
}
```

---

### 3.4 更新设备

#### 接口描述
修改指定设备的用途信息。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `PUT` |
| 接口路径 | `/device-usage/{id}` |
| 是否需要认证 | 是 |

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| id | string | 是 | 设备ID（20位UUID） | `a1b2c3d4e5f6g7h8i9j0` |

#### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| serial_no | int | 否 | 序号 | `11` |
| device_type | string | 否 | 设备类型 | `安全设备` |
| device_name | string | 否 | 设备名称 | `防火墙（升级版）` |
| function_cn | string | 否 | 功能描述 | `增强型访问控制` |
| is_mandatory | string | 否 | 是否必测 | `是` |
| status | string | 否 | 状态 | `启用` |

#### 请求示例

```http
PUT /api/device-usage/a1b2c3d4e5f6g7h8i9j0 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "device_name": "防火墙（升级版）",
  "function_cn": "增强型访问控制，支持AI智能检测"
}
```

#### 响应示例

**成功响应 (200 OK)**

```json
{
  "id": "a1b2c3d4e5f6g7h8i9j0",
  "serial_no": 11,
  "device_type": "安全设备",
  "device_name": "防火墙（升级版）",
  "function_cn": "增强型访问控制，支持AI智能检测",
  "is_mandatory": "是",
  "status": "启用",
  "created_at": "2026-05-25T10:00:00",
  "updated_at": "2026-05-25T10:35:00"
}
```

**失败响应 - 设备不存在 (404 Not Found)**

```json
{
  "error": "设备信息不存在"
}
```

**失败响应 - 序号冲突 (409 Conflict)**

```json
{
  "error": "序号已存在"
}
```

---

### 3.5 删除设备

#### 接口描述
软删除设备（将状态修改为"停用"），不会物理删除数据库记录。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `DELETE` |
| 接口路径 | `/device-usage/{id}` |
| 是否需要认证 | 是 |

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|-----|------|------|
| id | string | 是 | 设备ID（20位UUID） | `a1b2c3d4e5f6g7h8i9j0` |

#### 请求示例

```http
DELETE /api/device-usage/a1b2c3d4e5f6g7h8i9j0 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 响应示例

**成功响应 (204 No Content)**

无响应体

**失败响应 (404 Not Found)**

```json
{
  "error": "设备信息不存在"
}
```

---

### 3.6 获取设备类型列表

#### 接口描述
获取所有不重复的设备类型，用于前端下拉选择。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `GET` |
| 接口路径 | `/device-usage/device-types` |
| 是否需要认证 | 是 |

#### 请求示例

```http
GET /api/device-usage/device-types HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 响应示例

**成功响应 (200 OK)**

```json
[
  "网络设备",
  "安全设备",
  "电力专用-安全设备",
  "阿里云",
  "华为云",
  "京东云",
  "系统管理平台"
]
```

---

### 3.7 批量新增设备

#### 接口描述
一次性添加多个设备用途信息。

#### 请求信息

| 项目 | 说明 |
|-----|------|
| 请求方式 | `POST` |
| 接口路径 | `/device-usage/batch` |
| 是否需要认证 | 是 |

#### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| devices | array | 是 | 设备列表 |

**devices数组中的对象字段**

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| serial_no | int | 是 | 序号 |
| device_type | string | 是 | 设备类型 |
| device_name | string | 是 | 设备名称 |
| function_cn | string | 是 | 功能描述 |
| is_mandatory | string | 否 | 是否必测，默认"是" |
| status | string | 否 | 状态，默认"启用" |

#### 请求示例

```http
POST /api/device-usage/batch HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "devices": [
    {
      "serial_no": 61,
      "device_type": "安全设备",
      "device_name": "设备A",
      "function_cn": "功能描述A",
      "is_mandatory": "是"
    },
    {
      "serial_no": 62,
      "device_type": "网络设备",
      "device_name": "设备B",
      "function_cn": "功能描述B",
      "is_mandatory": "否"
    }
  ]
}
```

#### 响应示例

**成功响应 (201 Created)**

```json
[
  {
    "id": "u1v2w3x4y5z6a7b8c9d0",
    "serial_no": 61,
    "device_type": "安全设备",
    "device_name": "设备A",
    "function_cn": "功能描述A",
    "is_mandatory": "是",
    "status": "启用",
    "created_at": "2026-05-25T10:40:00",
    "updated_at": "2026-05-25T10:40:00"
  },
  {
    "id": "v2w3x4y5z6a7b8c9d0e1",
    "serial_no": 62,
    "device_type": "网络设备",
    "device_name": "设备B",
    "function_cn": "功能描述B",
    "is_mandatory": "否",
    "status": "启用",
    "created_at": "2026-05-25T10:40:00",
    "updated_at": "2026-05-25T10:40:00"
  }
]
```

---

## 4. 错误码说明

| 状态码 | 说明 | 处理建议 |
|-------|------|---------|
| 200 | 请求成功 | - |
| 201 | 创建成功 | - |
| 204 | 删除成功 | - |
| 400 | 请求参数错误 | 检查必填字段是否完整 |
| 401 | 未授权 | 检查Token是否有效或已过期 |
| 404 | 资源不存在 | 检查请求的ID是否正确 |
| 409 | 数据冲突 | 检查序号是否已存在 |
| 500 | 服务器内部错误 | 联系后端开发人员 |

---

## 5. 字段枚举值说明

### 5.1 设备类型 (device_type)

| 值 | 说明 |
|---|------|
| 网络设备 | 路由器、交换机等网络通信设备 |
| 安全设备 | 防火墙、IPS、WAF等安全防护设备 |
| 电力专用-安全设备 | 纵向加密、隔离装置等电力专用设备 |
| 阿里云 | 阿里云平台相关产品 |
| 华为云 | 华为云平台相关产品 |
| 京东云 | 京东云平台相关产品 |
| 系统管理平台 | 管理平台、中间件、数据库等 |

### 5.2 是否必测 (is_mandatory)

| 值 | 说明 |
|---|------|
| 是 | 必须进行测评的设备 |
| 否 | 作为测评资产，非强制测评 |

### 5.3 状态 (status)

| 值 | 说明 |
|---|------|
| 启用 | 正常使用的设备 |
| 停用 | 已删除或停用的设备 |

---

## 6. 注意事项

1. **认证要求**：所有接口都需要在请求头中携带有效的JWT Token
2. **ID生成**：新增设备时ID由后端自动生成20位UUID，前端无需传递
3. **软删除**：删除操作只是将状态改为"停用"，数据仍保留在数据库中
4. **序号唯一**：`serial_no` 字段在所有设备中必须唯一
5. **搜索说明**：搜索功能会匹配设备名称、设备类型、功能描述三个字段
6. **分页说明**：当前接口返回全部数据，前端自行实现分页

## 7. 数据库及测试数据
```sql
-- 创建设备用途表
DROP TABLE IF EXISTS `device_usage`;
CREATE TABLE `device_usage` (
    `id` VARCHAR(20) PRIMARY KEY COMMENT '20位UUID主键',
    `serial_no` INT NOT NULL COMMENT '序号',
    `device_type` VARCHAR(100) NOT NULL COMMENT '设备类型',
    `device_name` VARCHAR(200) NOT NULL COMMENT '设备名称',
    `function_cn` TEXT NOT NULL COMMENT '功能',
    `is_mandatory` VARCHAR(20) DEFAULT '是' COMMENT '是否为必测设备',
    `status` VARCHAR(20) DEFAULT '启用' COMMENT '状态',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备用途管理表';

-- 插入数据（60条记录，使用20位UUID）
INSERT INTO `device_usage` (`id`, `serial_no`, `device_type`, `device_name`, `function_cn`, `is_mandatory`, `status`) VALUES
('a1b2c3d4e5f6g7h8i9j0', 1, '网络设备', '出口路由器', '网络通信', '是', '启用'),
('b2c3d4e5f6g7h8i9j0k1', 2, '网络设备', '核心交换机', '核心数据交换', '是', '启用'),
('c3d4e5f6g7h8i9j0k1l2', 3, '网络设备', '汇聚交换机', '汇聚数据交换', '是', '启用'),
('d4e5f6g7h8i9j0k1l2m3', 4, '网络设备', '接入交换机', '接入数据交换', '否', '启用'),
('e5f6g7h8i9j0k1l2m3n4', 5, '网络设备', '非网管交换机', '接入数据交换', '否', '启用'),
('f6g7h8i9j0k1l2m3n4o5', 6, '网络设备', '负载均衡', '网络链路负载', '是', '启用'),
('g7h8i9j0k1l2m3n4o5p6', 7, '网络设备', '无线控制器AC', '管理无线网络中的所有无线AP', '是', '启用'),
('h8i9j0k1l2m3n4o5p6q7', 8, '网络设备', '无线AP', '无线网络接入', '否', '启用'),
('i9j0k1l2m3n4o5p6q7r8', 9, '网络设备', '无线路由器', '无线网络覆盖', '否', '启用'),
('j0k1l2m3n4o5p6q7r8s9', 10, '网络设备', '站控层交换机', '电力行业专用通讯协议用于数据交换', '是', '启用'),
('k1l2m3n4o5p6q7r8s9t0', 11, '安全设备', '防火墙', '访问控制，具备IPS、AV防病毒模块', '是', '启用'),
('l2m3n4o5p6q7r8s9t0u1', 12, '安全设备', 'WAF', 'WEB应用安全防护', '是', '启用'),
('m3n4o5p6q7r8s9t0u1v2', 13, '安全设备', 'IPS', '入侵检测和防御', '是', '启用'),
('n4o5p6q7r8s9t0u1v2w3', 14, '安全设备', '防毒墙', '对网络传输中的恶意代码进行过滤', '是', '启用'),
('o5p6q7r8s9t0u1v2w3x4', 15, '安全设备', '上网行为管理', '对用户上网行为进行限制和检查', '是', '启用'),
('p6q7r8s9t0u1v2w3x4y5', 16, '安全设备', '网络准入控制系统', '对终端设备的网络接入进行管理控制', '是', '启用'),
('q7r8s9t0u1v2w3x4y5z6', 17, '安全设备', '日志审计设备', '日志采集、存储和分析', '是', '启用'),
('r8s9t0u1v2w3x4y5z6a7', 18, '安全设备', '堡垒机', '运维操作审计', '是', '启用'),
('s9t0u1v2w3x4y5z6a7b8', 19, '安全设备', '数据库审计系统', '对数据库的操作行为进行审计，对审计记录进行保护', '是', '启用'),
('t0u1v2w3x4y5z6a7b8c9', 20, '安全设备', '抗APT攻击系统', '对未知攻击行为进行检测和防御', '是', '启用'),
('u1v2w3x4y5z6a7b8c9d0', 21, '安全设备', 'TDA深度威胁发现设备', '监测网络流量，侦测并响应未知攻击与未知威胁', '是', '启用'),
('v2w3x4y5z6a7b8c9d0e1', 22, '安全设备', 'IDS', '入侵检测', '是', '启用'),
('w3x4y5z6a7b8c9d0e1f2', 23, '安全设备', '网管平台', '对设备运行情况进行监控管理', '是', '启用'),
('x4y5z6a7b8c9d0e1f2g3', 24, '安全设备', 'VPN', '远程安全访问通道', '是', '启用'),
('y5z6a7b8c9d0e1f2g3h4', 25, '安全设备', '运维SVN（客户端）', '远程安全访问通道', '否', '启用'),
('z6a7b8c9d0e1f2g3h4i5', 26, '安全设备', '杀毒软件', '主机安全管理平台', '是', '启用'),
('a7b8c9d0e1f2g3h4i5j6', 27, '安全设备', '网闸', '安全隔离、数据摆渡', '是', '启用'),
('b8c9d0e1f2g3h4i5j6k7', 28, '安全设备', '态势感知', '安全威胁监测和响应处置', '是', '启用'),
('c9d0e1f2g3h4i5j6k7l8', 29, '安全设备', 'DDOS', '防御DDOS攻击', '是', '启用'),
('d0e1f2g3h4i5j6k7l8m9', 30, '电力专用-安全设备', '纵向加密装置', '电力数据加密传输到调度数据网', '是', '启用'),
('e1f2g3h4i5j6k7l8m9n0', 31, '电力专用-安全设备', '正向隔离装置', '正向隔离网闸', '是', '启用'),
('f2g3h4i5j6k7l8m9n0o1', 32, '电力专用-安全设备', '反向隔离装置', '反向隔离网闸', '是', '启用'),
('g3h4i5j6k7l8m9n0o1p2', 33, '电力专用-安全设备', '网络安全监测装置', '电力网络设备安全监测', '是', '启用'),
('h4i5j6k7l8m9n0o1p2q3', 34, '阿里云', '云防火墙', '流量监控、安全访问控制、入侵检测和防御等', '是', '启用'),
('i5j6k7l8m9n0o1p2q3r4', 35, '阿里云', '云安全中心', '主机安全管控平台', '是', '启用'),
('j6k7l8m9n0o1p2q3r4s5', 36, '阿里云', '日志服务', '日志收集、分析、存储', '是', '启用'),
('k7l8m9n0o1p2q3r4s5t6', 37, '阿里云', 'WEB应用云防火墙', 'Web应用安全防护', '是', '启用'),
('l8m9n0o1p2q3r4s5t6u7', 38, '阿里云', '云堡垒机', '综合性运维管控平台，核心系统运维和安全审计', '是', '启用'),
('m9n0o1p2q3r4s5t6u7v8', 39, '阿里云', '数据库审计', '对数据库行为审计', '是', '启用'),
('n0o1p2q3r4s5t6u7v8w9', 40, '阿里云', '对象存储OSS', '日志实时采集、存储', '否', '启用'),
('o1p2q3r4s5t6u7v8w9x0', 41, '华为云', '云防火墙', '云上互联网边界和VPC边界的防护、实时入侵检测与防御', '是', '启用'),
('p2q3r4s5t6u7v8w9x0y1', 42, '华为云', '云WAF', 'Web应用攻击防护', '是', '启用'),
('q3r4s5t6u7v8w9x0y1z2', 43, '华为云', '企业主机安全', '资产管理、漏洞管理、基线检查、入侵检测、安全运营', '是', '启用'),
('r4s5t6u7v8w9x0y1z2a3', 44, '华为云', '云堡垒机', '4A统一安全管控平台', '是', '启用'),
('s5t6u7v8w9x0y1z2a3b4', 45, '华为云', '云日志服务', '日志收集、分析、存储', '是', '启用'),
('t6u7v8w9x0y1z2a3b4c5', 46, '华为云', '对象存储', '日志实时采集、存储', '否', '启用'),
('u7v8w9x0y1z2a3b4c5d6', 47, '京东云', '云防火墙（宿迁没有）', '互联网安全边界、内网VPC边界流量管控与安全防护、入侵检测和防御', '是', '启用'),
('v8w9x0y1z2a3b4c5d6e7', 48, '京东云', '专有云NF1（宿迁地区WAF）', 'DDoS防护、Web应用安全防护', '是', '启用'),
('w9x0y1z2a3b4c5d6e7f8', 49, '京东云', '主机安全（企业版）', '资产统一管理、系统风险检测、木马查杀、黑客入侵检测', '是', '启用'),
('x0y1z2a3b4c5d6e7f8g9', 50, '京东云', 'Web应用防火墙（企业版）', 'Web应用安全防护', '是', '启用'),
('y1z2a3b4c5d6e7f8g9h0', 51, '京东云', '堡垒机（企业版）', '综合性运维管控平台，核心系统运维和安全审计', '是', '启用'),
('z2a3b4c5d6e7f8g9h0i1', 52, '京东云', '安全运营中心（企业版）', '统一安全运营与管理平台', '是', '启用'),
('a3b4c5d6e7f8g9h0i1j2', 53, '京东云', '对象存储OSS', '日志实时采集、存储', '否', '启用'),
('b4c5d6e7f8g9h0i1j2k3', 54, '系统管理平台', '管理控制台', '对系统资源、配置策略等进行管理控制、操作审计、云监控等', '是', '启用'),
('c5d6e7f8g9h0i1j2k3l4', 55, '系统管理平台', '备份一体机', '对分散在不同平台的设备提供数据备份', '是', '启用'),
('d6e7f8g9h0i1j2k3l4m5', 56, '系统管理平台', '服务器虚拟化平台', '对服务器资源进行统一分配、策略管理等', '是', '启用'),
('e7f8g9h0i1j2k3l4m5n6', 57, '系统管理平台', '服务器超融合平台', '对云安全防护产品、服务器资源进行统一分配、策略管理等', '是', '启用'),
('f8g9h0i1j2k3l4m5n6o7', 58, '系统管理平台', '统一监控平台', '对设备进行集中监测', '是', '启用'),
('g9h0i1j2k3l4m5n6o7p8', 59, '系统管理平台', '中间件', '对不同来源的数据和应用程序进行集成和整合', '是', '启用'),
('h0i1j2k3l4m5n6o7p8q9', 60, '系统管理平台', '数据库', '对数据进行组织、存储与管理，实现数据的追加、删除、更新、查询等操作', '是', '启用');
```