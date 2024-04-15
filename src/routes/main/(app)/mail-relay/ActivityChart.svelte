<script>
  import { Chart, LineController, LinearScale, CategoryScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
  import { onMount } from 'svelte';

  Chart.register(LineController, LinearScale, CategoryScale, PointElement, LineElement, Filler, Tooltip, Legend);

  const DAY_IN_SECS = 86400;

  export let metrics;
  $: updateChart(metrics);

  let canvas;
  let chart;

  function getTimestampAtMidnightInSecs() {
    var d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return Math.floor(d.getTime() / 1000);
  }

  function updateChart(metrics) {
    if (chart) {
      chart.data = extractData(metrics);
      chart.update();
    }
  }

  function extractData(metrics) {
    let labels = [];
    let received = [];
    let sent = [];

    const midnight = getTimestampAtMidnightInSecs();
    for (let ts = midnight - 13 * DAY_IN_SECS; ts <= midnight; ts += DAY_IN_SECS) {
      // labels
      const date = new Date(ts * 1000);
      labels.push(`${date.toISOString().substring(0, 10)}`);

      // datasets
      const point = metrics?.[ts.toString()];
      received.push((point?.['1'] || 0) + (point?.['2'] || 0) + (point?.['3'] || 0));
      sent.push((point?.['11'] || 0) + (point?.['12'] || 0) + (point?.['13'] || 0));
    }

    return {
      labels,
      datasets: [
        {
          label: 'Received',
          data: received,
          color: '#FFF',
          borderColor: '#00729CCC',
          backgroundColor: '#00729C55',
          fill: true,
          stepped: 'middle'
        },
        {
          label: 'Sent',
          data: sent,
          color: '#FFF',
          borderColor: '#009c76AA',
          backgroundColor: '#009c7655',
          fill: true,
          stepped: 'middle'
        }
      ]
    };
  }

  onMount(() => {
    // create chart
    chart = new Chart(canvas, {
      type: 'line',
      data: extractData(metrics),
      options: {
        responsive: true,
        resizeDelay: 0,

        interaction: {
          intersect: false,
          axis: 'x'
        },
        scales: {
          y: {
            min: 0,
            suggestedMax: 3,
            type: 'linear',
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  });
</script>

<div style="width: 100%;">
  <canvas bind:this={canvas}></canvas>
</div>
