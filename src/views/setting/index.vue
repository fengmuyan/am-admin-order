<template>
  <div class="app-container account">
    <div class="table-p" :style="{ 'min-height': minHeight }">
      <el-row :gutter="10" class="mb10 f-l">
        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增跟单配置参数</el-button>
        </el-col>
      </el-row>
      <el-table style="width: 100%" v-loading="loading" :data="settingList">
        <el-table-column label="序号" prop="order" width="55" />
        <el-table-column label="项目大类" prop="categoryName" />
        <el-table-column label="重试次数" prop="num" />
        <el-table-column label="跟单允许价差" prop="threshold" />
        <el-table-column label="跟单允许点差" prop="marketrange" />
        <el-table-column label="下单超时时间（秒）" prop="timeout" />
        <el-table-column label="平仓超时时间（秒）" prop="unravelTimeout" />
        <el-table-column label="最近操作时间" sortable prop="operationDate" width="150px" />
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
            >修改配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      :title="title"
      :visible.sync="open"
      @close="clearValidate"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" :inline="true" label-width="130px">
        <el-form-item label="项目大类" prop="categoryId" v-if="form.uid === undefined">
          <el-select v-model="form.categoryId" style="width:300px" placeholder="请选择项目大类">
            <el-option
              v-for="(item,index) in cateList"
              :key="index"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="重试次数" prop="num">
          <el-input v-model="form.num" maxlength="3" style="width:300px" placeholder="请输入重试次数"></el-input>
        </el-form-item>
        <el-form-item label="跟单允许价差" prop="threshold">
          <el-input
            v-model="form.threshold"
            maxlength="8"
            style="width:300px"
            placeholder="请输入跟单允许价差"
          ></el-input>
        </el-form-item>
        <el-form-item label="跟单允许点差" prop="marketrange">
          <el-input
            v-model="form.marketrange"
            maxlength="8"
            style="width:300px"
            placeholder="请输入跟单允许点差"
          ></el-input>
        </el-form-item>
        <el-form-item label="下单超时时间" prop="timeout">
          <el-input
            v-model="form.timeout"
            maxlength="10"
            style="width:300px"
            placeholder="请输入下单超时时间"
          ></el-input>
        </el-form-item>
        <el-form-item label="平仓超时时间" prop="unravelTimeout">
          <el-input
            v-model="form.unravelTimeout"
            maxlength="10"
            style="width:300px"
            placeholder="请输入平仓超时时间"
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
  getSysSettingList,
  handelEditSysSetting,
  getCategoryList
} from "@/api/main";
import minHeightMix from "@/mixins/minHeight";
export default {
  mixins: [minHeightMix],
  data() {
    const patterAmount = /^\d+(?:\.\d{1,4})?$/;
    const patterDot = /^[\-\+]?\d+(\.\d)?$/;
    const validateOnlyNum = (rule, value, callback) => {
      if (value === "" || value === undefined) {
        callback(new Error("必填项不能为空！"));
      } else {
        if (!/^[0-9]*$/.test(value)) {
          callback(new Error("为大于0的整数！"));
        }
        callback();
      }
    };
    const validatePrice = (rule, value, callback) => {
      if (value === "" || value === undefined) {
        callback(new Error("必填项不能为空！"));
      } else {
        if (!patterAmount.test(value)) {
          callback(new Error("必须非负整数或至多保留四位小数！"));
        }
        callback();
      }
    };
    const validateDot = (rule, value, callback) => {
      if (value === "" || value === undefined) {
        callback(new Error("必填项不能为空！"));
      } else {
        if (!patterDot.test(value)) {
          callback(new Error("最多保留一位小数！"));
        }
        callback();
      }
    };
    return {
      loading: false,
      loadingForm: false,
      settingList: [],
      cateList: [],
      title: "新增跟单配置参数",
      open: false,
      form: {
        uid: undefined,
        categoryId: undefined,
        num: undefined,
        threshold: undefined,
        marketrange: undefined,
        timeout: undefined,
        unravelTimeout: undefined
      },
      rules: {
        categoryId: [
          { required: true, message: "请选择分类", trigger: "blur" }
        ],
        num: [{ required: true, validator: validateOnlyNum, trigger: "blur" }],
        threshold: [
          { required: true, validator: validatePrice, trigger: "blur" }
        ],
        marketrange: [
          { required: true, validator: validateDot, trigger: "blur" }
        ],
        timeout: [
          { required: true, validator: validateOnlyNum, trigger: "blur" }
        ],
        unravelTimeout: [
          { required: true, validator: validateOnlyNum, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getCategoryList();
    this.getList();
  },
  methods: {
    async getCategoryList() {
      try {
        const { code, data } = await getCategoryList();
        if (code === 200) {
          this.cateList = data;
        }
      } catch (err) {
        console.log(err);
      }
    },
    async getList() {
      try {
        this.loading = true;
        const { code, data } = await getSysSettingList();
        this.loading = false;
        if (code === 200) {
          this.settingList = data.map((item, index) => {
            return Object.assign(item, { order: index + 1 });
          });
        }
      } catch (err) {
        this.loading = false;
        console.log(err);
      }
    },
    resetSetForm() {
      Object.assign(this.form, {
        uid: undefined,
        categoryId: undefined,
        num: undefined,
        threshold: undefined,
        marketrange:undefined,
        timeout: undefined,
        unravelTimeout: undefined
      });
    },
    async handleAdd() {
      this.resetSetForm();
      this.title = "新增跟单配置参数";
      await this.$nextTick();
      this.open = true;
    },
    async handleEdit(item) {
      this.resetSetForm();
      this.title = "修改跟单配置参数";
      Object.assign(this.form, {
        uid: item.uid,
        categoryId: item.categoryId,
        num: item.num,
        threshold: item.threshold,
        marketrange: item.marketrange,
        timeout: item.timeout,
        unravelTimeout: item.unravelTimeout
      });
      await this.$nextTick();
      this.open = true;
    },
    clearValidate() {
      this.$refs.form.resetFields();
    },
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            this.loadingForm = true;
            const { code } = await handelEditSysSetting(this.form);
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
    }
  }
};
</script>