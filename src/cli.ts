import { mkdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const USAGE = `\
Generate icon assets for Windows, macOS, Linux, Web, and PWA (Progressive Web App) in one go.

Usage:
  npx xplat-icons <path/to/source.png> <path/to/output-folder>
`;

// Keep these packaging names aligned with the app's icon manifest expectations.
const PNG_ICON_OUTPUTS = [
  ["16x16.png", 16],
  ["24x24.png", 24],
  ["32x32.png", 32],
  ["48x48.png", 48],
  ["64x64.png", 64],
  ["128x128.png", 128],
  ["128x128@2x.png", 256],
  ["256x256.png", 256],
  ["icon.png", 512],
  ["512x512.png", 512],
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon-48x48.png", 48],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
] as const;
const WINDOWS_ICON_SIZES = [16, 24, 32, 48, 64, 128, 256] as const;
const FAVICON_SIZES = [16, 32, 48] as const;
// ICNS type codes encode a logical point size and representation scale, not merely
// pixel dimensions. Keep both values explicit so Retina entries are not accidentally
// removed as duplicates when their rendered PNG matches a standard-size entry.
const MACOS_ICON_FRAMES = [
  { iconType: "icp4", logicalSize: 16, scale: 1 },
  { iconType: "ic11", logicalSize: 16, scale: 2 },
  { iconType: "icp5", logicalSize: 32, scale: 1 },
  { iconType: "ic12", logicalSize: 32, scale: 2 },
  { iconType: "icp6", logicalSize: 64, scale: 1 },
  { iconType: "ic07", logicalSize: 128, scale: 1 },
  { iconType: "ic13", logicalSize: 128, scale: 2 },
  { iconType: "ic08", logicalSize: 256, scale: 1 },
  { iconType: "ic14", logicalSize: 256, scale: 2 },
  { iconType: "ic09", logicalSize: 512, scale: 1 },
  { iconType: "ic10", logicalSize: 512, scale: 2 },
] as const;
const MINIMUM_SOURCE_PNG_SIZE = 1024;
const REQUIRED_ICON_SIZES = [
  ...new Set([
    ...PNG_ICON_OUTPUTS.map(([, iconSize]) => iconSize),
    ...WINDOWS_ICON_SIZES,
    ...MACOS_ICON_FRAMES.map(
      ({ logicalSize, scale }) => logicalSize * scale,
    ),
  ]),
];

function writeUnsignedInt16LittleEndian(
  bytes: Uint8Array,
  offset: number,
  value: number,
): void {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
}

function writeUnsignedInt32LittleEndian(
  bytes: Uint8Array,
  offset: number,
  value: number,
): void {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
  bytes[offset + 2] = (value >>> 16) & 0xff;
  bytes[offset + 3] = (value >>> 24) & 0xff;
}

function writeUnsignedInt32BigEndian(
  bytes: Uint8Array,
  offset: number,
  value: number,
): void {
  bytes[offset] = (value >>> 24) & 0xff;
  bytes[offset + 1] = (value >>> 16) & 0xff;
  bytes[offset + 2] = (value >>> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
}

function writeFourCharacterCode(
  bytes: Uint8Array,
  offset: number,
  fourCharacterCode: string,
): void {
  if (fourCharacterCode.length !== 4) {
    throw new Error(
      `Internal error: invalid four-character code ${fourCharacterCode}`,
    );
  }

  for (let characterIndex = 0; characterIndex < 4; characterIndex += 1) {
    bytes[offset + characterIndex] = fourCharacterCode.charCodeAt(characterIndex);
  }
}

function concatenateBytes(byteSequences: readonly Uint8Array[]): Uint8Array {
  const combinedBytes = new Uint8Array(
    byteSequences.reduce(
      (combinedLength, bytes) => combinedLength + bytes.length,
      0,
    ),
  );
  let destinationOffset = 0;
  for (const bytes of byteSequences) {
    combinedBytes.set(bytes, destinationOffset);
    destinationOffset += bytes.length;
  }
  return combinedBytes;
}

async function renderPngAtSize(
  sourcePngPath: string,
  iconSize: number,
): Promise<Uint8Array> {
  return new Bun.Image(sourcePngPath)
    .resize(iconSize, iconSize, { filter: "lanczos3" })
    .png({ colors: 256, compressionLevel: 9, dither: false, palette: false })
    .bytes();
}

async function requestApproval(message: string): Promise<boolean> {
  const commandLineInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      const answer = (
        await commandLineInterface.question(`${message} [y/n] `)
      )
        .trim()
        .toLowerCase();
      if (["y", "yes"].includes(answer)) {
        return true;
      }
      if (["n", "no"].includes(answer)) {
        return false;
      }
      console.log('Please answer "y" or "n".');
    }
  } finally {
    commandLineInterface.close();
  }
}

