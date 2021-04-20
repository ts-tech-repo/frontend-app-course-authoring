import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  documentationPage: {
    id: 'authoring.discussions.documentationPage',
    defaultMessage: 'Visit the {name} documentation page',
  },
  consumerKey: {
    id: 'authoring.discussions.consumerKey',
    defaultMessage: 'Consumer Key',
    description: 'Label for the Consumer Key field.',
  },
  consumerKeyRequired: {
    id: 'authoring.discussions.consumerKey.required',
    defaultMessage: 'Enter your consumer key',
    description: 'Tells the user that the Consumer Key field is required and must have a value.',
  },
  consumerSecret: {
    id: 'authoring.discussions.consumerSecret',
    defaultMessage: 'Consumer Secret',
    description: 'Label for the Consumer Secret field.',
  },
  consumerSecretRequired: {
    id: 'authoring.discussions.consumerSecret.required',
    defaultMessage: 'Enter your consumer secret',
    description: 'Tells the user that the Consumer Secret field is required and must have a value.',
  },
  launchUrl: {
    id: 'authoring.discussions.launchUrl',
    defaultMessage: 'Launch URL',
    description: 'Label for the Launch URL field.',
  },
  launchUrlRequired: {
    id: 'authoring.discussions.launchUrl.required',
    defaultMessage: 'Enter your launch URL',
    description: 'Tells the user that the Launch URL field is required and must have a value.',
  },
});

export default messages;
