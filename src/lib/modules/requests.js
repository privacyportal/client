import sendRequest from './sendRequest.js';

export async function refreshSession() {
  return await sendRequest({
    method: 'GET',
    path: '/refresh-session'
  });
}

export async function newAddress() {
  return await sendRequest({
    method: 'GET',
    path: '/email-relay/addresses/new'
  });
}

export async function getAddresses(search, filter, fwdToFilter, sortBy, previous, latestId) {
  return await sendRequest({
    method: 'GET',
    path:
      '/email-relay/addresses?' +
      Object.entries({
        search,
        filter,
        fwd_to: fwdToFilter,
        sort: sortBy,
        prev: previous,
        latest: latestId
      })
        .filter((item) => item[1] !== undefined)
        .map((item) => item.join('='))
        .join('&')
  });
}

export async function createAddress({ label, address, note, token }) {
  return await sendRequest({
    method: 'POST',
    path: '/email-relay/addresses/new',
    data: {
      label,
      address,
      note,
      token
    }
  });
}

export async function editAddress({ id, label, note }) {
  console.log({ id, label, note });
  return await sendRequest({
    method: 'PATCH',
    path: `/email-relay/addresses/${id}`,
    data: {
      label,
      note: note || ''
    }
  });
}

export async function deactivateAddress({ id, mode }) {
  return await sendRequest({
    method: 'PATCH',
    path: `/email-relay/addresses/${id}/deactivate?mode=${mode}`
  });
}

export async function activateAddress({ id, fwd_to }) {
  return await sendRequest({
    method: 'PATCH',
    path: `/email-relay/addresses/${id}/activate`,
    data: {
      ...(fwd_to && { fwd_to })
    }
  });
}

export async function deleteAddress({ id }) {
  return await sendRequest({
    method: 'DELETE',
    path: `/email-relay/addresses/${id}`
  });
}

export async function createRecipient({ addressId, recipient }) {
  return await sendRequest({
    method: 'POST',
    path: `/email-relay/addresses/${addressId}/recipients/new`,
    data: {
      recipient
    }
  });
}

export async function patchPreferences(data) {
  console.log('patchPreferences:', data);
  return await sendRequest({
    method: 'PATCH',
    path: '/preferences',
    data
  });
}

export async function getPreferences() {
  return await sendRequest({
    method: 'GET',
    path: '/preferences'
  });
}

export async function activateEmailRecovery() {
  return await sendRequest({
    method: 'GET',
    path: '/email-recovery/activate'
  });
}

export async function deactivateEmailRecovery() {
  return await sendRequest({
    method: 'GET',
    path: '/email-recovery/deactivate'
  });
}

export async function getEmailRecovery() {
  return await sendRequest({
    method: 'GET',
    path: '/email-recovery'
  });
}

export async function getEmailRecoveryTotpURI() {
  return await sendRequest({
    method: 'GET',
    path: '/email-recovery/totp/new'
  });
}

export async function registerEmailRecoveryTotp(data) {
  return await sendRequest({
    method: 'POST',
    path: '/email-recovery/totp/new',
    data
  });
}

export async function deleteEmailRecoveryTotp() {
  return await sendRequest({
    method: 'DELETE',
    path: '/email-recovery/totp'
  });
}

export async function requestAccountRecoveryCode(data) {
  return await sendRequest(
    {
      method: 'POST',
      path: '/email-recovery/send-code',
      data
    },
    {
      fullError: true
    }
  );
}

export async function recoverAccountChallenge(data) {
  return await sendRequest(
    {
      method: 'POST',
      path: '/email-recovery/recover-account-challenge',
      data
    },
    {
      fullError: true
    }
  );
}

export async function recoverAccount(data) {
  return await sendRequest({
    method: 'POST',
    path: '/email-recovery/recover-account',
    data
  });
}

export async function getEmailSubscriptions() {
  return await sendRequest({
    method: 'GET',
    path: '/email-subscriptions'
  });
}

export async function activateEmailSubscription(id) {
  return await sendRequest({
    method: 'GET',
    path: `/email-subscriptions/${id}/activate`
  });
}

export async function deactivateEmailSubscription(id, options) {
  return await sendRequest(
    {
      method: 'GET',
      path: `/email-subscriptions/${id}/deactivate`
    },
    options
  );
}

export async function exportAccountData() {
  return await sendRequest(
    {
      method: 'GET',
      path: '/export-account-data'
    },
    {
      displayError: true,
      fullError: false,
      downloadFile: 'pportal_export.tsv'
    }
  );
}

