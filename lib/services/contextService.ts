import { KeystoneContext } from '@keystone-next/types';

export class ContextService {
  #context: KeystoneContext = null;

  get context() {
    return this.#context;
  }

  setContext(context: KeystoneContext) {
    this.#context = context;
  }
}

export const contextService = new ContextService();
