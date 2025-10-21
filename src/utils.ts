import { exec } from "child_process";
import { promisify } from "util";
import { GLFSearchResult, GLFError, GLFPreferences } from "./types";

const execAsync = promisify(exec);

// Auto-detect glf binary path if not explicitly set
async function getGLFPath(configuredPath: string): Promise<string> {
  // If user configured a custom path, use it
  if (configuredPath && configuredPath !== "/usr/local/bin/glf" && configuredPath !== "/opt/homebrew/bin/glf") {
    return configuredPath;
  }

  // Try to find glf using 'which'
  try {
    const { stdout } = await execAsync("which glf");
    const detectedPath = stdout.trim();
    if (detectedPath) {
      return detectedPath;
    }
  } catch {
    // 'which' failed, fall back to common paths
  }

  // Try common paths in order
  const commonPaths = [
    "/opt/homebrew/bin/glf",  // Apple Silicon
    "/usr/local/bin/glf",      // Intel Mac
    "/home/linuxbrew/.linuxbrew/bin/glf",  // Linux Homebrew
  ];

  for (const path of commonPaths) {
    try {
      await execAsync(`test -f ${path}`);
      return path;
    } catch {
      continue;
    }
  }

  // Last resort: use configured path (will fail with helpful error)
  return configuredPath;
}

export async function searchGLF(
  query: string,
  preferences: GLFPreferences
): Promise<GLFSearchResult> {
  const { glfPath: configuredPath, showScores, maxResults } = preferences;

  // Auto-detect glf path
  const glfPath = await getGLFPath(configuredPath);

  // Build glf command
  const args = [
    "--json",
    `--limit ${maxResults}`,
  ];

  if (showScores) {
    args.push("--scores");
  }

  if (query.trim() !== "") {
    args.push(query);
  }

  const cmd = `${glfPath} ${args.join(" ")}`;

  try {
    const { stdout, stderr } = await execAsync(cmd);

    if (stderr) {
      console.error("glf stderr:", stderr);
    }

    // Parse JSON output
    const result = JSON.parse(stdout) as GLFSearchResult | GLFError;

    // Check for error response
    if ("error" in result) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      // Provide helpful error messages
      if (error.message.includes("ENOENT") || error.message.includes("command not found")) {
        throw new Error(
          `GLF binary not found at: ${glfPath}\n\n` +
          "Please install GLF or update the binary path in preferences.\n" +
          "Installation: brew install igusev/tap/glf"
        );
      }
      if (error.message.includes("no projects in cache")) {
        throw new Error(
          "No projects in cache. Run 'glf sync' first to fetch projects from GitLab."
        );
      }
      if (error.message.includes("config not found")) {
        throw new Error(
          "GLF not configured. Run 'glf --init' to configure GitLab connection."
        );
      }
      throw new Error(`GLF execution failed: ${error.message}`);
    }
    throw error;
  }
}

export async function syncGLF(preferences: GLFPreferences): Promise<void> {
  const { glfPath: configuredPath } = preferences;

  // Auto-detect glf path
  const glfPath = await getGLFPath(configuredPath);

  // Run full sync
  const cmd = `${glfPath} --sync --full`;

  try {
    const { stdout, stderr } = await execAsync(cmd);

    if (stderr) {
      console.error("glf sync stderr:", stderr);
    }

    console.log("glf sync output:", stdout);
  } catch (error) {
    if (error instanceof Error) {
      // Provide helpful error messages
      if (error.message.includes("ENOENT") || error.message.includes("command not found")) {
        throw new Error(
          `GLF binary not found at: ${glfPath}\n\n` +
          "Please install GLF or update the binary path in preferences.\n" +
          "Installation: brew install igusev/tap/glf"
        );
      }
      if (error.message.includes("config not found")) {
        throw new Error(
          "GLF not configured. Run 'glf --init' to configure GitLab connection."
        );
      }
      throw new Error(`GLF sync failed: ${error.message}`);
    }
    throw error;
  }
}

export function formatScore(score: number): string {
  return `Score: ${score.toFixed(1)}`;
}

// Simple hash function for consistent color generation
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Calculate relative luminance to determine if color is light or dark
function getRelativeLuminance(hex: string): number {
  const rgb = parseInt(hex.substring(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

// Get contrasting text color (black or white) based on background
function getContrastingTextColor(bgColor: string): string {
  const luminance = getRelativeLuminance(bgColor);
  // If luminance > 0.5, background is light, use dark text
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

// Desaturate and lighten a color (for hidden projects)
function desaturateColor(hex: string): string {
  const rgb = parseInt(hex.substring(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  // Convert to grayscale and mix with original (80% desaturation - more gray)
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const newR = Math.round(r * 0.2 + gray * 0.8);
  const newG = Math.round(g * 0.2 + gray * 0.8);
  const newB = Math.round(b * 0.2 + gray * 0.8);

  // Lighten by 30%
  const lightenR = Math.min(255, Math.round(newR + (255 - newR) * 0.3));
  const lightenG = Math.min(255, Math.round(newG + (255 - newG) * 0.3));
  const lightenB = Math.min(255, Math.round(newB + (255 - newB) * 0.3));

  return `#${((lightenR << 16) | (lightenG << 8) | lightenB).toString(16).padStart(6, '0')}`;
}

// Generate a color based on project name
function getAvatarColor(name: string): string {
  // Predefined pleasant colors for avatars
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#FFA07A", // Light Salmon
    "#98D8C8", // Mint
    "#F7DC6F", // Yellow
    "#BB8FCE", // Purple
    "#85C1E2", // Sky Blue
    "#F8B88B", // Peach
    "#A8E6CF", // Light Green
    "#FFD3B6", // Apricot
    "#FFAAA5", // Pink
    "#FF8B94", // Rose
    "#A8DADC", // Powder Blue
    "#E9C46A", // Goldenrod
  ];

  const hash = hashString(name);
  return colors[hash % colors.length];
}

// Generate initials from project name (1-2 letters from first words)
function getProjectInitials(name: string): string {
  const words = name
    .trim()
    .split(/[\s-_\/]+/) // Split by space, dash, underscore, or slash
    .filter(word => word.length > 0);

  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();

  // Take first letter of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Generate square colored avatar WITH text (for experimentation)
export function generateSquareAvatar(name: string, isHidden = false): string {
  const baseColor = getAvatarColor(name);
  // Desaturate and lighten color for hidden projects
  const bgColor = isHidden ? desaturateColor(baseColor) : baseColor;
  const textColor = getContrastingTextColor(bgColor);
  const initials = getProjectInitials(name);

  // SVG с различными параметрами для экспериментов
  const svg = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.4"/>
      </filter>
    </defs>

    <!-- Квадрат с фоном -->
    <rect width="40" height="40" fill="${bgColor}" rx="6"/>

    <!-- Обводка текста для контрастности -->
    <text
      x="20"
      y="31"
      font-family="-apple-system, BlinkMacSystemFont, SF Pro Text, Helvetica Neue, sans-serif"
      font-size="18"
      font-weight="900"
      fill="none"
      stroke="${textColor === '#FFFFFF' ? '#000000' : '#FFFFFF'}"
      stroke-width="0.5"
      text-anchor="middle"
      opacity="0.3"
    >${initials}</text>

    <!-- Основной текст с инициалами -->
    <text
      x="20"
      y="31"
      font-family="-apple-system, BlinkMacSystemFont, SF Pro Text, Helvetica Neue, sans-serif"
      font-size="18"
      font-weight="900"
      fill="${textColor}"
      text-anchor="middle"
      filter="url(#textShadow)"
    >${initials}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
