import * as path from "path";
import { parseObsidianVersions } from "wdio-obsidian-service";
import { env } from "process";

// wdio-obsidian-service downloads and caches real Obsidian builds here.
const cacheDir = path.resolve(".obsidian-cache");

// "latest" is the current stable release. "earliest" (manifest.json's
// minAppVersion) is deliberately not included by default: as of this
// writing minAppVersion is ahead of Obsidian's stable channel, so it only
// resolves via the beta channel, which needs an Obsidian Insiders account.
// Override with OBSIDIAN_VERSIONS to test other versions, e.g. once
// minAppVersion ships to stable: OBSIDIAN_VERSIONS="earliest/earliest latest/latest".
const versions = await parseObsidianVersions(
	env.OBSIDIAN_VERSIONS ?? "latest/latest",
	{ cacheDir }
);
if (env.CI) {
	// Printed so CI can use the resolved versions as a cache key (see ci.yml).
	console.log("obsidian-cache-key:", JSON.stringify(versions));
}

export const config: WebdriverIO.Config = {
	runner: "local",
	framework: "mocha",

	specs: ["./test/specs/**/*.e2e.ts"],

	maxInstances: Number(env.WDIO_MAX_INSTANCES || 4),

	// Every resolved Obsidian version is tested twice: once as normal desktop
	// Obsidian, once with app.emulateMobile(true) turned on, so every e2e spec
	// doubles as a mobile-UI check without needing a device or emulator.
	capabilities: [
		...versions.map<WebdriverIO.Capabilities>(([appVersion, installerVersion]) => ({
			browserName: "obsidian",
			"wdio:obsidianOptions": {
				appVersion,
				installerVersion,
				plugins: ["."],
				vault: "test/vaults/simple",
			},
		})),
		...versions.map<WebdriverIO.Capabilities>(([appVersion, installerVersion]) => ({
			browserName: "obsidian",
			"wdio:obsidianOptions": {
				appVersion,
				installerVersion,
				emulateMobile: true,
				plugins: ["."],
				vault: "test/vaults/simple",
			},
			"goog:chromeOptions": {
				mobileEmulation: {
					deviceMetrics: { width: 390, height: 844 },
				},
			},
		})),
	],

	services: ["obsidian"],
	reporters: ["obsidian"],

	mochaOpts: {
		ui: "bdd",
		timeout: 60 * 1000,
	},
	waitforInterval: 250,
	waitforTimeout: 5 * 1000,
	logLevel: "warn",

	cacheDir: cacheDir,

	injectGlobals: false,
};
