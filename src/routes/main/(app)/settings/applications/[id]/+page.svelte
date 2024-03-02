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

  let loading = false;

  let clientId;
  let clientSecrets;
  let icon;
  let name;
  let url;
  let domains;
  let callback_urls;
  let published_at;
  let dirtyCallbackURLs;
  let selectedSection = 0;
  let uploadIconModalOpened = true;
  let domainVerificationModalOpened = true;
  let mainDomain;

  $: _name = name;
  $: _url = url;
  $: _callback_urls = [...(callback_urls || [])];
  $: dirtyAppInfo = _name !== name || _url !== url || JSON.stringify(_callback_urls) !== JSON.stringify(callback_urls);

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

  function setData(data) {
    clientId = data.id;
    clientSecrets = data.client_secrets;
    icon = data.icon ? `data:image/png;base64,${data.icon}` : undefined;
    name = data.name;
    url = data.url;
    domains = data.domains;
    mainDomain = data.domains[0];
    callback_urls = data.callback_urls;
    published_at = data.published_at;
  }

  async function updateApplication() {
    loading = true;
    try {
      const res = await updateOAuthApplication({
        id: $page.params.id,
        name: _name,
        url: _url,
        callback_urls: _callback_urls
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      loading = false;
    }
  }

  async function fetchApplication(id) {
    loading = true;
    try {
      const res = await getOAuthApplication({ id });
      setData(res.data);
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
    bind:domain={mainDomain}
    handleClose={(refresh) => {
      domainVerificationModalOpened = false;
      if (refresh) fetchApplication($page.params.id);
    }}
  />
</Modal>

<form on:submit|preventDefault={updateApplication}>
  <GridContainer template_columns="2fr 5fr" mobile_template_columns="1fr">
    <FlexContainer column padding="1.5rem 0px 1.5rem 1.5rem" gap="1rem" justify_content="flex-start" nomobile>
      <h3 class="no-margin oneline">OAuth Application</h3>

      <FlexContainer column rounded border nooverflow>
        <Button
          on:click={() => {
            selectedSection = 0;
          }}
          flexgrow
          ascolumn
          align_items="flex-start"
          selected={selectedSection === 0}>App Info</Button
        >
        <div class="gridline" />
        <Button
          on:click={() => {
            selectedSection = 1;
          }}
          flexgrow
          ascolumn
          align_items="flex-start"
          selected={selectedSection === 1}>Credentials</Button
        >
        <div class="gridline" />
        <Button
          on:click={() => {
            selectedSection = 2;
          }}
          flexgrow
          ascolumn
          align_items="flex-start"
          selected={selectedSection === 2}>Access Management</Button
        >
        <div class="gridline" />
        <Button
          on:click={() => {
            selectedSection = 3;
          }}
          flexgrow
          ascolumn
          align_items="flex-start"
          selected={selectedSection === 3}>Mail Relay</Button
        >
        <div class="gridline" />
        <Button
          on:click={() => {
            selectedSection = 4;
          }}
          flexgrow
          ascolumn
          align_items="flex-start"
          selected={selectedSection === 4}>Danger Zone</Button
        >
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
                    <Button on:click={() => (domainVerificationModalOpened = true)} height="auto" padding="0.3rem" xsmall warning light rounded disabled={domains?.[0]?.value === 'localhost'}
                      >verify</Button
                    >
                  {/if}
                </GridContainer>
              {:else}
                <Input
                  type="text"
                  name="url"
                  placeholder="https://<app.url>"
                  pattern="^http(s:\/\/.+|:\/\/localhost:[0-9]+)$"
                  autocomplete="off"
                  bind:value={_url}
                  disabled={loading}
                  required={true}
                />
              {/if}
            </FlexContainer>

            <FlexContainer column gap="0.5rem">
              <h5 class="no-margin">Callback URLs</h5>
              <GridContainer template_columns="1fr auto" gap="0.3rem">
                {#each _callback_urls as callback_url, index}
                  <Input
                    type="text"
                    name={`callback_url_${index}`}
                    placeholder="https://<app.url>"
                    pattern="^http(s:\/\/.+|:\/\/localhost:[0-9]+\/.+)$"
                    autocomplete="off"
                    on:input={(e) => handleCallbackUrlInput(e, index)}
                    value={callback_url}
                    disabled={loading}
                    required={true}
                  />
                  <Button on:click={() => removeCallbackUrl(index)} padding="2px 7px" blendin rounded disabled={_callback_urls.length <= 1}
                    ><DeleteIcon dimension="20px" disabled={_callback_urls.length <= 1} /></Button
                  >
                {/each}
                <Button on:click={addCallbackUrl} height="30px" width="100%" padding="0px 4px" basic rounded border xsmall gap="0.2rem" disabled={loading}
                  ><AddIcon color="var(--color)" dimension="16px" />Add Callback URL</Button
                >
              </GridContainer>
            </FlexContainer>

            {#if dirtyAppInfo || dirtyCallbackURLs}
              <GridContainer template_columns="1fr 1fr" align_items="center" justify_items="stretch" gap="0.5rem">
                <Button on:click={() => fetchApplication($page.params.id)} width="100%" height="100%" padding="0.5rem 0" basic border rounded disabled={loading}>Reset</Button>
                <Button type="submit" width="100%" height="100%" padding="0.5rem 0" primary rounded disabled={loading}>Save Changes</Button>
              </GridContainer>
            {/if}
          </FlexContainer>
        </FlexContainer>

        <Credentials {clientId} {clientSecrets} {loading} selected={selectedSection === 1} />
        <AccessManagement {clientId} bind:published_at {loading} selected={selectedSection === 2} />
        <MailRelay {clientId} {domains} {loading} selected={selectedSection === 3} />
        <DangerZone id={$page.params.id} {name} selected={selectedSection === 4} />
      </FlexContainer>
    </FlexContainer>
  </GridContainer>
</form>
