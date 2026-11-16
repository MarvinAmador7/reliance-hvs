import { type ComponentProps, useId } from "react";

const cn = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/*
 * Fieldgeist brand, copied from the fieldgeist repo (packages/ui/src/components/logo.tsx)
 * for the Percy demo. The mark is redrawn as strokes from the 320px raster
 * (measured centerlines, within 1px of the source at that size); the wordmark
 * paths are the supplied vector verbatim. Both draw in currentColor.
 */

const MARK_VIEWBOX = "0 0 230.5 282.8";
/** The traced stroke, in viewBox units: 2% of the mark's height. */
const TRACED_STROKE = 5.8;
const WORDMARK_VIEWBOX = "0 0 963 194";

interface SvgLabelProps {
  className?: string;
  /** Names the image (role="img" + <title>). Without it the SVG is aria-hidden. */
  title?: string;
}

/** A titled SVG is an image named by its <title>; an untitled one is decoration. */
function BrandSvg({
  title,
  children,
  ...props
}: Omit<ComponentProps<"svg">, "role" | "title"> & { title?: string }) {
  const id = useId();
  if (!title) {
    return (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" {...props}>
        {children}
      </svg>
    );
  }
  return (
    <svg
      aria-labelledby={id}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title id={id}>{title}</title>
      {children}
    </svg>
  );
}

/**
 * The hexagon mark: line art in currentColor, no background. `strokeWidth` is
 * in viewBox units (282.8 tall) and defaults to the traced weight; thicker
 * strokes draw past the viewBox edge (overflow is visible), at most 0.3px
 * at the Logo sizes, so the geometry keeps its size and position.
 */
export function LogoMark({
  className,
  title,
  strokeWidth = TRACED_STROKE,
}: SvgLabelProps & { strokeWidth?: number }) {
  return (
    <BrandSvg
      className={cn("aspect-[230.5/282.8] h-6 w-auto shrink-0", className)}
      data-slot="logo-mark"
      fill="none"
      overflow="visible"
      stroke="currentColor"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      // Above the traced weight, the one acute join (miter ratio 2.3) would
      // grow a wedge into the mark; a limit of 2 bevels it and leaves the
      // hexagon's corners (ratio 1.2) mitered.
      strokeMiterlimit={strokeWidth > TRACED_STROKE ? 2 : undefined}
      strokeWidth={strokeWidth}
      title={title}
      viewBox={MARK_VIEWBOX}
    >
      <polygon points="113.7,3.5 227.6,73.6 227.6,208.6 117.2,279.4 3,207.7 3,72" />
      <polyline points="227.6,76.6 124.7,76.6 227,209" />
      <polyline points="227.6,76.2 176.7,143.8 111.1,264.1" />
      <polyline points="114.5,144.4 44.8,144.6 3,207.7" />
      <line x1="112.8" x2="57.8" y1="3.7" y2="106.6" />
      <line x1="3" x2="219.2" y1="70.5" y2="214" />
      <line x1="45.5" x2="118.4" y1="144.6" y2="278.6" />
    </BrandSvg>
  );
}

