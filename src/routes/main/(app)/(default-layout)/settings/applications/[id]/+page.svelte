<script>
  import { page } from '$app/stores';
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import AddIcon from '$lib/components/materialIcons/AddIcon.svelte';
  import CheckCircleIcon from '$lib/components/materialIcons/CheckCircleIcon.svelte';
  import DeleteIcon from '$lib/components/materialIcons/DeleteIcon.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { displayError } from '$lib/modules/errors';
  import { getOAuthApplication, updateOAuthApplication } from '$lib/modules/requests';
  import { onMount } from 'svelte';
  import AccessManagement from './AccessManagement.svelte';
  import Credentials from './Credentials.svelte';
  import DangerZone from './DangerZone.svelte';
  import DomainVerification from './DomainVerification.svelte';
  import EditAppIcon from './EditAppIcon.svelte';
  import MailRelay from './MailRelay.svelte';
  import Toggle from '$lib/components/common/Toggle.svelte';
  import UsageMetrics from './UsageMetrics.svelte';
  import SubscriptionPlan from './SubscriptionPlan.svelte';
  import Radio from '$lib/components/common/Radio.svelte';
  import InputButton from '$lib/components/common/InputButton.svelte';
  import Form from '$lib/components/common/Form.svelte';

  const SECTIONS = ['App Info', 'Credentials', 'Access Management', 'Mail Relay', 'Subscription Plan', 'Usage Metrics', 'Danger Zone'];

  const CLIENT_TYPE_OPTIONS = [
    { label: 'Confidential', value: false },
    { label: 'Public', value: true }
  ];

  const IS_LOCAL_DOMAIN_REGEX = new RegExp('^(?:localhost|.*.local)$');
  const IS_LOCAL_URL_REGEX = new RegExp('^http:|(?:https://(?:localhost\b.*|.*.local))$');

  let loading = false;

  let isPublicClient;
  let clientId;
  let clientSecrets;
  let icon;
  let name;
  let url;
  let domains;
  let callback_urls;
  let pkce;
  let active_users;
  let relay_metrics;
  let plan;
  let fdm_tech;
  let published_at;
  let selectedSection = 0;
  let uploadIconModalOpened = true;
  let domainVerificationModalOpened = true;
  let mainDomain;
  let verifiedURLs;
  let selectedDomain;

  $: _name = name;
  $: _url = url;
  $: _callback_urls = [...(callback_urls || [''])];
  $: domainByURL = Object.fromEntries((domains || []).map((domain) => domain.urls.map((url) => [url.val, domain])).flat());
  $: _isPublicClient = isPublicClient;
  $: _pkce = pkce || _isPublicClient;
  $: dirtyAppInfo = _name !== name || _url !== url || _pkce !== pkce || _isPublicClient !== isPublicClient || JSON.stringify(_callback_urls) !== JSON.stringify(callback_urls);
  $: isLocalUrl = IS_LOCAL_URL_REGEX.test(_url);

  function removeCallbackUrl(index) {
    _callback_urls.splice(index, 1);
    _callback_urls = [..._callback_urls];
  }

  function addCallbackUrl() {
    _callback_urls = _callback_urls.concat('');
  }

  // binding on the value seems to be buggy => handling input event directly
  function handleCallbackUrlInput(e, index) {
    _callback_urls[index] = e.srcElement.value;
  }

  function setData(data, reset = false) {
    if (reset) {
      name = undefined;
      url = undefined;
      pkce = undefined;
      isPublicClient = undefined;
    }
    clientId = data.id;
    clientSecrets = data.client_secrets;
    icon = data.icon ? `data:image/png;base64,${data.icon}` : undefined;
    name = data.name;
    isPublicClient = data.public;
    pkce = data.pkce;
    url = data.url;
    domains = data.domains;
    mainDomain = data.domains.find((d) => d.main);
    callback_urls = data.domains.map((d) => d.urls.map((url) => url.val)).flat();
    verifiedURLs = new Set(
      data.domains
        .filter((d) => d.verified_at)
        .map((d) => d.urls.map((url) => url.val))
        .flat()
    );
    active_users = data.active_users;
    relay_metrics = data.relay_metrics;
    plan = data.plan;
    fdm_tech = data.fdm_tech;
    published_at = data.published_at;
  }

  async function updateApplication() {
    loading = true;
    try {
      const res = await updateOAuthApplication({
        id: $page.params.id,
        name: _name,
        url: _url,
        callback_urls: _callback_urls,
        isPublicClient: _isPublicClient,
        pkce: _pkce
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      loading = false;
    }
  }

  async function fetchApplication(id, reset = false) {
    loading = true;
    try {
      const res = await getOAuthApplication({ id });
      setData(res.data, reset);
      console.log(res.data);
    } catch (err) {
      displayError(err);
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await fetchApplication($page.params.id);
  });
</script>

<Modal bind:open={uploadIconModalOpened} header minWidth="300px" maxWidth="500px">
  <EditAppIcon
    {clientId}
    {icon}
    handleClose={(refresh) => {
      uploadIconModalOpened = false;
      if (refresh) fetchApplication($page.params.id);
    }}
  />
</Modal>

<Modal bind:open={domainVerificationModalOpened} header minWidth="300px" maxWidth="500px">
  <DomainVerification
    {clientId}
    bind:domain={selectedDomain}
    handleClose={(refresh) => {
      domainVerificationModalOpened = false;
      if (refresh) fetchApplication($page.params.id);
    }}
  />
</Modal>

<Form on:submit={updateApplication}>
  <GridContainer template_columns="2fr 5fr" mobile_template_columns="1fr">
    <FlexContainer column padding="1.5rem 0px 1.5rem 1.5rem" gap="1rem" justify_content="flex-start" nomobile>
      <h3 class="no-margin oneline">OAuth Application</h3>

      <FlexContainer column rounded border nooverflow>
        {#each SECTIONS as title, index}
          {#if index > 0}
            <div class="gridline" />
          {/if}
          <Button
            on:click={() => {
              selectedSection = index;
            }}
            flexgrow
            ascolumn
            align_items="flex-start"
            selected={selectedSection === index}>{title}</Button
          >
        {/each}
      </FlexContainer>
    </FlexContainer>

    <FlexContainer column gap="1rem" align_items="center">
      <FlexContainer column padding="1.5rem" gap="0.7rem" mobileScale>
        <FlexContainer column justify_content="flex-start" gap="0.25rem" onlymobile>
          <h2 class="no-margin oneline">OAuth Application</h2>
        </FlexContainer>

        <FlexContainer column bgColor="var(--new-layer-color)" padding="1.5rem" gap="0.7rem" rounded mobileScale>
          <FlexContainer column align_items="center" justify_content="center" gap="0.2rem">
            <Button
              height="70px"
              width="auto"
              on:click={() => {
                uploadIconModalOpened = true;
              }}
              roundedIcon
              disabled={selectedSection > 0}
            >
              {#if icon}
                <img height="100%" alt="App Icon" src={icon} />
              {:else}
                <Logo dimension="70px" color="linear-gradient(#e66465, #9198e5)" opacity="1" blueprint />
              {/if}
            </Button>
            <h6 class="no-margin oneline">{_name}</h6>
          </FlexContainer>

          <FlexContainer column gap="1rem" onlymobile alwaysDisplay={selectedSection === 0}>
            <FlexContainer column gap="0.5rem">
              <h5 class="no-margin">Name</h5>
              <Input type="text" name="name" placeholder="Application Name" autocomplete="off" bind:value={_name} disabled={loading} required={true} />
            </FlexContainer>

            <FlexContainer column gap="0.5rem">
              <h5 class="no-margin">Homepage URL</h5>
              {#if published_at}
                <GridContainer height="35px" padding="0 0.5rem" align_items="center" bgColor="var(--new-layer-color)" template_columns="1fr auto" gap="0.3rem" rounded nooverflow>
                  <span class="oneline">{_url}</span>
                  {#if mainDomain.verified_at}
                    <CheckCircleIcon dimension="20px" />
                  {:else}
                    <Button
                      on:click={() => {
                        selectedDomain = mainDomain;
                        domainVerificationModalOpened = true;
                      }}
                      height="auto"
                      padding="0.3rem"
                      xsmall
                      warning
                      light
                      rounded
                      disabled={IS_LOCAL_DOMAIN_REGEX.test(domainByURL[mainDomain.value])}>verify</Button
                    >
                  {/if}
                </GridContainer>
              {:else}
                <Input
                  type="text"
                  name="url"
                  placeholder="https://<app.url>"
                  pattern="^http(s://.+|://(.+.local|localhost:[0-9]+))$"
                  }
                  autocomplete="off"
                  bind:value={_url}
                  disabled={loading}
                  required={true}
                />
              {/if}
            </FlexContainer>

            <FlexContainer column gap="0.5rem">
              <h5 class="no-margin">Client Type</h5>
              <Radio width="auto" options={CLIENT_TYPE_OPTIONS} bind:selected={_isPublicClient} />
            </FlexContainer>
          </FlexContainer>

          <FlexContainer column padding="1rem" gap="1rem" border rounded mobileScale onlymobile alwaysDisplay={selectedSection === 0}>
            <FlexContainer column align_items="center" justify_content="center" textCentered gap="0.3rem">
              {#if _isPublicClient}
                <h6 class="no-margin oneline">PUBLIC CLIENT</h6>
                <span class="xs">For frontend applications that need to authenticate users without a backend component. This flow does not use "client secrets".</span>
              {:else}
                <h6 class="no-margin oneline">CONFIDENTIAL CLIENT</h6>
                <span class="xs">For applications with server backends. Must be able to securely store and access the "client secret" without exposing it to the front end of your application.</span>
              {/if}
            </FlexContainer>

            <div class="gridline" />

            <FlexContainer column gap="1rem">
              <FlexContainer column gap="0.5rem">
                <h5 class="no-margin">Callback URLs</h5>
                <GridContainer template_columns="1fr auto" gap="0.3rem">
                  {#each _callback_urls as callback_url, index}
                    <InputButton hideButton={!published_at || dirtyAppInfo || verifiedURLs.has(callback_url)}>
                      <Input
                        slot="input"
                        wide
                        button={published_at && !dirtyAppInfo && !verifiedURLs.has(callback_url)}
                        type="text"
                        name={`callback_url_${index}`}
                        placeholder="https://<app.url>/callback"
                        pattern={isLocalUrl ? '^http://(.+.local|localhost:[0-9]+)(/.*)?$' : '^https://.+$'}
                        autocomplete="off"
                        on:input={(e) => handleCallbackUrlInput(e, index)}
                        value={callback_url}
                        disabled={loading}
                        required={true}
                      />
                      <Button
                        slot="button"
                        on:click={() => {
                          selectedDomain = domainByURL[callback_url];
                          domainVerificationModalOpened = true;
                        }}
                        height="auto"
                        padding="0.3rem"
                        xsmall
                        warning
                        light
                        rounded
                        disabled={IS_LOCAL_DOMAIN_REGEX.test(domainByURL[callback_url])}>verify</Button
                      >
                    </InputButton>
                    <Button on:click={() => removeCallbackUrl(index)} padding="2px 7px" blendin rounded disabled={_callback_urls.length <= 1}
                      ><DeleteIcon dimension="20px" disabled={_callback_urls.length <= 1} /></Button
                    >
                  {/each}
                  <Button on:click={addCallbackUrl} height="30px" width="100%" padding="0px 4px" basic rounded border xsmall gap="0.2rem" disabled={loading}
                    ><AddIcon color="var(--color)" dimension="16px" />Add Callback URL</Button
                  >
                </GridContainer>
              </FlexContainer>

              <!-- <div class="gridline" /> -->

              <FlexContainer column gap="0.15rem">
                <FlexContainer align_items="center" justify_content="space-between" gap="0.5rem">
                  <h5 class="no-margin">Enable PKCE</h5>
                  <Toggle size="13px" bind:checked={_pkce} noColorIfDisabled={_isPublicClient} disabled={loading || _isPublicClient} />
                </FlexContainer>
                {#if _isPublicClient}
                  <span class="xs">PKCE is required for public clients.</span>
                {:else}
                  <span class="xs">PKCE is recommended for all OAUTH2 clients for better security.</span>
                {/if}
              </FlexContainer>
            </FlexContainer>
          </FlexContainer>

          {#if dirtyAppInfo}
            <FlexContainer onlymobile alwaysDisplay={selectedSection === 0}>
              <GridContainer template_columns="1fr 1fr" align_items="center" justify_items="stretch" gap="0.5rem">
                <Button on:click={() => fetchApplication($page.params.id, true)} width="100%" height="100%" padding="0.5rem 0" basic border rounded disabled={loading}>Reset</Button>
                <Button type="submit" width="100%" height="100%" padding="0.5rem 0" primary rounded disabled={loading}>Save Changes</Button>
              </GridContainer>
            </FlexContainer>
          {/if}
        </FlexContainer>

        <Credentials {clientId} {clientSecrets} {isPublicClient} {loading} selected={selectedSection === 1} />
        <AccessManagement {clientId} bind:published_at {loading} selected={selectedSection === 2} {isLocalUrl} />
        <MailRelay {clientId} {domains} {loading} selected={selectedSection === 3} />
        <SubscriptionPlan {clientId} {active_users} {relay_metrics} {plan} {fdm_tech} {loading} selected={selectedSection === 4} />
        <UsageMetrics {active_users} {relay_metrics} bind:published_at {loading} selected={selectedSection === 5} />
        <DangerZone id={$page.params.id} {name} selected={selectedSection === 6} />
      </FlexContainer>
    </FlexContainer>
  </GridContainer>
</Form>
