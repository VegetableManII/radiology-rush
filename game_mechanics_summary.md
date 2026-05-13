# Radiology Rush - 当前游戏机制文档

> 本文档记录当前实现的所有游戏机制、分数计算、进程控制等核心系统。
> 更新日期：2026-05-14

---

## 1. 游戏状态机 (GamePhase)

游戏使用 `phase` 状态控制游戏进程：

```typescript
export type GamePhase = 'idle' | 'playing' | 'minigame' | 'paused' | 'gameover';
```

| 状态 | 说明 |
|------|------|
| `idle` | 初始状态，未开始游戏 |
| `playing` | 游戏进行中，主游戏循环运行 |
| `minigame` | 正在进行拍片小游戏 |
| `paused` | 游戏暂停 |
| `gameover` | 游戏结束 |

---

## 2. 游戏状态 (GameState)

```typescript
interface GameState {
  status: GameStatus;           // 'idle' | 'playing' | 'paused' | 'gameover'
  score: number;                // 当前分数
  lives: number;               // 生命值（初始10条）
  time: number;                 // 游戏时间（毫秒）
  combo: number;                // 连击数
  patients: Patient[];           // 等待中的病人列表
  rooms: Room[];                // 检查室列表
  selectedPatient: Patient | null; // 当前选中的病人
  gameSpeed: number;            // 游戏速度（当前固定1.0）
  pendingReports: PendingReport[]; // 待写报告列表
  emergencyCount: number;       // 累计处理急诊数
  reportCount: number;          // 累计提交报告数
}
```

---

## 3. 病人系统 (Patient)

### 病人类型 (PatientType)

```typescript
type PatientType = 'xray' | 'ct' | 'mri' | 'emergency';
```

| 类型 | 名称 | 处理检查室 | 基础时间(ms) | 基础分数 |
|------|------|------------|--------------|----------|
| `xray` | 普通胸片 | DR拍片室 | 3000 | 10 |
| `ct` | CT病人 | CT室 | 5000 | 20 |
| `mri` | MRI病人 | MRI核磁室 | 7000 | 30 |
| `emergency` | 急诊病人 | DR拍片室 | 4000 | 15 |

### 病人生成概率

- `xray`: 40%
- `ct`: 30%
- `mri`: 20%
- `emergency`: 10%

### 病人数据结构

```typescript
interface Patient {
  id: string;                   // 唯一ID
  type: PatientType;           // 病人类型
  name: string;                // 随机生成的名字
  patience: number;            // 当前耐心值
  maxPatience: number;         // 最大耐心值
  patienceSpeed: number;        // 耐心消耗速度（0.8~1.2随机）
  requiredRoom: RoomType;       // 需要的检查室类型
  processTime: number;         // 处理时间
  reward: number;              // 基础奖励分数
  mood: number;                // 心情值（0~100）
}
```

### 耐心值系统

- **初始耐心** = 15000 - (难度等级 × 1000) 毫秒
- **难度等级** = floor(游戏时间 / 30000)
- 随着游戏进行，病人耐心值逐渐减少
- 耐心降为0时，病人离开队列，生命值-1

### 病人名字库

```
张大爷、李大妈、王叔叔、刘阿姨、陈医生、周护士、
小林、小张、老王、阿强、阿丽、小李、老张、阿明
```

---

## 4. 检查室系统 (Room)

### 检查室配置

```typescript
const ROOM_CONFIGS = [
  { type: 'dr', name: 'DR拍片室', acceptedTypes: ['xray', 'emergency'] },
  { type: 'ct', name: 'CT室', acceptedTypes: ['ct', 'emergency'] },
  { type: 'mri', name: 'MRI核磁室', acceptedTypes: ['mri'] },
  { type: 'registration', name: '登记台', acceptedTypes: ['xray', 'ct', 'mri', 'emergency'] },
];
```

### 检查室数据结构