async function prepareOutputDirectory(outputDirectory: string): Promise<void> {
  try {
    const outputPathMetadata = await stat(outputDirectory);
    if (!outputPathMetadata.isDirectory()) {
      throw new Error(`Output path must be a directory: ${outputDirectory}`);
    }
    return;
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }

    // Require approval before recursively creating a missing path so a typo cannot
    // silently create an unintended directory tree and receive generated assets.
    if (
      !(await requestApproval(
        `Output directory does not exist: ${outputDirectory}. Create it?`,
      ))
    ) {
      throw new Error(
        "Icon generation cancelled without creating the output directory",
      );
    }
    await mkdir(outputDirectory, { recursive: true });
  }
}

function getRequiredPngFrame(
  pngFramesBySize: ReadonlyMap<number, Uint8Array>,
  iconSize: number,
): Uint8Array {
  const pngFrame = pngFramesBySize.get(iconSize);
  if (pngFrame === undefined) {
    throw new Error(`Internal error: missing ${iconSize}x${iconSize} icon frame`);
  }
  return pngFrame;
}

function createIco(
  pngFramesBySize: ReadonlyMap<number, Uint8Array>,
  iconSizes: readonly number[],
): Uint8Array {
  const iconDirectory = new Uint8Array(6 + iconSizes.length * 16);
  writeUnsignedInt16LittleEndian(iconDirectory, 0, 0);
  writeUnsignedInt16LittleEndian(iconDirectory, 2, 1);
  writeUnsignedInt16LittleEndian(iconDirectory, 4, iconSizes.length);
  let frameDataOffset = iconDirectory.length;

  for (let frameIndex = 0; frameIndex < iconSizes.length; frameIndex += 1) {
    const iconSize = iconSizes[frameIndex];
    const pngFrame = getRequiredPngFrame(pngFramesBySize, iconSize);
    const directoryEntryOffset = 6 + frameIndex * 16;
    const encodedDimension = iconSize === 256 ? 0 : iconSize;
    iconDirectory[directoryEntryOffset] = encodedDimension;
    iconDirectory[directoryEntryOffset + 1] = encodedDimension;
    writeUnsignedInt16LittleEndian(iconDirectory, directoryEntryOffset + 4, 1);
    writeUnsignedInt16LittleEndian(iconDirectory, directoryEntryOffset + 6, 32);
    writeUnsignedInt32LittleEndian(
      iconDirectory,
      directoryEntryOffset + 8,
      pngFrame.length,
    );
    writeUnsignedInt32LittleEndian(
      iconDirectory,
      directoryEntryOffset + 12,
      frameDataOffset,
    );
    frameDataOffset += pngFrame.length;
  }

  return concatenateBytes([
    iconDirectory,
    ...iconSizes.map((iconSize) =>
      getRequiredPngFrame(pngFramesBySize, iconSize),
    ),
  ]);
}

function createMacOsIconElement(
  iconType: string,
  pngFrame: Uint8Array,
): Uint8Array {
  const iconElement = new Uint8Array(8 + pngFrame.length);
  writeFourCharacterCode(iconElement, 0, iconType);
  writeUnsignedInt32BigEndian(iconElement, 4, iconElement.length);
  iconElement.set(pngFrame, 8);
  return iconElement;
}

