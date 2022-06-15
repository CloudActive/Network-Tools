import { list } from '@keystone-6/core';
import { text, checkbox, password } from '@keystone-6/core/fields';

import { access } from './access';

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

export const User = list({
  access: {
    operation: {
      create: isAdmin,
      update: isAdmin,
      delete: isAdmin,
      },
  },
  ui: {
    listView: {
      initialColumns: ['name', 'email', 'isAdmin'],
    },
  },
  fields: {
    /** The user's first and last name. */
    name: text({ validation: { isRequired: true } }),
    /** Email is used to log into the system. */
    email: text({isIndexed: 'unique',validation: { isRequired: true }}),
    password: password(),
    /** Administrators have more access to various lists and fields. */
    isAdmin: checkbox({
      access: {
        create: access.isAdmin,
        read: access.isAdmin,
        update: access.isAdmin,
      },
      ui: {
        createView: {
          fieldMode: args => (access.isAdmin(args) ? 'edit' : 'hidden'),
        },
        itemView: {
          fieldMode: args => (access.isAdmin(args) ? 'edit' : 'read'),
        },
      },
    }),
  },
});
