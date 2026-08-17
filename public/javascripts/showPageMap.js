mapboxgl.accessToken = mapToken;//ejsが使えるわけではないのでejsの方で展開してからその値を入れる
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11',//streets-v11の部分は地図の色味
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

//マーカー
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(//popupの表示
        new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h4>${campground.title}</h4><p>${campground.location}</p>`)

    )
    .addTo(map);