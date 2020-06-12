## 更新日志
### 2.1.7
*2020-05-22*
### 新增组件：ol-vector-tile-layer
- 用来加载矢量切片图层
### 新增组件：ol-control
- 用来加载地图控件；从组件 suc-map 的属性中拿出
### ol-cluster
- watch zIndex
### ol-heat-map
- watch zIndex
### ol-layer、ol-mul-path、ol-point-collection
- 新增 props 属性 moveStyle、clickStyle
### 2.1.6
*2020-04-13*
### ol-cluster
- 聚集列表大于40个用省略号表示，styleCache 删除
### ol-heat-map
- 去除 prop 属性 layerConfig
- 添加 prop 属性 opacity、 blur、 radius、 gradient
### 2.1.5
*2020-04-09*
### ol-mul-path
- 混入事件，悬浮/点击可根据配置项改变样式，可打开默认名称悬浮弹框配置
- zIndex 监听
### ol-point-collection
- 事件代码提取，采用事件混入对象
- zIndex 监听
### ol-layer
- 多个矢量图层事件样式冲突 bug 修复
- 事件代码提取，采用事件混入对象
- 添加 layerStyle 属性，控制矢量图层样式
### ol-cluster
- 添加 clusterListLabel 属性，设置为 'none'， 可屏蔽默认聚集列表弹框
- 添加 fullCustomStyle 属性，设置为true，则组件内不再为聚集样式加上 size text，完全采用外部定义的样式；
- pointStyle 属性和 clusterStyle 属性，类型改为 [Object, Array, Function]
- slot 属性加上 moveFeature，向外部提供悬浮对象
### ol-overlay
- 删除组件内外层多余的 container 元素
### ol-measure
- 双击结束绘制，禁止放大地图
### 2.0.8
*2019-11-08*
### ol-draw-points
- 分成两个组件，子组件加载预设的point feature
### 2.0.0
*2019-10-08*
### ol 版本更新
- ol5 -> ol6
### 1.6.4
*2019-12-10*
### 修复
- ol-point-collection
  - 循环遍历查找 feature 在大数据情况下性能过低，修改为利用 openlayers 的 API getFeatureById 查找 feature
### 1.4.8
*2019-06-10*
### 添加功能
- ol-mul-path
  - 多矢量加载
### 1.4.7
*2019-05-30*
### 添加功能
- ol-radar
  - 雷达图
### 1.4.6
*2019-05-17*
### 添加功能
- ol-migrate
  - 迁徙飞线图
- ol-flash
  - 添加属性 hasCenter ，可以在圆心添加固定的圆点
### 1.4.5
*2019-05-14*
#### 添加功能
- ol-track
  - 轨迹回放功能；
  - 添加了插值计算功能
### 1.4.3
*2019-05-07*
#### 添加功能
- ol-path 
  - 扩展了扇形（Sector）的绘制
- ol-plot
  - 标绘功能；对基于 ol5 实现的标绘库（改编自 https://gitee.com/windynature/plot/）进一步封装；
  - 标绘类型包括：点；线标：弧线、曲线、折线、自由线；面标：圆、椭圆、弓形、扇形、曲线面、多边形、矩形、自由面、聚集地；
  箭头：钳击、直箭头、细直箭头、突击方向、进攻方向、进攻方向（尾）、分队战斗行动、分队战斗行动（尾）；
- ol-point-collection
  - 海量点加载
- ol-draw-shape
  - 利用 ol/interaction/draw~draw 封装的组件；用于手绘图形；
  - 绘制类型包括：Point、LineString、Polygon、Box、Square、Circle、Star；
