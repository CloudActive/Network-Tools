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

export const Domain = list({
  access: {
    read: access.isAdmin,
    update: access.isAdmin,
    delete: access.isAdmin,
    create: access.isAdmin,
  },
  ui: {
    listView: {
      initialColumns: ['name', 'age', 'expiresIn'],
      initialSort: { field: 'registryExpiryDate', direction: 'DESC' },
      pageSize: 100,
    },
  },
  fields: {
    name: text({ isRequired: true }),
    registryCreationDate: timestamp({}),
    registryExpiryDate: timestamp({}),
    registryUpdatedDate: timestamp({}),
    registryDomainId: text({}),
    registrar: text({}),
    registrarWhoisServer: text({}),
    lastCheckedDate: timestamp({}),
    lastCheckError: text({}),
    checkPending: checkbox({}),
    whoisData: text({ ui: { displayMode: 'textarea' } }),
    /** virtual */
    expiresIn: virtual({
      resolver: item =>
        (item.registryExpiryDate && `${formatDistanceToNow(item.registryExpiryDate)}`) || 'N/A',
    }),
    age: virtual({
      resolver: item =>
        (item.registryCreationDate && `${formatDistanceToNow(item.registryCreationDate)}`) || 'N/A',
    }),
  },
  hooks: {
    afterChange: ({ operation, originalInput, updatedItem }) => {
      if (operation === 'create' || (operation === 'update' && !!originalInput.checkPending)) {
        whoisService.queueDomains([updatedItem]);
      }
    },
  },
});
