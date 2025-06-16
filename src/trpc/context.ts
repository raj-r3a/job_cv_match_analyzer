import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  return {
    req,
    res,
    files: (req as any).files, // Multer adds files to request
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
