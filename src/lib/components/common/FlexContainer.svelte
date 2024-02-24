<script>
  export let element = undefined;
  export let justify_content = 'auto';
  export let align_items = 'auto';
  export let gap = '0px';
  export let width = '100%';
  export let height = 'auto';
  export let bgColor = 'auto';
  export let color = 'var(--text-color)';
  export let padding = 'auto';
  export let margin = '0px';
  export let mainList = undefined;
  export let listItem = undefined;
  export let column = undefined;
  export let textCentered = undefined;
  export let border = undefined;
  export let rounded = undefined;
  export let roundedIcon = undefined;
  export let nooverflow = undefined;
  export let overflowhidden = undefined;
  export let zeroFlexShrink = undefined;
  export let mobileFullScreen = undefined;
  export let mobileFullScreenSelected = undefined;
  export let mobileScale = undefined;
  export let autooverflow = undefined;
  export let nomobile = undefined;
  export let onlymobile = undefined;
  export let alwaysDisplay = undefined;

  let paddingMobile = padding
    .split(' ')
    .map((v) => `calc(${v} / 2)`)
    .join(' ');
</script>

<div
  class="container"
  bind:this={element}
  style:--gap={gap}
  style:--width={width}
  style:--height={height}
  style:--justify-content={justify_content}
  style:--align-items={align_items}
  style:--bg-color={bgColor}
  style:--color={color}
  style:--padding={padding}
  style:--padding-mobile={paddingMobile}
  style:--margin={margin}
  class:column
  class:border
  class:rounded
  class:rounded-icon={roundedIcon}
  class:nooverflow
  class:overflowhidden
  class:autooverflow
  class:nomobile
  class:onlymobile
  class:text-centered={textCentered}
  class:main-list={mainList}
  class:list-item={listItem}
  class:mobile-full-screen={mobileFullScreen}
  class:mobile-full-screen-selected={mobileFullScreenSelected}
  class:mobile-scale={mobileScale}
  class:zero-flex-shrink={zeroFlexShrink}
  class:alwaysdisplay={alwaysDisplay}
>
  <slot />
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    gap: var(--gap);
    justify-content: var(--justify-content);
    align-items: var(--align-items);
    width: var(--width);
    height: var(--height);
    min-height: var(--height);
    max-height: var(--height);
    padding: var(--padding);
    margin: var(--margin);
    min-width: var(--width);
    max-width: var(--width);
    color: var(--color);
    background-color: var(--bg-color);
  }

  .nooverflow {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .overflowhidden {
    overflow: hidden;
  }

  .autooverflow {
    overflow: auto !important;
  }

  .container.column {
    flex-direction: column;
  }

  .text-centered {
    text-align: center;
  }

  .main-list {
    min-width: 40%;
  }

  .list-item {
    width: 60%;
    max-width: 60%;
    min-width: 60%;
  }

  .border {
    border: 2px solid var(--border-color);
  }

  .rounded {
    border-radius: 6px;
  }

  .rounded-icon {
    overflow: hidden;
    border-radius: 22%;
  }

  .onlymobile:not(.alwaysdisplay) {
    display: none;
  }

  .zero-flex-shrink {
    flex-shrink: 0;
  }

  @media screen and (max-width: 979px) {
    .container.mobile-scale {
      padding: var(--padding-mobile);
    }

    .list-item {
      width: 100%;
      max-width: 100%;
      min-width: 100%;
    }

    .mobile-full-screen {
      width: 100%;
      max-width: 100%;
      min-width: 100%;
      transition: 0.2s;
    }

    .mobile-full-screen-selected {
      transition: 0.2s;
      margin-left: -100%;
    }

    .nomobile:not(.alwaysdisplay) {
      display: none;
    }

    .onlymobile:not(.alwaysdisplay) {
      display: flex;
    }
  }
</style>
