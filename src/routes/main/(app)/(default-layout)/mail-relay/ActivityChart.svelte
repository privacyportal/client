<script>
  import { LineChart, Interpolation, easings } from 'chartist';
  import { onMount, onDestroy } from 'svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Button from '$lib/components/common/Button.svelte';

  const DAY_IN_SECS = 86400;

  export let metrics;
  $: updateChart(metrics);

  let hideReceived = false;
  let hideSent = false;
  let element;
  let tooltip;
  let tooltipLabel;
  let tooltipReceivedValue;
  let tooltipSentValue;
  let tooltipTimer;
  let tooltipSelectedIndex = 0;
  let chart;

  function resetTooltipSelection() {
    clearTimeout(tooltipTimer);
    tooltipSelectedIndex = 0;
  }

  function getTimestampAtMidnightInSecs() {
    var d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return Math.floor(d.getTime() / 1000);
  }

  function updateChart(metrics) {
    if (chart) {
      resetTooltipSelection();
      chart.update(extractData(metrics));
    }
  }

  function extractData(metrics) {
    let labels = [];
    let received = [];
    let sent = [];

    const midnight = getTimestampAtMidnightInSecs();
    for (let ts = midnight - 13 * DAY_IN_SECS; ts <= midnight; ts += DAY_IN_SECS) {
      // labels
      const label = new Date(ts * 1000).toISOString().substring(0, 10);

      // datasets
      const point = metrics?.[ts.toString()];
      const data = {
        label,
        received: (point?.['1'] || 0) + (point?.['2'] || 0) + (point?.['3'] || 0),
        sent: (point?.['11'] || 0) + (point?.['12'] || 0) + (point?.['13'] || 0)
      };
      const meta = JSON.stringify(data);

      labels.push(label);
      received.push({ meta, value: data.received });
      sent.push({ meta, value: data.sent });
    }

    return {
      labels,
      series: [received, sent]
    };
  }

  onMount(() => {
    chart = new LineChart(
      element,
      extractData(metrics),
      {
        low: 0,
        showArea: true,
        showLine: true,
        showPoint: true,
        fullWidth: true,
        axisX: {
          showLabel: true,
          showGrid: true
        },
        axisY: {
          onlyInteger: true
        },
        lineSmooth: Interpolation.simple({ divisor: 0 })
      },
      [
        [
          'screen and (min-width: 401px) and (max-width: 701px)',
          {
            axisX: {
              labelInterpolationFnc: (value, index) => (index % 2 === 1 ? value : '')
            }
          }
        ],
        [
          'screen and (max-width: 400px)',
          {
            axisX: {
              labelInterpolationFnc: (value, index) => (index % 3 === 1 ? value : '')
            }
          }
        ]
      ]
    );

    chart.on('draw', (data) => {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 0,
            dur: 1000,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: easings.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
        data.element.animate({
          opacity: {
            begin: 800,
            dur: 500,
            from: 0,
            to: 1,
            easing: 'easeOutQuart'
          }
        });

        data.element._node.addEventListener('click', (e) => {
          resetTooltipSelection();
          tooltip.style.top = data.y > 50 ? data.y - 60 + 'px' : data.y + 5 + 'px';
          tooltip.style.left = data.x > 200 ? data.x - 85 + 'px' : data.x + 5 + 'px';

          const { label, received, sent } = JSON.parse(data.meta);
          tooltipLabel = label;
          tooltipReceivedValue = `Received: ${received}`;
          tooltipSentValue = `Sent: ${sent}`;

          tooltipSelectedIndex = data.index + 1;
          tooltipTimer = setTimeout(() => (tooltipSelectedIndex = 0), 5000);
        });
      }
    });
  });

  onDestroy(async () => {
    if (chart) {
      chart.detach();
    }
  });
</script>

<FlexContainer column>
  <FlexContainer width="100%" align_items="center" justify_content="center" gap="0.5rem">
    <Button height="auto" on:click={() => (hideReceived = !hideReceived)} padding="0.5rem" blendin rounded nohover>
      <FlexContainer align_items="flex-start" gap="0.3rem">
        <div class="legend-color-container legend-series-a" />
        <span class="legend-label oneline mono xs" class:series-a-hidden={hideReceived}>Received</span>
      </FlexContainer>
    </Button>
    <Button height="auto" on:click={() => (hideSent = !hideSent)} padding="0.5rem" blendin rounded nohover>
      <FlexContainer align_items="flex-start" gap="0.5rem">
        <div class="legend-color-container legend-series-b" />
        <span class="legend-label oneline mono xs" class:series-b-hidden={hideSent}>Sent</span>
      </FlexContainer>
    </Button>
  </FlexContainer>
  <div bind:this={element} data-selected={tooltipSelectedIndex} class="chart" class:series-a-hidden={hideReceived} class:series-b-hidden={hideSent}>
    <div bind:this={tooltip} class="chartist-tooltip">
      <FlexContainer column padding="0.5rem">
        <span class="xs"><strong>{tooltipLabel}</strong></span>
        <span class="xs">{tooltipReceivedValue}</span>
        <span class="xs">{tooltipSentValue}</span>
      </FlexContainer>
    </div>
  </div></FlexContainer
