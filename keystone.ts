import { config } from '@keystone-6/core';

import { createAuth } from '@keystone-6/auth';
import { statelessSessions } from '@keystone-6/core/session';
import { lists } from './schema';
import { extendGraphqlSchema } from './graphql/extendGraphqlSchema';
import { contextService } from './lib/services/contextService';
import { whoisService } from './lib/services/whoisService';



let sessionSecret = process.env.SESSION_SECRET;

// Here is a best practice! It's fine to not have provided a session secret in dev,
// however it should always be there in production.
if (!sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'The SESSION_SECRET environment variable must be set in production'
    );
  } else {
    sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
  }
}
let sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: 'name',
  secretField: 'password',
  initFirstItem: {
    // If there are no items in the database, keystone will ask you to create
    // a new user, filling in these fields.
    fields: ['name', 'email', 'password'],
  },
});

// TODO -- Create a separate example for access control in the Admin UI
// const isAccessAllowed = ({ session }: { session: any }) => !!session?.item?.isAdmin;

export default withAuth(
  config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    onConnect: async (context: any) => {
      contextService.setContext(context);
      whoisService.setContext(context);
      // more backend processes
    },
  },
  // NOTE -- this is not implemented, keystone currently always provides a graphql api at /api/graphql
  graphql: {
    path: '/api/graphql',
  },
  ui: {
    // For our starter, we check that someone has session data before letting them see the Admin UI.
    isAccessAllowed: (context) => !!context.session?.data,
  },

  lists,
  extendGraphqlSchema,
  session: statelessSessions({
    maxAge: sessionMaxAge,
    secret: sessionSecret,
  }),
  
})
);
