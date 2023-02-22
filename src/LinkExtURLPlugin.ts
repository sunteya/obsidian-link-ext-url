import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian'
import { PluginSettings } from './PluginSettings'
import { SettingTab } from './SettingTab'
import { buildEditorExtension } from './LinkExtURLEditorPlugin'
import { ViewPlugin } from '@codemirror/view'

const DEFAULT_SETTINGS: PluginSettings = {
	mySetting: 'default'
}

export class LinkExternalURLPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings()
    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SettingTab(this.app, this))

    this.registerEditorExtension(buildEditorExtension(this.app))
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}