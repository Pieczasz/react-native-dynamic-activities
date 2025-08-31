import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  docsSidebar: [
    'introduction',
    'installation',
    {
      type: 'category',
      label: 'Tutorial',
      items: [
        'tutorial',
      ],
    },
    'getting-started',
    {
      type: 'category',
      label: 'Widget Generation',
      items: [
        'widgets/overview',
        'widgets/cli-usage',
        'widgets/customization',
      ],
    },
    {
      type: 'category',
      label: 'Platform Support',
      items: [
        'platform/ios-compatibility',
      ],
    },
    'troubleshooting',
  ],

  // API Reference sidebar
  apiSidebar: [
    'api/overview',
    {
      type: 'category',
      label: 'Core API',
      items: [
        'api/dynamic-activities',
        'api/live-activity-state',
      ],
    },
    {
      type: 'category',
      label: 'Error Handling',
      items: [
        'api/errors/overview',
      ],
    },
  ],
}

export default sidebars
