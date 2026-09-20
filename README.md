<div align="center">

# xplat-icons

</div>

正方形の PNG 画像から、Windows、macOS、Linux、Web、PWA（Progressive Web App）向けのアイコンセットを生成します。

## 使用方法

Bun 1.4 以降が必要です。`npx` と `bunx` のどちらで起動する場合も Bun を使用します。

```sh
npx xplat-icons <path/to/source.png> <path/to/output-folder>
```

## 出力ファイル

| ファイル | 画像サイズ (px) | 主な用途 | 備考 |
| --- | --- | --- | --- |
| `icon.ico` | 16, 24, 32, 48, 64, 128, 256 | Windows アプリ / Electron / Tauri | |
| `icon.icns` | 16 ~ 1024 | macOS アプリ / Electron / Tauri | 標準／Retina を収録 |
| `16x16.png` | 16 | Linux デスクトップ / Electron | |
| `24x24.png` | 24 | Linux デスクトップ | Windows 補助サイズ |
| `32x32.png` | 32 | Linux デスクトップ / Electron / Tauri | |
| `48x48.png` | 48 | Linuxデスクトップ / Electron | |
| `64x64.png` | 64 | Linuxデスクトップ / Electron | |
| `128x128.png` | 128 | Linux デスクトップ / Electron / Tauri | |
| `128x128@2x.png` | 256 / 論理サイズ 128 | Tauri / 高密度ディスプレイ | Tauri 標準の Retina |
| `256x256.png` | 256 | Linux デスクトップ / Electron | 汎用アイコン |
| `icon.png` | 512 | Tauri / Linux デスクトップ | Tauri CLI の既定生成ファイル / 汎用アイコン |
| `512x512.png` | 512 | Linux デスクトップ / Electron | 汎用アイコン |
| `favicon.ico` | 16, 32, 48 | Web ファビコン | 旧ブラウザ互換 |
| `favicon-16x16.png` | 16 | Web ファビコン | |
| `favicon-32x32.png` | 32 | Web ファビコン | |
| `favicon-48x48.png` | 48 | Web ファビコン | |
| `apple-touch-icon.png` | 180 | iOS / iPadOS のホーム画面アイコン | |
| `android-chrome-192x192.png` | 192 | Android / PWA | |
| `android-chrome-512x512.png` | 512 | Android / PWA | |
