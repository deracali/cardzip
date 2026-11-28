import dns from "node:dns";
import { isIP } from "node:net";

const defaultDnsServers = ["1.1.1.1", "8.8.8.8"];

export function configureMongoDns(env = process.env, setDnsServers = dns.setServers) {
  const configuredServers = (env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  const servers = configuredServers.length ? configuredServers : defaultDnsServers;
  if (servers.some((server) => !isIP(server))) {
    throw new Error("MONGODB_DNS_SERVERS must contain comma-separated DNS server IP addresses.");
  }
  setDnsServers(servers);
  return servers;
}

export function createMongoLookup({
  lookup = dns.lookup,
  resolve4 = dns.resolve4,
  resolve6 = dns.resolve6,
} = {}) {
  return (hostname, options, callback) => {
    const lookupOptions = typeof options === "number" ? { family: options } : options || {};
    const done = typeof options === "function" ? options : callback;

    lookup(hostname, options, (error, address, family) => {
      if (!error) {
        done(null, address, family);
        return;
      }
      if (error.code !== "ENOTFOUND") {
        done(error);
        return;
      }

      resolve4(hostname, (ipv4Error, ipv4Addresses = []) => {
        resolve6(hostname, (ipv6Error, ipv6Addresses = []) => {
          const addresses = [
            ...(ipv4Error ? [] : ipv4Addresses.map((ip) => ({ address: ip, family: 4 }))),
            ...(ipv6Error ? [] : ipv6Addresses.map((ip) => ({ address: ip, family: 6 }))),
          ].filter((entry) => !lookupOptions.family || lookupOptions.family === entry.family);

          if (!addresses.length) {
            done(error);
          } else if (lookupOptions.all) {
            done(null, addresses);
          } else {
            done(null, addresses[0].address, addresses[0].family);
          }
        });
      });
    });
  };
}
