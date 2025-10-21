# Development Guide

This guide covers local development, testing, and publishing the GLF Raycast extension.

## Prerequisites

### Required Tools

- **Node.js**: v20.x or later
- **npm**: v10.x or later (comes with Node.js)
- **Raycast**: macOS app (for testing)
- **GLF**: Installed and configured (the extension being developed)

### Install Dependencies

```bash
cd raycast-glf-extension
npm install
```

This installs:
- `@raycast/api` - Raycast SDK
- `@raycast/utils` - Utility functions
- `@raycast/eslint-config` - ESLint configuration
- TypeScript, ESLint, Prettier

## Project Structure

```
raycast-glf-extension/
├── src/
│   ├── types.ts                 # TypeScript type definitions
│   ├── utils.ts                 # GLF CLI execution logic
│   └── search-projects.tsx      # Main search component
├── assets/
│   ├── icon.png                 # Extension icon (512x512)
│   └── ICON-README.md           # Icon creation guide
├── package.json                 # Extension manifest
├── tsconfig.json                # TypeScript configuration
├── .eslintrc.js                 # ESLint configuration
├── .prettierrc.json             # Prettier configuration
├── README.md                    # User documentation
├── CHANGELOG.md                 # Version history
├── LICENSE                      # MIT License
└── DEVELOPMENT.md               # This file
```

## Development Workflow

### 1. Start Development Mode

```bash
npm run dev
```

This command:
- Compiles TypeScript in watch mode
- Hot-reloads changes in Raycast
- Opens the extension in Raycast for testing

You can now:
- Open Raycast
- Type "Search GitLab Projects" to test the extension
- Make changes to source files - they'll reload automatically

### 2. Code Quality

#### Linting

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run fix-lint
```

#### Type Checking

TypeScript type checking runs automatically during development. To manually check:

```bash
npx tsc --noEmit
```

#### Code Formatting

```bash
# Format all files
npx prettier --write .

# Check formatting without writing
npx prettier --check .
```

### 3. Testing

#### Manual Testing Scenarios

Test these scenarios before releasing:

**Basic Search:**
- [ ] Empty search shows all projects
- [ ] Single-word search works (e.g., "api")
- [ ] Multi-word search works (e.g., "api storage")
- [ ] No results message appears for non-matching queries

**Ranking:**
- [ ] Starred projects appear with yellow star icon
- [ ] Frequently selected projects rank higher
- [ ] Relevance scores display correctly (when enabled)

**Actions:**
- [ ] Enter key opens project in browser
- [ ] ⌘C copies project URL
- [ ] ⌘⇧C copies project path
- [ ] All URLs open correctly in default browser

**Error Handling:**
- [ ] Missing GLF binary shows helpful error
- [ ] Unconfigured GLF shows setup instructions
- [ ] Empty cache shows sync reminder
- [ ] Network errors display appropriately

**Performance:**
- [ ] Search debouncing works (300ms delay)
- [ ] No lag with large result sets (100+ projects)
- [ ] Loading state displays during search

**Preferences:**
- [ ] GLF binary path can be customized
- [ ] Show scores toggle works correctly
- [ ] Max results limit is respected

#### Testing with Different GLF Configurations

```bash
# Test with missing binary
mv /usr/local/bin/glf /usr/local/bin/glf.bak
# Extension should show "GLF binary not found" error

# Test with unconfigured GLF
mv ~/.config/glf ~/.config/glf.bak
# Extension should show "GLF not configured" error

# Test with empty cache
rm -rf ~/.cache/glf/
# Extension should show "No projects in cache" error

# Restore after testing
mv /usr/local/bin/glf.bak /usr/local/bin/glf
mv ~/.config/glf.bak ~/.config/glf
glf sync
```

## Building for Production

### 1. Build the Extension

```bash
npm run build
```

This creates a production build in `dist/` directory.

### 2. Test Production Build

After building, test the extension in Raycast to ensure it works correctly.

## Publishing

### Option 1: Submit to Raycast Store (Recommended)

1. **Prepare for Submission:**

```bash
# Ensure all tests pass
npm run lint
npm run build