export async function changePrimaryEmail({ id }) {
  return await sendRequest({
    method: 'PATCH',
    path: '/account-email',
    data: {
      id
    }
  });
}

export async function submitSupportRequest({ type, message }) {
  return await sendRequest({
    method: 'POST',
    path: '/support-requests/new',
    data: {
      type,
      message
    }
  });
}

export async function patchRelaySettings(data) {
  console.log('patchRelaySettings:', data);
  return await sendRequest({
    method: 'PATCH',
    path: '/email-relay/settings',
    data
  });
}

export async function getRelaySettings() {
  return await sendRequest({
    method: 'GET',
    path: '/email-relay/settings'
  });
}

export async function getRelayAccounts() {
  return await sendRequest({
    method: 'GET',
    path: '/email-relay/accounts'
  });
}

export async function getRelayAccountsWithActiveProfiles() {
  return await sendRequest({
    method: 'GET',
    path: '/email-relay/accounts?profile=true'
  });
}

export async function verifyRelayAccount({ accountId, code }) {
  return await sendRequest({
    method: 'POST',
    path: `/email-relay/accounts/${accountId}/verify-email`,
    data: {
      code
    }
  });
}

export async function resendRelayAccountVerificationCode({ accountId }) {
  return await sendRequest({
    method: 'GET',
    path: `/email-relay/accounts/${accountId}/resend-code`
  });
}

export async function createRelayAccount({ email }) {
  return await sendRequest({
    method: 'POST',
    path: '/email-relay/accounts/new',
    data: {
      email
    }
  });
}

export async function patchRelayAccountSettings({ accountId, data }) {
  return await sendRequest({
    method: 'PATCH',
    path: `/email-relay/accounts/${accountId}/settings`,
    data
  });
}

export async function deleteRelayAccount({ accountId }) {
  return await sendRequest({
    method: 'DELETE',
    path: `/email-relay/accounts/${accountId}`
  });
}

export async function issueCertificate({ accountId, csr, validity }) {
  return await sendRequest({
    method: 'POST',
    path: `/email-relay/accounts/${accountId}/profiles/new-smime`,
    data: {
      csr,
      validity
    }
  });
}

export async function enableCertificate({ accountId, id, issuer_pem, root_pem }) {
  return await sendRequest({
    method: 'PATCH',
    path: `/email-relay/accounts/${accountId}/profiles/${id}`,
    data: {
      issuer_pem,
      root_pem
    }
  });
}

export async function createPGPProfile({ accountId, key }) {
  return await sendRequest({
    method: 'POST',
    path: `/email-relay/accounts/${accountId}/profiles/new-pgp`,
    data: {
      key
    }
  });
}

export async function getProfiles({ accountId }) {
  return await sendRequest({
    method: 'GET',
    path: `/email-relay/accounts/${accountId}/profiles`
  });
}

export async function activateProfile({ id, accountId }) {
  return await sendRequest({
    method: 'PATCH',
    path: `/email-relay/accounts/${accountId}/profiles/${id}/activate`
  });
}

export async function deactivateProfile({ id, accountId }) {
  return await sendRequest({
    method: 'PATCH',
    path: `/email-relay/accounts/${accountId}/profiles/${id}/deactivate`
  });
}

export async function deleteProfile({ id, accountId }) {
  return await sendRequest({
    method: 'DELETE',
    path: `/email-relay/accounts/${accountId}/profiles/${id}`
  });
}

export async function signInChallenge() {
  return await sendRequest({
    method: 'POST',
    path: '/signin-challenge',
    data: {}
  });
}

export async function signIn({ credential, token }) {
  return await sendRequest({
    method: 'POST',
    path: '/signin',
    data: {
      credential,
      token
    }
  });
}

export async function signUpChallenge({ email }, { extraHeaders }) {
  return await sendRequest(
    {
      method: 'POST',
      path: '/signup-challenge',
      data: {
        email
      },
      ...(extraHeaders && { extraHeaders })
    },
    {
      fullError: true
    }
  );
}

export async function signUp({ credential, token }) {
  return await sendRequest({
    method: 'POST',
    path: '/signup',
    data: {
      credential,
      token
    }
  });
}

export async function verifyEmail({ code }) {
  return await sendRequest({
    method: 'POST',
    path: '/verify-email',
    data: {
      code
    }
  });
}

export async function resendCode() {
  return await sendRequest({
    method: 'GET',
    path: '/resend-code'
  });
}

export async function deleteAccount() {
  return await sendRequest({
    method: 'POST',
    path: `/delete-account`
  });
}

