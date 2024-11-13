<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import MultiStep from '$lib/components/common/MultiStep.svelte';
  import Select from '$lib/components/common/Select.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import { LANDING_CLIENT_URL, ORGANIZATION } from '$lib/modules/constants';
  import { SIGNING_ALGORITHMS } from '$lib/modules/pki/constants';
  import { activateProfile, enableCertificate, issueCertificate } from '$lib/modules/requests';
  import { sessionWrite } from '$lib/modules/storage';
  import { issueCertLoading, profiles as profilesStore } from '$lib/stores/profiles';
  import { Pkcs10CertificateRequest, X509Certificate } from '@peculiar/x509';
  import { createIntermediateCertFromCSR, createSmimeCertificateRequest, createSmimeRootCert } from '@privacyportal/client-certs';
  import { Convert } from 'pvtsutils';
  import SmimeExport from './SmimeExport.svelte';

  export let account;
  export let handleClose = () => {};
  let newProfile;
  let progressIndex;
  let activating = false;
  let scrollableContainer;

  let amount = 3;
  let unit = 'years';

  function nextStep() {
    progressIndex++;
    scrollableContainer.scrollTop = 0;
  }

  async function processIntermediateCSR({ issuerCSR, notBefore, notAfter }, crypto = window.crypto) {
    const verified = await issuerCSR.verify(crypto);
    if (!verified) throw new Error('Temprorary error. Please try again later.');

    // generate root keys
    const rootKeys = await crypto.subtle.generateKey(SIGNING_ALGORITHMS.sha256WithRSAEncryption, true, ['sign', 'verify']);
    const rootCert = await createSmimeRootCert({
      keys: rootKeys,
      signingAlgorithm: SIGNING_ALGORITHMS.sha256WithRSAEncryption,
      notBefore,
      notAfter,
      organization: ORGANIZATION
    });

    const intermediateCert = await createIntermediateCertFromCSR({
      csr: issuerCSR,
      rootCert,
      notBefore,
      notAfter,
      signingAlgorithm: SIGNING_ALGORITHMS.sha256WithRSAEncryption,
      signingKeys: rootKeys
    });

    return {
      rootCert,
      intermediateCert
    };
  }

  async function requestCertificate() {
    const email = account?.email;

    issueCertLoading.set(true);

    try {
      const keys = await window.crypto.subtle.generateKey(SIGNING_ALGORITHMS.sha256WithRSAEncryption, true, ['sign', 'verify']);
      const certSignReq = await createSmimeCertificateRequest({ email, keys, signingAlgorithm: SIGNING_ALGORITHMS.sha256WithRSAEncryption });

      const privateKey = Convert.ToBase64(await window.crypto.subtle.exportKey('pkcs8', keys.privateKey));

      const publicKey = Convert.ToBase64(await window.crypto.subtle.exportKey('spki', keys.publicKey));

      console.log(keys);
      console.log(certSignReq);
      console.log(privateKey);
      console.log(publicKey);

      const { data } = await issueCertificate({ accountId: account.id, csr: certSignReq.toString('pem'), validity: { amount, unit } });
      console.log(data);

      const { id, issuer_csr, pem } = data;

      const endEntityCert = new X509Certificate(pem);
      const issuerCSR = new Pkcs10CertificateRequest(issuer_csr);
      const { rootCert, intermediateCert } = await processIntermediateCSR({
        issuerCSR,
        notBefore: endEntityCert.notBefore,
        notAfter: endEntityCert.notAfter
      });

      await enableCertificate({
        accountId: account.id,
        id,
        issuer_pem: intermediateCert.toString('pem'),
        root_pem: rootCert.toString('pem')
      });

      console.log('root cert:', rootCert.toString('pem'));
      console.log('intermediate cert:', intermediateCert.toString('pem'));

      // write private key to session
      sessionWrite(id, { privateKey });

      newProfile = Object.assign({}, data, { root_pem: rootCert.toString('pem'), issuer_pem: intermediateCert.toString('pem') });
      profilesStore.update((profiles) => [newProfile, ...profiles.filter((p) => p.id != id)]);

      nextStep();
    } catch (err) {
      /* do nothing */
      console.error(err);
    } finally {
      issueCertLoading.set(false);
    }
  }

  async function handleActivateProfile() {
    activating = true;
    try {
      await activateProfile({ accountId: newProfile.acct_id, id: newProfile.id });
      profilesStore.update((profilesArr) => {
        return profilesArr.map((p) => (p.id === newProfile.id || p.enabled === true ? Object.assign(p, { enabled: p.id === newProfile.id }) : p));
      });
      handleClose();
    } catch (err) {
      /* do nothing */
      console.error(err);
    } finally {
      activating = false;
    }
  }
</script>

