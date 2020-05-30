<template>
  <div class="app-container main-detail">
    <div class="pro-info" v-loading="loading" v-if="proData">
      <div class="block table-p" :style="{ 'min-height': minHeight }">
        <h4>配置信息</h4>
        <el-form :inline="true" label-width="100px" style="margin-bottom:10px">
          <el-form-item label="客户端ID：">
            <el-input v-model="proData.xclient.id" disabled size="small" style="width: 270px" />
          </el-form-item>
          <el-form-item label="APP：">
            <el-input v-model="proData.xclient.app" disabled size="small" style="width: 270px" />
          </el-form-item>
          <el-form-item label="APP账号：">
            <el-input v-model="proData.xclient.appuser" disabled size="small" style="width: 270px" />
          </el-form-item>
          <el-form-item label="主账号ID：" v-if="proData.xclient.isMasterAccount === '1'">
            <el-input v-model="proData.xclient.parentId" disabled size="small" style="width: 270px" />
          </el-form-item>
        </el-form>
        <h4>
          项目列表
          <el-button
            size="mini"
            icon="el-icon-plus"
            class="f-r"
            type="primary"
            @click="handleAdd"
          >新增项目</el-button>
        </h4>
        <el-table style="width: 100%" :data="proData.list">
          <el-table-column label="项目ID" prop="itemId" width="80" />
          <el-table-column label="分类" prop="categoryName" />
          <el-table-column label="跟单项目" prop="itemName" />
          <el-table-column label="备注" prop="remarks" />
          <el-table-column label="APP名称" prop="platformName" />
          <el-table-column label="APP账号" prop="appuser" />
          <el-table-column label="创建人" prop="operationUser" />
          <el-table-column label="创建时间" prop="operationDate" />
          <el-table-column label="操作" width="100px">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDel(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog title="新增项目" :visible.sync="open" width="750px" :close-on-click-modal="false">
      <div>
        <div v-for="(item,index) in proSubData" :key="index" style="margin-bottom:10px">
          <el-cascader
            v-model="item.proName"
            :options="options"
            :props="{
              label:'name',
              value:'id',
              children:'itemList',
              emitPath:false
            }"
            placeholder="请选择项目"
            :show-all-levels="false"
            @change="cascaderChange"
            style="margin-right:5px;width:160px"
          ></el-cascader>
          <el-input
            v-model="item.remarks"
            maxlength="50"
            style="width:400px;margin-right:5px"
            placeholder="请输入备注"
          ></el-input>
          <el-button icon="el-icon-plus" v-if="index === 0" @click="handelAddItem">新增</el-button>
          <el-button icon="el-icon-delete" v-else @click="handelDelItem(item)">删除</el-button>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">取 消</el-button>
        <el-button :loading="loadingForm" type="primary" @click="handelProSub">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  getClientItemList,
  getClientItemInitList,
  handelDelClientItem,
  handelAddClientItem
} from "@/api/main";
import minHeightMix from "@/mixins/minHeight";
export default {
  mixins: [minHeightMix],
  data() {
    return {
      loading: false,
      open: false,
      loadingForm: false,
      proData: null,
      proSubData: [{ unStr: this._generateStr(), proName: "", remarks: "" }],
      options: []
    };
  },
  created() {
    this.getDetail();
  },
  methods: {
    async getDetail() {
      try {
        this.loading = true;
        const clientId = this.$route.params.code;
        const { code, data } = await getClientItemList({ clientId });
        this.loading = false;
        if (code === 200) {
          this.proData = data;
        }
      } catch (err) {
        this.loading = false;
        console.log(err);
      }
    },
    async getClientItemInitList() {
      try {
        const clientId = this.$route.params.code;
        const { code, data } = await getClientItemInitList({ clientId });
        if (code === 200) {
          this.options = this.initProData(data);
        }
      } catch (err) {
        console.log(err);
      }
    },
    resetSubData() {
      this.proSubData = [
        { unStr: this._generateStr(), proName: "", remarks: "" }
      ];
    },
    handleAdd() {
      this.resetSubData();
      this.getClientItemInitList();
      this.open = true;
    },
    handleDel(item) {
      this.$confirm(`确定要删除 ${item.itemId} 吗?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "el-message-box-wran"
      })
        .then(async () => {
          const clientId = this.$route.params.code;
          const { code } = await handelDelClientItem({
            itemId: item.itemId,
            clientId
          });
          if (code === 200) {
            this.msgSuccess("删除成功");
            this.getDetail();
          }
        })
        .catch(function() {});
    },
    handelAddItem() {
      if (this.proSubData.length > 7) {
        return;
      }
      this.proSubData.push({
        unStr: this._generateStr(),
        roName: "",
        remarks: ""
      });
    },
    handelDelItem(item) {
      const idx = this.proSubData.findIndex(value => {
        return item.unStr === value.unStr;
      });
      const id = this.proSubData[idx].proName;
      if (id) {
        this.options = this.initProData(this.options, [id], false);
      }
      this.proSubData.splice(idx, 1);
    },
    async handelProSub() {
      try {
        const subData = this.proSubData.filter(v => {
          return Boolean(v.proName);
        });
        if (subData.length === 0) {
          this.$confirm("至少填写一个项目！", "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            customClass: "el-message-box-wran"
          })
            .then(async () => {})
            .catch(() => {});
        } else {
          this.loadingForm = true;
          const clientId = this.$route.params.code;
          const json = subData.map(v => {
            return {
              itemId: v.proName,
              remarks: v.remarks
            };
          });
          const { code } = await handelAddClientItem({
            clientId,
            clientItemInfos: JSON.stringify(json)
          });
          this.loadingForm = false;
          this.open = false;
          if (code === 200) {
            this.msgSuccess("添加成功");
            this.getDetail();
          }
        }
      } catch (err) {
        this.loadingForm = false;
        console.log(err);
      }
    },
    initProData(data, changeList = undefined, noBack = true) {
      const list = changeList
        ? changeList
        : this.proData.list.map(v => {
            return v.itemId;
          });
      if (list.length === 0) {
        return data;
      } else {
        const findList = list.map(v => {
          return data.map(element => {
            const findCategory = element.itemList.find(item => {
              return item.id === v;
            });
            return findCategory ? findCategory.categoryId : undefined;
          });
        });
        const newArr = findList.flat().filter(v2 => {
          return Boolean(v2);
        });
        data.forEach(v3 => {
          if (newArr.includes(v3.id)) {
            return v3.itemList.forEach(v4 => {
              return Object.assign(v4, {
                disabled: noBack ? true : false
              });
            });
          } else {
            return v3;
          }
        });
        return data;
      }
    },
    cascaderChange(val) {
      this.options = this.initProData(this.options, [val]);
    },
    _generateStr(len) {
      var len = len || 32;
      var $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
      var maxPos = $chars.length;
      var pwd = "";
      for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
      }
      return pwd;
    }
  }
};
</script>