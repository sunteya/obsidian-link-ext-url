import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian'
import { LinkExternalURLPlugin } from './LinkExtURLPlugin'

export class SettingTab extends PluginSettingTab {
  plugin: LinkExternalURLPlugin;

  constructor(app: App, plugin: LinkExternalURLPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc('It\'s a secret')
      .addText(text => text
        .setPlaceholder('Enter your secret')
        .setValue(this.plugin.settings.mySetting)
        .onChange(async (value) => {
          console.log('Secret: ' + value);
          this.plugin.settings.mySetting = value;
          await this.plugin.saveSettings();
        }));
  }
}