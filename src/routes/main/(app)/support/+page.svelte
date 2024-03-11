<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import InputLabel from '$lib/components/common/InputLabel.svelte';
  import Select from '$lib/components/common/Select.svelte';
  import TextArea from '$lib/components/common/TextArea.svelte';
  import AlternateEmailIcon from '$lib/components/materialIcons/AlternateEmailIcon.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import ArrowDropDownIcon from '$lib/components/materialIcons/ArrowDropDownIcon.svelte';
  import MailIcon from '$lib/components/materialIcons/MailIcon.svelte';
  import { LANDING_CLIENT_URL } from '$lib/modules/constants';
  import { displayError } from '$lib/modules/errors';
  import { saveAs } from '$lib/modules/export';
  import { submitSupportRequest } from '$lib/modules/requests';
  import { gotoExt } from '$lib/modules/routingUtils';
  import { showSnackbar } from '$lib/stores/snackbar';

  let contactUsExpanded = false;
  let downloadingKey = {};

  const PGP_KEYS = {
    support: {
      fingerprint: '52E5F618',
      value:
        '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nxjMEZHc9dBYJKwYBBAHaRw8BAQdA+mi1KgpckAMSuU6MCNRcXAxQGMjwXm6c\nCSDuovDWEKnNNXN1cHBvcnRAcHJpdmFjeXBvcnRhbC5vcmcgPHN1cHBvcnRA\ncHJpdmFjeXBvcnRhbC5vcmc+wowEEBYKAD4FgmR3PXQECwkHCAmQUPjnsUug\nE+sDFQgKBBYAAgECGQECmwMCHgEWIQRS5fYYVspfkiEDovxQ+OexS6AT6wAA\nFxcA/iQ4rg/SEbQIUUiNT2gvwlpxgPAvWib9o8MomjC0OC89AP9jGnVbQzjT\nfzUXu86nTdrWxzXD8r0zSPucCh8ZdxVvA844BGR3PXQSCisGAQQBl1UBBQEB\nB0AN/iljs1UB2M0u+Nb5pLprHZuy6D1U2JnOzDD5A0uTCQMBCAfCeAQYFggA\nKgWCZHc9dAmQUPjnsUugE+sCmwwWIQRS5fYYVspfkiEDovxQ+OexS6AT6wAA\nG70A/1JpTeGmJtM61Dtt41J7jWK56tlpmGqw9HhddSa8YY+bAQCMMrwphd5G\n/x2T/Crx/vXlXT3U93Y+ILAxe0o+w4TzBQ==\n=bQPi\n-----END PGP PUBLIC KEY BLOCK-----\n'
    },
    security: {
      fingerprint: 'C52644F0',
      value:
        '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nxjMEZN8irhYJKwYBBAHaRw8BAQdAtwyPzIp5bfCgESvQPzcsDFOX1ZCud20N\nngf41I0UODvNN3NlY3VyaXR5QHByaXZhY3lwb3J0YWwub3JnIDxzZWN1cml0\neUBwcml2YWN5cG9ydGFsLm9yZz7CjAQQFgoAPgWCZN8irgQLCQcICZBW3Igd\n+0l8SQMVCAoEFgACAQIZAQKbAwIeARYhBMUmRPCFnaPS94LkElbciB37SXxJ\nAAAnTwD/fu2LsN+BK3O4K1mjJMM4j6zKuD0PaAF0+bVSGllmoyMBAP/XTlGo\n4cjNcKJoVlv5Lai2CmQbVTftrAWFHoWB+xIHzjgEZN8irhIKKwYBBAGXVQEF\nAQEHQKsHcwOB7fe4b/rD76NGyFpcm061zQoKR267JrHDU3dcAwEIB8J4BBgW\nCAAqBYJk3yKuCZBW3Igd+0l8SQKbDBYhBMUmRPCFnaPS94LkElbciB37SXxJ\nAAC7PwEAxUQRN05RxcEzxwu9mGNw/dKPewwESTUBByBvt4AqKdMBAJquT4zU\nnwzdn0RrWemUCsSKDZVe3+F1vqcfRuMSfS0P\n=Jk4p\n-----END PGP PUBLIC KEY BLOCK-----\n'
    }
  };

  async function downloadPGPKey(type) {
    downloadingKey[type] = true;
    const { fingerprint, value } = PGP_KEYS[type];
    try {
      saveAs({
        filename: `publickey - ${type}@privacyportal.org - 0x${fingerprint}.asc`,
        data: value,
        type: 'application/pgp-keys'
      });
    } catch (err) {
      showSnackbar({ text: 'Download failed. Please try again later.' });
      console.error(err);
    } finally {
      delete downloadingKey[type];
    }
  }

  const EMAIL_SUBJECT_DRAFT = 'Request%20to%20Join%20Your%20Service%20-%20%5BYour%20Name%5D';
  const EMAIL_BODY_DRAFT =
    "Dear%20%5BSupport%20Team%5D%2C%0A%0AI%20hope%20this%20email%20finds%20you%20well.%20I%20am%20writing%20to%20express%20my%20interest%20in%20registering%20for%20your%20online%20service%20while%20ensuring%20utmost%20privacy%20and%20security.%20I%20have%20been%20actively%20searching%20for%20ways%20to%20safeguard%20my%20personal%20information%20from%20potential%20data%20leaks%20and%20spam.%0A%0AI%20understand%20that%20providing%20my%20personal%20email%20address%20is%20necessary%20for%20registration%20purposes.%20However%2C%20I%20kindly%20request%20your%20consideration%20in%20allowing%20me%20to%20register%20with%20my%20Privacy%20Portal%20email%20address%20(ending%20with%20'%40pportal.io')%20designed%20specifically%20for%20privacy%20and%20security.%20By%20utilizing%20this%20address%2C%20you%20will%20still%20be%20able%20to%20reach%20me%20normally%20and%20indefinitely.%20Privacy%20Portal%20does%20not%20offer%20disposable%20emails%20and%20using%20their%20addresses%20should%20pose%20no%20risk%20to%20your%20business.%0A%0AI%20genuinely%20believe%20that%20allowing%20privacy%20addresses%20would%20not%20only%20attract%20users%20who%20prioritize%20privacy%20but%20also%20reinforce%20your%20commitment%20to%20providing%20a%20secure%20online%20environment.%0A%0AThank%20you%20for%20considering%20my%20request.%20I%20look%20forward%20to%20hearing%20your%20thoughts%20on%20this%20matter%20and%20potentially%20being%20able%20to%20join%20your%20service%20soon.%0A%0ASincerely%2C%0A%5BYour%20Name%5D";

  const SUPPORT_TOPICS = [
    { text: 'Select the topic', disabled: true, selected: true },
    { text: 'Usage Question', value: 'usage' },
    { text: 'Private Account Question', value: 'support' },
    { text: 'Mail Deliverability Issue', value: 'mail_deliverability' },
    { text: 'Report Privacy Address Rejection', value: 'rejection' },
    { text: 'Report Issue', value: 'issue' },
    { text: 'Report Spam Mail', value: 'spam' },
    { text: 'Feature Request', value: 'feature' },
    { text: 'Report Security Vulnerability', value: 'security' }
  ];

  const MAIL_DELIVERABILITY_OPTIONS = [
    { text: 'Select the issue', disabled: true, selected: true },
    { text: 'Unable to send mail to', value: 'outbound' },
    { text: 'Unable to receive mail from', value: 'inbound' }
  ];

  let submitting = false;
  let supportTopic;
  let message;
  let mailDeliverabilityType;
  let domain;
  let url;

  function getSupportMessage(supportTopic) {
    switch (supportTopic) {
      case 'mail_deliverability':
        return `${mailDeliverabilityType} mail issue for ${domain}`;
      case 'rejection':
        return `privacy address rejected by: ${url}`;
    }
    return message;
  }

  async function handleSubmitSupportRequest() {
    try {
      submitting = true;

      const { data } = await submitSupportRequest({
        type: supportTopic,
        message: getSupportMessage(supportTopic)
      });

      showSnackbar({ text: `submitted ticket #${data.ticket_num}` });

      // reset
      message = undefined;
      supportTopic = undefined;
      mailDeliverabilityType = undefined;
      domain = undefined;
    } catch (err) {
      displayError(err);
      console.error(err);
    } finally {
      submitting = false;
    }
  }
