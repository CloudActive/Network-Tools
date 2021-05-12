import { createSchema } from '@keystone-next/keystone/schema';
import { Domain } from './Domain';

import { User } from './User';
import { WhoisServer } from './whoisServer';

export const lists = createSchema({ User, Domain, WhoisServer });
