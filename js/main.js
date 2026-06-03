// Events / Main Init
(function () {
  'use strict';

  var data = window.RouteData;
  var equipment = window.RouteEquipment;
  var render = window.RouteRender;
  var map = window.RouteMap;
  var chart = window.RouteChart;

  function bindDayCardEvents() {
    document.getElementById('dayList').addEventListener('click', function (event) {
      var summary = event.target.closest('.day-summary');
      if (!summary) return;
      render.toggleDayCard(summary.closest('.day-card'));
    });
  }

  function bindEquipmentCardEvents() {
    document.getElementById('equipmentBoard').addEventListener('click', function (event) {
      var summary = event.target.closest('.equipment-summary');
      if (!summary) return;
      render.toggleEquipmentCard(summary.closest('.equipment-card'));
    });
  }

  function bindToolbarEvents() {
    document.querySelector('.toolbar').addEventListener('click', function (event) {
      var filterButton = event.target.closest('[data-filter]');
      var actionButton = event.target.closest('[data-action]');

      if (filterButton) {
        render.setFilter(filterButton.dataset.filter);
      }

      if (actionButton) {
        render.expandAll(actionButton.dataset.action === 'expand');
      }
    });
  }

  function bindTopButton() {
    var button = document.getElementById('topBtn');
    if (!button) return;

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 520);
    }, { passive: true });
  }

  function bindNavState() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
    var sections = links.map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    }).filter(Boolean);

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function init() {
    if (!data || !data.days || !data.passes) {
      throw new Error('Route data is missing.');
    }

    render.renderHeroStats(data.days, data.passes);
    render.renderDays(data.days, data.passes);
    render.renderEquipment(equipment);
    render.renderTips();
    bindEquipmentCardEvents();
    bindDayCardEvents();
    bindToolbarEvents();
    bindTopButton();
    bindNavState();
    map.initMap(data.days, data.passes);
    chart.initElevationChart(data.days, data.passes);
  }

  document.addEventListener('DOMContentLoaded', init);

  window.setFilter = render.setFilter;
})();