<!-- Step 1: Issue Certificate -->
<!-- Step 2: Export Certificate -->
<!-- Step 3: Install Certificate -->
<!-- Step 4: Trust Root Certificate -->
<FlexContainer height="100%" align_items="stretch" padding="0.5rem 0.1rem" bgColor="var(--new-layer-color)" rounded>
  <FlexContainer column gap="0.5rem">
    <FlexContainer column gap="0.5rem" padding="0 0.9rem">
      <h4 class="no-margin">New S/MIME Profile</h4>
      <MultiStep bind:progressIndex nodes={[{ text: 'Issue' }, { text: 'Export' }, { text: 'Install' }, { text: 'Trust' }, { text: 'Activate' }]} />
      <hr class="sm-v-margin divider" />
    </FlexContainer>
    <FlexContainer column gap="0.5rem" nooverflow padding="0 0.9rem" bind:element={scrollableContainer}>
      {#if progressIndex === 0}
        <h5 class="no-margin">Issue Certificate</h5>
        <span
          ><small>S/MIME uses certificates to establish trust between both parties. When issuing a certificate, your private key is generated in your browser and is never shared with us.</small></span
        >
        <FlexContainer padding="0.5rem" column border rounded gap="0.5rem">
          <h6 class="no-margin">Certificate Expiry</h6>
          <span><small>Define the expiration time of your newly issued certificate.</small></span>
          <FlexContainer align_items="center" gap="0.5rem">
            <Input height="35px" bind:value={amount} disabled={$issueCertLoading} type="number" step="1" min="1" max="100" />
            <Select
              height="35px"
              bind:value={unit}
              disabled={$issueCertLoading}
              options={[
                { text: 'years', value: 'years' },
                { text: 'months', value: 'months' },
                { text: 'days', value: 'days' }
              ]}
            />
          </FlexContainer>
        </FlexContainer>

        <Button on:click={requestCertificate} disabled={$issueCertLoading} padding="0.5rem 0" primary rounded>Issue Certificate</Button>
        <GridContainer template_columns="18px auto" align_items="center" margin="0.5rem 0" gap="0.5rem">
          <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
          <span class="note">Make sure your email client supports S/MIME.</span>
        </GridContainer>
      {:else if progressIndex === 1}
        <SmimeExport bind:profile={newProfile} />
        <Button on:click={nextStep} width="100%" padding="0.5rem 0" basic rounded>Continue</Button>
      {:else if progressIndex === 2}
        <h5 class="no-margin">Install Certificate</h5>
        <span
          ><small
            >Installing the certificate on your device can vary depending on the operating system and the mail client. The following are the most common ways to install the certificate:
            <ol>
              <li>Directly importing the certificate in the S/MIME settings of your email client. (e.g. Thunderbird)</li>
              <li>Emailing the certificate to your inbox and opening it in your mail client. (e.g. Outlook)</li>
              <li>Importing the certificate to the system wide certificate manager. (e.g. Keychain on macOS)</li>
            </ol>
          </small></span
        >
        <Button on:click={nextStep} padding="0.5rem 0" primary rounded>Continue</Button>
        <GridContainer template_columns="18px auto" align_items="center" margin="0.5rem 0" gap="0.5rem">
          <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
          <span class="note">During install you will be prompted to enter the passphrase you just created when exporting the certificates.</span>
        </GridContainer>
      {:else if progressIndex === 3}
        <h5 class="no-margin">Trust Root Certificate</h5>
        <span
          ><small
            >Mail Relay uses S/MIME in a decenralized manner. During the certificate issuance, a user-specific root certificate was created in your browser. Your device does not automatically trust
            that certificate. In order for S/MIME to function properly, you will need to manually trust the root certificate. <a href={`${LANDING_CLIENT_URL}/blog/how-to-set-up-smime-encryption`}
              >Learn more</a
            ></small
          ></span
        >
        <Button on:click={nextStep} padding="0.5rem 0" primary rounded>Continue</Button>
        <GridContainer template_columns="18px auto" align_items="center" margin="0.5rem 0" gap="0.5rem">
          <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
          <span class="note">Note that you can terminate trust at any point by uninstalling the root certificate.</span>
        </GridContainer>
      {:else if progressIndex === 4}
        <h5 class="no-margin">Activate Profile</h5>
        <span><small>Set this profile as default to start encrypting incoming emails.</small></span>
        <Button on:click={handleActivateProfile} disabled={activating} padding="0.5rem 0" primary rounded>Set as Default</Button>
        <Button on:click={handleClose} padding="0.5rem 0" basic rounded>Close</Button>
        <GridContainer template_columns="18px auto" align_items="center" margin="0.5rem 0" gap="0.5rem">
          <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
          <span class="note">You can modify the default profile later from the profiles list.</span>
        </GridContainer>
      {/if}
    </FlexContainer>
  </FlexContainer>
</FlexContainer>