```typescript
interface Room {
  id: string;
  type: RoomType;
  name: string;
  isBusy: boolean;             // 是否忙碌中
  currentPatient: Patient | null; // 当前正在处理的病人
  remainingTime: number;       // 剩余时间（当前未使用）
  queue: Patient[];            // 排队队列（当前未使用）
  acceptedTypes: PatientType[]; // 能接受的病人类型
  minigameScore: number;       // 小游戏得分
}
```

---

## 5. 小游戏系统 (Mini-game)

### 拍片小游戏 (minigame)

**触发时机**：病人分配到检查室后自动启动

**流程**：
1. 显示对应类型的X光/CT/MRI图像
2. 玩家需要在限定时间内点击正确区域
3. 完成后计算分数，添加待写报告到列表

**当前实现**：
- `DrGame.tsx`：3x3网格，点击找出骨折部位
- `CtGame.tsx`：CT扫描小游戏（类似DR）
- `MriGame.tsx`：MRI扫描小游戏（类似DR）

**分数计算**：

```typescript
// completeMinigame 函数
baseReward = patient.reward  // 基础奖励（10/20/30）
minigameScore = success ? 1 : 0.5  // 成功=1.0，失败=0.5
finalScore = baseReward * minigameScore
bonusPatience = floor(patience / 100)  // 剩余耐心/100作为奖励
totalScore = finalScore + bonusPatience
```

**额外效果**：
- 成功后 combo + 1
- 自动添加一条待写报告到 `pendingReports`

### 5.2 写报告小游戏

**状态**：当前未启用，流程简化为手动报告提交

**计划**：
- 显示人体示意图
- 玩家点击标注身体部位
- 根据正确率计算额外分数

---

## 6. 报告系统 (Report)

### 数据结构

```typescript
interface PendingReport {
  id: string;
  patientName: string;        // 病人名字
  roomName: string;            // 检查室名称
  completed: boolean;          // 是否已完成勾选
}
```

### 操作

| 操作 | 说明 |
|------|------|
| `addPendingReport` | 添加报告（在completeMinigame1中自动调用） |
| `toggleReportComplete` | 切换报告完成状态（勾选/取消勾选） |
| `submitReports` | 提交所有已勾选的报告 |

### 提交奖励

```typescript
// submitReports 函数
completedCount = 已勾选报告数量
bonusScore = completedCount * 5  // 每份报告+5分
```

---

## 7. 分数系统 (Score)

### 分数来源

| 来源 | 分数 | 说明 |
|------|------|------|
| 拍片成功 | 基础分×成功系数 | 成功=1.0，失败=0.5 |
| 剩余耐心奖励 | patience/100 | 剩余耐心值÷100 |
| 提交报告 | ×5/份 | 每提交一份已勾选报告+5分 |

### 连击系统 (Combo)

- 每次成功完成检查（拍片小游戏）combo + 1
- Combo越高，显示特效越明显

---

## 8. 生命值系统 (Lives)

### 生命值消耗

| 原因 | 消耗 |
|------|------|
| 病人耐心归零 | -1 |
| 病人队列超过20人 | -1（当生命值>1时） |

### 游戏结束条件

- 生命值 ≤ 0 时，游戏结束（`gameover`状态）

---

## 9. 游戏循环 (Game Loop)

### 主循环流程

```
1. requestAnimationFrame 驱动
2. 计算 deltaTime
3. 更新所有病人耐心值
4. 检查是否有耐心归零的病人
5. 如果归零：从队列移除，生命值-1
6. 更新游戏时间
7. 定时生成新病人
```

### 病人生成规则

- **生成间隔**：500/1000/1500/2000毫秒（随机）
- **难度影响**：每30秒难度+1
- **急诊优先级**：急诊病人插入队列最前面

---

## 10. 游戏流程图

