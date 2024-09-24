<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="是否启用，1-是  2-否" prop="enable">
        <el-select v-model="queryParams.enable" placeholder="请选择是否启用，1-是  2-否" clearable>
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="模板类型：1-slack 2-wechat 3-submail" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择模板类型：1-slack 2-wechat 3-submail" clearable>
          <el-option
            v-for="dict in alarm_webhook_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="机器人id" prop="robotId">
        <el-input
          v-model="queryParams.robotId"
          placeholder="请输入机器人id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入任务名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模板内容" prop="hookUrl">
        <el-input
          v-model="queryParams.hookUrl"
          placeholder="请输入模板内容"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['alarm:robot:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['alarm:robot:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['alarm:robot:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['alarm:robot:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="robotList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键id" align="center" prop="id" />
      <el-table-column label="是否启用，1-是  2-否" align="center" prop="enable">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.enable"/>
        </template>
      </el-table-column>
      <el-table-column label="模板类型：1-slack 2-wechat 3-submail" align="center" prop="type">
        <template #default="scope">
          <dict-tag :options="alarm_webhook_type" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column label="机器人id" align="center" prop="robotId" />
      <el-table-column label="任务名称" align="center" prop="name" />
      <el-table-column label="模板内容" align="center" prop="hookUrl" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['alarm:robot:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['alarm:robot:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改预警机器人对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="robotRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="是否启用，1-是  2-否" prop="enable">
          <el-radio-group v-model="form.enable">
            <el-radio
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模板类型：1-slack 2-wechat 3-submail" prop="type">
          <el-select v-model="form.type" placeholder="请选择模板类型：1-slack 2-wechat 3-submail">
            <el-option
              v-for="dict in alarm_webhook_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="机器人id" prop="robotId">
          <el-input v-model="form.robotId" placeholder="请输入机器人id" />
        </el-form-item>
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="模板内容" prop="hookUrl">
          <el-input v-model="form.hookUrl" placeholder="请输入模板内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Robot">
import { listRobot, getRobot, delRobot, addRobot, updateRobot } from "@/api/alarm/robot";

const { proxy } = getCurrentInstance();
const { sys_normal_disable, alarm_webhook_type } = proxy.useDict('sys_normal_disable', 'alarm_webhook_type');

const robotList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    enable: null,
    type: null,
    robotId: null,
    name: null,
    hookUrl: null
  },
  rules: {
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "更新时间不能为空", trigger: "blur" }
    ],
    enable: [
      { required: true, message: "是否启用，1-是  2-否不能为空", trigger: "change" }
    ],
    type: [
      { required: true, message: "模板类型：1-slack 2-wechat 3-submail不能为空", trigger: "change" }
    ],
    robotId: [
      { required: true, message: "机器人id不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "任务名称不能为空", trigger: "blur" }
    ],
    hookUrl: [
      { required: true, message: "模板内容不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询预警机器人列表 */
function getList() {
  loading.value = true;
  listRobot(queryParams.value).then(response => {
    robotList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    createTime: null,
    updateTime: null,
    enable: null,
    type: null,
    robotId: null,
    name: null,
    hookUrl: null
  };
  proxy.resetForm("robotRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加预警机器人";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getRobot(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改预警机器人";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["robotRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateRobot(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRobot(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除预警机器人编号为"' + _ids + '"的数据项？').then(function() {
    return delRobot(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('alarm/robot/export', {
    ...queryParams.value
  }, `robot_${new Date().getTime()}.xlsx`)
}

getList();
</script>
