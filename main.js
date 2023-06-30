let csvDataObject = {};

const main = async () => {
	const geoJSONData = await (await fetch('miami-dade-zips.geojson')).json();
	let csvData = (await (await fetch('HIP_zip_clean.csv')).text()).split('\r\n');
	// clean data
	csvData.shift();
	csvData = csvData.map(line => line.split(',')).filter(array => array.length > 1);
	csvData = csvData.map(array => [array[0], (array[array.length - 1])]);
	for (const keyValuePair of csvData) {
		csvDataObject[keyValuePair[0]] = parseFloat(keyValuePair[1]);
	}
	console.log(csvDataObject);

	let HIPLocations = (await (await fetch('EHE.tsv')).text()).split('\n');
	// clean data
	HIPLocations.shift();
	HIPLocations = HIPLocations.map(line => line.split('\t').slice(0, 2)).filter(array => array.length > 1);
	HIPLocations.forEach(array => {
		array[0] = array[0].replace(/"/g, '');
		array[1] = array[1].replace(/"/g, '');
	})

	const map = L.map('map').setView([25.8, -80.3], 10);

	// L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	// 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	// 	maxZoom: 20
	// }).addTo(map);

	L.geoJSON(geoJSONData, {
		style: getStyle
	}).addTo(map);

	const triangleIcon = L.icon({
		iconUrl: 'triangle.png',

		iconSize: [24, 24], // size of the icon
		iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
	});

	for (const HIPLocation of HIPLocations) {
		const result = await (await fetch(location.protocol + '//nominatim.openstreetmap.org/search?format=json&q=' + HIPLocation[1])).json();
		L.marker([result[0].lat, result[0].lon], { icon: triangleIcon }).addTo(map);
	}

	// const myTextLabel = L.marker([25.8, -80.3], {
	// 	icon: L.divIcon({
	// 		className: 'text-labels',   // Set class for CSS styling
	// 		html: 'A Text Label'
	// 	}),
	// 	zIndexOffset: 1000     // Make appear above other map features
	// }).addTo(map);

}

const getStyle = (feature) => {
	const count = getCount(feature.properties.ZIP)
	return {
		fillColor: getColor(count),
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7
	};
}

const getCount = (zip) => {
	return csvDataObject[zip] || 0;
}

const getColor = (value) => {
	return value >= 6 ? '#084594' :
		value >= 5 ? '#2171b5' :
			value >= 4 ? '#4292c6' :
				value >= 3 ? '#6baed6' :
					value >= 2 ? '#9ecae1' :
						value >= 1 ? '#c6dbef' :
							'#ffffff';
}

main();