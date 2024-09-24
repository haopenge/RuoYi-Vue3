<template>
  <div class="container">
    <el-radio-group v-model="codeType" size="small" @change="typeChange">
      <el-radio-button label="Dockerfile"/>
      <el-radio-button label="Yaml"/>
      <el-radio-button label="Properties"/>
      <el-radio-button label="Xml"/>
      <el-radio-button label="JavaScript"/>
      <el-radio-button label="Json"/>
      <el-radio-button label="Shell"/>
    </el-radio-group>

    <Codemirror
        v-model:value="codeMirrorVo.value"
        :options="codeMirrorVo.cmOptions"
        border
        ref="cmRef"
        @change="onChange"
        @input="onInput"
        @ready="onReady"
    />
  </div>

</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watchEffect } from "vue";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/dockerfile/dockerfile.js";
import "codemirror/mode/yaml/yaml.js";
import "codemirror/mode/properties/properties.js";
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/shell/shell.js";

import "codemirror/theme/seti.css";

import Codemirror from "codemirror-editor-vue3";
import type { CmComponentRef } from "codemirror-editor-vue3";
import type { Editor, EditorConfiguration } from "codemirror";
import { CodeMirrorVo } from "./type";

const codeTypeMap = ref(new Map<string, string>());
codeTypeMap.value.set("Dockerfile", "text/x-dockerfile");
codeTypeMap.value.set("Yaml", "text/x-yaml");
codeTypeMap.value.set("Properties", "text/x-properties");
codeTypeMap.value.set("Xml", "application/xml");
codeTypeMap.value.set("JavaScript", "text/javascript");
codeTypeMap.value.set("Json", "application/json");
codeTypeMap.value.set("Shell", "text/x-sh");

const codeType = ref<string>("Dockerfile");
const typeChange = (value: string) => {
  console.log('typeChange = ' + value);
  let temp = codeMirrorVo.value;
  codeMirrorVo.value = {
    value: temp.value,
    cmOptions: {
      mode: codeTypeMap.value.get(value)
    }
  };
};

const cmRef = ref<CmComponentRef>();
const codeMirrorVo = ref<CodeMirrorVo>({
  value: `var i = 0;
for (; i < 9; i++) {
    console.log(i);
    // more statements
}`,
  cmOptions: {
    mode: "application/json",
    theme: "seti"
  }
});

const onChange = (val: string, cm: Editor) => {
  console.log(val);
  console.log(cm.getValue());
};

const onInput = (val: string) => {
  console.log(val);
};

const onReady = (cm: Editor) => {
  setTimeout(() => {
    if (cmRef.value) {
      cmRef.value.refresh();
    }
  }, 1000);

  if (cmRef.value) {
    cmRef.value.cminstance.isClean();
    cm.focus();
  }
};

onMounted(() => {
  // 添加定时器的引用以便清理
  const timeout1 = setTimeout(() => {
    if (cmRef.value) {
      cmRef.value.refresh();
    }
  }, 1000);

  const timeout2 = setTimeout(() => {
  }, 2000);

  const timeout3 = setTimeout(() => {
    if (cmRef.value) {
      cmRef.value.cminstance.isClean();
    }
  }, 3000);

  // 监听 `codeType` 变化并更新 `mode`
  watchEffect(() => {
    if (cmRef.value && codeType.value) {
      cmRef.value.cminstance.setOption("mode", codeTypeMap.value.get(codeType.value));
    }
  });

  onUnmounted(() => {
    clearTimeout(timeout1);
    clearTimeout(timeout2);
    clearTimeout(timeout3);
    if (cmRef.value) {
      cmRef.value.destroy();
    }
  });
});

</script>
<style scoped>.container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

</style>