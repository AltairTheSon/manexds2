export interface FigmaFile {
  document: FigmaDocument;
  components: { [key: string]: FigmaComponent };
  styles: { [key: string]: FigmaStyle };
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  schemaVersion: number;
  mainComponentKey: string;
  componentPropertyReferences: { [key: string]: string };
  componentProperties: { [key: string]: any };
  id?: string;
  key?: string;
}

export interface FigmaDocument {
  id: string;
  name: string;
  type: string;
  children: FigmaNode[];
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  cornerRadius?: number;
  characters?: string;
  style?: FigmaTypeStyle;
  absoluteBoundingBox?: FigmaRectangle;
  constraints?: FigmaLayoutConstraint;
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  effects?: FigmaEffect[];
  opacity?: number;
  blendMode?: string;
  preserveRatio?: boolean;
  layoutAlign?: string;
  layoutGrow?: number;
  layoutPositioning?: string;
  strokeAlign?: string;
  strokeCap?: string;
  strokeJoin?: string;
  dashPattern?: number[];
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  cornerRadius?: number;
  characters?: string;
  style?: FigmaTypeStyle;
  characterStyleOverrides?: number[];
  styleOverrideTable?: { [key: string]: FigmaTypeStyle };
  absoluteBoundingBox?: FigmaRectangle;
  constraints?: FigmaLayoutConstraint;
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  effects?: FigmaEffect[];
  opacity?: number;
  blendMode?: string;
  preserveRatio?: boolean;
  layoutAlign?: string;
  layoutGrow?: number;
  layoutPositioning?: string;
  strokeAlign?: string;
  strokeCap?: string;
  strokeJoin?: string;
  dashPattern?: number[];
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  remote: boolean;
  documentationLinks: FigmaDocumentationLink[];
}

export interface FigmaStyle {
  key: string;
  name: string;
  description: string;
  remote: boolean;
  styleType: string;
}

export interface FigmaPaint {
  type: string;
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
  blendMode?: string;
  gradientHandlePositions?: FigmaVector[];
  gradientStops?: FigmaColorStop[];
  imageRef?: string;
  scaleMode?: string;
  imageTransform?: number[][];
  scalingFactor?: number;
  filters?: FigmaPaintFilter;
  gifHash?: string;
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaVector {
  x: number;
  y: number;
}

export interface FigmaColorStop {
  position: number;
  color: FigmaColor;
}

export interface FigmaPaintFilter {
  exposure: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  highlights: number;
  shadows: number;
}

export interface FigmaTypeStyle {
  fontFamily: string;
  fontPostScriptName: string;
  paragraphSpacing: number;
  paragraphIndent: number;
  listSpacing: number;
  hangingPunctuation: boolean;
  hangingList: boolean;
  spaceBefore: number;
  spaceAfter: number;
  justification: string;
  textAutoResize: string;
  textCase: string;
  textDecoration: string;
  letterSpacing: number;
  fills: FigmaPaint[];
  hyperlink: FigmaHyperlink;
  opentypeFlags: { [key: string]: number };
  lineHeightPx: number;
  lineHeightPercent: number;
  lineHeightPercentFontSize: number;
  lineHeightUnit: string;
}

export interface FigmaHyperlink {
  type: string;
  url: string;
}

export interface FigmaRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigmaLayoutConstraint {
  type: string;
  value: number;
}

export interface FigmaEffect {
  type: string;
  visible: boolean;
  radius: number;
  color: FigmaColor;
  blendMode: string;
  offset: FigmaVector;
  spread: number;
  showShadowBehindNode: boolean;
}

export interface FigmaDocumentationLink {
  uri: string;
}

export interface FigmaFileResponse {
  err: string | null;
  status: number;
  meta: {
    images: { [key: string]: string };
  };
}

export interface FigmaImageResponse {
  err: string | null;
  images: { [key: string]: string };
  status: number;
}