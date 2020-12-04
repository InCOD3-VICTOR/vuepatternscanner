import Vue from 'vue'
import Vuex from 'vuex'

import { Project, Group, Pattern, PatternRow, PatternByte } from '@/model/project.js'

Vue.use(Vuex)

const POPULATE_JSON = function (project, obj) {
  for (var g in obj.groups) {
    var group = obj.groups[g]
    var _group = new PatternGroup(group.name)
    for (var p in group.patterns) {
      var pattern = group.patterns[p]
      var _pattern = new Pattern(pattern.name)
      for (var r in pattern.rows) {
        var row = pattern.rows[r]
        var _row = new PatternRow(row.comment)
        for (var b in row.bytes) {
          var byte = row.bytes[b]
          _row.bytes.push(new PatternByte(byte.value, byte.wildcard))
        }
        _pattern.rows.push(_row)
      }
      _group.patterns.push(_pattern)
    }
    project.groups.push(_group)
  }
}

const store = new Vuex.Store({
  state: {
    project: null,
    currentPattern: null
  },
  mutations: {
    saveLocally(state) {
      localStorage.setItem('VPSProject', JSON.stringify(state.project))
    },
    loadLocally(state) {
      json = localStorage.getItem('VPSProject')
      if (json) {
        state.project = new Project()
        POPULATE_JSON(state.project, JSON.parse(json))
      }
    },
    createInitial(state) {
      state.project = Project.newProject()
      state.currentPattern = state.project.groups[0].patterns[0]
    },
    setCurrentPattern(state, pattern) {
      state.currentPattern = pattern;
    },
    removeGroup(state, group) {
      state.project.groups = state.project.groups.filter(g => g != group)
      if (state.project.groups.length > 0 && state.project.groups[0].patterns.length > 0)
        state.currentPattern = state.project.groups[0].patterns[0]
      else
        state.currentPattern = null
    },
    removePattern(state, pattern) {
      var groups = state.project.groups.filter(g => g.patterns.findIndex(p => p == pattern) != -1);
      if (groups.length == 0) return;
      var group = groups[0];
      group.patterns = group.patterns.filter(p => p != pattern);
      if (state.currentPattern == pattern)
        state.currentPattern = null
    },
    createGroup(state, name) {
      state.project.groups.push(new Group(name))
    },
    createPattern(state, data) {
      var groups = state.project.groups.filter(g => g.name == data.group.name)
      if (groups)
        groups[0].patterns.push(data.pattern)
    }
  },
  getters: {
    project: state => state.project,
    groups: state => {
      if (state && state.project)
        return state.project.groups
      else
        return null
    },
    currentPattern: state => state.currentPattern,
    elements: state => {
      var items = []
      for (var group in state.project.groups) {
        items.push(group)
        for (var pattern in group.patterns) {
          items.push(pattern)
        }
      }
      return items
    }
  }
})

export default store