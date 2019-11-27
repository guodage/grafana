// Libraries
import { CSSProperties } from 'react';
import tinycolor from 'tinycolor2';

// Utils
import { getColorFromHexRgbOrName, GrafanaTheme } from '@grafana/data';
import { calculateFontSize } from '../../utils/measureText';

// Types
import { BigValueColorMode, BigValueGraphMode, Props, BigValueJustifyMode } from './BigValue';

const MIN_VALUE_FONT_SIZE = 20;
const MAX_VALUE_FONT_SIZE = 50;
const MIN_TITLE_FONT_SIZE = 14;
const TITLE_VALUE_RATIO = 0.45;
const VALUE_HEIGHT_RATIO_WIDE = 0.3;
const LINE_HEIGHT = 1.2;
const PANEL_PADDING = 16;
const CHART_HEIGHT_RATIO = 0.25;
const TITLE_HEIGHT_RATIO = 0.15;

export interface LayoutResult {
  titleFontSize: number;
  valueFontSize: number;
  chartHeight: number;
  chartWidth: number;
  type: LayoutType;
  width: number;
  height: number;
  colorMode: BigValueColorMode;
  graphMode: BigValueGraphMode;
  theme: GrafanaTheme;
  valueColor: string;
  justifyCenter: boolean;
}

export enum LayoutType {
  Stacked,
  StackedNoChart,
  Wide,
  WideNoChart,
}

export function shouldJustifyCenter(props: Props) {
  const { value, justifyMode } = props;
  if (justifyMode === BigValueJustifyMode.Center) {
    return true;
  }
  return (value.title ?? '').length === 0;
}

export function calculateLayout(props: Props): LayoutResult {
  const { width, height, sparkline, colorMode, theme, value, graphMode } = props;
  const useWideLayout = width / height > 2.8;
  const valueColor = getColorFromHexRgbOrName(value.color || 'green', theme.type);
  const justifyCenter = shouldJustifyCenter(props);

  let layoutType = LayoutType.Stacked;
  let chartHeight = 0;
  let chartWidth = 0;
  let titleHeight = 0;
  let titleFontSize = 0;
  let valueFontSize = 14;

  if (useWideLayout) {
    const maxTextWidth = width - PANEL_PADDING;
    const maxTextHeight = height - PANEL_PADDING;

    // Detect auto wide layout type
    layoutType = height > 80 && !!sparkline ? LayoutType.Wide : LayoutType.WideNoChart;

    // Wide no chart mode
    if (layoutType === LayoutType.WideNoChart) {
      if (value.title && value.title.length > 0) {
        titleFontSize = calculateFontSize(value.title, maxTextWidth * 0.6, maxTextHeight, LINE_HEIGHT);
        titleHeight = titleFontSize * LINE_HEIGHT;
      }

      valueFontSize = calculateFontSize(value.text, maxTextWidth * 0.3, maxTextHeight, LINE_HEIGHT);
    } else {
      // stacked left side
    }

    //
    // const titleFontSize = Math.max(valueFontSize * TITLE_VALUE_RATIO, MIN_TITLE_FONT_SIZE);
    // const chartHeight = height - PANEL_PADDING * 2;
    // const chartWidth = width / 2;
  } else {
    const maxTextWidth = width - PANEL_PADDING * 2;
    const maxTextHeight = height - PANEL_PADDING * 2;

    // Does the fit / exist?
    if (height < 100 || !sparkline) {
      layoutType = LayoutType.StackedNoChart;
    } else {
      // we have chart
      chartHeight = height * CHART_HEIGHT_RATIO;
      chartWidth = width - PANEL_PADDING * 2;

      if (graphMode === BigValueGraphMode.Area) {
        chartWidth = width;
        chartHeight += PANEL_PADDING;
      }
    }

    if (value.title && value.title.length > 0) {
      titleFontSize = calculateFontSize(value.title, maxTextWidth, height * TITLE_HEIGHT_RATIO, LINE_HEIGHT);
      titleHeight = titleFontSize * LINE_HEIGHT;
    }

    valueFontSize = calculateFontSize(value.text, maxTextWidth, maxTextHeight - chartHeight - titleHeight, LINE_HEIGHT);
  }

  return {
    valueFontSize,
    titleFontSize,
    chartHeight,
    chartWidth,
    type: layoutType,
    width,
    height,
    colorMode,
    graphMode,
    theme,
    valueColor,
    justifyCenter,
  };
}

export function getTitleStyles(layout: LayoutResult) {
  const styles: CSSProperties = {
    fontSize: `${layout.titleFontSize}px`,
    textShadow: '#333 0px 0px 1px',
    color: '#EEE',
  };

  if (layout.theme.isLight) {
    styles.color = 'white';
  }

  return styles;
}

export function getValueStyles(layout: LayoutResult) {
  const styles: CSSProperties = {
    fontSize: `${layout.valueFontSize}px`,
    color: '#EEE',
    textShadow: '#333 0px 0px 1px',
    fontWeight: 500,
    lineHeight: LINE_HEIGHT,
  };

  switch (layout.colorMode) {
    case BigValueColorMode.Value:
      styles.color = layout.valueColor;
  }
  return styles;
}

export function getValueAndTitleContainerStyles(layout: LayoutResult): CSSProperties {
  const styles: CSSProperties = {
    display: 'flex',
  };

  switch (layout.type) {
    case LayoutType.Wide:
      styles.flexDirection = 'column';
      styles.flexGrow = 1;
      break;
    case LayoutType.WideNoChart:
      styles.flexDirection = 'row';
      styles.justifyContent = 'space-between';
      styles.alignItems = 'center';
      styles.flexGrow = 1;
      break;
    case LayoutType.StackedNoChart:
      styles.flexDirection = 'column';
      styles.flexGrow = 1;
      break;
    case LayoutType.Stacked:
    default:
      styles.flexDirection = 'column';
      styles.justifyContent = 'center';
  }

  if (layout.justifyCenter) {
    styles.alignItems = 'center';
    styles.justifyContent = 'center';
  }

  return styles;
}

export function getPanelStyles(layout: LayoutResult) {
  const panelStyles: CSSProperties = {
    width: `${layout.width}px`,
    height: `${layout.height}px`,
    padding: `${PANEL_PADDING}px`,
    borderRadius: '3px',
    position: 'relative',
    display: 'flex',
  };

  const themeFactor = layout.theme.isDark ? 1 : -0.7;

  switch (layout.colorMode) {
    case BigValueColorMode.Background:
      const bgColor2 = tinycolor(layout.valueColor)
        .darken(15 * themeFactor)
        .spin(8)
        .toRgbString();
      const bgColor3 = tinycolor(layout.valueColor)
        .darken(5 * themeFactor)
        .spin(-8)
        .toRgbString();
      panelStyles.background = `linear-gradient(120deg, ${bgColor2}, ${bgColor3})`;
      break;
    case BigValueColorMode.Value:
      panelStyles.background = `${layout.theme.colors.dark4}`;
      break;
  }

  switch (layout.type) {
    case LayoutType.Stacked:
      panelStyles.flexDirection = 'column';
      break;
    case LayoutType.StackedNoChart:
      panelStyles.alignItems = 'center';
      break;
    case LayoutType.Wide:
      panelStyles.flexDirection = 'row';
      panelStyles.alignItems = 'center';
      panelStyles.justifyContent = 'space-between';
      break;
    case LayoutType.WideNoChart:
      panelStyles.alignItems = 'center';
      break;
  }

  if (layout.justifyCenter) {
    panelStyles.alignItems = 'center';
    panelStyles.flexDirection = 'row';
  }

  return panelStyles;
}
