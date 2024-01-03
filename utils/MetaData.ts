import { Request } from 'express';

import { Meta } from '../models/meta.model';
export const createMetaData = async (
  req: Request,
  reference: string,
): Promise<object> => {
  const { title_meta, desc_meta } = req.body;
  return await Meta.create({
    title_meta,
    desc_meta,
    reference,
  });
};

export const deleteMetaData = async (reference: string): Promise<number> => {
  await Meta.findOneAndDelete({ reference: reference });
  return 1;
};
