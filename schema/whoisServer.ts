import { formatDistanceToNow } from 'date-fns';

import { list } from '@keystone-next/keystone/schema';
import {
  text,
  relationship,
  checkbox,
  password,
  timestamp,
  select,
  virtual,
  image,
  file,
} from '@keystone-next/fields';

import { access } from './access';
import { whoisService } from '../lib/services/whoisService';

export const WhoisServer = list({
  access: {
    read: access.isAdmin,
    update: access.isAdmin,
    delete: access.isAdmin,
    create: access.isAdmin,
  },
  ui: {
    listView: {
      initialColumns: ['tld', 'server'],
      pageSize: 100,
    },
  },
  fields: {
    tld: text({ isRequired: true, isUnique: true }),
    server: text({ isRequired: true }),
  },
  hooks: {
    afterChange: ({ updatedItem }) => {
      whoisService.setDomainWhoisServer(updatedItem.tld, updatedItem.server);
    },
  },
});
