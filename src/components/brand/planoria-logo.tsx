import type { SVGProps } from "react";

// Actif de marque vectoriel partagé par les layouts.

export type PlanoriaLogoProps = Omit<
  SVGProps<SVGSVGElement>,
  "width" | "height"
> & {
  size?: number | string;
  title?: string;
};

const NAVY_PATH =
  "M309 240 310 918 649 919 649 1015 419 1015C480.4 1065.3 563.7 1085.5 642 1081C755.9 1073.5 861.8 1004.6 921 908L920 904 906 887 771 736 769 1015 670 1014 670 777 547 777 481 888 335 888 335 418 488 418C538.4 416.5 574.6 365 569 317C566.5 276.2 531 240.6 490 239ZM1101 681C1097 833.1 1019.6 980.7 901 1075C813.1 1144.2 699.6 1179.3 588 1172C467.2 1165.6 352.9 1104.7 275 1013C193 918 136.1 793.9 146 666C150.1 605.6 167.1 546.2 196 493L195 139 494 138C603.6 131.8 696.3 236.4 680 344C674.8 465 546.2 536.9 435 518L434 787 441 779 471 727 566 576 638 471 657 488 739 576 951 790 953 790 953 572 1088 572C1092 582 1102 631 1101 681ZM585 703 695 704 641 607Z";

const EMERALD_PATH =
  "M610 144C691.7 139.9 774.1 160.5 845 201C915.9 241.1 974.1 301.8 1015 372C1046.7 426.5 1069.5 486.2 1082 548L952 548C941.6 478.3 909.6 412.4 864 359C820.7 310.3 762.6 273 698 261C685 212.7 653.6 169.3 610 144Z";

export function PlanoriaLogo({
  size = 128,
  title = "Planoria",
  role = "img",
  ...props
}: PlanoriaLogoProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 1254 1254"
      role={role}
      aria-label={props["aria-label"] ?? title}
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      <title>{title}</title>
      <path fill="#082648" fillRule="evenodd" d={NAVY_PATH} />
      <path fill="#01B36E" d={EMERALD_PATH} />
    </svg>
  );
}

export default PlanoriaLogo;
