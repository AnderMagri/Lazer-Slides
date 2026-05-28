import { create } from 'zustand';
import type {
  DeckProject,
  Slide,
  SlideType,
  ColumnCount,
  SlideColumn,
  SlideElement,
  HeadingElement,
} from '@/types/deck';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createColumn(): SlideColumn {
  return { id: generateId(), elements: [] };
}

function defaultColumnWidths(columns: ColumnCount): number[] {
  return Array.from({ length: columns }, () => Math.round(100 / columns));
}

function createSlide(type: SlideType, columns: ColumnCount = 1): Slide {
  const slide: Slide = {
    id: generateId(),
    type,
    columns,
    columnData: Array.from({ length: columns }, () => createColumn()),
    columnWidths: defaultColumnWidths(columns),
  };

  if (type === 'cover') {
    slide.title = 'Presentation Title';
    slide.subtitle = 'Subtitle or tagline goes here';
    slide.context = 'Date or additional context';
  } else if (type === 'title') {
    slide.sectionLabel = 'SECTION';
    slide.title = 'Section Title';
    slide.subtitle = 'Optional supporting text for this section';
    slide.showBadge = true;
  } else if (type === 'end') {
    slide.title = 'Thank You';
    slide.contactInfo = 'name@lazer.co | lazer.co';
  }

  return slide;
}

function createDefaultElement(type: SlideElement['type']): SlideElement {
  const base = { id: generateId(), sizing: 'hug' as const };

  switch (type) {
    case 'heading':
      return { ...base, type: 'heading', text: 'Heading', style: 'h1', showBadge: false, badgeText: 'Badge' };
    case 'body-text':
      return { ...base, type: 'body-text', text: 'Body text goes here. Edit this in the right panel.', style: 'body' };
    case 'quote':
      return { ...base, type: 'quote', text: 'Quote text goes here', attribution: '— Author Name' };
    case 'stat':
      return { ...base, type: 'stat', value: '100%', label: 'Metric label', layout: 'stacked' };
    case 'image':
      return { ...base, type: 'image', src: '', alt: 'Image description', fit: 'cover', isBackground: false };
    case 'divider':
      return { ...base, type: 'divider', color: 'brand' };
    case 'spacer':
      return { ...base, type: 'spacer', size: 'md' };
    case 'card':
      return { ...base, type: 'card', title: 'Card Title', body: 'Card body text', image: '' };
    case 'chart':
      return { ...base, type: 'chart', chartType: 'bar', data: [{ label: 'A', value: 40 }, { label: 'B', value: 70 }, { label: 'C', value: 55 }] };
    case 'person-card':
      return { ...base, type: 'person-card', name: 'Name', role: 'Role', avatar: '' };
    case 'icon-text':
      return { ...base, type: 'icon-text', icon: 'Star', text: 'Feature description', layout: 'horizontal' };
    case 'bullet-list':
      return { ...base, type: 'bullet-list', items: ['First item', 'Second item', 'Third item'] };
    case 'numbered-list':
      return { ...base, type: 'numbered-list', items: ['First step', 'Second step', 'Third step'], startNumber: 1 };
    default:
      return { ...base, type: 'heading', text: 'Heading', style: 'h1', showBadge: false, badgeText: '' } as HeadingElement;
  }
}

// ─── Store ───

interface EditorState {
  // Mode
  mode: 'landing' | 'editor' | 'present';

  // Project
  project: DeckProject | null;

  // Selection
  activeSlideId: string | null;
  activeColumnId: string | null;
  activeElementId: string | null;

  // UI state
  showElementPalette: boolean;
  targetColumnId: string | null;

  // Actions — Project
  createProject: (name: string) => void;
  loadProject: (json: string) => void;
  saveProject: () => string;

  // Actions — Mode
  setMode: (mode: EditorState['mode']) => void;

  // Actions — Slides
  addSlide: (type: SlideType) => void;
  deleteSlide: (slideId: string) => void;
  moveSlide: (slideId: string, direction: 'up' | 'down') => void;
  setActiveSlide: (slideId: string) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  setSlideColumns: (slideId: string, columns: ColumnCount) => void;
  changeSlideType: (slideId: string, newType: SlideType) => void;
  setColumnWidth: (slideId: string, columnIndex: number, delta: number) => void;

