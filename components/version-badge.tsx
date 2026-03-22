import { DEV_VERSION, DEV_UPDATED_AT } from "@/lib/version";

/** 개발 중 임시 버전/수정일시 표시 뱃지. 완성 후 제거 예정. */
export function VersionBadge() {
  return (
    <span className="inline-flex items-center gap-2 text-blue-200 text-xs font-mono ml-2 opacity-80">
      <span className="bg-blue-600 border border-blue-400 rounded px-1.5 py-0.5 text-white font-semibold tracking-wide">
        v{DEV_VERSION}
      </span>
      <span className="hidden sm:inline">{DEV_UPDATED_AT}</span>
    </span>
  );
}
