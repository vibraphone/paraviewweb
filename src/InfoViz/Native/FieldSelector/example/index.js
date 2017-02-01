/* global document */
import 'normalize.css';
import 'babel-polyfill';

import sizeHelper   from '../../../../Common/Misc/SizeHelper';

import CompositeClosureHelper from '../../../../../src/Common/Core/CompositeClosureHelper';
import FieldProvider from '../../../../../src/InfoViz/Core/FieldProvider';
import FieldHoverProvider from '../../../../../src/InfoViz/Core/FieldHoverProvider';
import LegendProvider from '../../../../../src/InfoViz/Core/LegendProvider';
import Histogram1DProvider from '../../../../../src/InfoViz/Core/Histogram1DProvider';
import HistogramBinHoverProvider from '../../../../../src/InfoViz/Core/HistogramBinHoverProvider';
import SelectionProvider from '../../../../../src/InfoViz/Core/SelectionProvider';
import Workbench from '../../../../Component/Native/Workbench';

import FieldSelector from '../../../Native/FieldSelector';

import dataModel from './state.json';

const container = document.querySelector('.content');
container.style.height = '100vh';
container.style.width = '100vw';

const provider = CompositeClosureHelper.newInstance((publicAPI, model, initialValues = {}) => {
  Object.assign(model, initialValues);
  FieldProvider.extend(publicAPI, model, initialValues);
  FieldHoverProvider.extend(publicAPI, model, initialValues);
  LegendProvider.extend(publicAPI, model, initialValues);
  Histogram1DProvider.extend(publicAPI, model, initialValues);
  HistogramBinHoverProvider.extend(publicAPI, model);
  SelectionProvider.extend(publicAPI, model, initialValues);
})(dataModel);

// set provider behaviors
provider.setFieldsSorted(true);
provider.getFieldNames().forEach((name) => {
  provider.addLegendEntry(name);
});
provider.assignLegend(['colors', 'shapes']);

// Create field selector
const fieldSelector = FieldSelector.newInstance({ provider });
const fieldSelectorB = FieldSelector.newInstance({ provider, display: 'selected', fieldShowHistogram: false });

const viewports = {
  FieldSelectorA: {
    component: fieldSelector,
    viewport: 0,
    scroll: true,
  },
  FieldSelectorB: {
    component: fieldSelectorB,
    viewport: 1,
    scroll: true,
  },
};

const workbench = new Workbench();
workbench.setComponents(viewports);
workbench.setLayout('2x1');

workbench.setContainer(container);
workbench.setCenter(0.67, 0.5);

// Listen to window resize
sizeHelper.onSizeChange(() => {
  workbench.resize();
});
sizeHelper.startListening();

sizeHelper.triggerChange();

