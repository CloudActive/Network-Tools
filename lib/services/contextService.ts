import { KeystoneContext } from '@keystone-6/core/types';

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
