<div align="center">

# xplat-icons

Generate icon assets for Windows, macOS, Linux, Web, and PWA (Progressive Web App) in one go

[![npm](https://img.shields.io/npm/v/xplat-icons)](https://www.npmjs.com/package/xplat-icons)
&nbsp;
[![🇯🇵](https://img.shields.io/badge/🇯🇵-日本語-789)](./README.ja.md)
[![🇨🇳](https://img.shields.io/badge/🇨🇳-简体中文-789)](./README.zh-CN.md)
[![🇺🇸](https://img.shields.io/badge/🇺🇸-English-789)](./README.md)

</div>

## Usage

Bun 1.4 or later is required. Bun is used whether you launch it with `npx` or `bunx`.

```sh
npx xplat-icons <path/to/source.png> <path/to/output-folder>
```

## Output Files

| File | Image Size (px) | Primary Use | Notes |
| --- | --- | --- | --- |
| `icon.ico` | 16, 24, 32, 48, 64, 128, 256 | Windows apps / Electron / Tauri | |
| `icon.icns` | 16 ~ 1024 | macOS apps / Electron / Tauri | Includes standard and Retina sizes |
| `16x16.png` | 16 | Linux desktop / Electron | |
| `24x24.png` | 24 | Linux desktop | Supplemental Windows size |
| `32x32.png` | 32 | Linux desktop / Electron / Tauri | |
| `48x48.png` | 48 | Linux desktop / Electron | |
| `64x64.png` | 64 | Linux desktop / Electron | |
| `128x128.png` | 128 | Linux desktop / Electron / Tauri | |
| `128x128@2x.png` | 256 / logical size 128 | Tauri / high-density displays | Standard Retina asset for Tauri |
| `256x256.png` | 256 | Linux desktop / Electron | General-purpose icon |
| `icon.png` | 512 | Tauri / Linux desktop | Default generated file for the Tauri CLI / general-purpose icon |
| `512x512.png` | 512 | Linux desktop / Electron | General-purpose icon |
| `favicon.ico` | 16, 32, 48 | Web favicon | Legacy browser compatibility |
| `favicon-16x16.png` | 16 | Web favicon | |
| `favicon-32x32.png` | 32 | Web favicon | |
| `favicon-48x48.png` | 48 | Web favicon | |
| `apple-touch-icon.png` | 180 | iOS / iPadOS home screen icon | |
| `android-chrome-192x192.png` | 192 | Android / PWA | |
| `android-chrome-512x512.png` | 512 | Android / PWA | |
