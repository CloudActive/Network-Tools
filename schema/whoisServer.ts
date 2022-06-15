import { formatDistanceToNow } from 'date-fns';

import { list } from '@keystone-6/core';
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

export const WhoisServer = list({
  access: {
    operation: {
      create: isAdmin,
      update: isAdmin,
      delete: isAdmin,
      },
  },
  ui: {
    listView: {
      initialColumns: ['tld', 'server'],
      pageSize: 100,
    },
  },
  fields: {
    tld: text({ validation: { isRequired: true } }),
    server: text({ validation: { isRequired: true } }),
  },
  hooks: {
    afterOperation: ({ item }) => {
      whoisService.setDomainWhoisServer(item.tld, item.server);
    },
  },
});
