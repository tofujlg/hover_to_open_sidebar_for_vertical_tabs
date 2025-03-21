import { Plugin } from 'obsidian';

interface HoverToRevealSidebarSettings {
	mySetting: string;
	leftSidebarEnabled: boolean;
	rightSidebarEnabled: boolean;
	expandSidebarThreshold: number;
}

const DEFAULT_SETTINGS: HoverToRevealSidebarSettings = {
	mySetting: 'default',
	leftSidebarEnabled: true,
	rightSidebarEnabled: true,
	expandSidebarThreshold: 10
}

export default class HoverToRevealSidebar extends Plugin {
	settings: HoverToRevealSidebarSettings;

	async onload() {
		await this.loadSettings();
		this.app.workspace.onLayoutReady(() => {

			// constants
			const leftSplit = this.app.workspace.leftSplit;
			const rightSplit = this.app.workspace.rightSplit;
			let isSidebarHovered = false;
			let isDragging = false;
			let isMouseDown = false;

			/**
			 * Handle left and right sidebar opening on mouse hover
			 */
			this.registerDomEvent(document, "mousemove", (e) => {
				if (this.settings.leftSidebarEnabled && e.clientX <= this.settings.expandSidebarThreshold) {
					this.app.workspace.leftSplit.expand();
					isSidebarHovered = true;
				}
				if (this.settings.rightSidebarEnabled && e.clientX >= window.innerWidth - this.settings.expandSidebarThreshold) {
					this.app.workspace.rightSplit.expand();
					isSidebarHovered = true;
				}
			});

			// Replace drag detection with mouse events
			this.registerDomEvent(document, 'mousedown', () => {
				isMouseDown = true;
				isDragging = true;
			});

			this.registerDomEvent(document, 'mouseup', () => {
				isMouseDown = false;
				isDragging = false;
			});

			/**
			 * Handles left and right sidebar closing on mouse leave
			 */
			// @ts-ignore
			this.registerDomEvent(leftSplit.containerEl, "mouseleave", () => {
				if(this.settings.leftSidebarEnabled){
					isSidebarHovered = false;
					setTimeout(() => {
						if(!isSidebarHovered && !isDragging && !isMouseDown)
							leftSplit.collapse();
					}, 100);
					// @ts-ignore
					this.registerDomEvent(leftSplit.containerEl, "mouseenter", () => {
						isSidebarHovered = true;
					});
				}
			});
			// @ts-ignore
			this.registerDomEvent(rightSplit.containerEl, "mouseleave", () => {
				if(this.settings.rightSidebarEnabled){
					isSidebarHovered = false;
					setTimeout(() => {
						if(!isSidebarHovered)
							rightSplit.collapse();
					}, 100);
					// @ts-ignore
					this.registerDomEvent(rightSplit.containerEl, "mouseenter", () => {
						isSidebarHovered = true;
					});
				}
			});
		});
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
