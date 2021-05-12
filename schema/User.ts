import { list } from '@keystone-next/keystone/schema';
import { text, checkbox, password } from '@keystone-next/fields';

import { access } from './access';

export const User = list({
  access: {
    read: access.isAdmin,
    update: access.isAdmin,
    delete: access.isAdmin,
    create: access.isAdmin,
  },
  ui: {
    listView: {
      initialColumns: ['name', 'email', 'isAdmin'],
    },
  },
  fields: {
    /** The user's first and last name. */
    name: text({ isRequired: true }),
    /** Email is used to log into the system. */
    email: text({ isRequired: true, isUnique: true }),
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