```
┌─────────────────────────────────────────────────────────────┐
│                         游戏开始                              │
│                       (status: idle)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       开始游戏                               │
│    - 初始化状态 (score=0, lives=10, combo=0)                  │
│    - phase: 'idle' → 'playing'                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       游戏主循环                             │
│    - 病人生成                                               │
│    - 耐心值递减                                            │
│    - 时间更新                                              │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐    ┌─────────────────────────────┐
│   点击病人               │    │   分配病人到检查室            │
│   (selectPatient)       │    │   (assignPatientToRoom)       │
└─────────────────────────┘    └─────────────────────────────┘
                                      │
                                      ▼
                    ┌───────────────────────────────────┐
                    │        进入 minigame               │
                    │        (显示拍片小游戏)           │
                    └───────────────────────────────────┘
                                      │
                                      ▼
                    ┌───────────────────────────────────┐
                    │       完成小游戏                  │
                    │       (completeMinigame)          │
                    │  - 计算分数                       │
                    │  - combo + 1                      │
                    │  - 添加待写报告                   │
                    └───────────────────────────────────┘
                                      │
                                      ▼
                    ┌───────────────────────────────────┐
                    │      返回 playing                 │
                    │   (重复主循环或提交报告)           │
                    └───────────────────────────────────┘
```

---

## 11. 待办/计划功能

### 未实现功能

1. **检查室排队系统**
   - 当前每种检查室只能同时处理1个病人
   - 计划：支持排队队列

3. **高峰期机制**
   - 随机触发大量病人涌入
   - 门诊下班高峰、急诊爆发、体检团

4. **难度曲线调整**
   - 病人生成速度随时间加快
   - 耐心消耗速度随时间加快

5. **报告小游戏奖励**
   - 正确率影响额外分数倍率

---

## 12. 配置文件路径

| 文件 | 路径 |
|------|------|
| 游戏状态管理 | `frontend/src/stores/gameStore.ts` |
| 类型定义 | `frontend/src/types/game.ts` |
| 游戏主组件 | `frontend/src/components/Game.tsx` |
| 拍片小游戏(DR) | `frontend/src/components/DrGame.tsx` |
| 拍片小游戏(CT) | `frontend/src/components/CtGame.tsx` |
| 拍片小游戏(MRI) | `frontend/src/components/MriGame.tsx` |
| 报告清单 | `frontend/src/components/ReportList.tsx` |
| 主任通知 | `frontend/src/components/DoctorNotification.tsx` |

### 主任通知系统 (DoctorNotification)

**触发时机**：游戏开始后5秒首次出现，之后随机10-15秒一条

**配置参数**：
- 最大同时显示数量：`3`
- 出现间隔：10/12.5/15秒（随机）
- z-index：`50`（最高，可遮盖所有UI）

**气泡样式**：
- 左侧主任头像（48px圆形），头像左侧超出气泡边框
- 气泡主体：白色圆角，阴影，红色加粗文字
- 新气泡从底部向上堆叠

**操作**：
- 点击气泡任意位置即可关闭

**消息语料**：
```
小王！动作快点！
效率！效率！我强调多少次了！
今天报告还没写完呢！
别磨蹭！
下一个！下一个！
这速度，午饭都赶不上了！
护士长又在催我了...
急诊病人先处理！
姿势摆好点！
排队的人越来越多了...
小李～别玩手机了！
快点快点！
我等都等急了！
```

---

---

## 13. 核心数值总结表

| 数值 | 默认值 | 范围 |
|------|--------|------|
| 初始生命值 | 10 | 0~10 |
| 初始耐心 | 15000ms | 随难度递减 |
| 耐心消耗速度 | 0.5×patienceSpeed | 0.8~1.2随机 |
| 病人最大队列 | 20 | 超过则-1生命 |
| 病人生成间隔 | 500~2000ms | 随机 |
| 难度提升间隔 | 30秒 | 每30秒+1级 |
| X光基础分 | 10 | - |
| CT基础分 | 20 | - |
| MRI基础分 | 30 | - |
| 急诊基础分 | 15 | - |
| 报告提交加分 | 5/份 | - |

### 爱心奖励机制

| 条件 | 奖励 |
|------|------|
| 每累计处理5个急诊 | +1生命 |
| 每累计提交10份报告 | +1生命 |