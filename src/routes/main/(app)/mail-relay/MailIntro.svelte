<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import MailRelayLogo from './MailRelayLogo.svelte';
</script>

<FlexContainer margin="2rem 0px" padding="0px 1rem" column gap="2.5rem">
  <MailRelayLogo />

  <FlexContainer column gap="1.5rem">
    <FlexContainer column textCentered gap="0.5rem">
      <h4>Keep your personal email address private.</h4>
      <p>Create disposable addresses that forward emails to your personal inbox.</p>
    </FlexContainer>

    <FlexContainer column textCentered gap="0.5rem">
      <h4>Protect your inbox from prying eyes.</h4>
      <p>Automatically encrypt all received emails before forwarding them to your email provider.</p>
    </FlexContainer>
  </FlexContainer>
</FlexContainer>

<style>
  h4,
  p {
    margin: 0px;
  }
</style>
