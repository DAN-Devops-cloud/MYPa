export const generateConfig = (config) => {
  const {
    protocol,
    host,
    port,
    uuid,
    password,
    transport,
    tls,
    path,
    sni,
    name
  } = config;

  let configString = '';

  if (protocol === 'vmess') {
    const vmessConfig = {
      v: '2',
      ps: name,
      add: host,
      port: port.toString(),
      id: uuid,
      aid: '0',
      scy: 'auto',
      net: transport,
      type: 'none',
      host: sni || host,
      path: path,
      tls: tls ? 'tls' : ''
    };
    configString = 'vmess://' + Buffer.from(JSON.stringify(vmessConfig)).toString('base64');
  }

  if (protocol === 'vless') {
    configString = `vless://${uuid}@${host}:${port}?type=${transport}&security=${
      tls ? 'tls' : 'none'
    }&sni=${sni || host}&path=${encodeURIComponent(path)}#${encodeURIComponent(name)}`;
  }

  if (protocol === 'trojan') {
    configString = `trojan://${password}@${host}:${port}?type=${transport}&security=${
      tls ? 'tls' : 'none'
    }&sni=${sni || host}&path=${encodeURIComponent(path)}#${encodeURIComponent(name)}`;
  }

  return configString;
};

export const validateConfig = (config) => {
  const { protocol, host, port } = config;

  if (!['vmess', 'vless', 'trojan'].includes(protocol)) return false;
  if (!host || !port) return false;

  return true;
};
