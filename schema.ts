import { createSchema, list, graphQLSchemaExtension, gql } from '@keystone-next/keystone/schema';
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

// TODO: Can we generate this type based on withItemData in the main config?
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
export const access = {
  isAdmin: ({ session }: AccessArgs) => !!session?.data?.isAdmin,
};

const randomNumber = () => Math.round(Math.random() * 10);

export const lists = createSchema({
  User: list({
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
  }),
});

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: gql`
    type Query {
      randomNumber: RandomNumber
    }
    type RandomNumber {
      number: Int
      generatedAt: Int
    }
  `,
  resolvers: {
    RandomNumber: {
      number(rootVal: { number: number }) {
        return rootVal.number * 1000;
      },
    },
   Query: {
      randomNumber: () => ({
        number: randomNumber(),
        generatedAt: Date.now(),
      }),
    },
  },
});