</script>

<FlexContainer column padding="1rem" align_items="flex-start" justify_content="flex-start" gap="1rem">
  <h1 class="no-margin">Get Help</h1>
  <FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
    <h4 class="no-margin">Have a question?</h4>
    <span class="sm">Most likely you will find your answer on our Frequently Asked Questions page.</span>
    <Button on:click={gotoExt(`${LANDING_CLIENT_URL}/mail-relay/support`)} primary rounded>Open FAQ page</Button>
    <hr class="divider sm-v-margin" />
    <span class="sm">Check out our Community site for previously answered questions or post your new question there.</span>
    <Button on:click={gotoExt('https://community.privacyportal.org')} primary rounded>Open Community Site</Button>
    <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
      <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
      <span class="note"
        >Remember, don't post any personal information such as emails or IP addresses to the Community site. For account specific questions, we recommend you directly contact support.</span
      >
    </GridContainer>
  </FlexContainer>
  <FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
    <h4 class="no-margin">Contact Support</h4>

    <FlexContainer column align_items="strech" gap="0.5rem" width="100%">
      <Select bind:value={supportTopic} height="35px" options={SUPPORT_TOPICS} />
      {#if supportTopic}
        <FlexContainer column align_items="strech" padding="0.5rem" gap="0.5rem" width="100%">
          {#if supportTopic === 'usage'}
            <span class="sm"
              >For general info or usage questions, please check out the FAQ and our Community site for previously answered questions. If your question hasn't already been answered, please post it to
              the Community site where our moderators will be happy to help.</span
            >
            <Button on:click={gotoExt('https://community.privacyportal.org')} primary rounded>Open Community Site</Button>
          {:else if supportTopic === 'support'}
            <Form on:submit={handleSubmitSupportRequest} width="100%">
              <FlexContainer column gap="0.5rem">
                <TextArea name="body" placeholder="Enter your question" required bind:value={message} disabled={submitting} />
                <Button type="submit" disabled={submitting} padding="0.5rem 1rem" primary rounded>Submit Question</Button>
              </FlexContainer>
            </Form>
          {:else if supportTopic === 'spam'}
            <h5 class="no-margin">Received spam? What next?</h5>
            <ul class="no-margin">
              <li>
                <span class="sm"
                  ><strong>Do not mark the email as spam</strong>. Marking emails as spam (or moving them to your junk mailbox) will hurt the reputation of our mail servers and could lead to
                  legitimate emails no longer getting delivered to your inbox.</span
                >
              </li>
              <li>
                <span class="sm"
                  ><strong>Deactivate</strong> or <strong>Delete</strong> the Privacy Address that is receiving spam. These addresses should be used for single purpose and deactivating them should only
                  impact the spamming party.</span
                >
              </li>
            </ul>
          {:else if supportTopic === 'mail_deliverability'}
            <span class="sm"
              >We are always monitoring and working on fixing mail deliverability issues. Reporting will notify us about the problem in case we aren't already working to resolve it.</span
            >
            <Form on:submit={handleSubmitSupportRequest} width="100%">
              <FlexContainer column gap="0.5rem">
                <GridContainer template_columns="1fr 1fr" mobile_template_columns="1fr" gap="0.5rem">
                  <Select bind:value={mailDeliverabilityType} height="35px" options={MAIL_DELIVERABILITY_OPTIONS} />
                  <InputLabel>
                    <AlternateEmailIcon slot="icon" />
                    <Input slot="input" name="domain" placeholder="domain" pattern="^\S+(\.\S+)+$" icon bind:value={domain} />
                  </InputLabel>
                </GridContainer>
                <Button type="submit" disabled={submitting} padding="0.5rem 1rem" primary rounded>Report Issue</Button>
              </FlexContainer>
            </Form>
            <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
              <AnnouncementIcon color="var(--info-color)" dimension="18px" />
              <span class="note"
                >To improve email deliverability to your inbox, configure your personal mail by adding a rule (or filter) that marks all emails sent from addresses ending with 'pportal.io' as safe.</span
              >
            </GridContainer>
          {:else if supportTopic === 'rejection'}
            <span class="sm"
              >Some websites mistakenly or purposefully reject Privacy Addresses. You could reach out to their support to let them know why this is bad for your privacy and security.</span
            >
            <Button height="25px" on:click={gotoExt(`mailto:?subject=${EMAIL_SUBJECT_DRAFT}&body=${EMAIL_BODY_DRAFT}`)} xsmall border rounded>Create Draft</Button>
            <hr class="divider sm-v-margin" />
            <span class="sm">Also please report this issue to us to help us keep track of these problems.</span>
            <Form on:submit={handleSubmitSupportRequest} width="100%">
              <FlexContainer column gap="0.5rem">
                <Input name="website" placeholder="https://website" pattern="^https:\/\/.+$" autocomplete="off" bind:value={url} />
                <Button type="submit" disabled={submitting} padding="0.5rem 1rem" primary rounded>Report Website</Button>
              </FlexContainer>
            </Form>
          {:else if supportTopic === 'issue'}
            <Form on:submit={handleSubmitSupportRequest} width="100%">
              <FlexContainer column gap="0.5rem">
                <TextArea name="description" placeholder="Describe the issue (and the steps to reproduce it)" required minlength="10" maxlength="500" bind:value={message} disabled={submitting} />
                <Button type="submit" disabled={submitting} padding="0.5rem 1rem" primary rounded>Report Issue</Button>
              </FlexContainer>
            </Form>
          {:else if supportTopic === 'security'}
            <Form on:submit={handleSubmitSupportRequest} width="100%">
              <FlexContainer column gap="0.5rem">
                <TextArea name="message" placeholder="Describe the security vulnerability" required minlength="10" maxlength="500" bind:value={message} disabled={submitting} />
                <Button type="submit" disabled={submitting} padding="0.5rem 1rem" primary rounded>Report Vulnerability</Button>
              </FlexContainer>
            </Form>
          {:else if supportTopic === 'feature'}
            <Form on:submit={handleSubmitSupportRequest} width="100%">
              <FlexContainer column gap="0.5rem">
                <TextArea name="message" placeholder="Describe the feature" required minlength="10" maxlength="500" bind:value={message} disabled={submitting} />
                <Button type="submit" disabled={submitting} padding="0.5rem 1rem" primary rounded>Submit Feature Request</Button>
              </FlexContainer>
            </Form>
          {/if}

          {#if supportTopic !== 'usage' && supportTopic !== 'spam' && supportTopic !== 'mail_deliverability'}
            <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
              <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
              <span class="note">Please note that it could take up to 24h for support to respond during weekdays.</span>
            </GridContainer>
          {/if}
        </FlexContainer>
      {/if}
    </FlexContainer>
  </FlexContainer>

  <FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
    <Button on:click={() => (contactUsExpanded = !contactUsExpanded)} height="auto" width="100%" blendin nohover rounded>
      <FlexContainer align_items="center" justify_content="space-between">
        <h5 class="no-margin">Contact Us</h5>
        <ArrowDropDownIcon opened={contactUsExpanded} dimension="18px" />
      </FlexContainer>
    </Button>

    {#if contactUsExpanded}
      <span class="sm">Alternatively, you can contact us directly by mail.</span>

      <FlexContainer align_items="stretch" gap="0.5rem">
        <Button on:click={gotoExt('mailto:support@privacyportal.org')} height="auto" padding="0.1rem 0.4rem" gap="0.3rem" border rounded>
          <MailIcon dimension="15px" />
          <span class="sm mono oneline">support@privacyportal.org</span>
        </Button>
        <Button on:click={() => downloadPGPKey('support')} height="auto" padding="0.1rem 0.4rem" gap="0.3rem" border rounded disabled={downloadingKey?.support}>
          <span class="xs oneline"><strong>PGP Key</strong></span>
        </Button>
      </FlexContainer>

      <FlexContainer align_items="stretch" gap="0.5rem">
        <Button on:click={gotoExt('mailto:security@privacyportal.org')} height="auto" padding="0.1rem 0.4rem" gap="0.3rem" border rounded>
          <MailIcon dimension="15px" />
          <span class="sm mono oneline">security@privacyportal.org</span>
        </Button>
        <Button on:click={() => downloadPGPKey('security')} height="auto" padding="0.1rem 0.4rem" gap="0.3rem" border rounded disabled={downloadingKey?.security}>
          <span class="xs oneline"><strong>PGP Key</strong></span>
        </Button>
      </FlexContainer>

      <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">It could take longer for our support team to respond to direct emails.</span>
      </GridContainer>
    {/if}
  </FlexContainer>
</FlexContainer>
