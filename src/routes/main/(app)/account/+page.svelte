<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import ArrowDropDownIcon from '$lib/components/materialIcons/ArrowDropDownIcon.svelte';
  import CheckCircleIcon from '$lib/components/materialIcons/CheckCircleIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import { deleteAccount, upgradeAccount } from '$lib/modules/requests';
  import { MONTHLY_PRICE, isEnhancedProtection } from '$lib/stores/account';
  import DataExport from './DataExport.svelte';
  import EmailSubscriptions from './EmailSubscriptions.svelte';
  import Preferences from './Preferences.svelte';
  import PrimaryEmailAddress from './PrimaryEmailAddress.svelte';

  let deleting = false;
  let upgrading = false;
  let upgradeModalOpened = false;
  let deletionModalOpened = false;
  let basicProtectionExpanded = false;

  function toggleBasicProtectionExpanded() {
    basicProtectionExpanded = !basicProtectionExpanded;
  }

  async function handleDeleteAccount(withConfirmation = false) {
    if (withConfirmation && !confirm('Are you sure you want to delete your account?')) return;

    try {
      deleting = true;
      await deleteAccount();
    } finally {
      deleting = false;
    }
  }

  async function handleUpgradeAccount() {
    try {
      upgrading = true;
      await upgradeAccount();
      upgradeModalOpened = false;
    } finally {
      upgrading = false;
    }
  }
</script>

<Modal bind:open={deletionModalOpened} maxWidth="500px" header>
  <FlexContainer column gap="0.7rem">
    <FlexContainer align_items="center" justify_content="space-between">
      <h4 class="no-margin">Account Deletion Confirmation</h4>
      <Button height="auto" on:click={() => (deletionModalOpened = false)} blendin rounded>
        <CloseIcon dimension="25px" />
      </Button>
    </FlexContainer>
    <span><small>Deleting your account completely wipes any reference to your personal email address from our services.</small></span>
    <FlexContainer column gap="0.5rem">
      <Button on:click={() => handleDeleteAccount()} disabled={deleting} danger rounded flexgrow>Delete Account</Button>
    </FlexContainer>
    <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
      <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
      <span class="note">Your personal email address could stay up to 30 days in database backups post account deletion.</span>
    </GridContainer>
  </FlexContainer>
</Modal>

<Modal bind:open={upgradeModalOpened} maxWidth="500px" header>
  <FlexContainer column gap="0.7rem">
    <FlexContainer align_items="center" justify_content="space-between">
      <h4 class="no-margin">Account Upgrade Confirmation</h4>
      <Button height="auto" on:click={() => (upgradeModalOpened = false)} blendin rounded>
        <CloseIcon dimension="25px" />
      </Button>
    </FlexContainer>
    <span><small>Upgrade your account free-of-charge to benefit from Enhanced Protection features until the official release of Mail Relay.</small></span>
    <FlexContainer column gap="0.5rem">
      <Button on:click={() => handleUpgradeAccount()} disabled={upgrading} primary rounded flexgrow>Upgrade Account for Free</Button>
    </FlexContainer>
    <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
      <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
      <span class="note"
        >When your Enhanced Protection plan expires, you will have the option to purchase additional time or you can continue using existing Privacy Addresses with Basic Protection features.</span
      >
    </GridContainer>
  </FlexContainer>
</Modal>

