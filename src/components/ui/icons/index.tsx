/*
 * Icon components for the Property Management design system.
 *
 * Conventions:
 * - All icons are 24×24 (viewBox 0 0 24 24).
 * - Default size is 1em — icons scale with the parent's font-size. Override
 *   via className (e.g. `h-5 w-5`) or an explicit width/height prop.
 * - All strokes/fills use currentColor — icons inherit the parent's text color.
 *   Control color with Tailwind text-* utilities (e.g. `text-muted-foreground`).
 *
 * Usage:
 *   import { IconSearch } from "@/components/ui/icons";
 *   <IconSearch className="h-5 w-5 text-foreground" />
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  width: "1em",
  height: "1em",
  xmlns: "http://www.w3.org/2000/svg",
} as const;

const strokeProps = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function IconAddImage(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <g transform="scale(1.2)">
        <path
          d="M9.37492 16.0417H5.62492C4.70444 16.0417 3.95825 15.2955 3.95825 14.375V13.3333M3.95825 13.3333V5.62501C3.95825 4.70454 4.70444 3.95834 5.62492 3.95834H14.3749C15.2954 3.95834 16.0416 4.70454 16.0416 5.62501V10.2083L13.8213 7.86624C13.1385 7.07152 11.9012 7.09666 11.251 7.91682L11.2428 7.92746C11.1647 8.02846 9.96834 9.57576 9.10467 10.6745M3.95825 13.3333L6.24674 10.4223C6.89567 9.59676 8.13703 9.56976 8.82125 10.3663L9.10467 10.6745M9.10467 10.6745L10.2083 11.875M9.10467 10.6745C9.10167 10.6783 9.09875 10.6821 9.09575 10.6858"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M14.1667 12.2917V16.0417"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M16.0417 14.1667H12.2917"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

export function IconAiAgent(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M19.25 12.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H11.25M8.19234 19C8.6918 17.5752 9.75228 16 12 16C14.2477 16 15.3082 17.5752 15.8077 19M14.25 11C14.25 12.2426 13.2426 13.25 12 13.25C10.7574 13.25 9.75 12.2426 9.75 11C9.75 9.75736 10.7574 8.75 12 8.75C13.2426 8.75 14.25 9.75736 14.25 11ZM16.9999 4.75L16.3571 6.35705L14.75 6.9999L16.3571 7.64273L17 9.25L17.6429 7.64274L19.25 6.9999L17.6427 6.35699L16.9999 4.75Z"
        {...strokeProps}
      />
    </svg>
  );
}

export function IconArchive(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M18.25 8.75H5.75L6.57758 17.4396C6.67534 18.4661 7.53746 19.25 8.56857 19.25H15.4314C16.4625 19.25 17.3247 18.4661 17.4224 17.4396L18.25 8.75Z"
        {...strokeProps}
      />
      <path
        d="M19.25 5.75C19.25 5.19772 18.8023 4.75 18.25 4.75H5.75C5.19771 4.75 4.75 5.19772 4.75 5.75V7.75C4.75 8.30228 5.19772 8.75 5.75 8.75H18.25C18.8023 8.75 19.25 8.30228 19.25 7.75V5.75Z"
        {...strokeProps}
      />
      <path d="M9.75 13.25H14.25" {...strokeProps} />
    </svg>
  );
}

export function IconArrowDown(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <g transform="scale(1.2)">
        <path
          d="M14.375 11.4583L10 16.0417L5.625 11.4583"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M10 15.2083V3.95833"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path d="M13.75 6.75L19.25 12L13.75 17.25" {...strokeProps} />
      <path d="M19 12H4.75" {...strokeProps} />
    </svg>
  );
}

export function IconArrowUp(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <g transform="scale(1.2)">
        <path
          d="M14.375 8.54167L10 3.95833L5.625 8.54167"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M10 16.0417V4.79167"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

export function IconArrowUpRight(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path d="M17.25 15.25V6.75H8.75" {...strokeProps} />
      <path d="M17 7L6.75 17.25" {...strokeProps} />
    </svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M4.75 8.75C4.75 7.64543 5.64543 6.75 6.75 6.75H17.25C18.3546 6.75 19.25 7.64543 19.25 8.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V8.75Z"
        {...strokeProps}
      />
      <path d="M8 4.75V8.25" {...strokeProps} />
      <path d="M16 4.75V8.25" {...strokeProps} />
      <path d="M7.75 10.75H16.25" {...strokeProps} />
    </svg>
  );
}

export function IconCallIncoming(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M8.89286 4.75H6.06818C5.34017 4.75 4.75 5.34017 4.75 6.06818C4.75 13.3483 10.6517 19.25 17.9318 19.25C18.6598 19.25 19.25 18.6598 19.25 17.9318V15.1071L16.1429 13.0357L14.5317 14.6468C14.2519 14.9267 13.8337 15.0137 13.4821 14.8321C12.8858 14.524 11.9181 13.9452 10.9643 13.0357C9.98768 12.1045 9.41548 11.1011 9.12829 10.494C8.96734 10.1537 9.06052 9.76091 9.32669 9.49474L10.9643 7.85714L8.89286 4.75Z"
        {...strokeProps}
      />
      <path d="M19.25 4.75L14.75 9.25" {...strokeProps} />
      <path d="M14.75 5.75V9.25H18.25" {...strokeProps} />
    </svg>
  );
}

export function IconCaretDown(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M11.2318 14.0781C11.6316 14.5579 12.3684 14.5579 12.7682 14.0781L15.6332 10.6402C16.176 9.98886 15.7128 9 14.865 9H9.13504C8.2872 9 7.82405 9.98886 8.36682 10.6402L11.2318 14.0781Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconCaretRight(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M14.0781 12.7682C14.5579 12.3684 14.5579 11.6316 14.0781 11.2318L10.6402 8.36682C9.98886 7.82405 9 8.2872 9 9.13504V14.865C9 15.7128 9.98886 16.176 10.6402 15.6332L14.0781 12.7682Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconCheck({
  strokeWidth = 1.5,
  ...props
}: IconProps & { strokeWidth?: number }) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M7.75 13.0577L10.3971 15.75L17.75 8.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path d="M7 9.5L12.3167 15L17.6333 9.5" {...strokeProps} />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path d="M9 7L14.5 12.3167L9 17.6333" {...strokeProps} />
    </svg>
  );
}

export function IconCircleAlert(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M19.25 12.25C19.25 16.2541 16.0041 19.5 12 19.5C7.99594 19.5 4.75 16.2541 4.75 12.25C4.75 8.24594 7.99594 5 12 5C16.0041 5 19.25 8.24594 19.25 12.25Z"
        {...strokeProps}
      />
      <path
        d="M12 14.25C11.5858 14.25 11.25 14.5858 11.25 15C11.25 15.4142 11.5858 15.75 12 15.75V14.25ZM12.01 15.75C12.4242 15.75 12.76 15.4142 12.76 15C12.76 14.5858 12.4242 14.25 12.01 14.25V15.75ZM12 15.75H12.01V14.25H12V15.75Z"
        fill="currentColor"
      />
      <path d="M12 8.75V12.25" {...strokeProps} />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <g transform="scale(1.2)">
        <path
          d="M14.375 5.625L5.625 14.375"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M5.625 5.625L14.375 14.375"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

export function IconContact(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M6.75 19C6.75 19 8 15.75 12 15.75C16 15.75 17.25 19 17.25 19M14.25 10C14.25 10.5967 14.0129 11.169 13.591 11.591C13.169 12.0129 12.5967 12.25 12 12.25C11.4033 12.25 10.831 12.0129 10.409 11.591C9.98705 11.169 9.75 10.5967 9.75 10C9.75 9.40326 9.98705 8.83097 10.409 8.40901C10.831 7.98705 11.4033 7.75 12 7.75C12.5967 7.75 13.169 7.98705 13.591 8.40901C14.0129 8.83097 14.25 9.40326 14.25 10ZM7.75 19.25H16.25C17.0456 19.25 17.8087 18.9339 18.3713 18.3713C18.9339 17.8087 19.25 17.0456 19.25 16.25V7.75C19.25 6.95435 18.9339 6.19129 18.3713 5.62868C17.8087 5.06607 17.0456 4.75 16.25 4.75H7.75C6.95435 4.75 6.19129 5.06607 5.62868 5.62868C5.06607 6.19129 4.75 6.95435 4.75 7.75V16.25C4.75 17.0456 5.06607 17.8087 5.62868 18.3713C6.19129 18.9339 6.95435 19.25 7.75 19.25Z"
        {...strokeProps}
      />
    </svg>
  );
}

export function IconContacts(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M16.75 4.75H18.25C18.5152 4.75 18.7696 4.85536 18.9571 5.04289C19.1446 5.23043 19.25 5.48478 19.25 5.75V8.25M16.75 4.75H7.75C6.95435 4.75 6.19129 5.06607 5.62868 5.62868C5.06607 6.19129 4.75 6.95435 4.75 7.75V16.25C4.75 17.0456 5.06607 17.8087 5.62868 18.3713C6.19129 18.9339 6.95435 19.25 7.75 19.25H16.75M16.75 4.75V8.25M19.25 8.25H16.75M19.25 8.25V12M16.75 19.25H18.25C18.5152 19.25 18.7696 19.1446 18.9571 18.9571C19.1446 18.7696 19.25 18.5152 19.25 18.25V15.75M16.75 19.25V15.75M16.75 8.25V12M19.25 15.75H16.75M19.25 15.75V12M16.75 15.75V12M16.75 12H19.25M8.75 15.25C8.75 15.25 9.425 13.75 11 13.75C12.575 13.75 13.25 15.25 13.25 15.25M12.25 10C12.25 10.3315 12.1183 10.6495 11.8839 10.8839C11.6495 11.1183 11.3315 11.25 11 11.25C10.6685 11.25 10.3505 11.1183 10.1161 10.8839C9.8817 10.6495 9.75 10.3315 9.75 10C9.75 9.66848 9.8817 9.35054 10.1161 9.11612C10.3505 8.8817 10.6685 8.75 11 8.75C11.3315 8.75 11.6495 8.8817 11.8839 9.11612C12.1183 9.35054 12.25 9.66848 12.25 10Z"
        {...strokeProps}
      />
    </svg>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <g transform="scale(1.2)">
        <path
          d="M5.41659 12.7083C4.61117 12.7083 3.95825 12.0554 3.95825 11.25V5.62501C3.95825 4.70454 4.70444 3.95834 5.62492 3.95834H11.2499C12.0553 3.95834 12.7083 4.61126 12.7083 5.41668"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M14.3751 7.29166H8.95841C8.03794 7.29166 7.29175 8.03785 7.29175 8.95832V14.375C7.29175 15.2955 8.03794 16.0417 8.95841 16.0417H14.3751C15.2956 16.0417 16.0417 15.2955 16.0417 14.375V8.95832C16.0417 8.03785 15.2956 7.29166 14.3751 7.29166Z"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

export function IconEmail(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M4.75 7.75C4.75 6.64543 5.64543 5.75 6.75 5.75H17.25C18.3546 5.75 19.25 6.64543 19.25 7.75V16.25C19.25 17.3546 18.3546 18.25 17.25 18.25H6.75C5.64543 18.25 4.75 17.3546 4.75 16.25V7.75Z"
        {...strokeProps}
      />
      <path d="M5.5 6.5L12 12.25L18.5 6.5" {...strokeProps} />
    </svg>
  );
}

export function IconEndArrowClose(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path d="M4.75 4.75V19.25" {...strokeProps} />
      <path d="M8.75 12H19.25" {...strokeProps} />
      <path d="M15.75 8.75L19.25 12L15.75 15.25" {...strokeProps} />
    </svg>
  );
}

export function IconFilter(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M4.75 7C4.33579 7 4 7.33579 4 7.75C4 8.16421 4.33579 8.5 4.75 8.5V7ZM19.25 8.5C19.6642 8.5 20 8.16421 20 7.75C20 7.33579 19.6642 7 19.25 7V8.5ZM4.75 8.5H19.25V7H4.75V8.5Z"
        fill="currentColor"
      />
      <path
        d="M6.75 11C6.33579 11 6 11.3358 6 11.75C6 12.1642 6.33579 12.5 6.75 12.5V11ZM17.25 12.5C17.6642 12.5 18 12.1642 18 11.75C18 11.3358 17.6642 11 17.25 11V12.5ZM6.75 12.5H17.25V11H6.75V12.5Z"
        fill="currentColor"
      />
      <path
        d="M8.75 15C8.33579 15 8 15.3358 8 15.75C8 16.1642 8.33579 16.5 8.75 16.5V15ZM15.25 16.5C15.6642 16.5 16 16.1642 16 15.75C16 15.3358 15.6642 15 15.25 15V16.5ZM8.75 16.5H15.25V15H8.75V16.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconInbox(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M19.25 11.75L17.6644 6.20056C17.4191 5.34195 16.6344 4.75 15.7414 4.75H8.2586C7.36564 4.75 6.58087 5.34196 6.33555 6.20056L4.75 11.75"
        {...strokeProps}
      />
      <path
        d="M10.2142 12.3689C9.95611 12.0327 9.59467 11.75 9.17085 11.75H4.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V11.75H14.8291C14.4053 11.75 14.0439 12.0327 13.7858 12.3689C13.3745 12.9046 12.7276 13.25 12 13.25C11.2724 13.25 10.6255 12.9046 10.2142 12.3689Z"
        {...strokeProps}
      />
    </svg>
  );
}

export function IconIntegrations(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M4.75 6.75V8.25C4.75 9.35457 5.64543 10.25 6.75 10.25H8.25C9.35457 10.25 10.25 9.35457 10.25 8.25V6.75C10.25 5.64543 9.35457 4.75 8.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75Z"
        {...strokeProps}
      />
      <path d="M14.75 7H19.25" {...strokeProps} />
      <path d="M17 4.75V9.25" {...strokeProps} />
      <path
        d="M4.75 15.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H8.25C9.35457 19.25 10.25 18.3546 10.25 17.25V15.75C10.25 14.6454 9.35457 13.75 8.25 13.75H6.75C5.64543 13.75 4.75 14.6454 4.75 15.75Z"
        {...strokeProps}
      />
      <path
        d="M13.75 15.75V17.25C13.75 18.3546 14.6454 19.25 15.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V15.75C19.25 14.6454 18.3546 13.75 17.25 13.75H15.75C14.6454 13.75 13.75 14.6454 13.75 15.75Z"
        {...strokeProps}
      />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
        {...strokeProps}
      />
      <path
        d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
        {...strokeProps}
      />
      <path
        d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
        {...strokeProps}
      />
    </svg>
  );
}

export function IconMessage(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M12 18.25C15.5 18.25 19.25 16.5 19.25 12C19.25 7.5 15.5 5.75 12 5.75C8.5 5.75 4.75 7.5 4.75 12C4.75 13.0298 4.94639 13.9156 5.29123 14.6693C5.50618 15.1392 5.62675 15.6573 5.53154 16.1651L5.26934 17.5635C5.13974 18.2547 5.74527 18.8603 6.43651 18.7307L9.64388 18.1293C9.896 18.082 10.1545 18.0861 10.4078 18.1263C10.935 18.2099 11.4704 18.25 12 18.25Z"
        {...strokeProps}
      />
      <path
        d="M9.5 12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12C8.5 11.7239 8.72386 11.5 9 11.5C9.27614 11.5 9.5 11.7239 9.5 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 12C12.5 12.2761 12.2761 12.5 12 12.5C11.7239 12.5 11.5 12.2761 11.5 12C11.5 11.7239 11.7239 11.5 12 11.5C12.2761 11.5 12.5 11.7239 12.5 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 12C15.5 12.2761 15.2761 12.5 15 12.5C14.7239 12.5 14.5 12.2761 14.5 12C14.5 11.7239 14.7239 11.5 15 11.5C15.2761 11.5 15.5 11.7239 15.5 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconNote(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M13.75 19.25H6.75C6.21957 19.25 5.71086 19.0393 5.33579 18.6642C4.96071 18.2891 4.75 17.7804 4.75 17.25V6.75C4.75 6.21957 4.96071 5.71086 5.33579 5.33579C5.71086 4.96071 6.21957 4.75 6.75 4.75H17.25C17.7804 4.75 18.2891 4.96071 18.6642 5.33579C19.0393 5.71086 19.25 6.21957 19.25 6.75V13.75M13.75 19.25L19.25 13.75M13.75 19.25V14.75C13.75 14.4848 13.8554 14.2304 14.0429 14.0429C14.2304 13.8554 14.4848 13.75 14.75 13.75H19.25"
        {...strokeProps}
      />
    </svg>
  );
}

export function IconPause(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} fill="currentColor" {...props}>
      <rect height="14.5" rx="1" width="3.5" x="6.5" y="4.75" />
      <rect height="14.5" rx="1" width="3.5" x="14" y="4.75" />
    </svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} fill="currentColor" {...props}>
      <path d="M8 5.14V18.86C8 19.65 8.86 20.14 9.54 19.74L20.46 13.38C21.13 12.99 21.13 12.01 20.46 11.62L9.54 5.26C8.86 4.86 8 5.35 8 6.14V5.14Z" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M19.25 19.25L15.5 15.5M4.75 11C4.75 7.54822 7.54822 4.75 11 4.75C14.4518 4.75 17.25 7.54822 17.25 11C17.25 14.4518 14.4518 17.25 11 17.25C7.54822 17.25 4.75 14.4518 4.75 11Z"
        {...strokeProps}
      />
    </svg>
  );
}

export function IconSelector(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path
        d="M15.5 9.36L12 6L8.5 9.36M15.5 14.64L12 18L8.5 14.64"
        {...strokeProps}
      />
    </svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <path d="M4.75 8H7.25" {...strokeProps} />
      <path d="M12.75 8H19.25" {...strokeProps} />
      <path d="M4.75 16H12.25" {...strokeProps} />
      <path d="M17.75 16H19.25" {...strokeProps} />
      <path
        d="M10 10.25C11.2426 10.25 12.25 9.24264 12.25 8C12.25 6.75736 11.2426 5.75 10 5.75C8.75736 5.75 7.75 6.75736 7.75 8C7.75 9.24264 8.75736 10.25 10 10.25Z"
        {...strokeProps}
      />
      <path
        d="M15 18.25C16.2426 18.25 17.25 17.2426 17.25 16C17.25 14.7574 16.2426 13.75 15 13.75C13.7574 13.75 12.75 14.7574 12.75 16C12.75 17.2426 13.7574 18.25 15 18.25Z"
        {...strokeProps}
      />
    </svg>
  );
}

export function IconUploadMedia(props: IconProps) {
  return (
    <svg aria-hidden={true} {...baseProps} {...props}>
      <g transform="scale(1.2)">
        <path
          d="M9.37492 16.0417H5.62492C4.70444 16.0417 3.95825 15.2955 3.95825 14.375V13.3333M3.95825 13.3333V5.62501C3.95825 4.70454 4.70444 3.95834 5.62492 3.95834H14.3749C15.2954 3.95834 16.0416 4.70454 16.0416 5.62501V10.2083L13.8213 7.86624C13.1385 7.07152 11.9012 7.09666 11.251 7.91682L11.2428 7.92746C11.1647 8.02846 9.96834 9.57576 9.10467 10.6745M3.95825 13.3333L6.24674 10.4223C6.89567 9.59676 8.13703 9.56976 8.82125 10.3663L9.10467 10.6745M9.10467 10.6745L10.2083 11.875M9.10467 10.6745C9.10167 10.6783 9.09875 10.6821 9.09575 10.6858"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M14.1667 12.2917V16.0417"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M16.0417 14.1667H12.2917"
          {...strokeProps}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}