>

<style>
  .chart {
    position: relative;
    width: 100%;
    max-height: calc(max(20vh, 150px) + 1rem);
    padding-bottom: 1rem;
  }

  .chartist-tooltip {
    width: 80px;
    position: absolute;
    overflow: hidden;
    background-color: var(--new-layer-x3-color);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border-radius: 5px;
    opacity: 0;
    visibility: hidden;
    transition: ease-in-out 0.3s;
  }

  .chart:not([data-selected='0']) .chartist-tooltip {
    visibility: visible;
    opacity: 1;
    transition: ease-in-out 0.3s;
  }

  .legend-color-container {
    width: 45px;
    height: 15px;
  }

  .legend-series-a {
    border: 3px solid #00729ccc;
    background: #00729c33;
  }

  .legend-series-b {
    border: 3px solid #009c76aa;
    background-color: #009c7633;
  }

  .legend-label.series-a-hidden,
  .legend-label.series-b-hidden {
    text-decoration: line-through;
  }

  :global(.ct-chart-line) {
    overflow: visible;
  }

  :global(.ct-grid) {
    stroke-width: 0.5px;
    stroke-dasharray: 0px;
    stroke: #00000033;
  }

  :global(.ct-chart-line .ct-line) {
    stroke-width: 3px;
    fill: none;
  }

  :global(.ct-chart-line .ct-point) {
    stroke-width: 7px;
    stroke-linecap: round;
  }

  :global(.chart .ct-point:hover) {
    stroke-width: 10px;
  }

  :global(.chart[data-selected='1'] .ct-point:nth-of-type(1)),
  :global(.chart[data-selected='2'] .ct-point:nth-of-type(2)),
  :global(.chart[data-selected='3'] .ct-point:nth-of-type(3)),
  :global(.chart[data-selected='4'] .ct-point:nth-of-type(4)),
  :global(.chart[data-selected='5'] .ct-point:nth-of-type(5)),
  :global(.chart[data-selected='6'] .ct-point:nth-of-type(6)),
  :global(.chart[data-selected='7'] .ct-point:nth-of-type(7)),
  :global(.chart[data-selected='8'] .ct-point:nth-of-type(8)),
  :global(.chart[data-selected='9'] .ct-point:nth-of-type(9)),
  :global(.chart[data-selected='10'] .ct-point:nth-of-type(10)),
  :global(.chart[data-selected='11'] .ct-point:nth-of-type(11)),
  :global(.chart[data-selected='12'] .ct-point:nth-of-type(12)),
  :global(.chart[data-selected='13'] .ct-point:nth-of-type(13)),
  :global(.chart[data-selected='14'] .ct-point:nth-of-type(14)) {
    stroke-width: 10px !important;
  }

  :global(.ct-series) {
    opacity: 1;
    visibility: visible;
    transition: ease-in-out 0.5s;
    fill-opacity: 0.2;
  }

  :global(.series-a-hidden .ct-series-a, .series-b-hidden .ct-series-b) {
    opacity: 0;
    visibility: hidden;
    transition: ease-in-out 0.8s;
  }

  :global(.ct-series-a .ct-point, .ct-series-a .ct-line) {
    stroke: #00729ccc;
  }

  :global(.ct-area) {
    stroke: none;
  }

  :global(.ct-series-a .ct-area) {
    fill: #00729c;
    fill-opacity: 0.2;
  }

  :global(.ct-series-b .ct-point, .ct-series-b .ct-line) {
    stroke: #009c76aa;
  }

  :global(.ct-series-b .ct-area) {
    fill: #009c76;
    fill-opacity: 0.2;
  }

  :global(.ct-label) {
    display: flex;
    fill: #00000066;
    color: var(--text-color);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    line-height: 1;
  }

  :global(.ct-label.ct-horizontal.ct-end) {
    margin-left: -100%;
    align-items: flex-start;
    justify-content: flex-end;
    white-space: nowrap;
    transform: rotate(-30deg) translate(-3px, 3px);
    transform-box: fill-box;
    transform-origin: 100% 0;
    text-anchor: end;
    font-size: x-small;
    text-align: left;
  }

  :global(.ct-label.ct-vertical.ct-start) {
    align-items: flex-end;
    justify-content: flex-end;
    text-align: right;
  }
</style>
