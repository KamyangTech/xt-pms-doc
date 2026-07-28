# 术语表 {#glossary}

本术语表旨在为 xt-pms（小微模具制造与注塑企业生产管理系统）中常用的设计和生产相关业务术语的含义提供指导。其目的在于描述术语在项目中的实际用法，帮助开发者和使用者理解系统中的各个概念。

> **数据来源与说明**：术语的「值」以 Go 代码常量（`server/internal/model/constant/dict_constant.go`、`production_constant.go`）为准；字典标签与取值同时参考初始化脚本 `server/migrations/init_seed.sql`（安装器实际使用）与基线参考脚本 `server/migrations/init_database_complete.sql`（`sys_dict_type` / `sys_dict_data`）。

## 模具 (mold) {#mold}

*模具*是用于成型产品的工具或装备。在注塑、吹塑、冲压等工艺中，模具决定了产品的形状、尺寸和表面质量。本系统中的 `Mold` 实体记录了模具的完整档案信息。

模具是系统的核心管理对象之一，贯穿从设计、制造到生产使用的全生命周期。每个模具拥有唯一的模具编号 (`mold_code`)，并关联客户、工艺参数、权属等信息。

详见：
- [模具生命周期](#mold-life-cycle)
- [模腔数](#cavity-count)
- [模次](#mold-shots)

## 模腔数 (cavity count) {#cavity-count}

*模腔数*是指一个模具中包含的成型型腔数量，即"一模几腔"。模腔数越多，单次开合模可同时生产的产品数量越多。在系统中由 `Mold.CavityCount` 字段记录，默认为 `1`。

例如，一模四腔的模具，每次注塑循环可同时产出 4 个相同产品。

## 模次 (mold shots) {#mold-shots}

*模次*是指模具的开合次数，即模具完成一次完整的"合模→成型→冷却→开模→取件"循环的次数。模次是衡量模具使用寿命和生产量的重要指标。

系统中通过 `Mold.TotalShots` 记录模具的累计使用模次，通过 `ProductionOrder.MoldShots` 记录单个生产订单中的模次。每次生产报工时，模次会同步更新到模具档案的累计数中。

## 啤货 {#beer-goods}

*啤货*是注塑行业的俗称，指模具处于量产状态、正在持续产出产品的行为。"啤"源自粤语中对英文 "plastic"（塑料）中 "plas" 的音译。系统中对应 `Mold.LifeCycleStatus` 为 `PRODUCING` 的状态。

当模具处于"生产中"状态时，行业内习惯称为"在啤货"或"啤货中"。

## 模胚 (mold blank) {#mold-blank}

*模胚*是模具的基础框架部分，也称为模架或模座。它承载模具的型芯、型腔等功能部件，是模具制造的第一步。在系统中，`Mold.MoldType` 字段（对应 `mold-type` 字典）用于标识模胚情况：

- `NEW` — **全新**：全新制造的模胚，未经过使用
- `USED` — **二手**：使用过的二手模胚，成本较低

模胚情况由 `mold-type` 字典管理，在 `sys_dict_data` 中有对应的条目。

## 模具工艺 (mold process) {#mold-process}

*模具工艺*指模具制造过程中采用的技术方案，直接影响模具的性能、生产效率和使用寿命。系统中由 `Mold.MoldProcess` 字段（对应 `mold-process` 字典）标识：

- `NORMAL` — **普通模具**：常规结构的模具，采用标准浇注系统
- `HOT_RUNNER` — **热流道**：采用加热流道系统，使塑料在浇注系统内始终保持熔融状态，避免冷料产生，提升成型效率和产品品质

模具工艺由 `mold-process` 字典管理，在 `sys_dict_data` 中有对应的条目。

## 模具材质 (mold material) {#mold-material}

*模具材质*是指制造模具主体所使用的钢材类型，不同材质决定了模具的硬度、耐磨性和使用寿命。系统中由 `Mold.MaterialType` 字段（对应 `material-type` 字典）标识：

- `STEEL` — **钢材**：普通模具钢，适用于一般生产场景
- `HARDENED_STEEL` — **加硬钢材**：经淬火或表面硬化处理的钢材，硬度更高、耐磨性更好，适用于高产量或复杂场景

模具材质由 `material-type` 字典管理，在 `sys_dict_data` 中有对应的条目。

> 注：此处的"材质"指**模具钢材**，与库存模块中 `material.mat_type`（物料类别：1=原料、2=模具配件、3=产品、4=辅料，硬编码枚举）是不同概念。

## 模具权属 (mold ownership) {#mold-ownership}

*模具权属*是指模具的资产归属关系。由于模具价值较高，部分客户会自行采购模具并交由工厂使用，因此系统需要区分不同权属以便管理和核算。系统中由 `Mold.OwnershipType` 字段（硬编码 int8，**非字典**）标识：

- `1` — **自有**：模具为本厂所有，资产归属工厂
- `2` — **客户资产**：模具属于客户，工厂代为保管和生产使用
- `3` — **第三方**：模具归属于其他第三方（非厂方、非客户）

## 模具来源 (mold source) {#mold-source}

*模具来源*是指生产订单中所使用模具的提供方。系统中通过 `ProductionOrder.MoldSourceType` 字段（对应 `mold-source` 字典）标识：

- `SELF_MADE` — **本厂制造模具**（自有模具）：工厂自行制造或拥有的模具，需要关联系统中的模具档案 ID（`MoldID`）
- `CUSTOMER_PROVIDED` — **客户提供模具**（外来模具）：客户提供的非自有模具，需要填写外来模具编号（`ExternalMoldCode`）和相关模具信息

模具来源由 `mold-source` 字典管理，在 `sys_dict_data` 中有对应的条目。

## 模具生命周期 (mold life cycle) {#mold-life-cycle}

*模具生命周期*是指模具从设计到最终报废所经历的全部阶段。系统通过 `Mold.LifeCycleStatus` 字段（对应 `mold-status` 字典）追踪模具所处的阶段。

各阶段如下：

| 字典值 | 中文名称 | 说明 |
|--------|---------|------|
| `DESIGNING` | 设计中 | 模具处于设计图纸阶段，尚未开始加工 |
| `PROCESSING` | 加工中 | 模具正在车间进行加工制造 |
| `TESTING` | 试模 | 模具加工完成，等待排期进行试模检验 |
| `TESTED` | 已试模 | 试模已完成，结论合格或待返修 |
| `PRODUCING` | 生产中 | 模具已投入量产，正在产出产品（俗称"啤货"） |
| `REPAIRING` | 维修 | 模具处于维修状态，暂停生产 |
| `IN_STOCK` | 仓库库存 | 模具存放在仓库中，未投入生产（又称"在仓"） |
| `DELIVERED` | 已交付客户 | 模具已交付给客户，不再由工厂管理 |
| `SCRAPPED` | 报废 | 模具已报废，不能再使用 |

模具状态由 `mold-status` 字典管理，包含 9 条字典数据，其中部分状态标记为"锁定"（`is_locked=2`）以限制操作。

## 模具订单类型 (mold order type) {#mold-order-type}

*模具订单类型*用于区分模具订单的业务性质，决定后续工单的执行流程。系统中由 `MoldOrder.OrderType` 字段（对应 `mold_order_type` 字典）标识：

- `NEW_MOLD` — **新模**：从头制造一套全新的模具。新模订单创建时不需要关联已有模具档案，制造完成后才会创建模具档案
- `REPAIR` — **修模**：对已损坏或磨损的模具进行维修，修复后可恢复使用。修模订单必须关联已有模具
- `MODIFICATION` — **改造**：对现有模具进行改造或改进，如变更产品结构、调整模腔数等。同样需要关联已有模具

模具订单类型由 `mold_order_type` 字典管理。

## 模具订单状态 (mold order status) {#mold-order-status}

*模具订单状态*用于追踪单个模具订单（`MoldOrder`）在制造流程中的进展。系统中由 `MoldOrder.Status` 字段（对应 `mold-order-status` 字典）标识：

| 字典值 | 中文名称 | 说明 |
|--------|---------|------|
| `NOT_STARTED` | 未开始 | 订单尚未开始 |
| `PROCESSING` | 加工中 | 订单正在加工 |
| `PENDING_TEST` | 待试模 | 等待试模 |
| `TESTED` | 已试模 | 试模已完成 |
| `COMPLETED` | 已完成 | 订单已完成 |
| `DELIVERED` | 已交付 | 已交付客户 |
| `CANCELLED` | 已取消 | 订单取消，终止 |

流转路径为：未开始 → 加工中 → 待试模 → 已试模 → 已完成 → 已交付（可取消）。模具订单状态由 `mold-order-status` 字典管理。

## 模具工单 (mold work order) {#mold-work-order}

*模具工单*是将模具订单拆分至具体执行层面的任务单元。一个模具订单可对应一个或多个工单。工单包含具体的生产安排、时间计划和工序执行信息。

系统中工单通过 `MoldWorkOrder` 实体管理，核心字段包括：

- 工单号（`WorkCode`）：唯一标识
- 工单类型（`WorkType`，**硬编码枚举，非字典**）：内部生产（`IN_HOUSE`）或外发加工（`OUTSOURCED`）
- 时间安排：计划开始/结束时间、实际开始/结束时间
- 整体进度（`Progress`）：0-100 的百分比
- 关联的工序（`Processes`）：每个工序的完成状态

工单状态由 `work-order-status` 字典管理，流转路径为：未开始（`NOT_STARTED`）→ 加工中（`PROCESSING`）→ 已完成（`COMPLETED`）→ 已试模（`TESTED`）→ 已入库（`STOCKED_IN`）→ 已交付（`DELIVERED`），也可触发已取消（`CANCELLED`）。

详见：
- [工序](#process)

## 试模 (try test) {#try-test}

*试模*是模具制造完成后进行的首次成型测试，用于检验模具是否达到设计要求的尺寸精度、外观质量和功能。试模是模具从制造转向量产的关键检验环节，通过 `MoldTryTest` 实体记录。

试模方式由 `test-mode` 字典管理，分为三种（代码中以 `SELF_TEST` / `EXTERNAL_TEST` / `EXEMPTED` 常量引用）：

- `SELF_TEST` — **自家试模**：在本厂使用自有设备进行试模
- `EXTERNAL_TEST` — **外协试模**：委托外部加工商进行试模
- `EXEMPTED` — **免试**：免予试模（适用于简单模具或有历史记录的修模）

试模结果记录合格数量（`OkQty`）、不良数量（`BadQty`）以及试模结论（如"合格"、"需返修"等）。

## 工序 (process) {#process}

*工序*是模具制造或产品生产过程中的一个加工环节。在一个生产工单中，多个工序按预设顺序排列，形成完整的加工工艺流程。

系统中通过 `ProcessTemplate` 定义标准工序模板，通过 `WorkOrderProcess` 记录每个工单中各工序的实际完成状态。此外库存模块还有独立的工序主数据 `Process`（表 `process`，字段 `ProcessType`：1=模具工序、2=产品工序）。

### 工序类型

系统中工序按 `Process.ProcessType` 分为两类：

- `1` — **模具工序**：用于模具制造的工序，如 CNC 加工、线切割、磨床、放电、抛光、装配等
- `2` — **产品工序**：用于产品生产工序，如注塑、组装等。系统预设的 `PROC009` 即为"注塑"（product process）

### 工序模板

模具制造中的标准工序模板包括：

| 工序编码 | 工序名称 | 类型 | 说明 |
|---------|---------|------|------|
| PROC001 | 设计 | 模具工序 | 模具图纸设计阶段 |
| PROC002 | CNC 加工 | 模具工序 | 通过数控加工中心对模具钢材进行铣削、钻孔等加工 |
| PROC003 | 线切割 | 模具工序 | 利用电极丝对模具进行切割成型，常用于精密轮廓 |
| PROC004 | 磨床加工 | 模具工序 | 使用砂轮对模具表面进行精密磨削 |
| PROC005 | 放电加工 | 模具工序 | 利用电火花放电的腐蚀作用加工模具型腔 |
| PROC006 | 抛光 | 模具工序 | 对模具表面进行抛光处理 |
| PROC007 | 装配 | 模具工序 | 将各零件组装成完整模具并调试 |
| PROC008 | 试模 | 模具工序 | 上机测试模具的成型效果 |
| PROC009 | 注塑 | 产品工序 | 将熔融塑料注入模具型腔成型产品 |

### 工序分组与状态

工序可分组管理（`ProcessTemplate.GroupID`）——同一分组内的工序可并行执行，不同分组间则按序流转。

工序完成状态有三种（对应 `WorkOrderProcess.IsCompleted`）：

- `0` — **未完成**：工序尚未开始或进行中
- `1` — **已完成**：工序已完工
- `2` — **已跳过**：该工序被跳过（不适用于当前模具）

每组工序全部完成后，工单才能进入下一阶段。

## 生产订单 (production order) {#production-order}

*生产订单*是指客户下达的产品生产需求记录，是组织产品生产的核心单据。系统中通过 `ProductionOrder` 实体管理，包含了从产品信息、生产工艺、生产计划到成本核算的完整数据。

生产订单的核心字段包括：

- **产品信息**：产品名称（`ProductName`）
- **工艺信息**：生产工艺类型（`ProcessType`，可选填 `injection`/`blow_molding`/`stamping`）、工艺备注（`ProcessRemark`）、塑胶原料类型（`MaterialType`）、产品重量（`ProductWeight`）、是否含金属配件（`HasMetalParts`）
- **后处理**：手工处理流程（`ManualProcess`）、组装流程（`AssemblyProcess`）
- **生产计划**：计划生产数量（`PlanQty`）、计划开始/交期（`PlanStartDate`/`PlanEndDate`）
- **进度追踪**：已完成数量（`CompletedQty`）、良品数量（`OkQty`）、不良数量（`BadQty`）、模次（`MoldShots`）
- **资源配置**：内部生产时的设备和人员，或外发时的加工商和单价
- **成本核算**：材料成本、加工成本、总成本、单价和总金额

生产订单明细（`ProductionOrderItem`）支持**一单多款**，即一个订单可包含多个产品明细项，每个明细项可独立关联模具、塑胶原料（`plastic-material` 字典），并独立追踪产量和完工状态。明细项状态（`ProductionOrderItem.Status`）在订单状态基础上额外包含 `PAUSED`（暂停）。

生产订单状态由 `production-order-status` 字典管理：待排产（`PENDING_SCHEDULE`）→ 生产中（`PRODUCING`）→ 已入库（`STOCKED_IN`）→ 已出货（`SHIPPED`）→ 已完成（`COMPLETED`）/ 已取消（`CANCELLED`）。

## 生产方式 (production type) {#production-type}

*生产方式*是指产品由谁来组织生产。系统中通过 `ProductionOrder.ProductionType` 字段（对应 `production-type` 字典）标识：

- `IN_HOUSE` — **本厂生产**：由本厂自行组织人力、设备进行生产，需要分配具体设备和操作人员
- `OUTSOURCED` — **外发生产**：将生产任务外发给加工商执行，需要指定加工商和外发单价

生产方式由 `production-type` 字典管理。

## 外发加工 (outsourcing) {#outsourcing}

*外发加工*是指将生产任务或模具加工任务委托给外部加工商完成。系统中通过 `OutsourcingRecord` 实体进行管理，涵盖生产外发和模具外发两种类型。外发类型（`OutsourceType`，**硬编码枚举，非字典**）分为：生产外发（`PRODUCTION`）和模具外发（`MOLD`）。

外发记录的核心信息包括：

- 外发单号（`RecordCode`）、外发类型（`OutsourceType`）
- 关联的订单/工单和模具
- 外发日期（`OutsourceDate`）、预计返回日期（`ExpectedReturnDate`）
- 外发数量（`Quantity`）、单价（`UnitPrice`）、总金额（`TotalAmount`）
- 物流信息：物流公司、单号、交付地址和收货人

外发状态由 `outsourcing-status` 字典管理，流转路径为：待发出（`PENDING`）→ 已发出（`SENT`）→ 生产中（`PRODUCING`）→ 已返回（`RETURNED`），也可在发出前撤回（`CANCELLED`）。

外发完成后通过 `OutsourcingReport` 进行报工，记录良品/不良数量和现场照片（`Photos`）。

## 加工商 (processor) {#processor}

*加工商*是指承接外发加工任务的外部企业或个人。系统中通过 `Processor` 实体管理加工商档案，包括加工商编号、名称、联系人、联系电话、地址，以及用户自定义填写的加工类型（`ProcessType`，如"深孔钻"、"电脑锣（CNC）"、"模具厂"、"注塑厂"等纯文本描述）。

加工商与供应商（`Supplier`）是两个独立的概念：加工商承接加工服务，供应商提供原材料和配件。

## 生产报工 (production report) {#production-report}

*生产报工*是记录生产过程中实际产出数据的操作环节。操作人员通过报工记录汇报在某个时间段内使用特定设备和模具生产出的产品数量。系统中通过 `ProductionReport` 实体管理。

报工记录的核心字段：

- **产出数据**：良品数量（`OkQty`）、不良数量（`BadQty`）、报废数量（`ScrapQty`）
- **时间信息**：报工时间（`ReportDate`）、班次（`Shift`，对应 `shift-type` 字典）
- **资源信息**：使用设备（`DeviceID`）、操作人员（`WorkerID`）、工时（`WorkHours`）
- **质量信息**：不良原因（`DefectReason`）

每次报工后，系统会自动更新对应生产订单的已完成数量、良品/不良数量和模具使用模次。

## 排产/排程 (production schedule) {#production-schedule}

*排产*（也称排程）是将生产订单按天、按设备、按人员进行详细排期的计划过程。系统中通过 `ProductionSchedule` 实体管理。

排程的核心信息包括：

- 排产日期（`ScheduleDate`）和时间段（`TimeSlot`）
- 分配设备（`DeviceID`）和分配人员（`WorkerID`）
- 计划产量（`PlanQty`）

排产是连接生产订单与实际执行的桥梁，将抽象的订单需求转化为具体的每日生产任务。

## 生产入库 (production stock in) {#production-stock-in}

*生产入库*是将生产完成的产品存入仓库的操作。系统中通过 `ProductionStockIn` 实体管理，记录每次入库的详细信息。

入库记录包含：入库单号（`StockCode`）、关联的生产订单、仓库（`WarehouseID`）、模具信息、产品名称、入库数量（`Quantity`）、批次号（`BatchNo`）和入库日期（`StockInDate`）。

## 生产出库 (production stock out) {#production-stock-out}

*生产出库*是将库存中的产品发货给客户或因其他原因移出仓库的操作。系统中通过 `ProductionStockOut` 实体管理。

出库记录的核心字段：

- **出库基本信息**：出库单号（`StockCode`）、出库数量（`Quantity`）、批次号（`BatchNo`）
- **出库类型**（`OutType`）：正常发货（`normal`）或其他原因出库（`other`）
- **出库原因**（`OutReason`，对应 `out-reason` 字典）：过期丢弃（`EXPIRED`）、损坏（`DAMAGED`）、不达标（`UNQUALIFIED`）、其他（`OTHER`）
- **发货方式**（`DeliveryMethod`，对应 `delivery_method` 字典）：快递（`EXPRESS`）、货拉拉（`LALAMOVE`）、自提（`PICKUP`）、物流配送（`LOGISTICS`）
- **物流追踪**：快递公司（`ExpressCompany`，对应 `express_company` 字典，如 `SF`/`YT`/`ZT`/`ST`/`YD`/`YZ`/`JT`/`DB`/`BS`/`JD`/`TT`）、快递单号（`ExpressNo`）、总重量（`TotalWeight`）、发货照片（`Photos`）

系统会自动统计已出货数量（`ShippedQty`）并与订单中的计划数量进行对比。

## 良品 / 不良品 / 报废品 {#ok-bad-scrap}

生产过程中，产出的产品按质量分为三类：

- **良品**（`OkQty`）：经检验符合质量标准、可正常交付的产品数量
- **不良品**（`BadQty`）：不符合质量标准、存在缺陷但可修复的产品数量，需要记录不良原因（`DefectReason`）
- **报废品**（`ScrapQty`）：严重不合格、无法修复、直接废弃的产品数量

良品率 = 良品数量 /（良品数量 + 不良品数量），是衡量生产质量的关键指标。

## 塑胶原料 (plastic material) {#plastic-material}

*塑胶原料*是注塑生产中使用的热塑性塑料颗粒，生产时原料经高温熔融后注入模具成型。系统中将其作为 `plastic-material` 字典管理，在生产订单明细（`ProductionOrderItem.PlasticMaterialID`，外键关联 `sys_dict_data.id`）中关联选择。

字典中预设了 12 种常用原料：

| 字典值 | 字典标签 | 说明 |
|--------|---------|------|
| `PP` | PP（聚丙烯） | 具有良好的耐化学性和耐热性 |
| `PE` | PE（聚乙烯） | 分为高密度 HDPE 和低密度 LDPE |
| `ABS` | ABS | 丙烯腈-丁二烯-苯乙烯共聚物，韧性和加工性好 |
| `PS` | PS（聚苯乙烯） | 透明度高，易加工 |
| `PC` | PC（聚碳酸酯） | 具有优异的抗冲击性和透明度 |
| `PVC` | PVC（聚氯乙烯） | 分为硬质和软质两种 |
| `PMMA` | PMMA（亚克力） | 透明度高，耐候性好 |
| `PA` | PA（尼龙） | 具有优异的耐磨性和机械强度 |
| `POM` | POM（聚甲醛） | 具有高硬度和良好的耐磨性 |
| `PET` | PET（聚酯） | 常用于包装和纤维 |
| `TPE` | TPE（热塑性弹性体） | 兼具橡胶和塑料特性 |
| `TPU` | TPU（热塑性聚氨酯） | 具有优异的耐磨性和弹性 |

## 模具 BOM (mold BOM) {#mold-bom}

*模具 BOM*（物料清单）是构成一套模具所需的全部物料及其用量的明细表。系统中通过 `MoldBOM` 实体管理，记录模具与物料的关联关系。

BOM 明细包含：物料（`MaterialID`）、用量（`Qty`）、单价（`UnitPrice`）和总价（`TotalPrice`）。BOM 用于核算模具的材料成本，也可作为物料采购的依据。

## 日产能 (production capacity) {#production-capacity}

*日产能*是指模具在正常工况下每天能够生产的产品件数（单位：件/天）。系统中通过 `Mold.ProductionCapacity` 字段记录。

日产能是排产和交期估算的重要依据。例如，日产能 500 件/天的模具，要生产 5000 件产品，预计需要 10 个工作日。

## 生产设备 (production equipment) {#production-equipment}

*生产设备*是指本厂内部用于生产的机器设备。系统中将其作为 `production-equipment` 字典管理，在创建生产订单时选择（`ProductionOrder.DeviceID`）。

字典中预设了三档吨位注塑机：

| 字典值 | 中文名称 | 说明 |
|--------|---------|------|
| `960-ton` | 960 吨机 | 大型注塑机，适合大型产品或一模多穴生产 |
| `600-ton` | 600 吨机 | 中型注塑机 |
| `300-ton` | 300 吨机 | 小型注塑机，适合小型产品 |

## 综合订单 (master order) {#master-order}

*综合订单*是将模具订单和对应的生产订单合并管理的高层业务单据。系统通过 `MasterOrder` 实体管理，实现了"先制模具、后做产品"的一体化业务流程。

综合订单类型由 `master-order-type` 字典管理：
- 模具 + 产品（`COMBINED`）：同时包含模具制造和后续产品生产
- 仅模具（`MOLD_ONLY`）：仅包含模具制造
- 仅产品（`PRO_ONLY`）：仅包含产品生产（使用已有模具）

综合订单状态由 `master-order-status` 字典管理：待开始（`PENDING`）→ 模具制造中（`MOLD_PRODUCING`）→ 生产中（`PRODUCING`）→ 待发货（`PENDING_SHIP`）→ 已完成（`COMPLETED`）/ 已取消（`CANCELLED`）。

生产订单的依赖状态（`DependencyStatus`，对应 `dependency-status` 字典）由 `dependency-status` 字典管理，用于控制工序间的依赖关系：

- `NONE` — **无依赖**：可立即开始
- `WAITING_MOLD` — **等待模具**：生产订单需要等待模具制造完成后才能开始
- `READY` — **就绪**：依赖已满足，可开始生产

## 款项 (payment) {#payment}

*款项*是模具订单和生产订单涉及的收款/付款记录。系统将款项管理分为三大类：

**模具订单款项**（`MoldOrderPayment`）：记录模具订单的分期收款。款项类型（`PaymentType`）为**自由文本**，可自定义（如首款、二期款、尾款等），不再限定字典。

**应收账款**（`AccountsReceivable`）：统一管理所有应收款项，包括模具款和生产款。状态由 `receivable-status` 字典管理：待收款（`PENDING`）、锁定（`LOCKED`）、部分收款（`PARTIAL`）、已收款（`PAID`）、逾期（`OVERDUE`）。账龄分类由 `aging-category` 字典管理。

**应付账款**（`AccountsPayable`）：管理对加工商和供应商的应付款项。状态由 `payable-status` 字典管理：待付款（`PENDING`）、部分付款（`PARTIAL`）、已付款（`PAID`）、逾期（`OVERDUE`）。

**款项类型**（`payment-type` 字典，可配置）的取值为：`TOTAL`（全款）、`first-payment`（首款）、`middle-payment`（中期款）、`final-payment`（尾款）。需注意各模块实际写入 `PaymentType` 的取值并不统一（应收用 `deposit`/`final`/`production`/`total`，应付用 `total`/`first`/`final`/`installment`），详见文末不一致说明。

**费用**（`FinanceExpense`）的费用类型由 `expense-type` 字典管理：`freight`（运费）、`packaging`（包装费）、`insurance`（保险费）、`other`（其他）。

**收付款方式**（`payment-method` 字典）用于收款/付款记录（`ReceivablePayment`/`PayablePayment`/`ExpensePayment`）：`bank_transfer`（银行转账）、`cash`（现金）、`check`（支票）、`wechat`（微信）、`alipay`（支付宝）。

## 订单优先级 (order priority) {#order-priority}

*订单优先级*用于标识订单的紧急程度，影响排产顺序。系统中由 `order-priority` 字典管理：

- `NORMAL` — **普通**：正常优先级
- `IMPORTANT` — **重要**：优先于普通订单
- `URGENT` — **紧急**：需要尽快处理
- `VERY_URGENT` — **非常紧急**：最高优先级，需要立即响应

## 班次 (shift) {#shift}

*班次*用于区分一天中不同的工作时间段。系统中由 `shift-type` 字典管理：

- `DAY_SHIFT` — **白班**：日间工作班次
- `NIGHT_SHIFT` — **夜班**：夜间工作班次

班次信息主要用于生产报工记录，便于统计不同班次的产能和效率。

## 模具交付 (mold delivery) {#mold-delivery}

*模具交付*是将制作完成的模具正式移交给客户的环节。系统中通过 `MoldDelivery` 实体管理交付全流程。

交付记录包含：

- 交付单号（`DeliveryNo`）、交付时间（`DeliveryTime`）
- 交付方式（`DeliveryMethod`，对应 `delivery_method` 字典）：自提、快递或物流
- 物流信息：物流公司（`LogisticsCompany`）、物流单号（`TrackingNo`）
- 收货信息：收货人、联系电话、交付地址
- 随附文档（`DocumentsAttached`）

客户确认状态：待确认（`1`）、已确认（`2`）、拒收（`3`），拒收时需记录拒收原因。

## 模具位置 (mold location) {#mold-location}

*模具位置*标识模具当前所处的物理地点。系统中由 `Mold.CurrentLocation` 字段（对应 `mold-location` 字典）记录：

- `IN_FACTORY` — **厂内**：模具在本厂车间或仓库
- `OUTSOURCING` — **外发中**：模具已外发给加工商
- `AT_CUSTOMER` — **客户处**：模具在客户工厂或仓库

模具位置由 `mold-location` 字典管理。

## 质检 (quality inspection) {#quality-inspection}

系统中质检通过两个字典管理。检验类型由 `inspection-type` 字典定义：

- `FIRST_ARTICLE` — **首件检验**：生产开始时的首件产品检验
- `IN_PROCESS` — **过程检验**：生产过程中的巡检
- `FINAL` — **成品检验**：生产完成后的成品检验

检验结果由 `inspection-result` 字典定义：
- `PASS` — **合格**：通过检验
- `FAIL` — **不合格**：未通过检验，需要整改
- `CONCESSION` — **让步接收**：虽然存在瑕疵，但可接受使用

## 模具使用记录 (mold usage record) {#mold-usage-record}

*模具使用记录*用于追踪模具在每次生产中的使用情况。系统中通过 `MoldUsageRecord` 实体管理，每次生产报工时会自动生成使用记录。

记录包含：模具 ID、生产订单 ID、使用日期（`UsageDate`）、本次模次（`TotalShots`）、良品数（`OkQty`）、不良数（`BadQty`）、产品信息等。该记录用于追溯模具的完整使用历史和寿命管理。

## 已知数据/代码不一致 {#known-inconsistencies}

以下为分析代码与 SQL 后发现、**尚未完全消除**的不一致。字典种子（`init_seed.sql` / `init_database_complete.sql`）中与代码冲突的取值**已在初始化/恢复脚本中修正**；凡仍有冲突，以**代码常量**为准。

1. **已修复（字典种子已对齐代码常量）**
   - `dependency-status`：原为 `NO_DEPENDENCY`/`COMPLETED`，已改为 `NONE`/`READY`（与代码 `NONE`/`WAITING_MOLD`/`READY` 一致）。
   - `test-mode`：原 `INTERNAL_TESTING`/`EXTERNAL_TESTING`/`EXEMPT`（参考脚本中为中文值），已改为 `SELF_TEST`/`EXTERNAL_TEST`/`EXEMPTED`。
   - `master-order-status`：参考脚本中旧的 3 态（`PROCESSING`/`COMPLETED`/`CANCELLED`）已改为代码一致的 6 态。
   - `delivery_method` / `out_reason`：参考脚本中小写值已改为大写（`EXPRESS`/`LALAMOVE`/`PICKUP`/`LOGISTICS`、`EXPIRED`/`DAMAGED`/`UNQUALIFIED`/`OTHER`）。
   - `mold-status`：新增代码常量 `MANUFACTURING_INTERRUPTED`，与种子及 `status_flow_config` 对齐。
   - 上述修正对**新装库**与**手动恢复**立即生效；本项目目前均为初始化安装（无需要迁移的存量库），故不保留独立的增量迁移文件。

2. **`payment-type` 跨模块取值不统一**：字典定义为 `TOTAL`/`first-payment`/`middle-payment`/`final-payment`；但 `accounts_receivable.payment_type` 用 `deposit`/`final`/`production`/`total`，`accounts_payable.payment_type` 用 `total`/`first`/`final`/`installment`，`mold_order_payment.payment_type` 为自由文本。建议统一为字典驱动。

3. **未建字典的计划字段**：`production_schedule.status` 与 `time_slot` 表注释引用 `dict:schedule-status` / `dict:time-slot`，但基线未在 `sys_dict_type` 中创建，实际为硬编码。
