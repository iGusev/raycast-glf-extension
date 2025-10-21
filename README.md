# GLF - GitLab Fuzzy Finder for Raycast

Search your self-hosted GitLab projects instantly from Raycast with fuzzy matching and smart ranking.

## Features

- ⚡ **Lightning-fast search** with local caching via GLF
- 🔍 **Multi-token search** - Search with spaces: "api storage" finds projects with both terms
- 🧠 **Smart ranking** - Combines usage history with starred favorites
- ⭐ **GitLab starred integration** - Starred projects automatically highlighted
- 🎯 **Keyboard-first** - Navigate and open projects without leaving Raycast
- 📊 **Optional relevance scores** - Debug search ranking with score display

## Prerequisites

### Required: GLF Installation

This extension requires [GLF](https://github.com/igusev/glf) to be installed on your system.

#### Install via Homebrew (macOS/Linux)

```bash
brew tap igusev/tap
brew install glf
```

#### Install via MacPorts (macOS)

```bash
git clone https://github.com/igusev/macports-ports.git
cd macports-ports
sudo bash -c "echo 'file://$(pwd)' >> /opt/local/etc/macports/sources.conf"
sudo port sync
sudo port install glf
```

#### Install via Scoop (Windows)

```bash
scoop bucket add igusev https://github.com/igusev/scoop-bucket
scoop install igusev/glf
```

#### Other installation methods

See the [GLF README](https://github.com/igusev/glf#installation) for more installation options.

### Required: GLF Configuration

Before using this extension, you must configure GLF with your GitLab instance:

```bash
# Run the interactive configuration wizard
glf --init

# Sync projects from GitLab
glf sync
```

You'll need:
- GitLab instance URL (e.g., `https://gitlab.example.com`)
- Personal Access Token with `read_api` scope

## Installation

1. Install the extension from the Raycast Store
2. Ensure GLF is installed and configured (see Prerequisites above)
3. (Optional) Configure extension preferences:
   - **GLF Binary Path**: Custom path if GLF is not in `/usr/local/bin/glf`
   - **Show Relevance Scores**: Enable to see search ranking scores
   - **Maximum Results**: Limit search results (default: 20)

## Usage

### Search Projects

1. Open Raycast
2. Type "Search GitLab Projects" or use the assigned hotkey
3. Start typing to search across project names, paths, and descriptions
4. Press `Enter` to open the selected project in your browser

### Keyboard Shortcuts

- `Enter` - Open project in browser
- `⌘ C` - Copy project URL to clipboard
- `⌘ ⇧ C` - Copy project path to clipboard

### Visual Indicators

- ⭐ Yellow star icon - Starred projects (higher ranking)
- 📁 Blue folder icon - Regular projects
- 📊 Score badge - Relevance score (when enabled in preferences)

## Configuration

### Extension Preferences

Access via Raycast Settings → Extensions → GLF

| Preference | Description | Default |
|------------|-------------|---------|
| GLF Binary Path | Path to glf executable | `/usr/local/bin/glf` |
| Show Relevance Scores | Display search ranking scores | `false` |
| Maximum Results | Limit number of results | `20` |

### GLF Configuration

GLF uses `~/.config/glf/config.yaml` for configuration:

```yaml
gitlab:
  url: "https://gitlab.example.com"
  token: "your-personal-access-token"
  timeout: 30

cache:
  dir: "~/.cache/glf"
```

You can also use environment variables:

```bash
export GLF_GITLAB_URL="https://gitlab.example.com"
export GLF_GITLAB_TOKEN="your-token-here"
```

## Troubleshooting

### "GLF binary not found"

**Solution**: Install GLF or update the binary path in extension preferences.

```bash
# Find GLF path
which glf

# Update preference if not in /usr/local/bin/glf
```

### "No projects in cache"

**Solution**: Sync projects from GitLab.

```bash
glf sync
```

### "GLF not configured"

**Solution**: Run the GLF configuration wizard.

```bash
glf --init
```

### "Connection timeout" or "Invalid token"

**Solution**: Check GLF configuration and network connectivity.

```bash
# Verify configuration
cat ~/.config/glf/config.yaml

# Test connection with verbose logging
glf sync --verbose

# Regenerate token if expired
# GitLab → User Settings → Access Tokens → Create token with read_api scope
```

### Slow search performance

**Solution**:
1. Check if sync is running in background (GLF auto-syncs on startup)
2. Reduce maximum results in preferences
3. Check GLF cache size and re-sync if needed:

```bash
# Check cache
ls -lah ~/.cache/glf/

# Clear and re-sync
rm -rf ~/.cache/glf/
glf sync
```

## How It Works

1. **Search Input**: As you type, the extension calls `glf --json [query]`
2. **Debouncing**: 300ms delay prevents excessive CLI calls
3. **JSON Parsing**: GLF returns structured JSON with project metadata
4. **Smart Ranking**: Results sorted by:
   - Search relevance (fuzzy + full-text matching)
   - Usage history (frequently selected projects)
   - Starred status (+50 points boost)
   - Query-specific boost (3x for exact query matches)
5. **Display**: Projects rendered with icons, metadata, and actions

## Privacy & Security

- **Local-first**: All data stored locally in `~/.cache/glf/`
- **No tracking**: Extension doesn't send data to external services
- **Token security**: GitLab token stored in GLF config file (`~/.config/glf/config.yaml`)
- **Read-only**: Extension only reads GLF output, doesn't modify data

## Contributing

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/igusev/glf/issues).

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on [GLF](https://github.com/igusev/glf) - GitLab Fuzzy Finder CLI
- Powered by [Raycast](https://www.raycast.com/) - Productivity tool for macOS
