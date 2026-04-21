'use client'

import {
    FileText,
    Image as ImageIcon,
    Video,
    Music,
    Download,
    FileArchive,
    FileCode,
    FileSpreadsheet,
} from "lucide-react";

interface PreviewFileProps {
    fileName: string;
    fileUrl?: string;
    thumbnailBase64?: string; // base64 string from backend (images, videos, PDFs)
    isMine?: boolean;
}

export default function PreviewFile({
    fileName,
    fileUrl,
    thumbnailBase64,
    isMine = false,
}: Readonly<PreviewFileProps>) {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

    const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
    const isVideo = ["mp4", "mov", "webm", "avi"].includes(ext);
    const isAudio = ["mp3", "wav", "ogg", "aac", "flac"].includes(ext);
    const isArchive = ["zip", "rar", "tar", "gz", "7z"].includes(ext);
    const isCode = ["js", "ts", "py", "html", "css", "json", "xml", "sh"].includes(ext);
    const isSpreadsheet = ["xlsx", "xls", "csv"].includes(ext);
    const isPdf = ext === "pdf";

    const iconConfig = (() => {
        if (isImage)       return { Icon: ImageIcon,       bg: "bg-blue-100",    color: "text-blue-600" };
        if (isVideo)       return { Icon: Video,           bg: "bg-purple-100",  color: "text-purple-600" };
        if (isAudio)       return { Icon: Music,           bg: "bg-pink-100",    color: "text-pink-600" };
        if (isArchive)     return { Icon: FileArchive,     bg: "bg-yellow-100",  color: "text-yellow-600" };
        if (isCode)        return { Icon: FileCode,        bg: "bg-green-100",   color: "text-green-600" };
        if (isSpreadsheet) return { Icon: FileSpreadsheet, bg: "bg-emerald-100", color: "text-emerald-600" };
        if (isPdf)         return { Icon: FileText,        bg: "bg-red-100",     color: "text-red-500" };
        return             { Icon: FileText,               bg: "bg-gray-100",    color: "text-gray-500" };
    })();

    const { Icon, bg, color } = iconConfig;

    // Sender = indigo bubble; receiver = white card
    const bubbleBg     = isMine ? "bg-indigo-500"      : "bg-white";
    const borderStyle  = isMine ? "border-indigo-400"  : "border-gray-200";
    const nameColor    = isMine ? "text-white"          : "text-gray-900";
    const metaColor    = isMine ? "text-indigo-200"     : "text-gray-400";
    const downloadBg   = isMine
        ? "bg-white/20 hover:bg-white/30 text-white"
        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600";
    const dividerColor = isMine ? "border-indigo-400/40" : "border-gray-100";

    // Prefer the server-generated base64 thumbnail; for plain images fall back
    // to the fileUrl itself so we don't need a separate round-trip.
    const thumbnailSrc = thumbnailBase64 ?? (isImage ? fileUrl : undefined);
    const hasThumbnail = Boolean(thumbnailSrc);

    const fileTypeLabel = isImage ? "Image"
        : isVideo        ? "Video"
        : isAudio        ? "Audio"
        : isPdf          ? "PDF Document"
        : isArchive      ? "Archive"
        : isCode         ? "Source File"
        : isSpreadsheet  ? "Spreadsheet"
        : "File";

    return (
        <div className={`
            max-w-[260px] min-w-[220px] rounded-2xl overflow-hidden border shadow-sm
            ${bubbleBg} ${borderStyle}
        `}>
            {/* ── Thumbnail strip (images, videos, PDFs) ── */}
            {hasThumbnail && (
                <div className="w-full overflow-hidden rounded-t-xl">
                    <img
                        src={thumbnailSrc}
                        alt={fileName}
                        className="w-full max-h-48 object-cover"
                    />
                </div>
            )}

            {/* ── Info row ── */}
            <div className={`
                flex items-center gap-2.5 px-3 py-2.5
                ${hasThumbnail ? `border-t ${dividerColor}` : ""}
            `}>
                {/* Icon — shown only when there's no thumbnail preview */}
                {!hasThumbnail && (
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={20} className={color} />
                    </div>
                )}

                {/* Name + file type */}
                <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold truncate ${nameColor}`}>
                        {fileName}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${metaColor}`}>
                        {fileTypeLabel}
                    </p>
                </div>

                {/* Download */}
                <a
                    href={fileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition ${downloadBg}`}
                    title="Download"
                >
                    <Download size={15} />
                </a>
            </div>
        </div>
    );
}