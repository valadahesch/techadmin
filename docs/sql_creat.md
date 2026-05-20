```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS techadmin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE techadmin;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (`username`),
    INDEX idx_email (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 角色表
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` TEXT,
    `is_builtin` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 权限表
CREATE TABLE IF NOT EXISTS `permissions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `resource` VARCHAR(50) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (`code`),
    INDEX idx_resource (`resource`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 用户-角色关联表
CREATE TABLE IF NOT EXISTS `user_roles` (
    `user_id` INT NOT NULL,
    `role_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `role_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 角色-权限关联表
CREATE TABLE IF NOT EXISTS `role_permissions` (
    `role_id` INT NOT NULL,
    `permission_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`role_id`, `permission_id`),
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 操作日志表（可选，用于审计）
CREATE TABLE IF NOT EXISTS `operation_logs` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT,
    `username` VARCHAR(50),
    `operation` VARCHAR(100),
    `target_type` VARCHAR(50),
    `target_id` INT,
    `details` TEXT,
    `ip_address` VARCHAR(45),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (`user_id`),
    INDEX idx_created_at (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 插入初始权限数据
INSERT INTO `permissions` (`code`, `name`, `resource`, `action`, `description`) VALUES
-- 用户管理权限
('user:view', '查看用户', 'user', 'view', '查看用户列表和详情'),
('user:create', '创建用户', 'user', 'create', '创建新用户'),
('user:edit', '编辑用户', 'user', 'edit', '编辑用户信息'),
('user:delete', '删除用户', 'user', 'delete', '删除用户'),

-- 角色管理权限
('role:view', '查看角色', 'role', 'view', '查看角色列表'),
('role:manage', '管理角色', 'role', 'manage', '创建/编辑/删除角色，分配权限'),

-- 权限管理权限
('permission:view', '查看权限', 'permission', 'view', '查看权限列表'),

-- 漏扫处理权限
('leak:view', '查看漏扫', 'leak', 'view', '查看漏扫页面'),
('leak:extract', '漏扫提取', 'leak', 'extract', '提取漏扫数据'),
('leak:export', '漏扫导出', 'leak', 'export', '导出漏扫数据'),

-- 测评录入权限
('assessment:view', '查看测评', 'assessment', 'view', '查看测评页面'),
('assessment:manage', '管理测评', 'assessment', 'manage', '管理测评项目和规则');

-- 8. 插入初始角色数据
INSERT INTO `roles` (`name`, `description`, `is_builtin`) VALUES
('admin', '系统管理员，拥有所有权限', TRUE),
('user', '普通用户，只有查看权限', TRUE),
('guest', '访客，最小权限', TRUE);

-- 9. 分配角色权限
-- admin 角色拥有所有权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions`;

-- user 角色拥有查看权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, id FROM `permissions` 
WHERE `code` IN ('user:view', 'role:view', 'permission:view', 'leak:view', 'assessment:view');

-- guest 角色只有漏扫查看权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, id FROM `permissions` WHERE `code` = 'leak:view';

-- 10. 插入初始用户（密码都是 123456 的 bcrypt 哈希）
-- 密码 '123456' 的 bcrypt 哈希值（你需要用代码生成，这里先插入临时数据，后面用 Python 脚本更新）
INSERT INTO `users` (`username`, `email`, `password_hash`, `is_active`) VALUES
('admin', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYvQ7yY7L6K', TRUE),
('zhangsan', 'zhangsan@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYvQ7yY7L6K', TRUE);

-- 11. 分配用户角色
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),  -- admin 拥有 admin 角色
(2, 2);  -- zhangsan 拥有 user 角色

```