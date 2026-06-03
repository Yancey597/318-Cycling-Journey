// Utility Functions
(function () {
  'use strict';

  var PASSING_DAY_LIMIT = 25;

  function getMainDays(days) {
    return days.filter(function (day) {
      return typeof day.n === 'number' && day.n <= PASSING_DAY_LIMIT;
    });
  }

  function getDayType(day) {
    if (day.rest) return 'rest';
    if (day.opt) return 'option';
    return 'ride';
  }

  function getClimb(day) {
    if (typeof day.climb === 'number') return day.climb;
    return Math.max(Number(day.eAlt) - Number(day.sAlt), 0);
  }

  function getDayTags(day) {
    if (day.tags && day.tags.length) return day.tags.slice();
    if (day.rest) return [{ t: '休整', c: 'rest' }];
    if (day.opt) return [{ t: '可选', c: 'option' }];
    return [{ t: '骑行', c: 'plain' }];
  }

  function isHardDay(day) {
    return getDayTags(day).some(function (tag) {
      return tag.c === 'hard';
    });
  }

  function formatDayNumber(day) {
    return String(day.n).padStart(2, '0');
  }

  function formatRoute(day) {
    return day.to ? day.from + ' → ' + day.to : day.from;
  }

  function formatKm(km) {
    return Number(km).toLocaleString('zh-CN');
  }

  function getPassesForDay(day, passes) {
    return passes
      .filter(function (pass) {
        return pass.day === day.n;
      })
      .sort(function (a, b) {
        return b.alt - a.alt;
      });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function wgs2gcj(lng, lat) {
    lng = Number(lng);
    lat = Number(lat);
    if (Number.isNaN(lng) || Number.isNaN(lat)) return [0, 0];

    var a = 6378245.0;
    var ee = 0.00669342162296594323;
    var PI = Math.PI;

    function transformLat(x, y) {
      var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(y / 12.0 * PI) + 320.0 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
      return ret;
    }

    function transformLng(x, y) {
      var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
      return ret;
    }

    var dLat = transformLat(lng - 105.0, lat - 35.0);
    var dLng = transformLng(lng - 105.0, lat - 35.0);
    var radLat = lat / 180.0 * PI;
    var magic = Math.sin(radLat);
    magic = 1.0 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1.0 - ee)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);

    var outLng = lng + dLng;
    var outLat = lat + dLat;
    if (Number.isNaN(outLng) || Number.isNaN(outLat)) return [lng, lat];
    return [outLng, outLat];
  }

  window.RouteUtils = {
    getMainDays: getMainDays,
    getDayType: getDayType,
    getClimb: getClimb,
    getDayTags: getDayTags,
    isHardDay: isHardDay,
    formatDayNumber: formatDayNumber,
    formatRoute: formatRoute,
    formatKm: formatKm,
    getPassesForDay: getPassesForDay,
    escapeHtml: escapeHtml,
    wgs2gcj: wgs2gcj
  };
})();
