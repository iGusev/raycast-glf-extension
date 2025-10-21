// @ts-nocheck - React types v18.2 compatibility issue with Raycast
import React from "react";
import { List, ActionPanel, Action, Icon, Color, getPreferenceValues, showToast, Toast, popToRoot } from "@raycast/api";
import { useState, useEffect, useRef } from "react";
import { searchGLF, syncGLF, formatScore, generateSquareAvatar } from "./utils";
import { GLFProject, GLFPreferences } from "./types";

export default function SearchProjects() {
  const [searchText, setSearchText] = useState("");
  const [projects, setProjects] = useState<GLFProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const preferences = getPreferenceValues<GLFPreferences>();
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Search with minimal debounce - always use glf
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Abort previous search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Minimal debounce (50ms) - just enough to cancel rapid typing
    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchText);
    }, 50);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchText]);

  // Background auto-sync
  useEffect(() => {
    const intervalMinutes = parseInt(preferences.autoSyncInterval);

    // Skip if auto-sync is disabled (0 or invalid)
    if (!intervalMinutes || intervalMinutes <= 0) {
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;

    // Background sync function (silent, doesn't show toast)
    const backgroundSync = async () => {
      try {
        console.log("Background sync started");
        await syncGLF(preferences);
        console.log("Background sync completed");
      } catch (err) {
        console.error("Background sync failed:", err);
        // Silent failure - don't disturb user with toast
      }
    };

    // Set up interval for background sync
    const intervalId = setInterval(backgroundSync, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [preferences.autoSyncInterval]);

  async function performSearch(query: string) {
    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const result = await searchGLF(query, preferences);
      setProjects(result.results);
    } catch (err) {
      if (err instanceof Error && err.message.includes("aborted")) {
        return; // Ignore aborted requests
      }

      console.error("Search failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");

      await showToast({
        style: Toast.Style.Failure,
        title: "Search failed",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }

  async function handleSync() {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Syncing projects...",
    });

    try {
      await syncGLF(preferences);

      toast.style = Toast.Style.Success;
      toast.title = "Sync complete";
      toast.message = "Projects updated from GitLab";

      // Refresh search results after sync
      await performSearch(searchText);
    } catch (err) {
      console.error("Sync failed:", err);

      toast.style = Toast.Style.Failure;
      toast.title = "Sync failed";
      toast.message = err instanceof Error ? err.message : "Unknown error";
    }
  }

  // Filter projects based on showHidden state
  // By default (showHidden=false), hide archived, excluded, and non-member projects
  const visibleProjects = showHidden
    ? projects
    : projects.filter(project => !project.archived && !project.excluded && project.member);

  return (
    <List
      isLoading={isLoading || isInitialLoad}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search GitLab projects..."
      searchText={searchText}
      throttle
    >
      {error ? (
        <List.EmptyView
          icon={Icon.ExclamationMark}
          title="Search Error"
          description={error}
        />
      ) : visibleProjects.length === 0 && !isLoading && !isInitialLoad ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="No Projects Found"
          description={
            searchText.trim() === ""
              ? "Start typing to search your GitLab projects"
              : showHidden
              ? `No projects matching "${searchText}"`
              : `No active projects matching "${searchText}"\n(Press Cmd+Shift+H to show hidden projects)`
          }
        />
      ) : !isInitialLoad ? (
        visibleProjects.map((project) => {
          const accessories: List.Item.Accessory[] = [];

          // Determine if project is hidden (archived, excluded, or non-member)
          const isHidden = project.archived || project.excluded || !project.member;

          // Add score if enabled (goes first)
          if (preferences.showScores && project.score !== undefined) {
            accessories.push({
              text: formatScore(project.score),
              icon: Icon.Gauge,
            });
          }

          // Add status indicators (in middle)
          if (project.archived) {
            accessories.push({
              icon: { source: Icon.Box, tintColor: Color.SecondaryText },
              tooltip: "Archived project"
            });
          }

          if (project.excluded) {
            accessories.push({
              icon: { source: Icon.XMarkCircle, tintColor: Color.SecondaryText },
              tooltip: "Excluded from search"
            });
          }

          if (!project.member) {
            accessories.push({
              icon: { source: Icon.Eye, tintColor: Color.SecondaryText },
              tooltip: "Guest project (non-member)"
            });
          }

          // Add heart indicator for starred projects (at the end, closest to title)
          if (project.starred) {
            accessories.unshift({
              icon: { source: Icon.Heart, tintColor: "#FDB515" }, // California Gold heart
              tooltip: "Starred project"
            });
          }

          return (
            <List.Item
              key={project.path}
              icon={generateSquareAvatar(project.name, isHidden)}
              title={project.name}
              subtitle={project.path}
              accessories={accessories}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser
                    title="Open in Browser"
                    url={project.url}
                    onOpen={() => popToRoot()}
                  />
                  <Action.CopyToClipboard
                    title="Copy URL"
                    content={project.url}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Path"
                    content={project.path}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                  />
                  <Action
                    title="Sync Projects"
                    icon={Icon.ArrowClockwise}
                    onAction={handleSync}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                  />
                  <Action
                    title={showHidden ? "Hide Hidden Projects" : "Show Hidden Projects"}
                    icon={showHidden ? Icon.EyeDisabled : Icon.Eye}
                    onAction={() => setShowHidden(!showHidden)}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "h" }}
                  />
                </ActionPanel>
              }
            />
          );
        })
      ) : null}
    </List>
  );
}
