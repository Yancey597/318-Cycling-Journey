// Chart Initialization
(function () {
  'use strict';

  var U = window.RouteUtils;

  function createPassMarkPoints(day, passes) {
    return U.getPassesForDay(day, passes).map(function (pass) {
      return {
        name: pass.name,
        value: pass.name + ' ' + pass.alt + 'm',
        coord: ['D' + day.n + ' ' + day.to, pass.alt],
        label: {
          formatter: pass.name + ' ' + pass.alt + 'm'
        }
      };
    });
  }

  function initElevationChart(days, passes) {
    var target = document.getElementById('elevationChart');
    if (!target || typeof window.echarts === 'undefined') return;

    var chart = window.echarts.init(target, null, { renderer: 'canvas' });
    var mainDays = U.getMainDays(days);
    var isMobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    var labels = [];
    var points = [];
    var climbBars = [];
    var marks = [];

    mainDays.forEach(function (day) {
      labels.push('D' + day.n + ' ' + (day.to || day.from));
      points.push({
        value: day.eAlt,
        day: day,
        label: day.to || day.from
      });
      climbBars.push({
        value: U.getClimb(day),
        day: day
      });
      marks = marks.concat(createPassMarkPoints(day, passes));
    });

    chart.setOption({
      backgroundColor: 'transparent',
      color: ['#FC4C02'],
      grid: {
        left: isMobile ? 42 : 58,
        right: isMobile ? 18 : 36,
        top: isMobile ? 34 : 42,
        bottom: isMobile ? 78 : 72,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#171717',
        borderWidth: 0,
        padding: [10, 12],
        textStyle: { color: '#FFFDF8', fontSize: 12 },
        formatter: function (items) {
          var item = items[0];
          var day = item.data.day;
          return [
            '<b>D' + day.n + ' ' + U.escapeHtml(U.formatRoute(day)) + '</b>',
            '距离 ' + day.km + 'km',
            '海拔 ' + day.sAlt + ' → ' + day.eAlt + 'm',
            '累计爬升约 ' + U.getClimb(day) + 'm'
          ].join('<br>');
        }
      },
      xAxis: {
        type: 'category',
        data: labels,
        boundaryGap: false,
        axisLine: { lineStyle: { color: 'rgba(23,23,23,.14)' } },
        axisTick: { show: false },
        axisLabel: {
          interval: isMobile ? 1 : 0,
          rotate: isMobile ? 35 : 26,
          color: '#8B867D',
          fontSize: isMobile ? 10 : 11,
          margin: 16
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '海拔 m',
          min: 0,
          max: 5600,
          splitNumber: 7,
          nameTextStyle: { color: '#8B867D', fontSize: 11 },
          axisLabel: { color: '#8B867D', fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: 'rgba(23,23,23,.07)' } }
        },
        {
          type: 'value',
          name: '爬升 m',
          min: 0,
          max: 2800,
          splitNumber: 4,
          nameTextStyle: { color: '#8B867D', fontSize: 11 },
          axisLabel: { color: '#8B867D', fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: isMobile ? 42 : 100
        },
        {
          type: 'slider',
          height: 18,
          bottom: 18,
          start: 0,
          end: isMobile ? 42 : 100,
          borderColor: 'transparent',
          fillerColor: 'rgba(252,76,2,.14)',
          handleStyle: { color: '#FC4C02' },
          moveHandleStyle: { color: '#FC4C02' },
          textStyle: { color: '#8B867D' }
        }
      ],
      series: [
        {
          name: '每日爬升',
          type: 'bar',
          yAxisIndex: 1,
          data: climbBars,
          barWidth: isMobile ? 7 : 10,
          itemStyle: {
            color: 'rgba(60,127,167,.20)',
            borderRadius: [5, 5, 0, 0]
          },
          emphasis: {
            itemStyle: { color: 'rgba(60,127,167,.32)' }
          },
          z: 1
        },
        {
          name: '海拔',
          type: 'line',
          data: points,
          yAxisIndex: 0,
          smooth: 0.18,
          symbol: 'circle',
          symbolSize: isMobile ? 5 : 6,
          lineStyle: { width: 3, color: '#FC4C02' },
          itemStyle: { color: '#FC4C02', borderColor: '#FFFDF8', borderWidth: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(252,76,2,.18)' },
                { offset: 1, color: 'rgba(252,76,2,0)' }
              ]
            }
          },
          markPoint: {
            symbol: 'roundRect',
            symbolSize: isMobile ? [0, 0] : [78, 24],
            itemStyle: { color: '#171717' },
            label: {
              color: '#FFFDF8',
              fontSize: 10,
              fontWeight: 700,
              padding: [4, 6]
            },
            data: isMobile ? [] : marks
          }
        }
      ]
    });

    window.addEventListener('resize', function () {
      chart.resize();
    });
  }

  window.RouteChart = {
    initElevationChart: initElevationChart
  };
})();
