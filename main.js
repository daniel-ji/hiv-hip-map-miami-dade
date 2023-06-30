let csvDataObject = {};

const main = async () => {
	// get GeoJSON data
	const geoJSONData = await (await fetch('miami-dade-zips.geojson')).json();

	// get CSV data
	let csvData = (await (await fetch('HIP_zip_clean.csv')).text()).split('\r\n');
	// clean data
	csvData.shift();
	csvData = csvData.map(line => line.split(',')).filter(array => array.length > 1);
	csvData = csvData.map(array => [array[0], (array[array.length - 1])]);
	for (const keyValuePair of csvData) {
		csvDataObject[keyValuePair[0]] = parseFloat(keyValuePair[1]);
	}

	// get HIP location data (hardcoded)
	let HIPLocationsCoordinates = [["AIDS Healthcare Foundation Men's Wellness Clinic-South Beach", "25.7893881", "-80.1409799"], ["AHF- Jackson North", "25.9306385", "-80.2025155"], ["CAN Community Health (North Beach)", "25.941077181818184", "-80.27761418181818"], ["CAN Community Health (South Beach)", "25.773899215968495", "-80.13420298721049"], ["CareFirst Foundation Inc.", "25.8841012", "-80.2095468"], ["Community Health & Empowerment Network", "25.883731333333333", "-80.21281793939394"], ["Community Health of S. Florida, Inc.", "25.5654423", "-80.35775694105419"], ["Health Education Prevention & Promotion, Inc. ", "25.7508964", "-80.2283979"], ["Homestead Hospital", "25.4800698", "-80.4302564"], ["Hope for Miami", "25.7773878", "-80.26427137425898"], ["Jackson Memorial (Main)", "25.791670500000002", "-80.21260146013265"], ["Jackson Memorial (North)", "25.93023675", "-80.20325480474534"], ["Jackson Memorial (South)", "25.629649649999998", "-80.34587768318102"], ["Latinos Salud ", "25.74430115", "-80.3524967499066"], ["Positively U Inc.", "25.670801559846513", "-80.37249040844505"], ["Soul Sisters Leadership Collective", "25.7947508", "-80.2065118"], ["Survivors Pathway Corporation", "25.751048249999997", "-80.22430758474164"], ["UM Adolescent Medicine", "25.79090002020202", "-80.21093598989899"], ["UM - IDEA Exchange", "25.473437", "-80.486573"]];

	// create map and center
	const map = L.map('map').setView([25.6, -80.3], 10);

	// add tile layer
	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		maxZoom: 20
	}).addTo(map);

	// add GeoJSON layer, style it
	L.geoJSON(geoJSONData, {
		style: getStyle
	}).addTo(map);

	// add HIP location markers
	const triangleIcon = L.icon({
		iconUrl: 'triangle.png',
		iconSize: [24, 24], // size of the icon
		iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
	});
	for (const HIPLocation of HIPLocationsCoordinates) {
		L.marker([HIPLocation[1], HIPLocation[2]], { icon: triangleIcon }).addTo(map);
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