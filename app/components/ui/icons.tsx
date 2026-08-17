type IconProps = { size?: number; className?: string };

function base(paths: React.ReactNode) {
  return function Icon({ size = 20, className = "" }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {paths}
      </svg>
    );
  };
}

export const IconPackage = base(
  <>
    <path d="M21 8.5 12 4 3 8.5l9 4.5 9-4.5Z" />
    <path d="M3 8.5V16l9 4.5 9-4.5V8.5" />
    <path d="M12 13v7.5" />
  </>
);

export const IconPlus = base(
  <>
    <path d="M12 5v14M5 12h14" />
  </>
);

export const IconTrash = base(
  <>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <path d="M9 7V4h6v3" />
  </>
);

export const IconDownload = base(
  <>
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M4 19h16" />
  </>
);

export const IconAlertTriangle = base(
  <>
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </>
);

export const IconClipboardCheck = base(
  <>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
    <path d="m9 13 2 2 4-4" />
  </>
);

export const IconUsers = base(
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M16 4.5a3 3 0 0 1 0 6" />
    <path d="M20 20c0-2.6-1.7-4.5-4-5.2" />
  </>
);

export const IconSearch = base(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </>
);

export const IconLogout = base(
  <>
    <path d="M15 17.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v.5" />
    <path d="M19 12H9m10 0-3-3m3 3-3 3" />
  </>
);

export const IconUpload = base(
  <>
    <path d="M12 21V9" />
    <path d="M7 14l5-5 5 5" />
    <path d="M4 21h16" />
  </>
);

export const IconClock = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </>
);

export const IconUser = base(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.9 3.6-6 8-6s8 2.1 8 6" />
  </>
);

export const IconLock = base(
  <>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </>
);

export const IconEye = base(
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

export const IconEyeOff = base(
  <>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a15.5 15.5 0 0 1-4 4.6M6.2 6.2C3.6 8 2 12 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.4-1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </>
);

export const IconShield = base(
  <>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </>
);

export const IconCheck = base(
  <>
    <path d="M4 12l5 5 11-11" />
  </>
);

export const IconX = base(
  <>
    <path d="M6 6l12 12M18 6 6 18" />
  </>
);

export const IconChartBar = base(
  <>
    <path d="M4 20V10" />
    <path d="M12 20V4" />
    <path d="M20 20v-6" />
  </>
);

export const IconArrowRight = base(
  <>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </>
);
