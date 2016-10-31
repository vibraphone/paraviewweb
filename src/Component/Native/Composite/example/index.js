import CompositeComponent   from '..';
import BGColorComponent     from '../../BackgroundColor';

// Load CSS
require('normalize.css');

const container = document.querySelector('.content');
container.style.position = 'relative';
container.style.width = '100%';
container.style.height = '600px';

const composite = new CompositeComponent();
const green = new BGColorComponent({ color:'green' });
const red   = new BGColorComponent({ color:'red' });
const blue  = new BGColorComponent({ color:'blue' });
const pink  = new BGColorComponent({ color:'pink' });

composite.addViewport(green);
composite.addViewport(red);
composite.addViewport(blue);
composite.addViewport(pink);

composite.setContainer(container);
