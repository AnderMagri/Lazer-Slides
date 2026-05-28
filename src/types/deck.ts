// ─── Lazer Slides Data Model ───
// This is the JSON structure that gets saved/loaded

export type SlideType = 'cover' | 'title' | 'column' | 'end';
export type ColumnCount = 1 | 2 | 3;
export type ElementSizing = 'expand' | 'hug';

export type TextStyle =
  | 'display-mega'
  | 'display-hero'
  | 'display-title'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'label'
  | 'label-sm'
  | 'stat-hero'
  | 'quote';

export type ElementType =
  | 'heading'
  | 'body-text'
  | 'quote'
  | 'stat'
  | 'image'
  | 'divider'
  | 'spacer'
  | 'card'
  | 'chart'
  | 'person-card'
  | 'icon-text'
  | 'bullet-list'
  | 'numbered-list';

// ─── Element Palette Categories ───

export type ElementCategory = 'text' | 'media' | 'layout';

export const ELEMENT_CATEGORIES: Record<ElementCategory, { label: string; types: ElementType[] }> = {
  text: {
    label: 'Text',
    types: ['heading', 'body-text', 'quote', 'bullet-list', 'numbered-list', 'stat'],
  },
  media: {
    label: 'Media',
    types: ['image', 'card', 'chart', 'person-card', 'icon-text'],
  },
  layout: {
    label: 'Layout',
    types: ['divider', 'spacer'],
  },
};

// ─── Element Definitions ───

export interface BaseElement {
  id: string;
  type: ElementType;
  sizing: ElementSizing;
}

export interface HeadingElement extends BaseElement {
  type: 'heading';
  text: string;
  style: Extract<TextStyle, 'display-mega' | 'display-hero' | 'display-title' | 'h1' | 'h2' | 'h3'>;
  showBadge: boolean;
  badgeText: string;
}

export interface BodyTextElement extends BaseElement {
  type: 'body-text';
  text: string;
  style: Extract<TextStyle, 'body-lg' | 'body' | 'body-sm'>;
}

export interface QuoteElement extends BaseElement {
  type: 'quote';
  text: string;
  attribution: string;
}

export interface StatElement extends BaseElement {
  type: 'stat';
  value: string;
  label: string;
  layout: 'stacked' | 'inline';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt: string;
  fit: 'cover' | 'contain' | 'fill';
  isBackground: boolean;
}

export interface DividerElement extends BaseElement {
  type: 'divider';
  color: 'brand' | 'accent' | 'neutral';
}

export interface SpacerElement extends BaseElement {
  type: 'spacer';
  size: 'sm' | 'md' | 'lg';
}

export interface CardElement extends BaseElement {
  type: 'card';
  title: string;
  body: string;
  image?: string; // optional data URL for card image
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chartType: 'bar' | 'line';
  data: { label: string; value: number }[];
}

export interface PersonCardElement extends BaseElement {
  type: 'person-card';
  name: string;
  role: string;
  avatar: string;
}

export interface IconTextElement extends BaseElement {
  type: 'icon-text';
  icon: string; // Phosphor icon name
  text: string;
  layout: 'horizontal' | 'vertical';
}

export interface BulletListElement extends BaseElement {
  type: 'bullet-list';
  items: string[];
}

export interface NumberedListElement extends BaseElement {
  type: 'numbered-list';
  items: string[];
  startNumber: number;
}

export type SlideElement =
  | HeadingElement
  | BodyTextElement
  | QuoteElement
  | StatElement
  | ImageElement
  | DividerElement
  | SpacerElement
  | CardElement
  | ChartElement
  | PersonCardElement
  | IconTextElement
  | BulletListElement
  | NumberedListElement;

// ─── Column & Slide ───

export interface SlideColumn {
  id: string;
  elements: SlideElement[];
}

export interface Slide {
  id: string;
  type: SlideType;
  columns: ColumnCount;
  columnData: SlideColumn[];
  columnWidths?: number[]; // percentage widths per column, e.g. [50, 50] or [25, 50, 25]
  layoutChosen?: boolean;
  // Cover/Title/End specific
  title?: string;
  subtitle?: string;
  context?: string;
  sectionLabel?: string;
  showBadge?: boolean;
  contactInfo?: string;
}

// ─── Project ───

export interface DeckProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  slides: Slide[];
}

// ─── Settings ───

export interface AppSettings {
  claudeApiKey?: string;
  claudeConnection: 'api' | 'mcp';
}
