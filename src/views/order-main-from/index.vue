<template>
  <div class="app-container account">
    <el-collapse-transition>
      <div class="form-p" v-if="formShow" ref="formPublic" v-resize="resize">
        <el-form :model="queryForm" ref="queryForm" :inline="true" label-width="80px">
          <el-form-item label="APP信息" prop="platformId">
            <el-select v-model="queryForm.platformId" style="width:300px" placeholder="请选择APP信息">
              <el-option
                v-for="(item,index) in selectList"
                :key="index"
                :label="item.platformName"
                :value="item.platformId"
              >
                <span style="float: left">{{ item.platformName }}</span>
                <span
                  style="float: right;height:30px;color: rgb(200,200,200);"
                >{{ `${item.appuser}` }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="交易方向" prop="direction">
            <el-select
              v-model="queryForm.direction"
              placeholder="请选择"
              clearable
              size="small"
              style="width: 200px"
            >
              <el-option label="买入" value="0" />
              <el-option label="卖出" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="交易时间">
            <el-date-picker
              v-model="dateRange"
              size="small"
              style="width: 360px"
              type="datetimerange"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-collapse-transition>

    <div class="table-p" :style="{ 'min-height': minHeight }">
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
      <el-table style="width: 100%" v-loading="loading" :data="orderList">
        <el-table-column label="序号" prop="order" width="55" />
        <el-table-column label="交易号" prop="tradeId" width="120" show-overflow-tooltip />
        <el-table-column label="项目名称" prop="tradeItemName" />
        <el-table-column label="交易时间" sortable prop="tradeTime" width="150" />
        <el-table-column label="交易货币" prop="tradeCurrency" />
        <el-table-column label="交易方向" prop="direction" />
        <el-table-column label="APP名称" prop="platformName" width="150" show-overflow-tooltip />
        <el-table-column label="APP账号" prop="appuser" />
        <el-table-column label="跟单数量" sortable prop="num" width="100" />
        <el-table-column label="单价" sortable prop="unitPriceStr" />
        <el-table-column label="剩余数量" sortable prop="stockNum" width="100" />
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-document-copy"
              @click="handelDetail(scope.row)"
            >子账号下单详情</el-button>
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
  </div>
</template>
<script>
import { getOrderList, getOrderSelect } from "@/api/main";
import minHeightMix from "@/mixins/minHeight";
export default {
  mixins: [minHeightMix],
  data() {
    return {
      loading: false,
      formShow: true,
      orderList: [],
      dateRange: [],
      selectList:[],
      total: 0,
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        operationCode: "1",
        direction: undefined,
        platformId: undefined,
        appuser: undefined
      }
    };
  },
  created() {
    this.getSelect();
    this.getList();
  },
  filters: {
    initDirection(val) {
      const arr = ["买入", "卖出"];
      return arr[val];
    }
  },

  methods: {
    async getSelect() {
      try {
        const { code, data } = await getOrderSelect();
        if (code === 200) {
          this.selectList = data;
        }
      } catch (err) {}
    },
    async getList() {
      try {
        this.loading = true;
        const { _initParams, queryForm } = this;
        const {
          code,
          data: { content, totalSize }
        } = await getOrderList(_initParams(queryForm));
        this.loading = false;
        if (code === 200) {
          this.orderList = content.map((item, index) => {
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
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handelDetail(item) {
      this.$router.push({
        path: `/order-aide-place/list?code=${item.guid}`
      });
    },
    _initParams(obj) {
      const dateRange = this.dateRange || [];
      const selectItem = this.selectList.find(item => {
        return item.platformId === obj.platformId;
      });
      const appuser = selectItem ? selectItem.appuser : undefined;
      Object.assign(obj, {
        beginTime: dateRange.length > 0 ? dateRange[0] : undefined,
        endTime: dateRange.length > 0 ? dateRange[1] : undefined,
        appuser
      });
      return obj;
    }
  }
};
</script>