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
  isUser: ({ session, item }: AccessArgs) => !!session?.itemId === item,
  isSession: ({ session }: AccessArgs) => !!session?.data,
  isAdmin: ({ session }: AccessArgs) => !!session?.data?.isAdmin,
};

