/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** GLF Binary Path - Path to glf binary (auto-detected if left default) */
  "glfPath": string,
  /** Show Relevance Scores - Display search relevance scores (for debugging) */
  "showScores": boolean,
  /** Maximum Results - Limit number of search results (default: 20) */
  "maxResults": string,
  /** Auto-Sync Interval (minutes) - Automatically sync projects in background (0 to disable, default: 60) */
  "autoSyncInterval": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search-projects` command */
  export type SearchProjects = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search-projects` command */
  export type SearchProjects = {}
}