# Update version in package.json
# Update CHANGELOG.md
```

2. **Create Icon:**
   - See `assets/ICON-README.md` for requirements
   - 512x512 PNG with transparent background
   - GitLab-themed design

3. **Submit:**

```bash
npm run publish
```

This uses Raycast's official publishing tool which:
- Validates your extension
- Creates a PR to https://github.com/raycast/extensions
- Raycast team reviews and merges

4. **Review Process:**
   - Raycast team reviews code quality
   - Tests functionality
   - Verifies documentation
   - Usually takes 2-5 days

### Option 2: Manual Distribution

For internal/private use:

1. **Build:**
   ```bash
   npm run build
   ```

2. **Share:**
   - Zip the entire directory
   - Send to users
   - Users run `npm install && npm run dev`

## Troubleshooting Development Issues

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Raycast Not Loading Extension

```bash
# Restart Raycast
killall Raycast
open -a Raycast

# Clear Raycast cache (macOS)
rm -rf ~/Library/Caches/com.raycast.macos
```

### Hot Reload Not Working

1. Check if `npm run dev` is still running
2. Restart the dev server
3. Reload Raycast (⌘R in any Raycast window)

### ESLint Configuration Issues

```bash
# Regenerate ESLint config
npm install --save-dev @raycast/eslint-config@latest

# Clear ESLint cache
rm -rf .eslintcache
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript (`strict: true`)
- Define interfaces for all data structures
- Avoid `any` type - use `unknown` if needed
- Export types from `types.ts`

### React Components

- Use functional components only
- Use React hooks (`useState`, `useEffect`)
- Keep components focused and single-purpose
- Prefer composition over inheritance

### Error Handling

- Always provide helpful error messages
- Include solutions in error messages
- Never fail silently
- Log errors to console for debugging

### Naming Conventions

- **Files**: kebab-case (`search-projects.tsx`)
- **Components**: PascalCase (`SearchProjects`)
- **Functions**: camelCase (`searchGLF`)
- **Types/Interfaces**: PascalCase (`GLFProject`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_MAX_RESULTS`)

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes

### Commit Messages

Follow conventional commits format:

```
feat: add support for private projects
fix: handle timeout errors gracefully
docs: update installation instructions
chore: update dependencies
```

### Creating a Release

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release with changelog

## Performance Optimization

### Debouncing

Search is debounced by 300ms to prevent excessive GLF calls:

```typescript
useEffect(() => {
  const timeoutId = setTimeout(async () => {
    await performSearch(searchText);
  }, 300);
  return () => clearTimeout(timeoutId);
}, [searchText]);
```

### Caching

GLF handles caching internally. Extension simply calls `glf --json` which:
- Uses local cache (`~/.cache/glf/`)
- Auto-syncs in background
- Returns results instantly

### Rendering

- Use `List` component for efficient rendering
- Limit results with `--limit` flag (default: 20)
- Avoid re-rendering with proper React dependencies

## Debugging

### Enable Verbose Logging

Add debug logging in development:

```typescript
// In utils.ts
console.log("GLF command:", cmd);
console.log("GLF output:", stdout);
console.error("GLF error:", stderr);
```

### Inspect Raycast Console

Open Raycast console to see logs:
- In Raycast, open any extension
- Press ⌘⌥I (Cmd+Option+I)
- View console output

### Test GLF Directly

```bash
# Test GLF JSON output
glf --json api

# Test with scores
glf --json --scores backend

# Test with limit
glf --json --limit 5

# Test without query (all projects)
glf --json
```

## Resources

- [Raycast API Documentation](https://developers.raycast.com/)
- [Raycast Extension Examples](https://github.com/raycast/extensions)
- [GLF Documentation](https://github.com/igusev/glf)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

## Support

- **Extension Issues**: Open issue on GitHub
- **GLF Issues**: https://github.com/igusev/glf/issues
- **Raycast API**: https://raycast.com/developers
