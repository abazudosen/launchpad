import { MongoClient } from 'mongodb';
import type { Pad } from './types';

type Cursor<Type> = {
  toArray: () => Promise<Array<Type>>,
};

type WriteOpResult<Type> = {
  result: Type,
};

type Collection<Type> = {
  findOne: (query: any, options?: any) => Promise<?Type>,
  find: (query: any, options: any) => Cursor<Type>,
  update: (
    query: any,
    document: any,
    options?: any,
  ) => Promise<WriteOpResult<Type>>,
};

export default class MongoProvider {
  mongodb: any;

  constructor(mongoUrl: string) {
    this.mongodb = MongoClient.connect(mongoUrl);
  }

  async pads(): Promise<Collection<Pad>> {
    return (await this.mongodb).collection('Pads');
  }
}
