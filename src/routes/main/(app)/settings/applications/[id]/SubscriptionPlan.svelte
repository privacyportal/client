<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Select from '$lib/components/common/Select.svelte';
  import TextArea from '$lib/components/common/TextArea.svelte';
  import Toggle from '$lib/components/common/Toggle.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import { LANDING_CLIENT_URL } from '$lib/modules/constants';
  import { displayError } from '$lib/modules/errors';
  import { patchOAuthAppSubscriptionPlan, submitOAuthAppFreedomTechApplication } from '$lib/modules/requests';
  import { addMonthsToTimestamp, capitalize, fmtCount, fmtPrice, getMonthStartTS, timestampToSecs } from '$lib/modules/utils';
  import { showSnackbar } from '$lib/stores/snackbar';

  const BILLING_OPTS = [
    { text: 'Monthly Billing', value: 'm' },
    { text: 'Yearly Billing', value: 'y' }
  ];

  const PLANS = [
    { name: 'free', mau: 500, mrc: 1500, price: { m: 0, y: 0 }, ft: { price: { m: 0, y: 0 } } },
    { name: 'essential', mau: 1000, mrc: 15000, price: { m: 800, y: 600 }, ft: { price: { m: 0, y: 0 } } },
    { name: 'essential', mau: 5000, mrc: 75000, price: { m: 4000, y: 3400 }, ft: { price: { m: 4000 - 800, y: 3400 - 600 } } },
    { name: 'essential', mau: 10000, mrc: 150000, price: { m: 8000, y: 6800 }, ft: { price: { m: 8000 - 800, y: 6800 - 600 } } },
    { name: 'essential', mau: 20000, mrc: 300000, price: { m: 16000, y: 13600 }, ft: { price: { m: 16000 - 800, y: 13600 - 600 } } }
  ];

  export let selected;
  export let loading;
  export let clientId;
  export let active_users;
  export let relay_metrics;
  export let plan = { name: 'free', mau: 500, billing: 'm' };
  export let fdm_tech;

  let submitting = false;
  let editPlanModalOpened = false;
  let freedomTechModalOpened = false;
  let editedPlan;
  let editedPlanBilling = plan?.billing;
  let fdmTechProjectType;
  let isFdmTechPrivacyProject = true;
  let isFdmTechFreeSpeechProject = false;
  let freedomTechRepo;
  let freedomTechDescription = '';

  // metrics data
  $: monthlyActiveUsers = calculatePlanUsage('active_users', { activeUsers: active_users });
  $: relayedEmailsCount = calculatePlanUsage('relay_metrics:count', { relayMetrics: relay_metrics });

  // plan data
  $: editPlanOptions = PLANS?.map((item) => ({ text: `${item.name} (${item.mau} MAU)`, value: item }));
  $: planIndex = PLANS?.findIndex((item) => item.mau === plan?.mau && item.name === plan?.name);
  $: editedPlanIndex = PLANS?.findIndex((item) => item.mau === editedPlan?.mau && item.name === editedPlan?.name);
  $: editType = editedPlanIndex - planIndex;
  $: showCompareView = !!editType || plan?.billing !== editedPlanBilling;
  $: isFreedomTech = fdm_tech?.status === 'approved';
  $: editedPlanPrice = isFreedomTech ? editedPlan?.ft?.price?.[editedPlanBilling] : editedPlan?.price?.[editedPlanBilling];
  $: currentPlan = {
    ...plan,
    mrc: PLANS?.[planIndex].mrc,
    price: isFreedomTech ? PLANS?.[planIndex]?.ft?.price?.[plan?.billing || 'm'] : PLANS?.[planIndex]?.price?.[plan?.billing || 'm']
  };

  const METRICS_CONFIG = {
    active_users: {
      label: 'Active Users',
      selector: ({ activeUsers, monthTsInSecs }) => activeUsers?.[`${monthTsInSecs}`] || 0
    },
    'relay_metrics:count': {
      label: 'Relayed Emails',
      selector: ({ relayMetrics, monthTsInSecs }) => relayMetrics?.[`${monthTsInSecs}`]?.count?.['0'] || 0
    }
  };

  function calculatePlanUsage(type, params) {
    const monthStartTS = getMonthStartTS();
    const monthTsInSecs = timestampToSecs(monthStartTS);
    const previousMonthTsInSecs = timestampToSecs(addMonthsToTimestamp(monthStartTS, -1));

    return Math.max(METRICS_CONFIG[type]['selector']({ ...params, monthTsInSecs: `${monthTsInSecs}` }), METRICS_CONFIG[type]['selector']({ ...params, monthTsInSecs: `${previousMonthTsInSecs}` }));
  }

  function handleEditPlan() {
    editedPlan = PLANS?.[planIndex];
    editedPlanBilling = plan?.billing;
    editPlanModalOpened = true;
  }

  async function handleUpdatePlan() {
    submitting = true;
    try {
      const res = await patchOAuthAppSubscriptionPlan({
        id: clientId,
        name: editedPlan.name,
        mau: editedPlan.mau,
        billing: editedPlanBilling
      });
      plan = res.data;
      editPlanModalOpened = false;
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      submitting = false;
    }
  }

  async function submitFdmTechApplication() {
    submitting = true;
    try {
      const res = await submitOAuthAppFreedomTechApplication({
        id: clientId,
        type: fdmTechProjectType,
        focus: [...(isFdmTechPrivacyProject ? ['privacy'] : []), ...(fdmTechProjectType === 'software' && isFdmTechFreeSpeechProject ? ['freespeech'] : [])],
        ...(fdmTechProjectType === 'software' && freedomTechRepo && { repo: freedomTechRepo }),
        description: freedomTechDescription
      });
      fdm_tech = { status: 'pending' };
      freedomTechModalOpened = false;
      showSnackbar({ text: 'Application Submitted.' });
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      submitting = false;
    }
  }
