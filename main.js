let csvDataObject = {};
let providers = [];

const main = async () => {
	// get GeoJSON data
	const geoJSONData = await (await fetch('miami-dade-zips.geojson')).json();

	// get CSV data
	let csvData = (await (await fetch('HIP_zip_clean.csv')).text()).split('\r\n');
	// clean data
	providers = csvData.shift().split(',').slice(1, -1);
	csvData = csvData.map(line => line.split(',')).filter(array => array.length > 1);
	for (const keyValuePair of csvData) {
		csvDataObject[keyValuePair[0]] = keyValuePair.slice(1).map(value => parseInt(value));
	}

	// get HIP location data (hardcoded)
	let HIPLocations = (await (await fetch('EHE.tsv')).text()).split('\r\n');
	// clean data
	HIPLocations.shift();
	HIPLocations = HIPLocations.map(line => line.split('\t')).filter(array => array.length > 1);
	HIPLocations.forEach(array => {
		array.forEach(entry => {
			entry = entry.replace(/"/g, '');
			entry.trim();
		})
	})
	
	// create map and center
	const map = L.map('map').setView([25.6, -80.3], 10);

	// add tile layer
	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		maxZoom: 20
	}).addTo(map);

	// add GeoJSON layer, style it
	L.geoJSON(geoJSONData, {
		style: getStyle,
		onEachFeature: (feature, layer) => {
			layer.bindPopup(getProviders(feature.properties.ZIP), {closeOnClick: false, autoClose: false})
			layer.bindTooltip('<strong>' + feature.properties.ZIP + '</strong>', {permanent: true, direction: 'center', className: 'map-zipcode-label'}).openTooltip();
		}
	}).addTo(map);

	// add HIP location markers
	const triangleIcon = L.icon({
		iconUrl: 'triangle.png',
		iconSize: [24, 24], // size of the icon
		iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
	});
	for (const HIPLocation of HIPLocations) {
		L.marker([HIPLocation[2], HIPLocation[3]], { icon: triangleIcon, zIndexOffset: 10000 }).addTo(map).
			bindPopup("<strong>" + HIPLocation[0] + "</strong><br>" + HIPLocation[1], {closeOnClick: false, autoClose: false});
	}

	// add scale
	L.control.scale({
		maxWidth: Math.max(window.innerWidth * 0.2, 200),
	}).addTo(map);

	// add legend
	const legend = L.control({ position: 'bottomright' });
	legend.onAdd = map => {
		const legendDiv = L.DomUtil.create('div', 'map-legend');
		const labels = [];
		const grades = [0, 1, 2, 3, 4, 5, 6];

		for (let i = 0; i < grades.length; i++) {
			labels.push(
				'<div class="map-legend-entry"><div class="map-legend-color" style="background-color:' + getColor(grades[i]) + '"></div>' +
				'<p class="map-legend-label">' + (grades[i] + (i === grades.length - 1 ? '+' : '') + '</p></div>')
			)
		}

		legendDiv.innerHTML = '<div id="map-legend-title">HIP Location Count</div>' + labels.join('');
		return legendDiv;
	}
	legend.addTo(map);

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
		color: '#939496',
		dashArray: '3',
		fillOpacity: 0.8
	};
}

const getCount = (zip) => {
	if (csvDataObject[zip] === undefined) {
		return 0;
	}

	return csvDataObject[zip][csvDataObject[zip].length - 1];
}

const getProviders = (zip) => {
	if (csvDataObject[zip] === undefined) {
		return "No Providers";
	}

	let providersText = "<strong>Providers: </strong><br>";

	for (let i = 0; i < providers.length; i++) {
		if (csvDataObject[zip][i] > 0) {
			providersText += providers[i] + "<br>";
		}
	}

	return providersText;
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