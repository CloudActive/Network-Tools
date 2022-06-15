import { formatDistanceToNow } from 'date-fns';

import { list, graphql } from '@keystone-6/core';
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
} from '@keystone-6/core/fields';

import { access } from './access';
import { whoisService } from '../lib/services/whoisService';

type AccessArgs = {
  session?: {
    itemId?: string;
    listKey?: string;
    data?: {
      name?: string;
      isAdmin: boolean;
    };
  };
  item?: any;
};

const isAdmin = ({ session }: AccessArgs) => {
  return !!session?.data?.isAdmin;
};

export const Domain = list({
  access: {
    operation: {
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    },
   },
  ui: {
    listView: {
      initialColumns: ['name'],
      initialSort: { field: 'registryExpiryDate', direction: 'DESC' },
      pageSize: 100,
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
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
    field: graphql.field({
      type: graphql.String,
      resolve(item:any) {
        return((item.registryExpiryDate && `${formatDistanceToNow(item.registryExpiryDate)}`|| 'N/A'));
      }
    }),
      
    }),
    age: virtual({
    field: graphql.field({
      type: graphql.String,
      resolve(item:any) {
        return((item.registryExpiryDate && `${formatDistanceToNow(item.registryExpiryDate)}`|| 'N/A'));
      }
    }),
    }),
   },
  hooks: {
    afterOperation: ({ operation, originalItem, item }) => {
      if (operation === 'create' || (operation === 'update' && !!originalItem.checkPending)) {
        whoisService.queueDomains([item]);

      }
    },
    },
   
});
