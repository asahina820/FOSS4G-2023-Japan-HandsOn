const map = new maplibregl.Map({
  container: 'map',
  center: [136.218796, 36.064226], // 中心座標
  zoom: 12, // ズームレベル
  style: {
    // スタイル仕様のバージョン番号。8を指定する
    version: 8,
    // データソース
    sources: {
      // OpenStreetMap
      'osm-tile': {
        // ソースの種類。vector、raster、raster-dem、geojson、image、video のいずれか
        type: 'raster',
        // タイルソースのURL
        tiles: ['https://tile.openstreetmap.jp/styles/osm-bright-ja/{z}/{x}/{y}.png'],
        // タイルの解像度。単位はピクセル、デフォルトは512
        tileSize: 256,
        // データの帰属
        attribution: "地図の出典：<a href='https://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a>",
      },
      // 福井駅前の法務省登記所備付地図データ
      'moj-polygon': {
        type: 'geojson',
        data: './data/moj_fukui_station.geojson',
        attribution:
          "データの出典：<a href='https://www.geospatial.jp/ckan/organization/moj-mapdata' target='_blank'>「登記所備付データ福井市」（法務省）</a>をもとにG空間情報センターにて変換処理したデータを加工して作成",
      },
      // 福井市の観光地データ
      'spot-point': {
        type: 'geojson',
        // GeoJSONファイルのURL
        data: './data/spot.geojson',
        attribution:
          "データの出典：<a href='https://www.city.fukui.lg.jp/sisei/tokei/opendata/opengov.html' target='_blank'>福井市オープンデータパーク</a>",
      },
      // 福井県の河川データ
      'river-line': {
        type: 'geojson',
        data: './data/river.geojson',
        attribution: "データの出典：<a href='https://nlftp.mlit.go.jp/ksj/index.html' target='_blank'>国土交通省国土数値情報ダウンロードサイト</a>",
      },
    },
    // 表示するレイヤ
    layers: [
      // 背景地図としてOpenStreetMapのラスタタイルを追加
      {
        // 一意のレイヤID
        id: 'osm-layer',
        // レイヤの種類。background、fill、line、symbol、raster、circle、fill-extrusion、heatmap、hillshade のいずれか
        type: 'raster',
        // データソースの指定
        source: 'osm-tile',
      },
      // 福井駅前の法務省登記所備付地図のポリゴンデータを追加
      {
        id: 'polygon-layer',
        type: 'fill',
        source: 'moj-polygon',
        paint: {
          // 塗りつぶしの色
          'fill-color': '#fd7e00',
          // 塗りつぶしの透明度。0になるほど透明に、1になるほど不透明になる
          'fill-opacity': 0.3,
          // 枠の色
          'fill-outline-color': '#ff0000',
        },
      },
      // 福井市の観光地のポイントデータを追加
      {
        id: 'point-layer',
        type: 'circle',
        source: 'spot-point',
        paint: {
          // 丸の半径。単位はピクセル。
          'circle-radius': 10,
          // 丸の色
          'circle-color': '#3887be',
        },
      },
      // 福井県の河川のラインデータを追加
      {
        id: 'line-layer',
        type: 'line',
        source: 'river-line',
        paint: {
          // ラインの色
          'line-color': '#ade0ee',
          // ラインの幅
          'line-width': 5,
        },
        // 地物の条件式を指定
        // 九頭竜川（くずりゅうがわ）のみを表示
        // filter: ['==', 'W05_004', '九頭竜川'],
      },
    ],
  },
});

// ポイントクリック時にポップアップを表示する
map.on('click', 'point-layer', function (e) {
  var coordinates = e.features[0].geometry.coordinates.slice();
  var name = e.features[0].properties.施設名称;

  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }
  // ポップアップを表示する
  new maplibregl.Popup({
    offset: 10, // ポップアップの位置
    closeButton: false, // 閉じるボタンの表示
  })
    .setLngLat(coordinates)
    .setHTML(name)
    .addTo(map);
});

map.on('click', 'polygon-layer', function (e) {
  // note: 今回使うデータは小字名がすべてnullだったので住所に含めていない
  var address = e.features[0].properties.市町村名 + e.features[0].properties.大字名 + e.features[0].properties.丁目名 + e.features[0].properties.地番;
  new maplibregl.Popup({
    offset: 10,
    closeButton: false,
  })
    .setLngLat(e.lngLat)
    .setHTML(address)
    .addTo(map);
});
