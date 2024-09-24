import request from '@/utils/request'

// 查询预警机器人列表
export function listRobot(query) {
  return request({
    url: '/alarm/robot/list',
    method: 'get',
    params: query
  })
}

// 查询预警机器人详细
export function getRobot(id) {
  return request({
    url: '/alarm/robot/' + id,
    method: 'get'
  })
}

// 新增预警机器人
export function addRobot(data) {
  return request({
    url: '/alarm/robot',
    method: 'post',
    data: data
  })
}

// 修改预警机器人
export function updateRobot(data) {
  return request({
    url: '/alarm/robot',
    method: 'put',
    data: data
  })
}

// 删除预警机器人
export function delRobot(id) {
  return request({
    url: '/alarm/robot/' + id,
    method: 'delete'
  })
}
