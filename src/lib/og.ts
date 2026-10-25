// Renders 1200x630 social preview images (Open Graph / Twitter cards) at build time.
// Satori turns the layout into an SVG with text as vector paths, so the result does not
// depend on fonts installed on the build machine; sharp then rasterizes it to PNG.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";
import { profile } from "../data/profile";

const root = process.cwd();
const fontFile = (pkg: string, file: string) => readFileSync(join(root, "node_modules", "@fontsource", pkg, "files", file));

const fonts = [
  { name: "JetBrains Mono", data: fontFile("jetbrains-mono", "jetbrains-mono-latin-700-normal.woff"), weight: 700 as const },
  { name: "JetBrains Mono", data: fontFile("jetbrains-mono", "jetbrains-mono-latin-400-normal.woff"), weight: 400 as const },
  { name: "IBM Plex Sans", data: fontFile("ibm-plex-sans", "ibm-plex-sans-latin-400-normal.woff"), weight: 400 as const }
];

let avatarDataUri: string | undefined;
async function getAvatar() {
  avatarDataUri ??= `data:image/png;base64,${(
    await sharp(join(root, "src", "assets", "avatar.jpg")).resize(128, 128).png().toBuffer()
  ).toString("base64")}`;
  return avatarDataUri;
}

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra }
});

const colors = {
  bg: "#0b0d0f",
  ink: "#f2f5f3",
  muted: "#8e9993",
  line: "rgba(255,255,255,0.12)",
  accent: "#5ee6a0",
  warm: "#f2c46d"
};

export interface OgOptions {
  /** Small label above the title, e.g. "notes" or "projects". */
  section: string;
  title: string;
  /** Shown under the title when there are no tags. */
  subtitle?: string;
  tags?: string[];
  /** Right side of the footer, e.g. ["Jul 27, 2026", "11 min read"]. */
  meta?: string[];
}

const WIDTH = 1200;
const HEIGHT = 630;
const PAD_X = 72;
const PAD_Y = 56;
const INNER = WIDTH - PAD_X * 2;

function titleSize(title: string) {
  if (title.length <= 30) return 76;
  if (title.length <= 55) return 62;
  if (title.length <= 85) return 52;
  return 44;
}

export async function renderOgImage({ section, title, subtitle, tags = [], meta = [] }: OgOptions) {
  const avatar = await getAvatar();

  const tree = h(
    "div",
    {
      // Satori sizes boxes as content-box, so subtract the padding to fill exactly WIDTH x HEIGHT.
      width: INNER,
      height: HEIGHT - PAD_Y * 2,
      display: "flex",
      flexDirection: "column",
      padding: `${PAD_Y}px ${PAD_X}px`,
      backgroundColor: colors.bg,
      backgroundImage: "radial-gradient(circle at 0% 0%, rgba(94,230,160,0.20), rgba(94,230,160,0) 55%)",
      color: colors.ink,
      fontFamily: "JetBrains Mono"
    },
    [
      h("div", { display: "flex", alignItems: "center", width: INNER, fontSize: 26 }, [
        h("span", { color: colors.accent }, "~/"),
        h("span", { fontWeight: 700 }, profile.handle),
        h("span", { color: colors.muted, marginLeft: 14 }, `/ ${section}`)
      ]),
      // Middle area takes the remaining height and centers the title vertically.
      h("div", { display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, width: INNER, flexGrow: 1 }, [
        h(
          "div",
          {
            display: "block",
            width: INNER,
            fontSize: titleSize(title),
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            lineClamp: 3
          },
          title
        ),
        tags.length > 0
          ? h(
              "div",
              { display: "flex", flexWrap: "wrap", gap: 12, width: INNER },
              tags.slice(0, 5).map((tag) =>
                h(
                  "span",
                  {
                    display: "flex",
                    padding: "6px 16px",
                    border: `1px solid ${colors.line}`,
                    borderRadius: 999,
                    color: colors.muted,
                    fontSize: 22
                  },
                  `#${tag}`
                )
              )
            )
          : h("div", { display: "flex", width: INNER, fontFamily: "IBM Plex Sans", fontSize: 30, color: colors.muted }, subtitle ?? "")
      ]),
      h(
        "div",
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: INNER,
          paddingTop: 24,
          borderTop: `1px solid ${colors.line}`
        },
        [
          h("div", { display: "flex", alignItems: "center", gap: 20 }, [
            h("img", { width: 64, height: 64, borderRadius: 999, border: `2px solid ${colors.accent}` }, undefined, {
              src: avatar,
              width: 64,
              height: 64
            }),
            h("div", { display: "flex", flexDirection: "column", gap: 4 }, [
              h("span", { fontSize: 26, fontWeight: 700 }, profile.name),
              h("span", { fontSize: 20, color: colors.accent, fontWeight: 400 }, profile.role)
            ])
          ]),
          h("div", { display: "flex", gap: 18, fontSize: 22, color: colors.muted, fontWeight: 400 }, meta.join("  ·  "))
        ]
      )
    ]
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: WIDTH, height: HEIGHT, fonts });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
