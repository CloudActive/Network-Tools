import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';

import { lists } from './schema';
import { extendGraphqlSchema } from './graphql/extendGraphqlSchema';
import { contextService } from './lib/services/contextService';
import { whoisService } from './lib/services/whoisService';

let sessionSecret = process.env.COOKIE_SECRET || '-- DEV COOKIE SECRET; CHANGE ME --';
let sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    itemData: {
      isAdmin: true,
    },
  },
});

// TODO -- Create a separate example for access control in the Admin UI
// const isAccessAllowed = ({ session }: { session: any }) => !!session?.item?.isAdmin;

export default auth.withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',
      onConnect: async context => {
        contextService.setContext(context);
        whoisService.setContext(context);
        // more backend processes
      },
    },
    // NOTE -- this is not implemented, keystone currently always provides a graphql api at /api/graphql
    // graphql: {
    //   path: '/api/graphql',
    // },
    ui: {
      // NOTE -- this is not implemented, keystone currently always provides an admin ui at /
      // path: '/admin',
      // isAccessAllowed,
    },
    images: { upload: 'local' },
    files: { upload: 'local' },
    lists,
    extendGraphqlSchema,
    session: withItemData(
      statelessSessions({
        maxAge: sessionMaxAge,
        secret: sessionSecret,
      }),
      { User: 'name isAdmin' }
    ),
    // TODO -- Create a separate example for stored/redis sessions
    // session: storedSessions({
    //   store: new Map(),
    //   // store: redisSessionStore({ client: redis.createClient() }),
    //   secret: sessionSecret,
    // }),
  })
);
