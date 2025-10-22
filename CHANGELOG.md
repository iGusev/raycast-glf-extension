# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-01-22

### Changed
- Unified icon usage: both extension and command now use `gitlab-logo.svg`
- Changed subtitle from "GLF" to "glf" (lowercase) for consistency

### Removed
- Removed unused icon files: `icon.png`, `gitlab-icon.svg`, `create-icon.sh`
- Removed unused dependency: `@raycast/utils`
- Removed unused code: variables, comments, and development documentation
- Cleaned up assets directory

### Improved
- Reduced total codebase size by ~16 lines
- Reduced asset size from 13KB PNG to 488B SVG
- Improved visual consistency across the extension

## [1.0.0] - 2025-01-20

### Added
- Initial release of GLF Raycast extension
- Search GitLab projects with fuzzy matching
- Real-time search with 300ms debounce
- Support for multi-token search queries
- Starred projects highlighting with yellow star icon
- Smart ranking combining search relevance, usage history, and starred status
- Three keyboard actions:
  - Open in browser (Enter)
  - Copy URL (⌘C)
  - Copy path (⌘⇧C)
- Configurable preferences:
  - GLF binary path
  - Show relevance scores toggle
  - Maximum results limit
- Comprehensive error handling:
  - Missing GLF binary
  - Unconfigured GLF
  - Empty cache
  - Connection errors
- Helpful error messages with solutions
- Complete documentation and troubleshooting guide

### Technical Details
- TypeScript implementation with strict type checking
- React components using Raycast API v1.90.0
- Child process execution for GLF CLI integration
- JSON parsing with error handling
- ESLint and Prettier configuration
- MIT License

[1.0.0]: https://github.com/igusev/glf/releases/tag/raycast-v1.0.0
