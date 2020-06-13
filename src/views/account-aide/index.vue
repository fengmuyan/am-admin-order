<template>
  <div class="app-container account">
    <el-collapse-transition>
      <div class="form-p" v-if="formShow" ref="formPublic" v-resize="resize">
        <el-form :model="queryForm" ref="queryForm" :inline="true" label-width="80px">
          <el-form-item label="APP名称" prop="platformName">
            <el-input
              v-model="queryForm.platformName"
              placeholder="请输入APP名称"
              clearable
              size="small"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="APP账号" prop="appuser">
            <el-input
              v-model="queryForm.appuser"
              placeholder="请输入APP账号"
              clearable
              size="small"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-collapse-transition>

    <div class="table-p" :style="{ 'min-height': minHeight }">
      <el-row :gutter="10" class="mb10 f-l">
        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增子账号</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="10" class="mb10 f-r icon-wrap">
        <el-col :span="1.5">
          <div class="icon-box icon-box-f" @click="formShow = !formShow">
            <i class="el-icon-zoom-in" v-show="!formShow"></i>
            <i class="el-icon-zoom-out" v-if="formShow"></i>
          </div>
        </el-col>
        <el-col :span="1.5">
          <div class="icon-box icon-box-t" @click="handleQuery">
            <i class="el-icon-refresh"></i>
          </div>
        </el-col>
      </el-row>
      <el-table style="width: 100%" v-loading="loading" :data="aideList">
        <el-table-column label="序号" prop="order" width="55" show-overflow-tooltip />
        <el-table-column label="客户端ID" prop="id" width="80" show-overflow-tooltip />
        <el-table-column label="对应主账号" prop="parentId" width="80" show-overflow-tooltip />
        <el-table-column label="APP" prop="app" width="150" show-overflow-tooltip />
        <el-table-column label="APP名称" prop="platformName" show-overflow-tooltip />
        <el-table-column label="APP路径" prop="apppath" width="180" show-overflow-tooltip />
        <el-table-column label="APP账号" prop="appuser" width="80" show-overflow-tooltip />
        <el-table-column label="最大下单数" prop="maxnum" width="100" show-overflow-tooltip />
        <el-table-column label="跟单比例（%）" prop="proportion" width="100" show-overflow-tooltip />
        <el-table-column label="账号状态" align="status" width="120" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="0"
              inactive-value="1"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="最近操作时间"
          sortable
          prop="operationDate"
          width="150px"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="240px" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
            >修改配置</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-download"
              @click="handleExport(scope.row)"
            >导出</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit-outline"
              @click="handleProject(scope.row)"
            >跟单项目</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryForm.pageNum"
        :limit.sync="queryForm.pageSize"
        @pagination="getList"
      />
    </div>

    <el-dialog
      :title="title"
      :visible.sync="open"
      @close="clearValidate"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" :inline="true" label-width="110px">
        <el-form-item label="客户端ID" prop="id">
          <el-input v-model="form.id" maxlength="6" style="width:240px" placeholder="请输入客户端标识"></el-input>
          <span class="tip">* ID为六位数字。</span>
        </el-form-item>
        <el-form-item label="对应主账号" prop="parentId">
          <el-select v-model="form.parentId" style="width:360px" placeholder="请选择对应主账号">
            <el-option
              v-for="(item,index) in mainList"
              :key="index"
              :label="item.id"
              :value="item.id"
            >
              <span style="float: left">{{ item.id }}</span>
              <span
                style="float: right;height:30px;color: rgb(200,200,200);"
              >{{ `${item.platformName} - ${item.appuser}` }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="TOKEN" prop="token">
          <el-input
            v-model="form.token"
            maxlength="64"
            disabled
            style="width:240px"
            placeholder="请输入客户端ID对应Token"
          ></el-input>
          <el-button class="btn-tip" @click="generateToken">生成Token</el-button>
        </el-form-item>
        <el-form-item label="APP" prop="app">
          <el-input v-model="form.app" maxlength="30" style="width:240px" placeholder="请输入APP"></el-input>
          <span class="tip">* 如：ZBClient.exe。</span>
        </el-form-item>
        <el-form-item label="APP名称" prop="platformId">
          <el-select v-model="form.platformId" style="width:360px" placeholder="请选择APP名称">
            <el-option
              v-for="(item,index) in platformList"
              :key="index"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="APP路径" prop="apppath">
          <el-input
            v-model="form.apppath"
            maxlength="100"
            style="width:360px"
            placeholder="请输入APP路径"
          ></el-input>
        </el-form-item>
        <span class="tip block-tip">* 如：C:\\ZHONGBEN\\TraderDemo\\ZBClient.exe。</span>
        <el-form-item label="APP账号" prop="appuser">
          <el-input
            v-model="form.appuser"
            maxlength="20"
            style="width:360px"
            placeholder="请输入APP账号"
          ></el-input>
        </el-form-item>
        <el-form-item label="最大下单数" prop="maxnum">
          <el-input v-model="form.maxnum" maxlength="8" style="width:360px" placeholder="请输入最大下单数"></el-input>
        </el-form-item>
        <el-form-item label="跟单比例" prop="proportion">
          <el-input
            v-model="form.proportion"
            maxlength="6"
            style="width:180px"
            placeholder="请输入跟单比例"
          ></el-input>
          <span class="tip">* 非负整数，如：10（10%）</span>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            type="textarea"
            v-model="form.remarks"
            placeholder="请输入备注"
            maxlength="255"
            show-word-limit
            style="width:360px"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">取 消</el-button>
        <el-button :loading="loadingForm" type="primary" @click="submitForm('form')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  getSlaveClientList,
  handelMainStatusEdit,
  handelMainInfoEdit,
  getPlatformList,
  getAllMainList,
  handelGenClientConfig
} from "@/api/main";
import minHeightMix from "@/mixins/minHeight";
export default {
  mixins: [minHeightMix],
  data() {
    const validateOnlyNum = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入客户端标识"));
      } else {
        if (!/^[0-9]*$/.test(value) || value.length !== 6) {
          callback(new Error("客户端标识为六位数字！"));
        }
        callback();
      }
    };
    const validateProp = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入跟单比例"));
      } else {
        if (!/^[1-9]\d*|0$/.test(value)) {
          callback(new Error("跟单比例为非负整数！"));
        }
        callback();
      }
    };
    const validateMaxnum = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入最大下单数"));
      } else {
        if (!/^[1-9]\d*$/.test(value)) {
          callback(new Error("最大下单数为大于零的整数！"));
        }
        callback();
      }
    };
    return {
      loading: false,
      loadingForm: false,
      formShow: true,
      aideList: [],
      mainList: [],
      platformList: [],
      total: 0,
      title: "新增子账号",
      open: false,
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        platformName: undefined,
        appuser: undefined
      },
      form: {
        uid: undefined,
        id: "",
        parentId: "",
        isMasterAccount: "1",
        token: "",
        app: undefined,
        apppath: undefined,
        platformId: undefined,
        appuser: undefined,
        maxnum: undefined,
        proportion: undefined,
        remarks: undefined
      },
      rules: {
        id: [{ required: true, validator: validateOnlyNum, trigger: "blur" }],
        token: [{ required: true, message: "请生成Token", trigger: "blur" }],
        app: [{ required: true, message: "请输入APP", trigger: "blur" }],
        platformId: [
          { required: true, message: "请输入APP名称", trigger: "blur" }
        ],
        apppath: [
          { required: true, message: "请输入APP路径", trigger: "blur" }
        ],
        appuser: [
          { required: true, message: "请输入APP账号", trigger: "blur" }
        ],
        maxnum: [
          { required: true, validator: validateMaxnum, trigger: "blur" }
        ],
        parentId: [
          { required: true, message: "请选择对应主账号", trigger: "blur" }
        ],
        proportion: [
          { required: true, validator: validateProp, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getMainAndPlat();
    this.getList();
  },
  methods: {
    async getMainAndPlat() {
      try {
        const [
          { code: code1, data: data1 },
          { code: code2, data: data2 }
        ] = await Promise.all([getAllMainList(), getPlatformList()]);
        if (code1 === 200 && code2 === 200) {
          this.mainList = data1;
          this.platformList = data2;
        }
      } catch (err) {
        console.log(err);
      }
    },
    async getList() {
      try {
        this.loading = true;
        const {
          code,
          data: { content, totalSize }
        } = await getSlaveClientList(this.queryForm);
        this.loading = false;
        if (code === 200) {
          this.aideList = content.map((item, index) => {
            return Object.assign(item, { order: index + 1 });
          });
          this.total = totalSize;
        }
      } catch (err) {
        this.loading = false;
        console.log(err);
      }
    },
    handleQuery() {
      this.queryForm.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    resetMainForm() {
      Object.assign(this.form, {
        uid: undefined,
        id: "",
        parentId: "",
        isMasterAccount: "1",
        token: "",
        app: undefined,
        apppath: undefined,
        platformId: undefined,
        appuser: undefined,
        maxnum: undefined,
        proportion: undefined,
        remarks: undefined
      });
    },
    async handleAdd() {
      this.resetMainForm();
      this.title = "新增子账号";
      await this.$nextTick();
      this.open = true;
    },
    async handleEdit(item) {
      this.resetMainForm();
      this.title = "修改子账号配置";
      Object.assign(this.form, {
        uid: item.uid,
        id: item.id,
        token: item.token,
        app: item.app,
        apppath: item.apppath,
        parentId: item.parentId,
        platformId: item.platformId,
        appuser: item.appuser,
        maxnum: item.maxnum,
        proportion: item.proportion,
        remarks: item.remarks
      });
      await this.$nextTick();
      this.open = true;
    },
    handleProject(item) {
      this.$router.push({
        path: `/account-main/detail/${item.id}`
      });
    },
    clearValidate() {
      this.$refs.form.resetFields();
    },
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm("确认要" + text + " " + row.id + " 吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "el-message-box-wran"
      })
        .then(async () => {
          this.loadingForm = true;
          const { code } = await handelMainStatusEdit({
            status: row.status === "1" ? "1" : "0",
            clientId: row.id
          });
          this.loadingForm = false;
          this.open = false;
          if (code === 200) {
            this.msgSuccess("操作成功");
            this.getList();
          }
        })
        .catch(err => {
          console.log(err);
          this.loadingForm = false;
          row.status = row.status === "1" ? "0" : "1";
        });
    },
    handleExport(item) {
      this.$confirm(`是否导出 ${item.id} 配置项?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "el-message-box-wran"
      })
        .then(async () => {
          this.loading = true;
          const { msg, code } = await handelGenClientConfig({
            clientId: item.id
          });
          this.loading = false;
          if (code === 200) {
            this.download(msg);
            this.msgSuccess("导出成功");
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            this.loadingForm = true;
            const { code } = await handelMainInfoEdit(this.form);
            this.loadingForm = false;
            this.open = false;
            if (code === 200) {
              this.msgSuccess("操作成功");
              this.getList();
            }
          } catch (err) {
            this.loadingForm = false;
            console.log(err);
          }
        } else {
          return false;
        }
      });
    },
    generateToken() {
      this.form.token = this._newGuid();
    },
    _newGuid() {
      var guid = "";
      for (var i = 1; i <= 32; i++) {
        var n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if (i == 8 || i == 12 || i == 16 || i == 20) guid += "-";
      }
      return guid;
    }
  }
};
</script>