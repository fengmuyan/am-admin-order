<template>
  <div class="app-container account-monitor">
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

    <div class="table-p" style="padding-bottom:0px;">
      <el-table v-loading="loading" :data="clientList" :height="minHeight">
        <el-table-column label="序号" prop="order" width="50" />
        <el-table-column label="客户端ID" prop="id" width="80" />
        <el-table-column label="账号类型" sortable prop="isMasterAccount" width="100">
          <template slot-scope="scope">{{scope.row.isMasterAccount|initType}}</template>
        </el-table-column>
        <el-table-column label="APP" prop="app" width="120" show-overflow-tooltip />
        <el-table-column label="APP名称" prop="platformName" show-overflow-tooltip />
        <el-table-column label="连接状态" sortable prop="monitorClientStatus" width="90">
          <template slot-scope="scope">
            <span
              :class="{'warn-color':scope.row.monitorClientStatus===false,'suc-color':scope.row.monitorClientStatus===true}"
            >{{scope.row.monitorClientStatus | initState }}</span>
          </template>
        </el-table-column>
        <el-table-column label="运行状态" sortable prop="monitorClientAppStatus" width="90">
          <template slot-scope="scope">
            <span v-if="scope.row.monitorClientStatus===false">--</span>
            <el-popover placement="top-start" title="异常信息" width="220" trigger="hover" v-else>
              <div>
                <p style="margin:0;line-height:22px">{{scope.row.monitorClientAppStatus}}</p>
              </div>
              <span
                slot="reference"
                :class="{'warn-color':scope.row.monitorClientAppStatusCode!=='100','suc-color':scope.row.monitorClientAppStatusCode==='100'}"
              >{{scope.row.monitorClientAppStatusCode | initAppState }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="540px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-thumb"
              :disabled="scope.row.monitorClientStatus===false"
              @click="handelStartOrder(scope.row)"
            >启动</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-video-pause"
              :disabled="scope.row.monitorClientStatus===false"
              @click="handelStopAction(scope.row)"
            >暂停</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-open"
              :disabled="scope.row.monitorClientStatus===false"
              @click="handelOpenApp(scope.row)"
            >启动APP</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-turn-off"
              :disabled="scope.row.monitorClientStatus===false"
              @click="handelCloseApp(scope.row)"
            >退出APP</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-circle-close"
              :disabled="scope.row.monitorClientStatus===false"
              @click="handelCloseClient(scope.row)"
            >退出客户端</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-key"
              :disabled="scope.row.monitorClientStatus===false"
              @click="handelResetPw(scope.row)"
            >重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { getMonitorClientList, handelMonitorClientEdit } from "@/api/main";
import minHeightMix from "@/mixins/minHeight";
export default {
  mixins: [minHeightMix],
  data() {
    return {
      loading: false,
      loadingForm: false,
      formShow: true,
      isMonitor: true,
      lock: false,
      isListLoading: true,
      clientList: [],
      timer: null,
      queryForm: {
        platformName: undefined,
        appuser: undefined
      }
    };
  },
  filters: {
    initType(val) {
      const arr = ["主账号", "子账号"];
      return arr[val];
    },
    initState(val) {
      if (val === true) {
        return "正常";
      } else if (val === false) {
        return "未连接";
      }
    },
    initAppState(val) {
      if (val === "100") {
        return "正常";
      } else if (val === "200") {
        return "已停止";
      } else if (val === "300") {
        return "已退出APP";
      } else {
        return "异常";
      }
    }
  },
  created() {
    this._clearTimer();
    this.getList();
  },
  beforeDestroy() {
    this._clearTimer();
  },
  methods: {
    async getList() {
      if (!this.lock) {
        this.lock = true;
        try {
          this._clearTimer();
          this.timer = setTimeout(this.getList, 7000);
          if (this.isListLoading) {
            this.loading = true;
          }
          const { code, data } = await getMonitorClientList(this.queryForm);
          this.loading = false;
          if (code === 200) {
            this.clientList = data.map((item, index) => {
              return Object.assign(item, { order: index + 1 });
            });
            this.lock = false;
            this.isListLoading = false;
          }
        } catch (err) {
          this.loading = false;
          console.log(err);
        }
      } else {
        return false;
      }
    },
    handleQuery() {
      this.isListLoading = true;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    _clearTimer() {
      clearTimeout(this.timer);
      this.timer = null;
    },
    handelStartOrder(item) {
      this.$confirm(`确定 ${item.id} 要启动吗？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "el-message-box-wran"
      })
        .then(async () => {
          this.isListLoading = true;
          const { code } = await handelMonitorClientEdit({
            operationCode: "20003",
            clientId: item.id
          });
          this.loading = false;
          if (code === 200) {
            this.msgSuccess(`${item.id} 已启动成功`);
            this.getList();
          }
        })
        .catch(() => {});
    },
    handelStopAction(item) {
      this.$confirm(`确定要停止 ${item.id} 吗？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "el-message-box-wran"
      })
        .then(async () => {
          this.isListLoading = true;
          const { code } = await handelMonitorClientEdit({
            operationCode: "30003",
            clientId: item.id
          });
          this.loading = false;
          if (code === 200) {
            this.msgSuccess(`${item.id} 已停止`);
            this.getList();
          }
        })
        .catch(() => {});
    },
    handelOpenApp(item) {
      this.$confirm(`确定要启动 ${item.id} 交易APP吗？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "el-message-box-wran"
      })
        .then(async () => {
          this.isListLoading = true;
          const { code } = await handelMonitorClientEdit({
            operationCode: "30001",
            clientId: item.id
          });
          this.loading = false;
          if (code === 200) {
            this.msgSuccess(`${item.id} 已启动交易APP`);
            this.getList();
          }
        })
        .catch(() => {});
    },
    handelCloseApp(item) {
      this.$confirm(`确定要退出 ${item.id} 交易APP吗？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "el-message-box-wran"
      })
        .then(async () => {
          this.isListLoading = true;
          const { code } = await handelMonitorClientEdit({
            operationCode: "30004",
            clientId: item.id
          });
          this.loading = false;
          if (code === 200) {
            this.msgSuccess(`${item.id} 已退出交易APP`);
            this.getList();
          }
        })
        .catch(() => {});
    },
    handelCloseClient(item) {
      this.$confirm(`确定要退出 ${item.id} 客户端吗？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "el-message-box-wran"
      })
        .then(async () => {
          this.isListLoading = true;
          const { code } = await handelMonitorClientEdit({
            operationCode: "30005",
            clientId: item.id
          });
          this.loading = false;
          if (code === 200) {
            this.msgSuccess(`${item.id} 已退出客户端`);
            this.getList();
          }
        })
        .catch(() => {});
    },
    handelResetPw(item) {
      this.$prompt(`请输入 客户端${item.id} 交易APP重置后的密码`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[a-zA-Z0-9_]{6,18}$/,
        inputErrorMessage: "密码6-18位数字、字母！"
      })
        .then(async ({ value }) => {
          this.isListLoading = true;
          const { code } = await handelMonitorClientEdit({
            operationCode: "30002",
            clientId: item.id,
            appPwd: value
          });
          this.loading = false;
          if (code === 200) {
            this.msgSuccess(`${item.id} 密码重置成功`);
            this.getList();
          }
        })
        .catch(err => {});
    }
  }
};
</script>