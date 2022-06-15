import whois from '@mysupport/whois';
import { parseDomain, ParseResultType } from 'parse-domain';

import { KeystoneContext } from '@keystone-6/core/types';
import { ContextService } from './contextService';
import { sleep } from '../utils';

export class WhoisService extends ContextService {
  domainsQueue = [];
  domainServers = {};
  isRunning = false;

  init(context: KeystoneContext) {
    this.setContext(context);
    this.cacheDomainWhoisServer();
  }

  setDomainWhoisServer(domain, server) {
    this.domainServers[domain] = server;
  }

  /**
   * check for domains
   * @param {queries.Domain[]} domains domains
   */
  async queueDomains(domains = []) {
    this.domainsQueue.push(...domains);

    if (this.domainsQueue.length && !this.isRunning) {
      this.checkDomainWhois();
    }
  }

  async checkDomainWhois() {
    if (this.domainsQueue.length === 0) {
      this.isRunning = false;
      return;
    }
    let counter = 0;
    this.isRunning = true;
    let d = this.domainsQueue.shift();
    while (d) {
      const { who, error } = await this.getDomainWhois(d.name);
      counter++;
      await this.saveDomainWhois(d, who, error);
      console.log('waiting for 12 seconds for next call');
      await sleep(12000); // REF: needed to prevent whois server rate limiting, ideally it should be per whois server (ip).
      console.log('waking after 12 seconds of sleep');
      d = this.domainsQueue.shift();
    }
    console.log(`finishing up this stretch, processed: ${counter} domains`);
    this.isRunning = false;
  }

  async saveDomainWhois(domain, whoisInfo, error) {
    try {
      /** @type Partial<queries.Domain> */
      const data = error
        ? {
            lastCheckError: error,
            lastCheckedDate: new Date().toISOString(),
          }
        : {
            registryCreationDate: whoisInfo.creationDate,
            registryExpiryDate: whoisInfo.registryExpiryDate,
            registryUpdatedDate: whoisInfo.updatedDate,
            registrar: whoisInfo.registrar,
            registryDomainId: whoisInfo.registryDomainId,
            registrarWhoisServer: whoisInfo.registrarWhoisServer,
            lastCheckedDate: new Date().toISOString(),
            whoisData: whoisInfo.rawWhois,
            lastCheckError: null,
            checkPending: false,
          };

      const result = await this.context.query.Domain.updateOne({
        
        where: {id: domain.id},
        data,
      });
      console.log(`saved domain info for: ${domain.name}${error ? `with error ${error}` : ''}`);
    } catch (err) {
      console.log(err);
    }
  }

  async cacheDomainWhoisServer() {
    const whoisServers = await this.context.query.WhoisServer.findMany({
      where:{ first: 100 },
      query: 'id tld server',
    });

    const servers = whoisServers.reduce((accumulator, current) => {
      accumulator[current.tld] = current.server;
      return accumulator;
    }, {});
    this.domainServers = servers || {};
  }

  /**
   * get this from whois call
   * @param {string} domain domain
   */
  async getDomainWhois(domain) {
    try {
      const options: Record<string, any> = { follow: 0 };
      const parseResult = parseDomain(domain);
      if (parseResult.type === ParseResultType.Listed) {
        const { subDomains, domain, topLevelDomains } = parseResult;

        const tld = topLevelDomains.join('.');
        options.server = this.domainServers[tld];
      } else {
        // Read more about other parseResult types below...
      }

      const who = await whois(domain, options);
      if (who && Object.keys(who).length === 0) {
        return { who: null, error: 'empty result, retry later' };
      }
      return { who };
    } catch (error) {
      console.log(`error in processing domain: ${domain}, error: ${error.message || error}`);
      return { who: null, error: error.message || error };
    }
  }
}

export const whoisService = new WhoisService();
