import { SandblocksEditor } from "./editor/editor.js";
import { button, useAsyncEffect } from "../view/widgets.js";
import { render, h } from "../view/widgets.js";
import { useEffect, useState } from "../external/preact-hooks.mjs";
import { matchesKey, withDo } from "../utils.js";
import { choose, openComponentInWindow } from "./window.js";
import {} from "./file-project/search.js";
import { loadUserPreferences, openPreferences } from "./preference-window.js";

await loadUserPreferences();

const PROJECT_TYPES = {
  FileProject: {
    path: "./file-project/main.js",
    name: "FileProject",
    label: "Open Folder",
    createArgs: () => ({ folder: prompt() }),
  },
};

async function loadProjectType(desc) {
  return (await import(desc.path))[desc.name];
}

async function loadSerializedProject(serialized) {
  return (await loadProjectType(PROJECT_TYPES[serialized.type])).deserialize(
    serialized,
  );
}

function projectEqual(a, b) {
  const aInfo = a.fullSerialize();
  const bInfo = b.fullSerialize();
  for (const key of Object.keys(aInfo)) {
    if (aInfo[key] !== bInfo[key]) return false;
  }
  return true;
}

SandblocksEditor.init();

const tla = async () =>
  (await import("../extensions/tla/state-explorer.js")).TlaStateExplorer;

const startUpOptions = {
  tla: async (options) => {
  },
};

function Sandblocks() {
  const [openProjects, setOpenProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);

  // Debugging utility for diffing
  // useEffect(() => {
  //   const e = document.createElement("sb-editor");
  //   document.body.appendChild(e);
  //   e.load("a", "tsx", []);
  //   setTimeout(function () {
  //     e.replaceFullTextFromCommand("b");
  //   }, 1000);
  // }, []);

  useAsyncEffect(async () => {
    openComponentInWindow(await tla(), {}, {
      doNotStartAttached: true,
      initialPosition: { x: 10, y: 10 },
      initialSize: { x: 1000, y: 800 },
      fullscreen: true,
    });
  }, []);

  useAsyncEffect(async () => {
    const lastProjects = JSON.parse(localStorage.lastProjects ?? "[]");
    for (const info of lastProjects) {
      const project = await loadSerializedProject(info);
      await project.open();
      setOpenProjects((p) => [...p, project]);
    }
  }, []);

  useAsyncEffect(async () => {
    for (const info of JSON.parse(localStorage.recentProjects ?? "[]")) {
      const project = await loadSerializedProject(info);
      setRecentProjects((p) => [...p, project]);
    }
  }, []);

  return 'Loading SpecTacles ...';
}

render(h(Sandblocks), document.body);
