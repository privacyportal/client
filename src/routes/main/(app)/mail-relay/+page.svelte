<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Button from '$lib/components/common/Button.svelte';
  import Dropdown from '$lib/components/common/Dropdown.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import { setNavActionHandler } from '$lib/components/common/Header.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import InputLabel from '$lib/components/common/InputLabel.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import Section from '$lib/components/common/Section.svelte';
  import Select from '$lib/components/common/Select.svelte';
  import AddIcon from '$lib/components/materialIcons/AddIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import FilterIcon from '$lib/components/materialIcons/FilterIcon.svelte';
  import OfflineBoltIcon from '$lib/components/materialIcons/OfflineBoltIcon.svelte';
  import SearchIcon from '$lib/components/materialIcons/SearchIcon.svelte';
  import SortListIcon from '$lib/components/materialIcons/SortListIcon.svelte';
  import { getAddresses, getRelayAccountsWithActiveProfiles } from '$lib/modules/requests';
  import { replaceStateWithQuery } from '$lib/modules/utils';
  import { isEnhancedProtection } from '$lib/stores/account';
  import { MAX_LABEL_LENGTH, addresses as addressesStore, selectedAddress } from '$lib/stores/mail';
  import { navBackButton } from '$lib/stores/nav';
  import { activeAccountsById, fwdToFilters } from '$lib/stores/relay';
  import { onDestroy, onMount } from 'svelte';
  import MailAddress from './MailAddress.svelte';
  import MailIntro from './MailIntro.svelte';

  const MAX_BASIC_PROTECTION_ADDRESSES = 20;

  const SORT_BY = {
    date: 'Newest first',
    label: 'Label (a to z)',
    value: 'Email (a to z)'
  };

  const SORT_OPTIONS = Object.keys(SORT_BY);
  const FILTER_OPTIONS = ['all', 'active', 'inactive'];

  let queryTitle;
  let queryUrl;
  let sortModalOpened = false;
  let searchModalOpened = false;
  let showNewAddress = false;
  let searching = false;
  let searchInput;
  let fwdToFilterInput;
  let searchInputElement;
  let addressesCount;
  let oidcAddressesCount;

  // addresses and query
  let addresses;
  let searchQuery = (searchInput = getQueryParam('q') || undefined);
  let fwdToFilter = (fwdToFilterInput = getQueryParam('a') || undefined);
  let filter = getQueryParam('f', FILTER_OPTIONS, 'all');
  let sortBy = getQueryParam('s', SORT_OPTIONS, 'date');

  // pagination
  let isFirstPage = true;
  let isLastPage = true;

  let fetchingAddresses = false;

  // Web Share Target - https://w3c.github.io/web-share-target/
  // the host share system may not have a dedicated URL field, but a convention that both plain text
  // and URLs are sometimes transmitted in a "text" field. This is the case on Android.
  // The user agent can check whether all or part of the "text" field is a valid URL string,
  // and if so, move that part of the "text" field to the ShareData's url member.
  if ($page.url.searchParams.size > 0) {
    queryTitle = checkTitle(getDelQueryParam('title'));
    queryUrl = checkUrl(getDelQueryParam('url')) || checkUrl((getDelQueryParam('text') || '').replace(/^.*(https?:\/\/)/, '$1'));

    if (queryTitle || queryUrl) toggleShowNewAddress();
  }

  $: addressLimitReached =
    !$isEnhancedProtection && !fetchingAddresses && addressesCount !== undefined && oidcAddressesCount !== undefined && addressesCount - oidcAddressesCount >= MAX_BASIC_PROTECTION_ADDRESSES;

  function reset() {
    navBackButton.set(false);
    showNewAddress = false;
    selectedAddress.set(null);
    queryTitle = undefined;
    queryUrl = undefined;
  }

  function checkTitle(title) {
    // remove all unsafe characters (very strict)
    return (title && title.replaceAll(/[^a-zA-Z0-9 \-_]/g, '').substring(0, MAX_LABEL_LENGTH)) || undefined;
  }

  function checkUrl(url) {
    try {
      const { hostname } = new URL(url);
      return (hostname && hostname.substring(0, MAX_LABEL_LENGTH)) || undefined;
    } catch {
      // do nothing
    }
    return undefined;
  }

  function getQueryParam(paramName, options, defaultValue) {
    let value = $page.url.searchParams.get(paramName);
    if (!options || options.includes(value)) return value ? decodeURIComponent(value) : value;
    return defaultValue;
  }

  function getDelQueryParam(paramName, defaultValue) {
    let value = $page.url.searchParams.get(paramName);
    if (value) {
      $page.url.searchParams.delete(paramName);
      history.replaceState({}, '', $page.url);
      return value;
    }
    return defaultValue;
  }

  function updateNavButton(show) {
    if (show) {
      setNavActionHandler(reset);
      navBackButton.set(true);
    } else {
      setNavActionHandler(() => {});
      navBackButton.set(null);
    }
  }

  function selectAddress(address) {
    showNewAddress = false;
    selectedAddress.set(address);
    updateNavButton(true);
  }

  async function handleNewAddressCreated(newAddress) {
    showNewAddress = false;
    filter = 'all';
    sortBy = 'date';
    updateUrlSearchParams({ resetWebShareTargetParams: true });
    await fetchAddresses();
    selectedAddress.set({ ...newAddress, created_at: Date.now() });
    updateNavButton(true);
  }

  async function handleAddressPatched(addressPatch) {
    addressesStore.update((addresses) => addresses.map((address) => (address.id === addressPatch.id ? { ...address, ...addressPatch } : address)));
    selectedAddress.update((address) => ({ ...address, ...addressPatch }));
  }

  async function handleAddressDeleted(deletedAddress) {
    addressesStore.update((addresses) => addresses.filter((address) => address.id !== deletedAddress.id));
    selectedAddress.set(null);
    updateNavButton(false);
    addressesCount -= 1;
  }

  function toggleShowNewAddress() {
    showNewAddress = !showNewAddress;
    selectedAddress.set(null);
    updateNavButton(!!showNewAddress);
  }

  const unsubscribeAddressStore = addressesStore.subscribe((value) => {
    addresses = value;
    console.log('addresses updated', addresses);
  });

  async function fetchAddresses(previous = false, latestId = undefined) {
    console.log('fetchAddresses');
    try {
      fetchingAddresses = true;
      const res = await getAddresses(searchQuery, filter, fwdToFilter, sortBy, previous, latestId);
      // console.log(res.data);

      addressesStore.set(res.data.addresses);
      isFirstPage = res.data.meta.isFirstPage;
      isLastPage = res.data.meta.isLastPage;
      addressesCount = res.data.meta.total;
      oidcAddressesCount = res.data.meta.oidcTotal;
    } finally {
      fetchingAddresses = false;
    }
  }

  async function fetchAccountsWithProfiles() {
    const res = await getRelayAccountsWithActiveProfiles();
    activeAccountsById.set(Object.assign({}, ...res.data.map((acct) => ({ [acct.id]: acct }))));
    console.log($activeAccountsById);
  }

  function updateUrlSearchParams() {
    replaceStateWithQuery({
      q: searchQuery,
      a: fwdToFilter,
      f: filter,
      s: sortBy
    });
  }

  async function handleFilterChanged(value) {
    filter = value;
    updateUrlSearchParams();
    await fetchAddresses();
  }

  async function handleSortChanged(value) {
    sortBy = value;
    updateUrlSearchParams();
    await fetchAddresses();
  }

  async function handleSearch() {
    try {
      searching = true;
      searchQuery = searchInput || undefined;
      fwdToFilter = fwdToFilterInput || undefined;
      updateUrlSearchParams();
      await fetchAddresses();
    } finally {
      searching = false;
    }
  }

  async function handleClearSearch() {
    searchInput = undefined;
    fwdToFilterInput = undefined;
    await handleSearch();
  }

  function closeOnExit(next) {
    return () => {
      if (sortModalOpened) sortModalOpened = false;
      if (searchModalOpened) searchModalOpened = false;
      next();
    };
  }

  onMount(async () => {
    await Promise.all([fetchAddresses(), fetchAccountsWithProfiles()]);
  });

  onDestroy(() => {
    unsubscribeAddressStore();
    reset();
    updateNavButton(false);
  });