<FlexContainer column padding="1rem" align_items="flex-start" justify_content="flex-start" gap="1rem">
  <h1 class="no-margin">Account</h1>
  <FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
    <PrimaryEmailAddress />
    <hr class="divider" />
    <GridContainer template_columns="1fr 1fr" mobile_template_columns="1fr" gap="0.5rem 1rem">
      <FlexContainer justify_content="center" nomobile>
        {#if !$isEnhancedProtection}
          <h4 class="no-margin">Your Plan</h4>
        {/if}
      </FlexContainer>
      <FlexContainer justify_content="center" nomobile>
        {#if $isEnhancedProtection}
          <h4 class="no-margin">Your Plan</h4>
        {/if}
      </FlexContainer>
      <FlexContainer column bgColor="var(--new-layer-color)" padding="1rem" gap="0.5rem" rounded nomobile>
        <FlexContainer align_items="center" justify_content="space-between">
          <h5 class="no-margin">Basic Protection</h5>
          <h5 class="no-margin"><small>Free</small></h5>
        </FlexContainer>
        <hr class="divider sm-v-margin" />
        <GridContainer align_items="flex-start" template_columns="1rem auto" gap="0.5rem" margin="0px auto auto auto">
          <CheckCircleIcon dimension="20px" /><span><small>Up to 20 Privacy Addresses</small></span>
          <CheckCircleIcon dimension="20px" /><span><small>Secure Relay Connections (TLS)</small></span>
          <CheckCircleIcon dimension="20px" /><span><small>SPF, DKIM, and DMARC</small></span>
          <CheckCircleIcon dimension="20px" /><span><small>Spam Filtering + Virus Protection</small></span>
          <CheckCircleIcon dimension="20px" /><span><small>Zero Trust Deployment</small></span>
          <CheckCircleIcon dimension="20px" /><span><small>In-Memory Email Processing</small></span>
        </GridContainer>
      </FlexContainer>
      {#if $isEnhancedProtection}
        <FlexContainer justify_content="center" onlymobile>
          <h4 class="no-margin">Your Plan</h4>
        </FlexContainer>
      {/if}
      <FlexContainer column bgColor="var(--new-layer-color)" padding="1rem" gap="0.5rem" rounded primary border>
        <FlexContainer align_items="center" justify_content="space-between">
          <h5 class="no-margin">Enhanced Protection</h5>
          <FlexContainer width="auto" column align_items="center">
            <span class="xs strikethrough"><strong>€{MONTHLY_PRICE / 100} per month</strong></span>
            <h5 class="no-margin beta"><small>Free (until launch)</small></h5>
          </FlexContainer>
        </FlexContainer>
        <hr class="divider sm-v-margin" />
        <GridContainer align_items="flex-start" template_columns="1rem auto" gap="0.5rem" margin="0px auto auto auto">
          <CheckCircleIcon dimension="20px" /><span><small><span class="xs strikethrough">Unlimited</span> <strong class="beta">Up to 100</strong> Privacy Addresses</small></span>
          <CheckCircleIcon dimension="20px" /><span><small>Up to 5 Personal Accounts</small></span>
          <CheckCircleIcon dimension="20px" /><span><small>Email Encryption (PGP or S/MIME)</small></span>
          <CheckCircleIcon dimension="20px" /><span><small>Encrypted Outbound Mail <span class="xs beta">(replies only)</span></small></span>
          <CheckCircleIcon dimension="20px" /><span><small>Metadata Leak Protection</small></span>
          <CheckCircleIcon dimension="20px" /><span><small>More Customization</small></span>
          <CheckCircleIcon dimension="20px" /><span><small>Priority Support</small></span>
          <CheckCircleIcon dimension="20px" />
          <span class="no-mobile"><small><strong>All Basic Protection Features</strong></small></span>
          <Button on:click={toggleBasicProtectionExpanded} height="auto" width="100%" blendin nohover rounded mobile>
            <FlexContainer align_items="center" justify_content="space-between">
              <span><small><strong>All Basic Protection Features</strong></small></span>
              <ArrowDropDownIcon opened={basicProtectionExpanded} dimension="18px" />
            </FlexContainer>
          </Button>
          {#if basicProtectionExpanded}
            <CheckCircleIcon dimension="20px" mobile /><span class="mobile"><small>Secure Relay Connections (TLS)</small></span>
            <CheckCircleIcon dimension="20px" mobile /><span class="mobile"><small>SPF, DKIM, and DMARC</small></span>
            <CheckCircleIcon dimension="20px" mobile /><span class="mobile"><small>Spam Filtering + Virus Protection</small></span>
            <CheckCircleIcon dimension="20px" /><span><small>Zero Trust Deployment</small></span>
            <CheckCircleIcon dimension="20px" /><span><small>In-Memory Email Processing</small></span>
          {/if}
        </GridContainer>
        {#if !$isEnhancedProtection}
          <hr class="divider sm-v-margin" />
          <Button on:click={() => (upgradeModalOpened = true)} height="auto" padding="0.5rem 0.5rem" primary rounded>Upgrade to Enhanced Protection</Button>
        {/if}
      </FlexContainer>
    </GridContainer>
  </FlexContainer>
  <Preferences />
  <EmailSubscriptions />
  <DataExport />
  <FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
    <FlexContainer column gap="1rem">
      <h4 class="no-margin danger">Delete account</h4>
      <span class="sm">Account deletion allows you to completely wipe any reference to your personal email address from our services.</span>
      <Button on:click={() => (deletionModalOpened = true)} disabled={deleting} danger rounded flexgrow>Delete Account</Button>
      <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">All account deletions are permanent and cannot be reverted.</span>
      </GridContainer>
    </FlexContainer>
  </FlexContainer>
</FlexContainer>

<style>
  .beta {
    color: var(--info-color);
  }
  .strikethrough {
    text-decoration: line-through;
  }
</style>
