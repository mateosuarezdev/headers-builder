const MIME_TYPES = {
  // Text & Code
  html: "text/html; charset=utf-8",
  css: "text/css",
  javascript: "application/javascript",
  json: "application/json",
  xml: "application/xml",
  text: "text/plain; charset=utf-8",
  csv: "text/csv",
  markdown: "text/markdown; charset=utf-8",

  // Images
  png: "image/png",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  icon: "image/x-icon",
  bmp: "image/bmp",

  // Fonts
  woff: "font/woff",
  woff2: "font/woff2",
  truetype: "font/ttf",
  "embedded-opentype": "application/vnd.ms-fontobject",
  opentype: "font/otf",

  // Video
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",

  // Audio
  mpeg: "audio/mpeg",
  wav: "audio/wav",
  flac: "audio/flac",

  // Documents
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Archives
  zip: "application/zip",
  tar: "application/x-tar",
  gzip: "application/gzip",
  "7z": "application/x-7z-compressed",

  // Legacy mappings for file extensions (used by filePath())
  js: "application/javascript",
  txt: "text/plain; charset=utf-8",
  jpg: "image/jpeg",
  ico: "image/x-icon",
  ttf: "font/ttf",
  eot: "application/vnd.ms-fontobject",
  otf: "font/otf",
  mp3: "audio/mpeg",
  gz: "application/gzip",
} as const;

export function getMimeType(extension: keyof typeof MIME_TYPES): string {
  return MIME_TYPES[extension] || "application/octet-stream";
}
