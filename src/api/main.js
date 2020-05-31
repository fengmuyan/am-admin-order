import request from '@/utils/request'

//主账号列表
export function getMainList(data = {}) {
  return request({
    url: '/xrobot/masterClientList',
    method: 'post',
    data
  })
}

//主账号状态修改
export function handelMainStatusEdit(data = {}) {
  return request({
    url: '/xrobot/changeClientStatus',
    method: 'post',
    data
  })
}

//主账号配置修改
export function handelMainInfoEdit(data = {}) {
  return request({
    url: '/xrobot/saveClient',
    method: 'post',
    data
  })
}

//获取平台列表
export function getPlatformList() {
  return request({
    url: '/xrobot/sys/platformList',
    method: 'get'
  })
}

//获取项目列表
export function getClientItemList(data = {}) {
  return request({
    url: '/xrobot/clientItemList',
    method: 'post',
    data
  })
}

//获取项目列表
export function getClientItemInitList(data = {}) {
  return request({
    url: '/xrobot/saveClientItemInit',
    method: 'post',
    data
  })
}


//删除项目
export function handelDelClientItem(data = {}) {
  return request({
    url: '/xrobot/delClientItem',
    method: 'post',
    data
  })
}

//删除项目
export function handelAddClientItem(data = {}) {
  return request({
    url: '/xrobot/saveClientItem',
    method: 'post',
    data
  })
}

//子账号列表
export function getSlaveClientList(data = {}) {
  return request({
    url: '/xrobot/slaveClientList',
    method: 'post',
    data
  })
}

//主账号列表（不分页）
export function getAllMainList() {
  return request({
    url: '/xrobot/masterAllClientList',
    method: 'get'
  })
}

//客户端监控列表（不分页）
export function getMonitorClientList(data = {}) {
  return request({
    url: '/xrobot/monitorClientList',
    method: 'post',
    data
  })
}

//客户端监控操作
export function handelMonitorClientEdit(data = {}) {
  return request({
    url: '/xrobot/operationClientApp',
    method: 'post',
    data
  })
}

//订单列表
export function getOrderList(data = {}) {
  return request({
    url: '/xrobot/trade/abnormalOrderList',
    method: 'post',
    data
  })
}

//异常订单处理
export function handelOrderOperate(data = {}) {
  return request({
    url: '/xrobot/trade/operationAbnormalOrder',
    method: 'post',
    data
  })
}

//订单筛选
export function getOrderSelect() {
  return request({
    url: '/xrobot/allClients',
    method: 'get'
  })
}

//系统配置列表
export function getSysSettingList() {
  return request({
    url: '/xrobot/sys/dictList',
    method: 'get'
  })
}

//修改系统配置
export function handelEditSysSetting(data = {}) {
  return request({
    url: '/xrobot/sys/dictSave',
    method: 'post',
    data
  })
}

//账号配置生成文件
export function handelGenClientConfig(data = {}) {
  return request({
    url: '/xrobot/genClientConfig',
    method: 'post',
    data
  })
}

//获取分类列表
export function getCategoryList(data = {}) {
  return request({
    url: '/xrobot/sys/categoryList',
    method: 'post',
    data
  })
}



