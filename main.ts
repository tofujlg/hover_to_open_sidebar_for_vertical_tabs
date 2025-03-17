// import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';


interface HoverToRevealSidebarSettings {
	mySetting: string;
	leftSidebar: boolean;
	rightSidebar: boolean;
	expandSidebarThreshold: number;
}

const DEFAULT_SETTINGS: HoverToRevealSidebarSettings = {
	mySetting: 'default',
	leftSidebar: true,
	rightSidebar: true,
	expandSidebarThreshold: 10
}

export default class HoverToRevealSidebar extends Plugin {
	settings: HoverToRevealSidebarSettings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		/*
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});
		*/

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new HoverToRevealSidebarSettingsTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('HoverToRevealSidebar: click', evt);
		});

		
		
		this.app.workspace.onLayoutReady(() => {

			// constants
			const leftSplit = this.app.workspace.leftSplit;
			const rightSplit = this.app.workspace.rightSplit;
			let isHovering = false;

			/**
			 * Handle left and right sidebar opening on mouse hover
			 */
			this.registerDomEvent(document, "mousemove", (e) => {
				if (this.settings.leftSidebar && e.clientX <= this.settings.expandSidebarThreshold) {
					this.app.workspace.leftSplit.expand();
					isHovering = true;
				}
				if (this.settings.rightSidebar && e.clientX >= window.innerWidth - this.settings.expandSidebarThreshold) {
					this.app.workspace.rightSplit.expand();
					isHovering = true;
				}
			});

			/**
			 * Handles left and right sidebar closing on mouse leave
			 */
			// FIXME: Type error, fix me later
			// @ts-ignore
			this.registerDomEvent(leftSplit.containerEl, "mouseleave", () => {
				if(this.settings.leftSidebar){ //Check to see if the user has the 'Left Sidebar Hover' setting enabled.
					isHovering = false;
					setTimeout(() => {
						if(!isHovering)
							leftSplit.collapse(); //...if it has after the appropriate delay length, close the leftSplit...
					}, 100);
					// @ts-ignore
					this.registerDomEvent(leftSplit.containerEl, "mouseenter", () => {
						isHovering = true; //...but if the mouse reenters before the delay length, set 'isHovering' to true, preventing the above from happening.
					});
				}
				if(this.settings.rightSidebar){
					isHovering = false;
					setTimeout(() => {
						if(!isHovering)
							rightSplit.collapse(); //...if it has after the appropriate delay length, close the leftSplit...
					}, 100);
					// @ts-ignore
					this.registerDomEvent(rightSplit.containerEl, "mouseenter", () => {
						isHovering = true; //...but if the mouse reenters before the delay length, set 'isHovering' to true, preventing the above from happening.
					});
				}
			});
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

/*
class HoverToRevealSidebarModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
*/

class HoverToRevealSidebarSettingsTab extends PluginSettingTab {
	plugin: HoverToRevealSidebar;

	constructor(app: App, plugin: HoverToRevealSidebar) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Hover to reveal sidebar')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