function createMacOsIcon(
  pngFramesBySize: ReadonlyMap<number, Uint8Array>,
): Uint8Array {
  const iconElements = MACOS_ICON_FRAMES.map(
    ({ iconType, logicalSize, scale }) =>
      createMacOsIconElement(
        iconType,
        getRequiredPngFrame(pngFramesBySize, logicalSize * scale),
      ),
  );
  const iconHeader = new Uint8Array(8);
  const iconFileLength =
    iconHeader.length +
    iconElements.reduce(
      (combinedLength, iconElement) => combinedLength + iconElement.length,
      0,
    );
  writeFourCharacterCode(iconHeader, 0, "icns");
  writeUnsignedInt32BigEndian(iconHeader, 4, iconFileLength);

  return concatenateBytes([iconHeader, ...iconElements]);
}

async function generateIconSet(
  sourcePngPath: string,
  outputDirectory: string,
): Promise<void> {
  const sourceMetadata = await new Bun.Image(sourcePngPath).metadata();
  if (sourceMetadata.format !== "png") {
    throw new Error(`Source image must be PNG, not ${sourceMetadata.format}`);
  }
  if (sourceMetadata.width !== sourceMetadata.height) {
    throw new Error(
      `Source PNG must be square: ${sourceMetadata.width}x${sourceMetadata.height}`,
    );
  }
  // Never silently upscale the source for the largest ICNS representation: require an
  // explicit decision because the generated file can be valid despite degraded artwork.
  if (
    sourceMetadata.width < MINIMUM_SOURCE_PNG_SIZE &&
    !(await requestApproval(
      `Source PNG is ${sourceMetadata.width}x${sourceMetadata.height}. Upscale it to ${MINIMUM_SOURCE_PNG_SIZE}x${MINIMUM_SOURCE_PNG_SIZE} and continue?`,
    ))
  ) {
    throw new Error("Icon generation cancelled without upscaling the source PNG");
  }

  await prepareOutputDirectory(outputDirectory);

  const pngFramesBySize = new Map(
    await Promise.all(
      REQUIRED_ICON_SIZES.map(async (iconSize) => [
        iconSize,
        await renderPngAtSize(sourcePngPath, iconSize),
      ] as const),
    ),
  );

  await Promise.all([
    ...PNG_ICON_OUTPUTS.map(([outputFileName, iconSize]) =>
      Bun.write(
        resolve(outputDirectory, outputFileName),
        getRequiredPngFrame(pngFramesBySize, iconSize),
      ),
    ),
    Bun.write(
      resolve(outputDirectory, "icon.ico"),
      createIco(pngFramesBySize, WINDOWS_ICON_SIZES),
    ),
    Bun.write(
      resolve(outputDirectory, "favicon.ico"),
      createIco(pngFramesBySize, FAVICON_SIZES),
    ),
    Bun.write(
      resolve(outputDirectory, "icon.icns"),
      createMacOsIcon(pngFramesBySize),
    ),
  ]);
}

interface CommandLineArguments {
  sourcePngPath: string;
  outputDirectory: string;
}

function parseCommandLineArguments(): CommandLineArguments | undefined {
  const commandLineArguments = process.argv.slice(2);
  // Treat invocation without arguments as an intentional help request so discovering
  // the command does not report a usage error before the caller has supplied paths.
  if (
    commandLineArguments.length === 0 ||
    (commandLineArguments.length === 1 &&
      ["-h", "--help"].includes(commandLineArguments[0]))
  ) {
    console.log(USAGE);
    return undefined;
  }
  if (commandLineArguments.length !== 2) {
    console.error(USAGE);
    process.exitCode = 2;
    return undefined;
  }

  return {
    sourcePngPath: commandLineArguments[0],
    outputDirectory: commandLineArguments[1],
  };
}

const commandLineArguments = parseCommandLineArguments();
if (commandLineArguments !== undefined) {
  const { sourcePngPath, outputDirectory } = commandLineArguments;
  try {
    const resolvedOutputDirectory = resolve(outputDirectory);
    await generateIconSet(sourcePngPath, resolvedOutputDirectory);
    console.log(
      `Wrote PNG, ICO, and ICNS icon set to ${resolvedOutputDirectory}`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
