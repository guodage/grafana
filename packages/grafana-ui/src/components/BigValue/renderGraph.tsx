import React, { CSSProperties } from 'react';
import tinycolor from 'tinycolor2';

import { Chart, Geom } from 'bizcharts';
import { LayoutResult, LayoutType } from './styles';
import { BigValueSparkline, BigValueColorMode, BigValueGraphMode } from './BigValue';

export function renderGraph(layout: LayoutResult, sparkline?: BigValueSparkline) {
  if (!sparkline) {
    return null;
  }

  const data = sparkline.data.map(values => {
    return { time: values[0], value: values[1], name: 'A' };
  });

  const scales = {
    time: {
      type: 'time',
    },
  };

  const chartStyles: CSSProperties = {};
  const chartTopMargin = 8;

  // default to line graph
  const geomRender = getGraphGeom(layout.colorMode, layout.graphMode);
  switch (layout.type) {
    case LayoutType.Wide:
      chartStyles.width = `${layout.chartWidth}px`;
      chartStyles.height = `${layout.chartHeight - chartTopMargin}px`;
      break;
    case LayoutType.Stacked:
      chartStyles.position = 'absolute';
      chartStyles.bottom = '8px';
      break;
    case LayoutType.WideNoChart:
    case LayoutType.StackedNoChart:
      return null;
  }

  if (layout.chartWidth === layout.width) {
    chartStyles.position = 'absolute';
    chartStyles.bottom = 0;
    chartStyles.right = 0;
    chartStyles.left = 0;
    chartStyles.right = 0;
    chartStyles.top = 'unset';
  }

  return (
    <Chart
      height={layout.chartHeight - chartTopMargin}
      width={layout.chartWidth}
      data={data}
      animate={false}
      padding={[4, 0, 0, 0]}
      scale={scales}
      style={chartStyles}
    >
      {geomRender(layout)}
    </Chart>
  );
}
function getGraphGeom(colorMode: BigValueColorMode, graphMode: BigValueGraphMode) {
  // background color mode
  if (colorMode === BigValueColorMode.Background) {
    if (graphMode === BigValueGraphMode.Line) {
      return renderLineGeom;
    }
    if (graphMode === BigValueGraphMode.Area) {
      return renderAreaGeomOnColoredBackground;
    }
  }
  return renderClassicAreaGeom;
}

function renderLineGeom(layout: LayoutResult) {
  const lineStyle: any = {
    stroke: '#CCC',
    lineWidth: 2,
    shadowBlur: 10,
    shadowColor: '#444',
    shadowOffsetY: 7,
  };
  return <Geom type="line" position="time*value" size={2} color="white" style={lineStyle} shape="smooth" />;
}

function renderAreaGeomOnColoredBackground(layout: LayoutResult) {
  const lineColor = tinycolor(layout.valueColor)
    .brighten(40)
    .toRgbString();
  const lineStyle: any = {
    stroke: lineColor,
    lineWidth: 2,
  };
  return (
    <>
      <Geom type="area" position="time*value" size={0} color="rgba(255,255,255,0.4)" style={lineStyle} shape="smooth" />
      <Geom type="line" position="time*value" size={1} color={lineColor} style={lineStyle} shape="smooth" />
    </>
  );
}

function renderClassicAreaGeom(layout: LayoutResult) {
  const lineStyle: any = {
    opacity: 1,
    fillOpacity: 1,
  };
  const fillColor = tinycolor(layout.valueColor)
    .setAlpha(0.2)
    .toRgbString();
  lineStyle.stroke = layout.valueColor;
  return (
    <>
      <Geom type="area" position="time*value" size={0} color={fillColor} style={lineStyle} shape="smooth" />
      <Geom type="line" position="time*value" size={1} color={layout.valueColor} style={lineStyle} shape="smooth" />
    </>
  );
}

/* function renderAreaGeom(layout: LayoutResult) { */
/*   const lineStyle: any = { */
/*     opacity: 1, */
/*     fillOpacity: 1, */
/*   }; */
/*  */
/*   const color1 = tinycolor(layout.valueColor) */
/*     .darken(0) */
/*     .spin(20) */
/*     .toRgbString(); */
/*   const color2 = tinycolor(layout.valueColor) */
/*     .lighten(0) */
/*     .spin(-20) */
/*     .toRgbString(); */
/*  */
/*   const fillColor = `l (0) 0:${color1} 1:${color2}`; */
/*  */
/*   return <Geom type="area" position="time*value" size={0} color={fillColor} style={lineStyle} shape="smooth" />; */
/* } */