</script>

<Modal bind:open={freedomTechModalOpened} minWidth="min(30vw, 600px)" maxWidth="600px" padding="1rem 0.3rem" header>
  <FlexContainer column gap="0.7rem" nooverflow>
    <FlexContainer align_items="center" justify_content="space-between" padding="0px 0.7rem">
      <h4 class="no-margin">Freedom Tech</h4>
      <Button
        height="auto"
        on:click={() => {
          freedomTechModalOpened = false;
        }}
        blendin
        rounded
      >
        <CloseIcon dimension="25px" />
      </Button>
    </FlexContainer>

    <FlexContainer column nooverflow padding="0px 0.7rem">
      <Form on:submit={submitFdmTechApplication}>
        <GridContainer align_items="center" template_columns="auto 1fr" gap="0.5rem 1rem">
          <h5 class="no-margin">Project Type:</h5>
          <Select
            on:change={() => {
              if (fdmTechProjectType === 'newsletter') {
                isFdmTechPrivacyProject = true;
              }
            }}
            disabled={submitting}
            bind:value={fdmTechProjectType}
            options={[
              { text: 'OSS Software', value: 'software' },
              { text: 'Newsletter', value: 'newsletter' }
            ]}
          />
          <h5 class="no-margin">Focus Areas:</h5>
          <FlexContainer width="100%" column gap="0.5rem" padding="0.5rem" border rounded>
            <FlexContainer align_items="center" gap="0.5rem">
              <Toggle
                on:click={() => {
                  if (isFdmTechPrivacyProject) {
                    isFdmTechFreeSpeechProject = true;
                  }
                }}
                size="12px"
                disabled={submitting || fdmTechProjectType === 'newsletter'}
                bind:checked={isFdmTechPrivacyProject}
              />
              <span class="sm">Privacy</span>
            </FlexContainer>
            {#if fdmTechProjectType === 'software'}
              <FlexContainer align_items="center" gap="0.5rem">
                <Toggle
                  on:click={() => {
                    if (isFdmTechFreeSpeechProject) {
                      isFdmTechPrivacyProject = true;
                    }
                  }}
                  size="12px"
                  disabled={submitting}
                  bind:checked={isFdmTechFreeSpeechProject}
                />
                <span class="sm">Free Speech</span>
              </FlexContainer>
            {/if}
            <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
              <AnnouncementIcon color="var(--text-color)" dimension="18px" />
              <span class="note">We do not accept projects promoting any particular political affiliation.</span>
            </GridContainer>
          </FlexContainer>
          {#if fdmTechProjectType === 'software'}
            <h5 class="no-margin">Source Code:</h5>
            <Input name="repo" placeholder="Repository URL" pattern="^https:\/\/.+$" autocomplete="off" disabled={submitting} bind:value={freedomTechRepo} />
          {/if}
          <h5 class="no-margin">Description:</h5>
          <TextArea
            name="description"
            placeholder="Briefly explain how your project impacts the focus areas."
            minlength={20}
            maxlength={200}
            disabled={submitting}
            bind:value={freedomTechDescription}
          />
          <Button globalClass={['full-row']} type="submit" width="100%" primary rounded disabled={submitting}>
            {#if submitting}
              Submitting...
            {:else}
              Submit Application
            {/if}
          </Button>
        </GridContainer>
      </Form>
    </FlexContainer>
  </FlexContainer>
</Modal>

<Modal bind:open={editPlanModalOpened} minWidth="max(300px, min(30vw, 600px))" maxWidth="600px" padding="1rem 0.3rem" header>
  <FlexContainer column gap="0.7rem" nooverflow>
    <FlexContainer align_items="center" justify_content="space-between" padding="0px 0.7rem">
      <h4 class="no-margin">Edit Plan</h4>
      <Button
        height="auto"
        on:click={() => {
          editPlanModalOpened = false;
        }}
        blendin
        rounded
      >
        <CloseIcon dimension="25px" />
      </Button>
    </FlexContainer>
    <FlexContainer column nooverflow gap="0.5rem" padding="0px 0.7rem">
      <Select bind:value={editedPlan} options={editPlanOptions} disabled={submitting} />
      <Select bind:value={editedPlanBilling} options={BILLING_OPTS} disabled={submitting} />
      <FlexContainer column padding="0.5rem" gap="0.5rem" border rounded>
        <GridContainer template_columns="1fr 1fr" padding="0.5rem" gap="0.5rem 1rem">
          <h5 class="no-margin" class:full-row={!showCompareView}>Current Plan</h5>
          {#if showCompareView}
            <h5 class="no-margin">New Plan</h5>
          {/if}
        </GridContainer>
        <GridContainer template_columns="1fr 1fr" bgColor="var(--new-layer-color)" padding="0.5rem" gap="0.5rem 1rem" rounded>
          <h6 class="no-margin full-row">Name</h6>
          <FlexContainer column gap="0.1rem">
            <span class="sm" class:full-row={!showCompareView}>{capitalize(plan?.name)}<small>{` (${plan?.mau} MAU)`}</small></span>
            {#if isFreedomTech}
              <span class="xs" class:full-row={!showCompareView}>+ Freedom Tech</span>
            {/if}
          </FlexContainer>
          {#if showCompareView}
            <FlexContainer column gap="0.1rem">
              <span class="sm"><strong>{capitalize(editedPlan?.name)}<small>{` (${editedPlan?.mau} MAU)`}</small></strong></span>
              {#if isFreedomTech}
                <span class="xs">+ Freedom Tech</span>
              {/if}
            </FlexContainer>
          {/if}
        </GridContainer>
        <GridContainer template_columns="1fr 1fr" bgColor="var(--new-layer-color)" padding="0.5rem" gap="0.5rem 1rem" rounded>
          <h6 class="no-margin full-row">Price</h6>
          <FlexContainer column gap="0.1rem">
            <span class="sm" class:strikethrough={currentPlan?.price} class:full-row={!showCompareView}>{fmtPrice(currentPlan?.price)}<small>{' / month'}</small></span>
            {#if currentPlan?.price}
              <span class="sm beta" class:full-row={!showCompareView}>{fmtPrice(0)}<small>{' / month'}</small></span>
            {/if}
            <span class="xs" class:full-row={!showCompareView}>{currentPlan?.billing === 'y' ? 'Yearly billing' : 'Monthly billing'}</span>
          </FlexContainer>
          {#if showCompareView}
            <FlexContainer column gap="0.1rem">
              <span class="sm" class:strikethrough={editedPlanPrice}><strong>{fmtPrice(editedPlanPrice)}<small>{' / month'}</small></strong></span>
              {#if editedPlanPrice}
                <span class="sm beta"><strong>{fmtPrice(0)}<small>{' / month'}</small></strong></span>
              {/if}
              <span class="xs"><strong>{editedPlanBilling === 'y' ? 'Yearly billing' : 'Monthly billing'}</strong></span>
            </FlexContainer>
          {/if}
        </GridContainer>
        <GridContainer template_columns="1fr 1fr" bgColor="var(--new-layer-color)" padding="0.5rem" gap="0.5rem 1rem" rounded>
          <h6 class="no-margin full-row">Max Active Users <small>/ month</small></h6>
          <span class="sm" class:full-row={!showCompareView}>{fmtCount(plan?.mau)}</span>
          {#if showCompareView}
            <span class="sm"><strong>{fmtCount(editedPlan?.mau)}</strong></span>
          {/if}
        </GridContainer>
        <GridContainer template_columns="1fr 1fr" bgColor="var(--new-layer-color)" padding="0.5rem" gap="0.5rem 1rem" rounded>
          <h6 class="no-margin full-row">Max Emails Relayed <small>/ month</small></h6>
          <span class="sm" class:full-row={!showCompareView}>{fmtCount(currentPlan?.mrc)}</span>
          {#if showCompareView}
            <span class="sm"><strong>{fmtCount(editedPlan?.mrc)}</strong></span>
          {/if}
        </GridContainer>
        {#if plan?.price || (showCompareView && editedPlanPrice)}
          <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
            <AnnouncementIcon color="var(--info-contrasted-color)" dimension="18px" />
            <span class="note beta">All plans are free while Mail Relay is in beta.</span>
          </GridContainer>
        {/if}
      </FlexContainer>
      <FlexContainer column gap="0.5rem">
        {#if showCompareView}
          <Button on:click={handleUpdatePlan} disabled={submitting} primary={editType >= 0} danger={editType < 0} rounded flexgrow
            >{editType > 0 ? 'Upgrade' : editType < 0 ? 'Downgrade' : 'Edit'} Plan</Button
          >
        {:else}
          <Button
            on:click={() => {
              editPlanModalOpened = false;
            }}
            disabled={submitting}
            basic
            rounded
            flexgrow>Close</Button
          >
        {/if}
      </FlexContainer>
    </FlexContainer>
  </FlexContainer>
</Modal>

<FlexContainer column bgColor="var(--new-layer-color)" padding="1.5rem" gap="0.7rem" rounded mobileScale onlymobile alwaysDisplay={selected}>
  <FlexContainer align_items="center">
    <h4 class="no-margin oneline">Subscription Plan</h4>
  </FlexContainer>

  <FlexContainer column gap="1rem">
    <GridContainer width="100%" justify_items="center" template_columns="1fr 1fr" bgColor="var(--new-layer-color)" padding="1rem" gap="0.5rem" rounded>
      <h5 class="no-margin center full-row">{capitalize(plan?.name)}<small>{` - ${plan?.mau} MAU`}</small></h5>
      <FlexContainer column margin="0.5rem 0px 0px 0px" padding="0.5rem" gap="0.5rem" bgColor="var(--new-layer-color)" rounded>
        <h6 class="no-margin oneline">Monthly Active Users</h6>
        <h4 class="no-margin align-self-center oneline"><small>{fmtCount(monthlyActiveUsers)} of </small>{fmtCount(plan?.mau || 0)}</h4>
      </FlexContainer>
      <FlexContainer column margin="0.5rem 0px 0px 0px" padding="0.5rem" gap="0.5rem" bgColor="var(--new-layer-color)" rounded>
        <h6 class="no-margin oneline">Emails Relayed</h6>
        <h4 class="no-margin align-self-center oneline"><small>{fmtCount(relayedEmailsCount)} of </small>{fmtCount(currentPlan?.mrc || 0)}</h4>
      </FlexContainer>
      <Button globalClass={['full-row']} on:click={handleEditPlan} disabled={loading} width="100%" primary rounded>Edit Plan</Button>
    </GridContainer>

    {#if !fdm_tech?.status}
      <FlexContainer column bgColor="var(--new-layer-color)" padding="1rem" rounded gap="0.5rem">
        <FlexContainer align_items="center" justify_content="space-between" gap="0.5rem">
          <h5 class="no-margin">Freedom-Tech</h5>
          <Button
            on:click={() => {
              freedomTechModalOpened = true;
            }}
            disabled={loading}
            width="auto"
            height="auto"
            padding="0.2rem 0.5rem"
            border
            rounded
            xsmall>Apply</Button
          >
        </FlexContainer>
        <span class="sm"
          >If your project aligns with <strong><a href={`${LANDING_CLIENT_URL}/about`}>our values</a></strong> around Privacy and Freedom Of Speech, you may be eligible for the Freedom-Tech discount.</span
        >
      </FlexContainer>
    {/if}
  </FlexContainer>
</FlexContainer>

<style>
  a {
    color: inherit;
  }

  .beta {
    color: var(--info-contrasted-color);
  }

  .strikethrough {
    text-decoration: line-through;
  }
</style>
