// Render Functions
(function () {
  'use strict';

  var U = window.RouteUtils;

  var tips = [
    { icon: '↓', title: '下坡控速', text: '二郎山、折多山、72 拐、海子山下拉纳山隧道是全程最危险下坡段。困了、恐惧了立刻停车休息。' },
    { icon: '雨', title: '雨天策略', text: '进入塌方易发路段后雨天不要赶夜路。天气差时可以灵活拆分行程。' },
    { icon: '高', title: '高原适应', text: '初入高原晚上别洗太久热水澡，防感冒。松多海拔 4285m，注意保暖和睡眠。' },
    { icon: '修', title: '休整检查', text: '休整日必查补胎工具、刹车片磨损、链条润滑、驮包固定和衣物清洁。' },
    { icon: '补', title: '补给策略', text: '荣许至东达山垭口、色季拉山等路段补给少，出发前必须带足水和能量。' },
    { icon: '风', title: '逆风预警', text: '安久拉山逆风概率高，务必早出发。左贡至邦达段容易遇冰雹。' },
    { icon: '灯', title: '隧道安全', text: '通麦至鲁朗段隧道多，前后灯必须好用，隧道内不要并排骑，不夜骑。' },
    { icon: '末', title: '最后一天', text: '松多至拉萨约 182km，状态极好才一日到。更建议保留墨竹工卡至拉萨可选日。' }
  ];

  function renderHeroStats(days, passes) {
    var target = document.getElementById('heroStats');
    if (!target) return;

    var mainDays = U.getMainDays(days);
    var distance = mainDays.reduce(function (sum, day) {
      return sum + Number(day.km);
    }, 0);
    var restDays = mainDays.filter(function (day) {
      return day.rest;
    }).length;
    var highest = passes.reduce(function (max, pass) {
      return Math.max(max, pass.alt);
    }, 0);

    var stats = [
      { label: '主计划', value: mainDays.length + ' 天' },
      { label: '主线里程', value: U.formatKm(Math.round(distance)) + ' km' },
      { label: '最高海拔', value: U.formatKm(highest) + ' m' },
      { label: '雪山垭口', value: passes.length + ' 座' },
      { label: '休整日', value: restDays + ' 天' }
    ];

    target.innerHTML = stats.map(function (item) {
      return '<div class="stat-card"><b>' + U.escapeHtml(item.value) + '</b><span>' + U.escapeHtml(item.label) + '</span></div>';
    }).join('');
  }

  function renderTag(tag) {
    var className = tag.c === 'plain' ? 'chip' : 'chip chip-' + U.escapeHtml(tag.c);
    if (tag.c === 'rest') className = 'chip chip-rest';
    if (tag.c === 'option') className = 'chip chip-option';
    return '<span class="' + className + '">' + U.escapeHtml(tag.t) + '</span>';
  }

  function renderDayMetrics(day) {
    var climb = U.getClimb(day);
    var altitude = day.sAlt + ' → ' + day.eAlt + 'm';
    var metrics = [
      { label: 'Distance', value: day.km > 0 ? U.formatKm(day.km) + 'km' : 'Rest' },
      { label: 'Climb', value: climb + 'm' },
      { label: 'Altitude', value: altitude }
    ];

    return metrics.map(function (metric) {
      return '<div class="day-metric"><span>' + U.escapeHtml(metric.label) + '</span><b>' + U.escapeHtml(metric.value) + '</b></div>';
    }).join('');
  }

  function renderDayDetail(day, passes) {
    var blocks = [];
    var dayPasses = U.getPassesForDay(day, passes);

    if (dayPasses.length) {
      blocks.push({
        label: 'Passes',
        text: dayPasses.map(function (pass) {
          return pass.name + ' ' + pass.alt + 'm';
        }).join(' · ')
      });
    }

    if (day.lunch) {
      blocks.push({ label: 'Supply', text: day.lunch });
    }

    if (day.tip) {
      blocks.push({ label: 'Note', text: day.tip });
    }

    return blocks.map(function (block) {
      return '<div class="detail-block"><strong>' + U.escapeHtml(block.label) + '</strong>' + U.escapeHtml(block.text) + '</div>';
    }).join('');
  }

  function renderDayCard(day, passes) {
    var type = U.getDayType(day);
    var isHard = U.isHardDay(day);
    var classes = ['day-card', 'is-' + type];
    if (isHard) classes.push('is-hard');

    return [
      '<article class="' + classes.join(' ') + '" data-type="' + type + '" data-hard="' + (isHard ? '1' : '0') + '">',
      '  <button class="day-summary" type="button" aria-expanded="false">',
      '    <span class="route-node" aria-hidden="true"><span class="route-dot"></span></span>',
      '    <span class="day-main">',
      '      <span class="day-top">',
      '        <span class="day-code">Day ' + U.escapeHtml(U.formatDayNumber(day)) + '</span>',
      '        <span class="detail-link">查看详情</span>',
      '      </span>',
      '      <span class="day-title">' + U.escapeHtml(U.formatRoute(day)) + '</span>',
      '      <span class="day-metrics">' + renderDayMetrics(day) + '</span>',
      '      <span class="day-tags">' + U.getDayTags(day).map(renderTag).join('') + '</span>',
      '    </span>',
      '  </button>',
      '  <div class="day-detail"><div class="day-detail-inner"><div class="detail-groups">' + renderDayDetail(day, passes) + '</div></div></div>',
      '</article>'
    ].join('');
  }

  function renderDays(days, passes) {
    var target = document.getElementById('dayList');
    if (!target) return;

    target.innerHTML = days.map(function (day) {
      return renderDayCard(day, passes);
    }).join('');

  }

  function renderTips() {
    var target = document.getElementById('tipsGrid');
    if (!target) return;

    target.innerHTML = tips.map(function (tip) {
      return '<article class="tip-card"><div class="tip-icon">' + U.escapeHtml(tip.icon) + '</div><h3>' + U.escapeHtml(tip.title) + '</h3><p>' + U.escapeHtml(tip.text) + '</p></article>';
    }).join('');
  }

  function toggleDayCard(card, forceOpen) {
    var shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !card.classList.contains('is-open');
    card.classList.toggle('is-open', shouldOpen);

    var button = card.querySelector('.day-summary');
    var detailText = card.querySelector('.detail-link');
    if (button) button.setAttribute('aria-expanded', String(shouldOpen));
    if (detailText) detailText.textContent = shouldOpen ? '收起详情' : '查看详情';
  }

  function setFilter(type) {
    document.querySelectorAll('[data-filter]').forEach(function (button) {
      button.classList.toggle('is-active', button.dataset.filter === type);
    });

    document.querySelectorAll('.day-card').forEach(function (card) {
      var visible = type === 'all'
        || (type === 'ride' && card.dataset.type === 'ride' && card.dataset.hard !== '1')
        || (type === 'rest' && card.dataset.type === 'rest')
        || (type === 'hard' && card.dataset.hard === '1');
      card.hidden = !visible;
    });
  }

  function expandAll(open) {
    document.querySelectorAll('.day-card:not([hidden])').forEach(function (card) {
      toggleDayCard(card, open);
    });
  }

  window.RouteRender = {
    renderHeroStats: renderHeroStats,
    renderDayCard: renderDayCard,
    renderDays: renderDays,
    renderTips: renderTips,
    toggleDayCard: toggleDayCard,
    setFilter: setFilter,
    expandAll: expandAll
  };
})();
