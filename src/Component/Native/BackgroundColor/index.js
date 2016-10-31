import d3 from 'd3';

import style from 'PVWStyle/ComponentNative/BackgroundColor.mcss';
import htmlContent from './body.html';
import CompositeClosureHelper from '../../../Common/Core/CompositeClosureHelper';

function backgroundColorComponent(publicAPI, model) {
  publicAPI.resize = () => {
    if (!model.container) {
      return;
    }

    model.clientRect = model.container.getBoundingClientRect();
  };

  publicAPI.setContainer = (el) => {
    if (model.container) {
      while (model.container.firstChild) {
        model.container.removeChild(model.container.firstChild);
      }
    }

    model.container = el;

    if (model.container) {
      // Create placeholder
      model.container.innerHTML = htmlContent;

      // Apply style
      d3
        .select(model.container)
        .select('.bg-color-container')
        .classed(style.bgcolorContainer, true)
        .style('background-color', model.color);
    }
  };

  publicAPI.setColor = (colorSpec) => {
    let color = colorSpec;
    if (typeof colorSpec !== 'string' || colorSpec === '') {
      color = 'inherit';
    }
    model.color = color;
    if (model.container) {
      d3.select(model.container).select('.bg-color-container').style('background-color', model.color);
    }
  };
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  container: null,
  color: 'inherit',
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  CompositeClosureHelper.destroy(publicAPI, model);
  CompositeClosureHelper.isA(publicAPI, model, 'VizComponent');
  CompositeClosureHelper.get(publicAPI, model, ['color', 'container']);

  backgroundColorComponent(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = CompositeClosureHelper.newInstance(extend);

// ----------------------------------------------------------------------------

export default { newInstance, extend };
