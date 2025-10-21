# Icon Requirements

The extension requires an `icon.png` file in the `assets/` directory.

## Specifications

- **Format**: PNG
- **Size**: 512x512 pixels
- **Style**: Simple, recognizable icon representing GitLab or fuzzy search
- **Recommended**: GitLab logo with search/magnifying glass overlay

## Creating the Icon

You can:

1. Use GitLab's official logo (with appropriate licensing)
2. Create a custom icon combining:
   - GitLab tanuki icon
   - Search/magnifying glass symbol
   - Fuzzy/lightning bolt element
3. Use a simple abstract representation of project search

## Tools

- Figma/Sketch for vector design
- Export as PNG at 512x512
- Ensure transparency for rounded corners

## Placeholder

Until a proper icon is created, you can use a simple temporary icon:

```bash
# Create a simple colored square as placeholder (macOS)
# This requires ImageMagick: brew install imagemagick
convert -size 512x512 xc:"#FC6D26" assets/icon.png
```

Replace `#FC6D26` with GitLab's orange color or any preferred color.
