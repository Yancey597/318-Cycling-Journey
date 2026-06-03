// Map Initialization
(function () {
  'use strict';

  var U = window.RouteUtils;
  var AMAP_KEY = 'ed324d241897c68a929846b99e232774';
  var AMAP_VERSION = '2.0';
  var MAP_PADDING = [80, 80, 80, 80];

  var rawRoutePath = [
    [104.066, 30.572], [103.810, 30.410], [103.520, 30.320], [103.013, 29.980], [102.767, 30.067], [102.642, 29.942],
    [102.293, 29.857], [102.233, 29.913], [101.967, 30.050], [101.800, 30.075], [101.530, 30.042],
    [101.380, 30.030], [101.015, 30.015], [100.870, 30.010], [100.780, 30.000], [100.660, 29.980],
    [100.660, 29.983], [100.500, 29.990], [100.270, 29.993], [99.710, 29.990], [99.450, 29.995], [99.110, 30.005],
    [98.950, 30.010], [98.700, 29.750], [98.595, 29.680], [98.450, 29.660], [98.417, 29.590], [98.350, 29.540],
    [98.280, 29.510], [98.180, 29.480], [98.050, 29.530], [97.840, 29.670], [97.640, 29.830], [97.470, 30.010],
    [97.300, 30.200], [97.200, 30.210], [97.133, 30.180], [96.917, 30.050], [96.830, 30.000], [96.700, 29.760],
    [96.740, 29.500], [96.250, 29.620], [95.770, 29.860], [95.400, 30.000], [95.080, 30.090], [94.900, 29.970],
    [94.740, 29.770], [94.600, 29.660], [94.360, 29.660], [93.820, 29.710], [93.240, 29.890], [92.600, 29.890],
    [92.350, 29.820], [91.740, 29.840], [91.117, 29.650]
  ];

  function showMapError(message) {
    var target = document.getElementById('amap');
    if (!target) return;
    target.innerHTML = [
      '<div class="map-empty">',
      '  <div class="map-empty-card">',
      '    <b>鍦板浘鏆傛椂鏃犳硶鍔犺浇</b>',
      '    <span>' + U.escapeHtml(message) + '</span>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function getRoutePath() {
    return rawRoutePath.map(function (point) {
      return U.wgs2gcj(point[0], point[1]);
    }).filter(function (point) {
      return !Number.isNaN(point[0]) && !Number.isNaN(point[1]);
    });
  }

  function createDayPopup(day) {
    var climb = U.getClimb(day);
    var restHint = day.hasNextRest ? '<br><span>次日休整</span>' : '';
    return [
      '<div class="map-popup">',
      '  <b>D' + U.escapeHtml(day.n) + ' ' + U.escapeHtml(U.formatRoute(day)) + '</b>',
      '  <span>距离 ' + U.escapeHtml(day.km) + 'km · 爬升 ' + U.escapeHtml(climb) + 'm</span>',
      restHint,
      '</div>'
    ].join('');
  }

  function createPassPopup(pass) {
    return [
      '<div class="map-popup">',
      '  <b>' + U.escapeHtml(pass.name) + '</b>',
      '  <span>海拔 ' + U.escapeHtml(pass.alt) + 'm · D' + U.escapeHtml(pass.day) + '</span>',
      '</div>'
    ].join('');
  }

  function initMapInstance(AMap, days, passes) {
    var map = new AMap.Map('amap', {
      zoom: 7,
      center: [98.5, 32.2],
      resizeEnable: true,
      mapStyle: 'amap://styles/light'
    });

    var polyline = new AMap.Polyline({
      path: getRoutePath(),
      strokeColor: '#FC4C02',
      strokeWeight: 5,
      strokeOpacity: 0.88,
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 10
    });
    polyline.setMap(map);

    var openInfo = null;

    function addDayMarker(day, options) {
      options = options || {};
      var point = U.wgs2gcj(day.c[2], day.c[3]);
      var markerClass = 'map-marker';
      if (day.hasNextRest) markerClass += ' is-rest';
      var marker = new AMap.Marker({
        position: new AMap.LngLat(point[0], point[1]),
        offset: new AMap.Pixel(options.offsetX || -11, options.offsetY || -11),
        zIndex: options.zIndex || 50,
        content: '<div class="' + markerClass + '">' + U.escapeHtml(day.n) + '</div>'
      });
      marker.setMap(map);
      if (typeof marker.setzIndex === 'function') marker.setzIndex(options.zIndex || 50);
      marker.on('click', function () {
        if (openInfo) openInfo.close();
        openInfo = new AMap.InfoWindow({
          content: createDayPopup(day),
          offset: new AMap.Pixel(0, -30)
        });
        openInfo.open(map, marker.getPosition());
      });
    }

    var restDaysByPreviousStop = days.reduce(function (lookup, day) {
      if (!day.rest) return lookup;
      var restStop = day.from.replace('休整', '');
      var previousDay = days.find(function (candidate) {
        return !candidate.rest && candidate.to === restStop;
      });
      if (previousDay) lookup[previousDay.n] = true;
      return lookup;
    }, {});

    days.filter(function (day) {
      return !day.rest;
    }).forEach(function (day) {
      var markerDay = Object.assign({}, day, { hasNextRest: Boolean(restDaysByPreviousStop[day.n]) });
      addDayMarker(markerDay, { zIndex: 50 });
    });

    passes.forEach(function (pass) {
      var point = U.wgs2gcj(pass.lon, pass.lat);
      var marker = new AMap.Marker({
        position: new AMap.LngLat(point[0], point[1]),
        offset: new AMap.Pixel(-5, -5),
        zIndex: 30,
        content: '<div class="pass-marker"></div>'
      });
      marker.setMap(map);
      marker.on('click', function () {
        if (openInfo) openInfo.close();
        openInfo = new AMap.InfoWindow({
          content: createPassPopup(pass),
          offset: new AMap.Pixel(0, -16)
        });
        openInfo.open(map, marker.getPosition());
      });
    });

    map.setFitView(null, false, MAP_PADDING);
    setTimeout(function () {
      map.setFitView(null, false, MAP_PADDING);
    }, 300);
  }

  function initMap(days, passes) {
    if (location.protocol === 'file:') {
      showMapError('请通过 http://localhost 或部署域名访问。高德 Web JS API 需要网页来源与控制台白名单匹配。');
      return;
    }

    if (!window.AMapLoader || typeof window.AMapLoader.load !== 'function') {
      showMapError('高德地图加载器未就绪，请检查网络连接。');
      return;
    }

    window.AMapLoader.load({
      key: AMAP_KEY,
      version: AMAP_VERSION,
      plugins: []
    }).then(function (AMap) {
      initMapInstance(AMap, days, passes);
    }).catch(function (error) {
      showMapError(error && error.message ? error.message : '请检查 Key、安全密钥、域名白名单或网络连接。');
    });
  }

  window.RouteMap = {
    initMap: initMap
  };
})();
