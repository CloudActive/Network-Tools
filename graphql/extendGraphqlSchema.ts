import { graphQLSchemaExtension, gql} from '@keystone-6/core';

const randomNumber = () => Math.round(Math.random() * 10);

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: gql`
    type Query {
      randomNumber: RandomNumber
    }
    type RandomNumber {
      number: Int
      generatedAt: String
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
        generatedAt: new Date().toISOString(),
      }),
    },
  },
});