  // Actions — Elements
  addElement: (columnId: string, elementType: SlideElement['type']) => void;
  updateElement: (elementId: string, updates: Partial<SlideElement>) => void;
  deleteElement: (elementId: string) => void;
  moveElement: (elementId: string, direction: 'up' | 'down') => void;
  setActiveElement: (elementId: string | null) => void;

  // Actions — UI
  openElementPalette: (columnId: string) => void;
  closeElementPalette: () => void;
}

export const useDeckStore = create<EditorState>((set, get) => ({
  mode: 'landing',
  project: null,
  activeSlideId: null,
  activeColumnId: null,
  activeElementId: null,
  showElementPalette: false,
  targetColumnId: null,

  // ─── Project ───
  createProject: (name: string) => {
    const coverSlide = createSlide('cover');
    const project: DeckProject = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      slides: [coverSlide],
    };
    set({
      project,
      mode: 'editor',
      activeSlideId: coverSlide.id,
      activeColumnId: null,
      activeElementId: null,
    });
  },

  loadProject: (json: string) => {
    try {
      const project = JSON.parse(json) as DeckProject;
      set({
        project,
        mode: 'editor',
        activeSlideId: project.slides[0]?.id ?? null,
        activeColumnId: null,
        activeElementId: null,
      });
    } catch {
      console.error('Failed to load project');
    }
  },

  saveProject: () => {
    const { project } = get();
    if (!project) return '';
    const updated = { ...project, updatedAt: new Date().toISOString() };
    set({ project: updated });
    return JSON.stringify(updated, null, 2);
  },

  // ─── Mode ───
  setMode: (mode) => set({ mode }),

  // ─── Slides ───
  addSlide: (type: SlideType) => {
    const { project, activeSlideId } = get();
    if (!project) return;

    const newSlide = createSlide(type, type === 'column' ? 1 : 1);
    const slides = [...project.slides];
    const activeIndex = slides.findIndex(s => s.id === activeSlideId);
    slides.splice(activeIndex + 1, 0, newSlide);

    set({
      project: { ...project, slides },
      activeSlideId: newSlide.id,
      activeElementId: null,
    });
  },

  deleteSlide: (slideId: string) => {
    const { project } = get();
    if (!project || project.slides.length <= 1) return;

    const slides = project.slides.filter(s => s.id !== slideId);
    set({
      project: { ...project, slides },
      activeSlideId: slides[0]?.id ?? null,
      activeElementId: null,
    });
  },

  moveSlide: (slideId: string, direction: 'up' | 'down') => {
    const { project } = get();
    if (!project) return;

    const slides = [...project.slides];
    const index = slides.findIndex(s => s.id === slideId);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    [slides[index], slides[newIndex]] = [slides[newIndex], slides[index]];
    set({ project: { ...project, slides } });
  },

  setActiveSlide: (slideId: string) =>
    set({ activeSlideId: slideId, activeElementId: null }),

  updateSlide: (slideId: string, updates: Partial<Slide>) => {
    const { project } = get();
    if (!project) return;

    const slides = project.slides.map(s =>
      s.id === slideId ? { ...s, ...updates } : s
    );
    set({ project: { ...project, slides } });
  },

  setSlideColumns: (slideId: string, columns: ColumnCount) => {
    const { project } = get();
    if (!project) return;

    const slides = project.slides.map(s => {
      if (s.id !== slideId) return s;
      const columnData = [...s.columnData];
      while (columnData.length < columns) {
        columnData.push(createColumn());
      }
      return {
        ...s,
        columns,
        columnData: columnData.slice(0, columns),
        columnWidths: defaultColumnWidths(columns),
        layoutChosen: true,
      };
    });
    set({ project: { ...project, slides } });
  },

  changeSlideType: (slideId: string, newType: SlideType) => {
    const { project } = get();
    if (!project) return;

    const slides = project.slides.map(s => {
      if (s.id !== slideId) return s;
      // Preserve existing data, add defaults for new type
      const updated: Slide = { ...s, type: newType };
      if (newType === 'cover') {
        updated.title = updated.title || 'Presentation Title';
        updated.subtitle = updated.subtitle || 'Subtitle goes here';
        updated.context = updated.context || '';
      } else if (newType === 'title') {
        updated.title = updated.title || 'Section Title';
        updated.subtitle = updated.subtitle || '';
        updated.sectionLabel = updated.sectionLabel || 'SECTION';
      } else if (newType === 'end') {
        updated.title = updated.title || 'Thank You';
        updated.contactInfo = updated.contactInfo || '';
      } else if (newType === 'column') {
        if (!updated.columnData || updated.columnData.length === 0) {
          updated.columns = 1;
          updated.columnData = [createColumn()];
          updated.columnWidths = [100];
        }
        updated.layoutChosen = true;
      }
      return updated;
    });
    set({ project: { ...project, slides }, activeElementId: null });
  },

  setColumnWidth: (slideId: string, columnIndex: number, delta: number) => {
    const { project } = get();
    if (!project) return;

    const slides = project.slides.map(s => {
      if (s.id !== slideId || s.type !== 'column') return s;
      const widths = [...(s.columnWidths || defaultColumnWidths(s.columns))];
      const minWidth = 15; // minimum 15%

      // Apply delta to target column
      const newWidth = widths[columnIndex] + delta;
      if (newWidth < minWidth || newWidth > 85) return s;

      // Distribute the delta evenly across other columns
      const others = widths.length - 1;
      if (others === 0) return s;
      const perOther = -delta / others;

      // Check all others can absorb
      for (let i = 0; i < widths.length; i++) {
        if (i === columnIndex) continue;
        if (widths[i] + perOther < minWidth) return s;
      }

      widths[columnIndex] = newWidth;
      for (let i = 0; i < widths.length; i++) {
        if (i !== columnIndex) widths[i] += perOther;
      }

      // Round to integers
      const rounded = widths.map(w => Math.round(w));
      const diff = 100 - rounded.reduce((a, b) => a + b, 0);
      if (diff !== 0) rounded[0] += diff;

      return { ...s, columnWidths: rounded };
    });
    set({ project: { ...project, slides } });
  },

  // ─── Elements ───
  addElement: (columnId: string, elementType: SlideElement['type']) => {
    const { project } = get();
    if (!project) return;

    const element = createDefaultElement(elementType);

    const slides = project.slides.map(s => ({
      ...s,
      columnData: s.columnData.map(col =>
        col.id === columnId
          ? { ...col, elements: [...col.elements, element] }
          : col
      ),
    }));

    set({
      project: { ...project, slides },
      activeElementId: element.id,
      showElementPalette: false,
      targetColumnId: null,
    });
  },

  updateElement: (elementId: string, updates: Partial<SlideElement>) => {
    const { project } = get();
    if (!project) return;

    const slides = project.slides.map(s => ({
      ...s,
      columnData: s.columnData.map(col => ({
        ...col,
        elements: col.elements.map(el =>
          el.id === elementId ? { ...el, ...updates } as SlideElement : el
        ),
      })),
    }));
    set({ project: { ...project, slides } });
  },

  deleteElement: (elementId: string) => {
    const { project } = get();
    if (!project) return;

    const slides = project.slides.map(s => ({
      ...s,
      columnData: s.columnData.map(col => ({
        ...col,
        elements: col.elements.filter(el => el.id !== elementId),
      })),
    }));
    set({ project: { ...project, slides }, activeElementId: null });
  },

  moveElement: (elementId: string, direction: 'up' | 'down') => {
    const { project } = get();
    if (!project) return;

    const slides = project.slides.map(s => ({
      ...s,
      columnData: s.columnData.map(col => {
        const elements = [...col.elements];
        const index = elements.findIndex(el => el.id === elementId);
        if (index === -1) return col;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= elements.length) return col;
        [elements[index], elements[newIndex]] = [elements[newIndex], elements[index]];
        return { ...col, elements };
      }),
    }));
    set({ project: { ...project, slides } });
  },

  setActiveElement: (elementId: string | null) =>
    set({ activeElementId: elementId }),

  // ─── UI ───
  openElementPalette: (columnId: string) =>
    set({ showElementPalette: true, targetColumnId: columnId }),

  closeElementPalette: () =>
    set({ showElementPalette: false, targetColumnId: null }),
}));
