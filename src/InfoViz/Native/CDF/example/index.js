import 'normalize.css';

import                      CDF from '../../../../InfoViz/Native/CDF';
import            FieldProvider from '../../../../InfoViz/Core/FieldProvider';
import   CompositeClosureHelper from '../../../../Common/Core/CompositeClosureHelper';
import                Workbench from '../../../../Component/Native/Workbench';
import          BackgroundColor from '../../../../Component/Native/BackgroundColor';
import            ToggleControl from '../../../../Component/Native/ToggleControl';
import                   Spacer from '../../../../Component/Native/Spacer';
import                Composite from '../../../../Component/Native/Composite';
import             ReactAdapter from '../../../../Component/React/ReactAdapter';
import      WorkbenchController from '../../../../Component/React/WorkbenchController';
import              DataManager from '../../../../IO/Core/DataManager';


import { debounce } from '../../../../Common/Misc/Debounce';

import dataModel from '../../HistogramSelector/example/state.json';

const container = document.querySelector('.content');
container.style.height = '100vh';
container.style.width = '100vw';
d3.select('body').style('overflow', 'hidden'); // Safari otherwise intercepts wheel events

const provider = CompositeClosureHelper.newInstance((publicAPI, model, initialValues = {}) => {
  Object.assign(model, initialValues);
  FieldProvider.extend(publicAPI, model, initialValues);
})(dataModel);
provider.setFieldsSorted(true);

const green = BackgroundColor.newInstance({ color:'green' });
const   red = BackgroundColor.newInstance({ color:'red' });
const  blue = BackgroundColor.newInstance({ color:'blue' });
const  pink = BackgroundColor.newInstance({ color:'pink' });
const  gray = BackgroundColor.newInstance({ color:'gray' });

const cdf = CDF.newInstance({ provider });

const viewports = {
  Gray: {
    component: gray,
    viewport: 2,
  },
  CDF: {
    component: cdf,
    viewport: 0,
  },
  Green: {
    component: green,
    viewport: -1,
  },
  Red: {
    component: red,
    viewport: -1,
  },
  Blue: {
    component: blue,
    viewport: 1,
  },
  Pink: {
    component: pink,
    viewport: 3,
  },
};

const workbench = new Workbench();
workbench.setComponents(viewports);
workbench.setLayout('2x2');

const props = {
  onLayoutChange(layout) {
    workbench.setLayout(layout);
  },
  onViewportChange(index, instance) {
    workbench.setViewport(index, instance);
  },
  activeLayout: workbench.getLayout(),
  viewports: workbench.getViewportMapping(),
  count: 4,
};

const controlPanel = new ReactAdapter(WorkbenchController, props);
const shiftedWorkbench = new Composite();
shiftedWorkbench.addViewport(new Spacer(), false);
shiftedWorkbench.addViewport(workbench);
const mainComponent = new ToggleControl(shiftedWorkbench, controlPanel, 280);
mainComponent.setContainer(container);

workbench.onChange(model => {
  props.activeLayout = model.layout;
  props.viewports = model.viewports;
  props.count = model.count;
  controlPanel.render();
});

// Create a debounced window resize handler
const resizeHandler = debounce(() => {
  mainComponent.resize();
}, 50);

// Register window resize handler so workbench redraws when browser is resized
window.onresize = resizeHandler;

// -----------------------------------------------------------
// Make some variables global so that you can inspect and
// modify objects in your browser's developer console:
// -----------------------------------------------------------
global.cdf = cdf;