export async function upgradeAccount() {
  return await sendRequest({
    method: 'POST',
    path: '/upgrade-account'
  });
}

export async function getAuthenticators() {
  return await sendRequest({
    method: 'GET',
    path: `/authenticators`
  });
}

export async function getNewAuthenticatorChallenge() {
  return await sendRequest({
    method: 'GET',
    path: '/authenticators/new-challenge'
  });
}

export async function registerAuthenticator({ id, label, credential }) {
  return await sendRequest({
    method: 'POST',
    path: '/authenticators/new',
    data: {
      id,
      label,
      credential
    }
  });
}

export async function activateAuthenticator({ id }) {
  return await sendRequest({
    method: 'POST',
    path: `/authenticators/activate`,
    data: {
      id
    }
  });
}

export async function deactivateAuthenticator({ id }) {
  return await sendRequest({
    method: 'POST',
    path: `/authenticators/deactivate`,
    data: {
      id
    }
  });
}

export async function deleteAuthenticator({ id }) {
  return await sendRequest({
    method: 'POST',
    path: `/authenticators/delete`,
    data: {
      id
    }
  });
}

export async function getApiKeys() {
  return await sendRequest({
    method: 'GET',
    path: `/api-keys`
  });
}

export async function createNewApiKey({ label }) {
  return await sendRequest({
    method: 'POST',
    path: `/api-keys/new`,
    data: {
      label
    }
  });
}

export async function deleteApiKey({ key }) {
  return await sendRequest({
    method: 'DELETE',
    path: `/api-keys/${key}`
  });
}

export async function registerOAuthApplication({ name, url, callback_urls }) {
  return await sendRequest({
    method: 'POST',
    path: '/oauth/apps/new',
    data: {
      name,
      url,
      callback_urls
    }
  });
}

export async function updateOAuthApplication({ id, name, url, callback_urls }) {
  return await sendRequest({
    method: 'PATCH',
    path: `/oauth/apps/${id}`,
    data: {
      name,
      url,
      callback_urls
    }
  });
}

export async function uploadOAuthAppIcon({ id, formData }) {
  return await sendRequest({
    method: 'POST',
    path: `/oauth/apps/${id}/upload-icon`,
    data: formData,
    rawBody: true
  });
}

export async function getOAuthApplications() {
  return await sendRequest({
    method: 'GET',
    path: '/oauth/apps'
  });
}

export async function getOAuthApplication({ id }) {
  return await sendRequest({
    method: 'GET',
    path: `/oauth/apps/${id}`
  });
}

export async function deleteOAuthApplication({ id }) {
  return await sendRequest({
    method: 'DELETE',
    path: `/oauth/apps/${id}`
  });
}

export async function publishOAuthApplication({ id }) {
  return await sendRequest({
    method: 'PATCH',
    path: `/oauth/apps/${id}/publish`
  });
}

export async function unpublishOAuthApplication({ id }) {
  return await sendRequest({
    method: 'PATCH',
    path: `/oauth/apps/${id}/unpublish`
  });
}

export async function verifyOAuthApplicationDomain({ id, domain_id }) {
  return await sendRequest({
    method: 'GET',
    path: `/oauth/apps/${id}/domains/${domain_id}/verify`
  });
}

export async function generateOAuthClientSecret({ id }) {
  return await sendRequest({
    method: 'GET',
    path: `/oauth/apps/${id}/secrets/new`
  });
}

export async function deleteOAuthClientSecret({ id, secretId }) {
  return await sendRequest({
    method: 'DELETE',
    path: `/oauth/apps/${id}/secrets/${secretId}`
  });
}

export async function getOAuthAccounts() {
  return await sendRequest({
    method: 'GET',
    path: `/oauth/accounts`
  });
}

export async function deleteOAuthAccount({ id }) {
  return await sendRequest({
    method: 'DELETE',
    path: `/oauth/accounts/${id}`
  });
}

export async function terminateOAuthAccountSessions({ id }) {
  return await sendRequest({
    method: 'DELETE',
    path: `/oauth/accounts/${id}/sessions`
  });
}

export async function newOAuthAppDomain({ id, domain }) {
  return await sendRequest({
    method: 'POST',
    path: `/oauth/apps/${id}/domains/new`,
    data: {
      domain
    }
  });
}

export async function deleteOAuthAppDomain({ id, domain_id }) {
  return await sendRequest({
    method: 'DELETE',
    path: `/oauth/apps/${id}/domains/${domain_id}`
  });
}
