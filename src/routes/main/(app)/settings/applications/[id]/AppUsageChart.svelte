<script>
  import { LineChart, Interpolation, easings } from 'chartist';
  import { onMount, onDestroy } from 'svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import { addMonthsToTimestamp, getMonthNameFromTS, getMonthStartTS, getSizeUnit, timestampToSecs } from '$lib/modules/utils';
  import Radio from '$lib/components/common/Radio.svelte';

  export let selected;
  export let metrics;
  let type = 'active_users';
  let relayMetricsUnit = { label: 'KB', divider: 1024 };

  $: relayMetricsUnit = getSizeUnit(
    Object.values(metrics.relay_metrics).reduce((max, item) => Math.max(max, item.size['0']), 0)
  );

  $: updateChart(metrics, type) || selected || relayMetricsUnit;

  const METRICS_CONFIG = {
    'active_users': {
      label: 'Active Users',
      color: '#00729c',
      selector: (data) => data,
      tooltipValue: (value) => value === 1 ? '1 user' : `${value} users`,
      yLabelInterpolationFnc: (value) => `${value}`
    },
    'relay_metrics:size': {
      label: 'Relayed Data',
      color: '#009c76',
      selector: (data) => parseFloat((data?.size?.['0'] / relayMetricsUnit.divider).toFixed(2)),
      tooltipValue: (value) => `${value} ${relayMetricsUnit.label}`,
      yLabelInterpolationFnc: (value) => value === 0 ? `${value} ${relayMetricsUnit.label}` : `${value}`
    },
    'relay_metrics:count': {
      label: 'Relayed Emails',
      color: '#959595',
      selector: (data) => data?.count?.['0'],
      tooltipValue: (value) => value === 1 ? '1 email' : `${value} emails`,
      yLabelInterpolationFnc: (value) => `${value}`
    }
  };

  const METRICS_OPTIONS = ['active_users', 'relay_metrics:size', 'relay_metrics:count'].map(key => ({
    label: METRICS_CONFIG[key].label,
    value: key
  }));

  let element;
  let tooltip;
  let tooltipLabel;
  let tooltipValue;
  let tooltipTimer;
  let tooltipSelectedIndex = 0;
  let chart;

  function resetTooltipSelection() {
    clearTimeout(tooltipTimer);
    tooltipSelectedIndex = 0;
  }

  function updateChart(metrics, type) {
    if (chart) {
      resetTooltipSelection();
      chart.update(extractData(metrics, type));
    }
  }

  function extractData(metrics, type) {
    let labels = [];
    let dataPoints = [];

    const monthStartTS = getMonthStartTS();
    for (let monthOffset = -5; monthOffset <= 0; monthOffset++) {
      const typeKey = type.split(':', 1).pop();
      const monthTS = addMonthsToTimestamp(monthStartTS, monthOffset);
      const label = getMonthNameFromTS(monthTS);
      const monthTsInSecs = timestampToSecs(monthTS);
      const data = {
        label: getMonthNameFromTS(monthTS, 'long'),
        value: METRICS_CONFIG[type]['selector'](metrics?.[typeKey]?.[`${monthTsInSecs}`]) || 0
      };

      labels.push(label);
      dataPoints.push({ meta: JSON.stringify(data), value: data.value });
    }

    return {
      labels,
      series: [dataPoints]
    };
  }

  onMount(() => {
    chart = new LineChart(
      element,
      extractData(metrics, type),
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
          onlyInteger: true,
          labelInterpolationFnc: (value) => METRICS_CONFIG[type].yLabelInterpolationFnc(value)
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

          const { label, value } = JSON.parse(data.meta);
          tooltipLabel = label;
          tooltipValue = METRICS_CONFIG[type]['tooltipValue'](value);

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

<FlexContainer column align_items="center" gap="0.5rem">
  <Radio width="auto" margin="0.5rem 0 0 0" options={METRICS_OPTIONS} bind:selected={type} xs />
  <div bind:this={element} data-selected={tooltipSelectedIndex} class="chart" style:--series-color={METRICS_CONFIG[type].color} >
    <div bind:this={tooltip} class="chartist-tooltip">
      <FlexContainer column padding="0.5rem">
        <span class="xs"><strong>{tooltipLabel}</strong></span>
        <span class="xs">{tooltipValue}</span>
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

  :global(.ct-series-a .ct-point, .ct-series-a .ct-line) {
    stroke: var(--series-color);
    stroke-opacity: 0.8;
  }

  :global(.ct-area) {
    stroke: none;
  }

  :global(.ct-series-a .ct-area) {
    fill: var(--series-color);
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
