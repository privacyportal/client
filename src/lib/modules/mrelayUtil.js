import { tinyArrayShuffle } from '@privacyportal/client-e2ee';

function tokenizeSearchInput(input) {
  return [
    input,
    ...input
      .split(/[,.\-_ :/\\]+/)
      .filter((s) => s.length > 2 && s.length < input.length)
      .sort((a, b) => b.length - a.length)
      .slice(0, 3)
  ];
}

export async function encryptAddressData(address, $cryptoTasks) {
  const emailLocalPart = address.value.substring(0, address.value.indexOf('@'));
  const [ct, ...srch] = await Promise.all([
    $cryptoTasks.encryptStr(JSON.stringify(address)),
    $cryptoTasks.hashStr(address.value),
    $cryptoTasks.hashStr(emailLocalPart),
    ...[...tokenizeSearchInput(address.label), ...tokenizeSearchInput(emailLocalPart)].map(function (input) {
      return $cryptoTasks.hashStr(input);
    })
  ]);
  return {
    ct,
    srch: tinyArrayShuffle(srch)
  };
}
