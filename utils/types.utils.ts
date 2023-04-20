export type User = {
  id: string;
  avatar: string;
  username: string;
  email: string;
  name: string;
  emailVisibility: boolean;
  verified: boolean;
  created: Date;
  updated: Date;
};

export type Message = {
  id: string;
  user: string;
  channel: string;
  content: string | undefined;
  image: string | undefined;
  url: boolean;
  created: Date;
  updated: Date;
};
