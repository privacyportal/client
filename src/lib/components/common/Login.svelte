<script>
  import { page } from '$app/stores';
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import POW from '$lib/components/common/POW.svelte';
  import Section from '$lib/components/common/Section.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { base64ToBuffer, bufferToBase64 } from '$lib/modules/auth';
  import { displayError } from '$lib/modules/errors';
  import { recoverAccount, recoverAccountChallenge, requestAccountRecoveryCode, resendCode, signIn, signInChallenge, signUp, signUpChallenge, verifyEmail } from '$lib/modules/requests';
  import { isDarkMode, session } from '$lib/stores/account';
  import { showSnackbar } from '$lib/stores/snackbar';

  export let allowSignUp = true;
  export let headerHeight = '50px';
  let email;
  let invitationCode;
  let code;
  let totpToken;
  let showSignIn = $page.url.pathname !== '/signup';
  let showAccountRecoveryButton = false;
  let showAccountRecovery = false;
  let showRecoveryForm = false;
  let showTOTP = false;
  let loading = false;
  let clientId = $page.url.searchParams.get('client_id');
  let powChallenge;
  let powResult;

  async function handleCodeVerification() {
    loading = true;
    try {
      const res = await verifyEmail({ code });

      console.log(res, res.headers);
    } catch (err) {
      /* do nothing */
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function handleResendCode() {
    loading = true;
    try {
      await resendCode();
      console.log('code successfully re-sent');
      showSnackbar({ text: 'code successfully resent.' });
    } catch (err) {
      /* do nothing */
      console.error(err);
      displayError(err);
    } finally {
      loading = false;
    }
  }

  async function createCredential(options) {
    const credentialCreationOptions = options;
    credentialCreationOptions.challenge = base64ToBuffer(credentialCreationOptions.challenge);
    credentialCreationOptions.user.id = base64ToBuffer(credentialCreationOptions.user.id);

    console.log(credentialCreationOptions);
    return await navigator.credentials.create({
      publicKey: credentialCreationOptions
    });
  }

  function serializeCredential(credential) {
    return {
      id: credential.id,
      rawId: bufferToBase64(credential.rawId),
      response: {
        clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
        attestationObject: bufferToBase64(credential.response.attestationObject)
      }
    };
  }

  async function handleSignUp(_, { isVerified } = {}) {
    loading = true;
    try {
      const { pow_challenge, data } = await signUpChallenge({ email, invitationCode }, { ...(powResult && { extraHeaders: { powResponse: powResult } }) }).catch((err) => {
        // intercept pow_challenge
        if (err?.body?.data?.pow_challenge) return { pow_challenge: err.body.data.pow_challenge };

        // handle all other errors normally
        showSnackbar({ text: err.message, type: 'error' });
        powChallenge = undefined;
        powResult = undefined;
        throw err;
      });

      if (pow_challenge) {
        // wait for pow to be computed
        powChallenge = pow_challenge;
      } else {
        const credential = await createCredential(data.options);
        console.log(credential);

        const res = await signUp({
          credential: serializeCredential(credential),
          token: data.token
        });

        console.log(res, res.headers);
      }
    } catch (err) {
      /* do nothing */
      console.error(err);
    } finally {
      if (isVerified) {
        loading = false;
        powChallenge = undefined;
        powResult = undefined;
      } else if (!powChallenge) {
        loading = false;
      }
    }
  }

  async function handlePOWVerificationFailed(e) {
    console.log('handlePOWVerificationFailed::e.detail.powResult:', e.detail.powResult);
    powResult = undefined;
    loading = false;
  }

  async function handlePOWVerified(e) {
    console.log('handlePOWVerified::e.detail.powResult:', e.detail.powResult);
    powResult = btoa(JSON.stringify(e.detail.powResult));
    // continue signup
    await handleSignUp(undefined, { isVerified: true });
  }

  async function handleRecoverAccount() {
    loading = true;
    try {
      await requestAccountRecoveryCode({ email });
      showRecoveryForm = true;
    } catch (err) {
      console.error(err);
      if (err?.body?.data?.accept_code) {
        showRecoveryForm = true;
      }
      showSnackbar({ text: err.message });
    } finally {
      loading = false;
    }
  }

  async function handleSubmitRecoveryCode() {
    loading = true;
    try {
      const { data } = await recoverAccountChallenge({ email, code, ...(totpToken && { totp_token: totpToken }) });

      const credential = await createCredential(data.attestation_opts);
      console.log('credential:', credential);

      const res = await recoverAccount({
        email,
        credential: serializeCredential(credential)
      });

      console.log(res, res.headers);
    } catch (err) {
      console.error(err);
      if (err?.body?.data?.totp_required) {
        showTOTP = true;
      } else {
        showSnackbar({ text: err.message });
        code = undefined;
        totpToken = undefined;
      }
    } finally {
      loading = false;
    }
  }

  function toggleShowSignIn() {
    showSignIn = !showSignIn;
  }

  function toggleAccountRecovery() {
    showAccountRecovery = !showAccountRecovery;
  }

  async function handleSignIn() {
    loading = true;
    try {
      const { data } = await signInChallenge();

      console.log('data:', data);

      const credentialRequestOptions = data.options;
      credentialRequestOptions.challenge = base64ToBuffer(credentialRequestOptions.challenge);

      console.log(credentialRequestOptions);
      const credential = await navigator.credentials.get({
        publicKey: credentialRequestOptions
      });

      console.log(credential);

      const res = await signIn({
        credential: {
          id: credential.id,
          rawId: bufferToBase64(credential.rawId),
          response: {
            authenticatorData: bufferToBase64(credential.response.authenticatorData),
            clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
            signature: bufferToBase64(credential.response.signature),
            userHandle: bufferToBase64(credential.response.userHandle)
          }
        },
        token: data.token
      });

      console.log(res, res.headers);
    } catch (err) {
      /* do nothing */
      console.error(err);
      showAccountRecoveryButton = true;
    } finally {
      loading = false;
    }
  }
</script>

<div id="login" style:--header-height={headerHeight}>
  <Section height="100%" bgColor={$isDarkMode ? 'var(--outer-bg-color)' : 'var(--primary-color)'} color="var(--primary-text-color)" textCentered="true">
    <FlexContainer column gap="2rem" width="auto" color="inherit">
      <div>
        <Logo dimension="12rem" color="var(--primary-color)" opacity="1" animated={loading || $session === undefined} />
        <h2>Privacy Portal</h2>
      </div>

      {#if $session !== undefined}
        <FlexContainer column gap="1.5rem" color="inherit">
          {#if $session?.email}
            {#if $session?.email_verified === false}
              <Form on:submit={handleCodeVerification}>
                <FlexContainer column gap="0.25rem" color="inherit">
                  <Input type="text" name="code" placeholder="Verification Code" autocomplete="off" bind:value={code} disabled={loading} />
                  <Button type="submit" disabled={loading} rounded>Submit</Button>
                  <p><a on:click={handleResendCode} href>resend code</a></p>
                </FlexContainer>
              </Form>
            {:else}
              <p>Already Signed in</p>
            {/if}
          {:else if showSignIn || !allowSignUp}
            {#if showAccountRecovery}
              {#if showRecoveryForm}
                <Form on:submit={handleSubmitRecoveryCode}>
                  <FlexContainer column gap="0.25rem">
                    <Input type="text" name="code" placeholder="Verification Code" autocomplete="off" bind:value={code} disabled={loading} />
                    {#if showTOTP}
                      <Input type="text" name="token" placeholder="2FA Token" autocomplete="off" bind:value={totpToken} disabled={loading} />
                    {/if}
                    <Button type="submit" disabled={loading} rounded>Submit</Button>
                    <p><a on:click={handleRecoverAccount} href>resend code</a></p>
                  </FlexContainer>
                </Form>
              {:else}
                <Form on:submit={handleRecoverAccount}>
                  <FlexContainer column gap="0.25rem">
                    <Input type="email" name="email" placeholder="Email" bind:value={email} disabled={loading} />
                    <Button type="submit" disabled={loading} rounded strong border={$isDarkMode}>Recover Account</Button>
                  </FlexContainer>
                </Form>
              {/if}
              <span class="xs"><a on:click={toggleAccountRecovery} href>Back to Sign In</a></span>
            {:else}
              <Button on:click={handleSignIn} disabled={loading} rounded strong border={$isDarkMode}>
                <FlexContainer column padding="0.7rem 0px">
                  <span>Sign In</span>
                  {#if $page.url.pathname === '/oauth/authorize' && clientId}
                    <span class="xs">to continue to your application</span>
                  {/if}
                </FlexContainer>
              </Button>
              {#if allowSignUp}
                <p><a on:click={toggleShowSignIn} href>Create free account</a></p>
              {/if}

              {#if showAccountRecoveryButton}
                <span class="xs"><a on:click={toggleAccountRecovery} href>Recover Account</a></span>
              {/if}
            {/if}
          {:else}
            <Form on:submit={handleSignUp}>
              <FlexContainer column gap="0.25rem">
                <Input type="email" name="email" placeholder="Email" bind:value={email} disabled={loading} />
                <POW {powChallenge} on:verified={handlePOWVerified} on:not_verified={handlePOWVerificationFailed} />
                <Button type="submit" disabled={loading} rounded strong border={$isDarkMode}>Sign Up</Button>
              </FlexContainer>
            </Form>
            <a on:click={toggleShowSignIn} href>Sign in to existing account</a>
          {/if}
        </FlexContainer>
      {/if}
    </FlexContainer>
  </Section>
</div>

<style>
  #login {
    height: 100%;
  }

  a {
    color: var(--primary-text-color);
  }
</style>
