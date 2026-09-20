<div align="center">

# xplat-icons

一键生成适用于 Windows、macOS、Linux、Web 和 PWA（渐进式 Web 应用）的图标资源

[![npm](https://img.shields.io/npm/v/xplat-icons)](https://www.npmjs.com/package/xplat-icons)

</div>

## 用法

需要 Bun 1.4 或更高版本。无论使用 `npx` 还是 `bunx` 启动，都会使用 Bun。

```sh
npx xplat-icons <path/to/source.png> <path/to/output-folder>
```

## 输出文件

| 文件 | 图片尺寸 (px) | 主要用途 | 备注 |
| --- | --- | --- | --- |
| `icon.ico` | 16, 24, 32, 48, 64, 128, 256 | Windows 应用 / Electron / Tauri | |
| `icon.icns` | 16 ~ 1024 | macOS 应用 / Electron / Tauri | 包含标准与 Retina 尺寸 |
| `16x16.png` | 16 | Linux 桌面 / Electron | |
| `24x24.png` | 24 | Linux 桌面 | Windows 补充尺寸 |
| `32x32.png` | 32 | Linux 桌面 / Electron / Tauri | |
| `48x48.png` | 48 | Linux 桌面 / Electron | |
| `64x64.png` | 64 | Linux 桌面 / Electron | |
| `128x128.png` | 128 | Linux 桌面 / Electron / Tauri | |
| `128x128@2x.png` | 256 / 逻辑尺寸 128 | Tauri / 高密度显示屏 | Tauri 标准 Retina 资源 |
| `256x256.png` | 256 | Linux 桌面 / Electron | 通用图标 |
| `icon.png` | 512 | Tauri / Linux 桌面 | Tauri CLI 默认生成文件 / 通用图标 |
| `512x512.png` | 512 | Linux 桌面 / Electron | 通用图标 |
| `favicon.ico` | 16, 32, 48 | Web 网站图标 | 兼容旧版浏览器 |
| `favicon-16x16.png` | 16 | Web 网站图标 | |
| `favicon-32x32.png` | 32 | Web 网站图标 | |
| `favicon-48x48.png` | 48 | Web 网站图标 | |
| `apple-touch-icon.png` | 180 | iOS / iPadOS 主屏幕图标 | |
| `android-chrome-192x192.png` | 192 | Android / PWA | |
| `android-chrome-512x512.png` | 512 | Android / PWA | |
