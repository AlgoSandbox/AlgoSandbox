import * as reactComponents from '@algo-sandbox/react-components';
import * as visualizers from '@algo-sandbox/visualizers';
import * as d3 from 'd3';
import * as react from 'react';
import * as reactDomClient from 'react-dom/client';
import * as reactInspector from 'react-inspector';

export default function getClientSideOnlyLibraries() {
  return {
    '@algo-sandbox/visualizers': visualizers,
    '@algo-sandbox/react-components': reactComponents,
    react,
    'react-dom/client': reactDomClient,
    'react-inspector': reactInspector,
    d3,
  };
}