</script>

<Modal padding="0px" bind:open={sortModalOpened} header>
  <FlexContainer align_items="center" justify_content="space-between" padding="0.5rem 1rem">
    <h4 class="no-margin">Sort by</h4>
    <SortListIcon dimension="20" />
  </FlexContainer>
  <FlexContainer bgColor="var(--border-color)" column gap="1px" width="60vw">
    <Button on:click={closeOnExit(() => handleSortChanged('date'))} height="22px" padding="0.3rem 0.5rem" selected={sortBy === 'date'} disabled={fetchingAddresses}
      ><small>{SORT_BY.date}</small></Button
    >
    <Button on:click={closeOnExit(() => handleSortChanged('label'))} height="22px" padding="0.3rem 0.5rem" selected={sortBy === 'label'} disabled={fetchingAddresses}
      ><small>{SORT_BY.label}</small></Button
    >
    <Button on:click={closeOnExit(() => handleSortChanged('value'))} height="22px" padding="0.3rem 0.5rem" selected={sortBy === 'value'} disabled={fetchingAddresses}
      ><small>{SORT_BY.value}</small></Button
    >
  </FlexContainer>
</Modal>

<Modal padding="0.5rem" bind:open={searchModalOpened} minWidth="300px" header>
  <Form on:submit={closeOnExit(() => handleSearch())}>
    <FlexContainer column gap="1rem">
      <FlexContainer align_items="center" justify_content="space-between">
        <h4 class="no-margin">Search Addresses</h4>
        <Button on:click={() => (searchModalOpened = false)} height="auto" blendin rounded><CloseIcon /></Button>
      </FlexContainer>
      <FlexContainer column gap="1rem">
        <FlexContainer column gap="0.5rem">
          <InputLabel>
            <SearchIcon slot="icon" />
            <Input
              slot="input"
              type="text"
              name="search"
              placeholder="Enter label or address"
              autocomplete="off"
              bind:inputElement={searchInputElement}
              bind:value={searchInput}
              disabled={searching}
              required={false}
              icon
              focus
            />
          </InputLabel>
          {#if $fwdToFilters.length > 2}
            <FlexContainer align_items="center" gap="0.5rem">
              <h6 class="no-margin">Filter by<br />account</h6>
              <Select bind:value={fwdToFilterInput} options={$fwdToFilters} disabled={searching} />
            </FlexContainer>
          {/if}
        </FlexContainer>
        <GridContainer align_items="center" template_columns="1fr 1fr" gap="0.3rem">
          <Button on:click={closeOnExit(() => handleClearSearch())} width="100%" disabled={searching} rounded border>Reset</Button>
          <Button type="submit" width="100%" disabled={searching} primary rounded>Search</Button>
        </GridContainer>
      </FlexContainer>
    </FlexContainer>
  </Form>
</Modal>

<div class="body">
  <FlexContainer gap="0rem" height="100%">
    <FlexContainer mainList column gap="0.5rem" mobileFullScreen mobileFullScreenSelected={showNewAddress || $selectedAddress}>
      <GridContainer
        align_items="stretch"
        template_columns={searchQuery ? 'calc(100% - 35px - 1.3rem) 35px' : fwdToFilter ? 'calc(35px + 4rem) calc(100% - 35px - 4rem - 1.3rem)' : '35px calc(100% - 35px - 1.3rem)'}
        height="35px"
        margin="0.5rem 0.5rem 0px 0.5rem"
        gap="0.3rem"
      >
        {#if searchQuery || fwdToFilter}
          <GridContainer align_items="stretch" template_columns="calc(100% - 4rem) 4rem" height="100%" gap="0" border rounded nooverflow>
            <Button on:click={() => (searchModalOpened = true)} height="auto" width="100%" margin="0" blendin>
              <GridContainer align_items="center" justify_items="start" template_columns="35px auto" height="100%" gap="0.1rem">
                <FlexContainer align_items="center" justify_content="center">
                  {#if !searchQuery && fwdToFilter}
                    <FilterIcon />
                  {:else}
                    <SearchIcon />
                  {/if}
                </FlexContainer>
                {#if searchQuery}
                  <span class="oneline">{searchQuery}</span>
                {/if}
              </GridContainer>
            </Button>
            <Button on:click={handleClearSearch} height="auto" width="100%" margin="0" blendin><small>Clear</small></Button>
          </GridContainer>
        {:else}
          <Button on:click={() => (searchModalOpened = true)} height="35px" width="100%" margin="0" blendin border rounded><SearchIcon /></Button>
        {/if}
        <Button
          on:click={() => (addressLimitReached ? goto('/account', { replaceState: true }) : toggleShowNewAddress())}
          disabled={showNewAddress || fetchingAddresses}
          height="35px"
          width="100%"
          margin="0"
          padding="0"
          primary
          rounded
        >
          {#if searchQuery}
            <AddIcon color="var(--text-light-color)" />
          {:else}
            <GridContainer height="100%" padding="0.2rem 0.3rem" align_items="center" template_columns="1fr auto 1fr" color="var(--text-light-color)">
              <div />
              <span class="oneline">{addressLimitReached ? 'Get More Addresses' : 'New Address'}</span>
              <FlexContainer height="100%" align_items="flex-end" justify_content="flex-end" color="inherit">
                {#if !fetchingAddresses && !$isEnhancedProtection && addressesCount !== undefined && oidcAddressesCount !== undefined && addressesCount - oidcAddressesCount >= MAX_BASIC_PROTECTION_ADDRESSES}
                  <span class="xs">{Math.max(MAX_BASIC_PROTECTION_ADDRESSES - (addressesCount - oidcAddressesCount), 0)} remaining</span>
                {/if}
              </FlexContainer>
            </GridContainer>
          {/if}
        </Button>
      </GridContainer>
      <FlexContainer align_items="center" justify_content="space-between" width="auto" margin="0 0.5rem 0.25rem 0.5rem" gap="0.5rem">
        <!-- Filter options -->
        <FlexContainer width="auto" bgColor="var(--border-color)" border rounded nooverflow gap="1px" padding="0px auto">
          <Button on:click={() => handleFilterChanged('all')} padding="0.15rem 0.3rem" height="18px" selected={filter === 'all'} disabled={fetchingAddresses}><small>All</small></Button>
          <Button on:click={() => handleFilterChanged('active')} padding="0.15rem 0.3rem" height="18px" selected={filter === 'active'} disabled={fetchingAddresses}><small>Active</small></Button>
          <Button on:click={() => handleFilterChanged('inactive')} padding="0.15rem 0.3rem" height="18px" selected={filter === 'inactive'} disabled={fetchingAddresses}><small>Inactive</small></Button>
        </FlexContainer>
        <!-- Sort options (mobile) -->
        <Button on:click={() => (sortModalOpened = true)} margin="0px" padding="0.15rem 0.3rem" height="26px" disabled={fetchingAddresses} mobile border rounded
          ><span class="sm oneline">{SORT_BY[sortBy]}</span><SortListIcon dimension="16" /></Button
        >
        <!-- Sort options (desktop) -->
        <Dropdown width="7rem" height="26px" padding="0px" title={SORT_BY[sortBy]} small noMobile>
          <FlexContainer bgColor="var(--border-color)" column gap="1px">
            <Button on:click={() => handleSortChanged('date')} height="22px" padding="0.3rem 0.5rem" selected={sortBy === 'date'} disabled={fetchingAddresses}><small>{SORT_BY.date}</small></Button>
            <Button on:click={() => handleSortChanged('label')} height="22px" padding="0.3rem 0.5rem" selected={sortBy === 'label'} disabled={fetchingAddresses}><small>{SORT_BY.label}</small></Button>
            <Button on:click={() => handleSortChanged('value')} height="22px" padding="0.3rem 0.5rem" selected={sortBy === 'value'} disabled={fetchingAddresses}><small>{SORT_BY.value}</small></Button>
          </FlexContainer>
        </Dropdown>
      </FlexContainer>
      {#if fetchingAddresses}
        <FlexContainer column gap="0rem" nooverflow>
          <Button disabled={true} selected={false} ascolumn align_items="flex-start" height="65px">
            <h3 class="oneline">Loading...</h3>
          </Button>
        </FlexContainer>
      {:else}
        <FlexContainer column gap="0rem" nooverflow>
          {#if addresses?.length}
            {#each addresses as address}
              <Button on:click={() => selectAddress(address)} selected={$selectedAddress?.id === address?.id} ascolumn border align_items="flex-start" height="65px">
                <FlexContainer align_items="center" justify_content="flex-start" gap="0.5rem">
                  <h4 class="no-margin oneline">{address.label.replace(/^https?:\/\/(\S+)/, '$1')}</h4>
                  {#if address.deactivated_at}
                    <OfflineBoltIcon dimension="18" color="var(--warning-color)" />
                  {/if}
                </FlexContainer>
                <span class={`address oneline ${address.deactivated_at ? 'disabled' : ''}`}>{address.value}</span>
              </Button>
            {/each}
            <Pagination {isFirstPage} {isLastPage} firstId={addresses[0].id} lastId={addresses[addresses.length - 1].id} nextPage={fetchAddresses} />
          {:else}
            <Button disabled={true} selected={false} ascolumn align_items="flex-start" height="65px">
              <h3 class="oneline">No Addresses found.</h3>
            </Button>
          {/if}
        </FlexContainer>
      {/if}
    </FlexContainer>
    <Section padding="1rem" bgColor="var(--new-layer-color)" color="light-grey" height="100%" justify_content="flex-start" listItem nooverflow>
      {#if showNewAddress}
        <MailAddress label={queryUrl || queryTitle} note={queryUrl ? queryTitle : undefined} {handleNewAddressCreated} handleClose={toggleShowNewAddress} />
      {:else if $selectedAddress}
        <MailAddress {...$selectedAddress} {handleAddressPatched} {handleAddressDeleted} editMode="true" />
      {:else}
        <MailIntro />
      {/if}
    </Section>
  </FlexContainer>
</div>

<style>
  .body {
    height: calc(100vh - 50px);
    height: calc(100svh - 50px);
  }

  h3,
  .address {
    margin: 0;
  }

  span.disabled {
    opacity: 0.5;
  }

  .oneline {
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  @media screen and (max-width: 979px) {
    .body {
      height: calc(100vh - 50px);
      height: calc(100svh - 50px);
      margin-top: 0px;
    }
  }
</style>
