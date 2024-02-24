<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import DeleteIcon from '$lib/components/materialIcons/DeleteIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { deleteOAuthAppDomain, newOAuthAppDomain } from '$lib/modules/requests';
  import DomainVerification from './DomainVerification.svelte';

  const MAX_SENDER_DOMAINS = 3;

  export let selected;
  export let loading;
  export let clientId;
  export let domains;
  let selectedDomain;
  let removingDomain;

  let newDomain;
  let registeringDomain;
  let newDomainModalOpened = false;

  let domainVerificationModalOpened = false;

  async function registerDomain() {
    try {
      registeringDomain = true;
      const { data } = await newOAuthAppDomain({ id: clientId, domain: newDomain });
      domains = [...domains, data.domain];
      newDomainModalOpened = false;
      newDomain = undefined;
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      registeringDomain = false;
    }
  }

  async function removeRegisteredDomain(domain_id) {
    try {
      removingDomain = true;
      await deleteOAuthAppDomain({ id: clientId, domain_id });
      domains = domains.filter((d) => d.id !== domain_id);
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      removingDomain = false;
    }
  }
</script>

<Modal bind:open={domainVerificationModalOpened} header minWidth="300px" maxWidth="500px">
  <DomainVerification
    {clientId}
    bind:domain={selectedDomain}
    handleClose={() => {
      domainVerificationModalOpened = false;
    }}
  />
</Modal>

<Modal bind:open={newDomainModalOpened} header minWidth="300px" maxWidth="500px">
  <FlexContainer column gap="1.5rem">
    <FlexContainer align_items="center" justify_content="space-between">
      <h3 class="no-margin">Register Domain</h3>
      <Button
        height="auto"
        on:click={() => {
          newDomainModalOpened = false;
        }}
        blendin
        rounded
      >
        <CloseIcon dimension="25px" />
      </Button>
    </FlexContainer>
    <Form on:submit={registerDomain}>
      <FlexContainer column align_items="stretch" justify_content="center" gap="0.5rem">
        <Input type="text" name="url" placeholder="domain.example" pattern="^\S+(\.\S+)+$" autocomplete="off" bind:value={newDomain} disabled={loading} required={true} />
        <Button type="submit" padding="0.5rem 0" primary rounded disabled={loading || registeringDomain}>Submit</Button>
      </FlexContainer>
    </Form>
  </FlexContainer>
</Modal>

<FlexContainer column bgColor="var(--new-layer-color)" padding="1.5rem" gap="0.7rem" rounded mobileScale onlymobile alwaysDisplay={selected}>
  <FlexContainer align_items="center">
    <h4 class="no-margin oneline">Mail Relay</h4>
  </FlexContainer>

  <div class="gridline" />
  <FlexContainer column gap="1rem">
    <span class="xs">Only emails sent from registered domains can be relayed to users.</span>

    <FlexContainer column bgColor="var(--new-layer-color)" padding="0.5rem" rounded gap="0.5rem">
      <FlexContainer align_items="center" justify_content="space-between">
        <h5 class="no-margin">Registered Domains</h5>
        <Button on:click={() => (newDomainModalOpened = true)} height="auto" padding="0.3rem 0.5rem" primary rounded disabled={domains?.length >= MAX_SENDER_DOMAINS}><small>New Domain</small></Button>
      </FlexContainer>
      <GridContainer margin="0 0 0 0" justify_items="stretch" template_columns="1fr auto" align_items="center" gap="0.3rem 0.3rem">
        <div class="gridline"></div>
        {#if domains?.length > 0}
          {#each domains as domain, index}
            <h5 class="no-margin mono oneline">{domain.value.replace('/', '.')}</h5>
            <FlexContainer align_items="center" justify_content="flex-end" gap="0.1rem">
              {#if !domain?.verified_at}
                <Button
                  on:click={() => {
                    selectedDomain = domain;
                    domainVerificationModalOpened = true;
                  }}
                  height="auto"
                  padding="0.3rem"
                  xsmall
                  warning
                  light
                  disabled={domain.value === 'localhost'}
                  rounded>verify</Button
                >
              {/if}
              <Button on:click={() => removeRegisteredDomain(domain.id)} padding="2px 7px" blendin rounded disabled={removingDomain || index < 1}
                ><DeleteIcon dimension="20px" disabled={removingDomain || index < 1} /></Button
              >
            </FlexContainer>
            <div class="gridline"></div>
          {/each}
        {:else}
          <span class="sm">No domains are currently registered.</span>
        {/if}
      </GridContainer>
      <GridContainer template_columns="18px auto" align_items="center" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">Make sure your domains have valid SPF records.</span>
      </GridContainer>
    </FlexContainer>
  </FlexContainer>

  <GridContainer template_columns="18px auto" align_items="center" gap="0.5rem">
    <AnnouncementIcon color="var(--info-color)" dimension="18px" />
    <span class="note">Spamming is strictly prohibited and would lead to account deactivation.</span>
  </GridContainer>
</FlexContainer>
