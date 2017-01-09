import d3 from 'd3';

import style from 'PVWStyle/InfoVizNative/CDF.mcss';
import FieldProvider from '../../../InfoViz/Core/FieldProvider';
import CompositeClosureHelper from '../../../Common/Core/CompositeClosureHelper';

import dataModel from '../HistogramSelector/example/state.json';

function cdf(publicAPI, model) {

  publicAPI.resize = () => {
    if (!model.container) {
      return;
    }

    const rect = model.container.getBoundingClientRect();
    const smaller = rect.width < rect.height ? rect.width : rect.height;
    const tx = rect.width / smaller;
    const ty = rect.height / smaller;
    model.handleFraction = (smaller - (model.dividers.length - 2) * model.handleSize) / smaller;
    model.svg
      .attr('width', rect.width)
      .attr('height', rect.height);
    if (smaller > 0.0) {
      model.transformGroup.attr('transform',
        `scale(${smaller / 2.0}, ${smaller / 2.0}) translate(${tx}, ${ty})`);
    }
  };

  publicAPI.setContainer = (el) => {
    model.container = el;
    model.field = 'age';
    model.dividers = [0.0, 0.25, 0.6, 0.75, 1.0];

    if (model.container) {
      model.svg = d3.select(model.container).append('svg');
      model.height = 256;
      model.width = 128;
      model.handleSize = 16;
      model.transformGroup = model.svg.append('g').classed(style.transformGroup, true);

      publicAPI.resize(); // Apply a transform to the transformGroup based on the size of the SVG.
      publicAPI.histogramChanged(); // Add CDFs to the SVG
    }
  };

  publicAPI.histogramChanged = () => {
    const field = dataModel.histogram1D_storage[32][model.field];
    field.delta = field.max - field.min;
    const histo = field.counts;
    const nbins = histo.length;
    const cumcnt = histo.reduce((cdf, entry) => cdf.concat([entry + cdf[cdf.length - 1]]), [0]);
    const cdf = cumcnt.map(x => x / cumcnt[cumcnt.length - 1]);
    const tricky = cdf.reduce((segs, entry, ii) => {
      //const val = field.min + (field.delta * ii / nbins);
      const val = ii / nbins;
      const curseg = segs.out[segs.curdiv];
      if (entry > segs.dividers[segs.curdiv]) {
        curseg.push({ x: curseg[curseg.length - 1].x, y: segs.dividers[segs.curdiv] });
        curseg.push({ x: val, y: segs.dividers[segs.curdiv] });
        segs.out.push([{ x: val, y: segs.dividers[segs.curdiv] }, { x: val, y: entry }]);
        segs.curdiv++;
      } else {
        if (curseg.length > 0) {
          curseg.push({ x: curseg[curseg.length - 1].x, y: entry });
        }
        curseg.push({ x: val, y: entry });
      }
      return segs;
    }, { curdiv: 0, dividers: model.dividers.slice(1, 4), out: [[]] }).out.map(
      (segment, segmentIndex) => ({
        quantile: segmentIndex,
        path: [{ x: 0, y: segment[0].y}]
          .concat(segment)
          .concat([{ x: 0, y: segment[segment.length - 1].y }, { x: 0, y: segment[0].y }]),
      })
    );
    const hdata = model.svg.selectAll(`g.${style.quantile}`).data(tricky);
    hdata.enter().append('g').classed(style.quantile, true).append('path');
    hdata.exit().remove();
    model.svg.selectAll(`g.${style.quantile}`)
      .attr('transform', (dd, ii) => `translate(${model.handleSize}, ${model.handleSize * (model.dividers.length - ii - 1)})`);
    model.svg.selectAll(`g.${style.quantile} path`)
      .attr('d', segment => `M ${segment.path.map(pt => `${model.width * pt.x} ${(1. - pt.y) * model.height}`).join(' L ')}`);
  };
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  container: null,
  transitionTime: 500,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  CompositeClosureHelper.destroy(publicAPI, model);
  CompositeClosureHelper.isA(publicAPI, model, 'VizComponent');
  CompositeClosureHelper.get(publicAPI, model, ['container', 'transitionTime']);
  CompositeClosureHelper.set(publicAPI, model, ['transitionTime']);

  cdf(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = CompositeClosureHelper.newInstance(extend);

// ----------------------------------------------------------------------------

export default { newInstance, extend };