/** The "Fieldgeist" wordmark in currentColor. Cap height is 81% of its height. */
export function Wordmark({ className, title }: SvgLabelProps) {
  return (
    <BrandSvg
      className={cn("aspect-[963/194] h-6 w-auto shrink-0", className)}
      data-slot="wordmark"
      fill="currentColor"
      title={title}
      viewBox={WORDMARK_VIEWBOX}
    >
      <path d="M0 157.842V0.221997H99.012V18.87H9.546L19.092 9.102V81.474L9.546 71.706H95.016V89.91H9.546L19.092 80.142V157.842H0Z" />
      <path d="M123.945 157.842V40.182H142.593V157.842H123.945ZM123.501 21.756V0H143.037V21.756H123.501Z" />
      <path d="M221.931 160.506C210.831 160.506 201.211 157.99 193.071 152.958C185.079 147.926 178.863 140.822 174.423 131.646C170.131 122.322 167.985 111.444 167.985 99.012C167.985 86.58 170.131 75.776 174.423 66.6C178.863 57.424 185.005 50.32 192.849 45.288C200.841 40.108 210.239 37.518 221.043 37.518C231.255 37.518 240.283 39.96 248.127 44.844C255.971 49.58 262.039 56.536 266.331 65.712C270.771 74.888 272.991 86.062 272.991 99.234V104.784H187.521C188.261 117.364 191.591 126.836 197.511 133.2C203.579 139.564 211.719 142.746 221.931 142.746C229.627 142.746 235.917 140.97 240.801 137.418C245.833 133.718 249.311 128.908 251.235 122.988L271.215 124.542C268.107 135.05 262.187 143.708 253.455 150.516C244.871 157.176 234.363 160.506 221.931 160.506ZM187.521 88.356H252.567C251.679 76.96 248.349 68.598 242.577 63.27C236.953 57.942 229.775 55.278 221.043 55.278C212.015 55.278 204.541 58.09 198.621 63.714C192.849 69.19 189.149 77.404 187.521 88.356Z" />
      <path d="M322.422 157.842C315.614 157.842 310.064 156.066 305.772 152.514C301.48 148.962 299.334 143.338 299.334 135.642V0.221997H317.982V134.088C317.982 136.456 318.574 138.306 319.758 139.638C321.09 140.822 322.94 141.414 325.308 141.414H335.52V157.842H322.422Z" />
      <path d="M398.955 160.506C388.743 160.506 379.863 157.99 372.315 152.958C364.915 147.926 359.217 140.822 355.221 131.646C351.225 122.47 349.227 111.592 349.227 99.012C349.227 86.432 351.225 75.554 355.221 66.378C359.217 57.202 364.915 50.098 372.315 45.066C379.863 40.034 388.743 37.518 398.955 37.518C406.799 37.518 413.977 39.22 420.489 42.624C427.001 45.88 431.885 50.542 435.141 56.61V0.221997H453.789V157.842H436.917L436.251 140.082C432.995 146.446 428.037 151.478 421.377 155.178C414.717 158.73 407.243 160.506 398.955 160.506ZM402.729 142.746C409.685 142.746 415.531 140.97 420.267 137.418C425.151 133.866 428.851 128.834 431.367 122.322C433.883 115.662 435.141 107.892 435.141 99.012C435.141 89.836 433.883 81.992 431.367 75.48C428.851 68.968 425.151 64.01 420.267 60.606C415.531 57.054 409.685 55.278 402.729 55.278C392.369 55.278 384.081 59.2 377.865 67.044C371.797 74.74 368.763 85.396 368.763 99.012C368.763 112.48 371.797 123.136 377.865 130.98C384.081 138.824 392.369 142.746 402.729 142.746Z" />
      <path d="M531.702 193.806C523.266 193.806 515.644 192.4 508.836 189.588C502.028 186.776 496.33 182.78 491.742 177.6C487.154 172.42 484.046 166.426 482.418 159.618L501.954 158.286C503.73 163.762 506.838 168.054 511.278 171.162C515.866 174.418 522.674 176.046 531.702 176.046C542.358 176.046 550.498 173.9 556.122 169.608C561.894 165.316 564.78 158.878 564.78 150.294V131.202C561.968 137.418 557.454 142.376 551.238 146.076C545.022 149.776 538.066 151.626 530.37 151.626C520.454 151.626 511.574 149.184 503.73 144.3C496.034 139.416 489.966 132.682 485.526 124.098C481.234 115.514 479.088 105.672 479.088 94.572C479.088 83.324 481.234 73.482 485.526 65.046C489.818 56.462 495.738 49.728 503.286 44.844C510.982 39.96 519.714 37.518 529.482 37.518C537.77 37.518 545.17 39.442 551.682 43.29C558.342 47.138 563.004 52.318 565.668 58.83V40.182H583.428V149.85C583.428 159.026 581.356 166.87 577.212 173.382C573.068 180.042 567.148 185.074 559.452 188.478C551.756 192.03 542.506 193.806 531.702 193.806ZM531.258 133.866C541.322 133.866 549.388 130.388 555.456 123.432C561.524 116.328 564.632 106.708 564.78 94.572C564.928 86.432 563.596 79.476 560.784 73.704C558.12 67.784 554.198 63.27 549.018 60.162C543.986 56.906 538.066 55.278 531.258 55.278C520.898 55.278 512.832 58.83 507.06 65.934C501.436 72.89 498.624 82.436 498.624 94.572C498.624 106.708 501.51 116.328 507.282 123.432C513.202 130.388 521.194 133.866 531.258 133.866Z" />
      <path d="M662.679 160.506C651.579 160.506 641.959 157.99 633.819 152.958C625.827 147.926 619.611 140.822 615.171 131.646C610.879 122.322 608.733 111.444 608.733 99.012C608.733 86.58 610.879 75.776 615.171 66.6C619.611 57.424 625.753 50.32 633.597 45.288C641.589 40.108 650.987 37.518 661.791 37.518C672.003 37.518 681.031 39.96 688.875 44.844C696.719 49.58 702.787 56.536 707.079 65.712C711.519 74.888 713.739 86.062 713.739 99.234V104.784H628.269C629.009 117.364 632.339 126.836 638.259 133.2C644.327 139.564 652.467 142.746 662.679 142.746C670.375 142.746 676.665 140.97 681.549 137.418C686.581 133.718 690.059 128.908 691.983 122.988L711.963 124.542C708.855 135.05 702.935 143.708 694.203 150.516C685.619 157.176 675.111 160.506 662.679 160.506ZM628.269 88.356H693.315C692.427 76.96 689.097 68.598 683.325 63.27C677.701 57.942 670.523 55.278 661.791 55.278C652.763 55.278 645.289 58.09 639.369 63.714C633.597 69.19 629.897 77.404 628.269 88.356Z" />
      <path d="M738.998 157.842V40.182H757.646V157.842H738.998ZM738.554 21.756V0H758.09V21.756H738.554Z" />
      <path d="M833.875 160.506C823.367 160.506 814.413 158.804 807.013 155.4C799.761 151.996 794.063 147.334 789.919 141.414C785.923 135.346 783.629 128.464 783.037 120.768L802.573 119.436C803.757 126.54 806.791 132.238 811.675 136.53C816.559 140.674 823.959 142.746 833.875 142.746C841.867 142.746 848.231 141.488 852.967 138.972C857.851 136.308 860.293 132.09 860.293 126.318C860.293 123.21 859.553 120.62 858.073 118.548C856.593 116.476 853.707 114.7 849.415 113.22C845.123 111.592 838.759 110.038 830.323 108.558C819.075 106.486 810.195 103.97 803.683 101.01C797.319 97.902 792.731 94.128 789.919 89.688C787.255 85.1 785.923 79.698 785.923 73.482C785.923 62.974 789.771 54.39 797.467 47.73C805.163 40.922 816.115 37.518 830.323 37.518C839.943 37.518 848.009 39.294 854.521 42.846C861.181 46.25 866.361 50.838 870.061 56.61C873.909 62.234 876.425 68.45 877.609 75.258L858.073 76.59C857.185 72.446 855.557 68.82 853.189 65.712C850.821 62.456 847.713 59.94 843.865 58.164C840.017 56.24 835.429 55.278 830.101 55.278C821.665 55.278 815.449 56.906 811.453 60.162C807.457 63.418 805.459 67.562 805.459 72.594C805.459 76.442 806.347 79.624 808.123 82.14C810.047 84.508 813.081 86.506 817.225 88.134C821.369 89.614 826.919 90.946 833.875 92.13C845.863 94.202 855.187 96.718 861.847 99.678C868.507 102.638 873.169 106.264 875.833 110.556C878.497 114.848 879.829 120.102 879.829 126.318C879.829 133.57 877.757 139.786 873.613 144.966C869.617 149.998 864.141 153.846 857.185 156.51C850.377 159.174 842.607 160.506 833.875 160.506Z" />
      <path d="M943.797 157.842C933.141 157.842 925.223 155.4 920.043 150.516C915.011 145.632 912.495 138.01 912.495 127.65V12.654H931.143V127.206C931.143 132.534 932.327 136.234 934.695 138.306C937.063 140.378 940.689 141.414 945.573 141.414H962.445V157.842H943.797ZM895.179 56.61V40.182H962.445V56.61H895.179Z" />
    </BrandSvg>
  );
}

