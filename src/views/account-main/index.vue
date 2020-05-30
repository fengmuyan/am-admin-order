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
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增主账号</el-button>
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
      <el-table style="width: 100%" v-loading="loading" :data="mainList">
        <el-table-column label="序号" prop="order" width="55" />
        <el-table-column label="客户端ID" prop="id" width="100" />
        <el-table-column label="APP" prop="app" width="120" show-overflow-tooltip/>
        <el-table-column label="APP名称" prop="platformName" width="150" show-overflow-tooltip />
        <el-table-column label="APP路径" prop="apppath" width="180" show-overflow-tooltip />
        <el-table-column label="APP账号" prop="appuser" />
        <el-table-column label="账号状态" align="status" width="120">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="0"
              inactive-value="1"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="最近操作时间" sortable prop="operationDate" width="150px" />
        <el-table-column label="操作" width="180px">
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
  getMainList,
  handelMainStatusEdit,
  handelMainInfoEdit,
  getPlatformList
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
    return {
      loading: false,
      loadingForm: false,
      formShow: true,
      mainList: [],
      platformList: [],
      total: 0,
      title: "新增主账号",
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
        parentId: "0",
        isMasterAccount: "0",
        token: "",
        app: undefined,
        apppath: undefined,
        platformId: undefined,
        appuser: undefined,
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
        appuser: [{ required: true, message: "请输入APP账号", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getPlatList();
    this.getList();
  },
  methods: {
    async getPlatList() {
      try {
        this.loading = true;
        const { code, data } = await getPlatformList();
        if (code === 200) {
          this.platformList = data;
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
        } = await getMainList(this.queryForm);
        this.loading = false;
        if (code === 200) {
          this.mainList = content.map((item, index) => {
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
        parentId: "0",
        isMasterAccount: "0",
        token: "",
        app: undefined,
        apppath: undefined,
        platformId: undefined,
        appuser: undefined,
        remarks: undefined
      });
    },
    async handleAdd() {
      this.resetMainForm();
      this.title = "新增主账号";
      await this.$nextTick();
      this.open = true;
    },
    async handleEdit(item) {
      this.resetMainForm();
      this.title = "修改主账号配置";
      Object.assign(this.form, {
        uid: item.uid,
        id: item.id,
        token: item.token,
        app: item.app,
        apppath: item.apppath,
        platformId: item.platformId,
        appuser: item.appuser,
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