export type LogoSize = "sm" | "md" | "lg";

/** Wordmark height per size; everything else in the lockup scales from it (em). */
const LOGO_SIZE: Record<LogoSize, string> = {
  lg: "text-[32px]",
  md: "text-[24px]",
  sm: "text-[18px]",
};

/**
 * Mark stroke per size, in viewBox units. At the traced weight the mark's
 * lines render 0.39px at sm (a 19px mark) and 0.52px at md (25.4px), a hairline
 * beside the wordmark. md draws them at 1.26px (14 x 0.0898 px/unit); sm at
 * 1.01px (15 x 0.0673), because at 1.25px and up the seven inner lines of a
 * 15px-wide mark run together. lg (a 33.9px mark) keeps the traced weight.
 */
const MARK_STROKE: Record<LogoSize, number> = {
  lg: TRACED_STROKE,
  md: 14,
  sm: 15,
};

/**
 * Mark + wordmark lockup. Sizes set the wordmark height: sm 18px (same cap
 * height as the landing nav's old 21px text), md 24px, lg 32px. The mark is 1.3x
 * the wordmark's cap height (its pointed top and bottom read smaller than the
 * box), centered on the caps, with a gap of 0.35x the mark.
 */
export function Logo({
  className,
  size = "md",
  showWordmark = true,
}: {
  className?: string;
  size?: LogoSize;
  showWordmark?: boolean;
}) {
  return (
    <span
      aria-label="Fieldgeist"
      className={cn(
        "inline-flex shrink-0 items-start gap-[0.37em] leading-none",
        LOGO_SIZE[size],
        className
      )}
      data-size={size}
      data-slot="logo"
      role="img"
    >
      <LogoMark className="h-[1.058em]" strokeWidth={MARK_STROKE[size]} />
      {showWordmark ? <Wordmark className="mt-[0.122em] h-[1em]" /> : null}
    </span>
  );
}
