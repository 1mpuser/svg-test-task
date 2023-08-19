const chartData = generateChartData(); // Первая прерисовка данных

const svg = document.getElementById('chart');

const centerX = svg.width.baseVal.value / 2;
const centerY = svg.height.baseVal.value / 2;

const cutoutRadius = 30; // Радиус выреза в центре

chartData.sort((a, b) => b.value - a.value); // Сортируем, чтобы были значения по кругу шли

drawChart(chartData);

drawCircleWithoutClip(svg, centerX, centerY, cutoutRadius); // Рисуем круг выреза последним

svg.addEventListener('click', () => {
	const newData = generateChartData();
	newData.sort((a, b) => b.value - a.value);
	drawChart(newData);
	drawCircleWithoutClip(svg, centerX, centerY, cutoutRadius);
});

function drawCircleWithoutClip(svg, centerX, centerY, cutoutRadius) {
	// рисуем круг по вырезу
	const circle = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'circle'
	);
	circle.setAttribute('cx', centerX);
	circle.setAttribute('cy', centerY);
	circle.setAttribute('r', cutoutRadius);
	circle.setAttribute('fill', 'rgb(28, 28, 28)'); // Устанавливаем цвет фона
	svg.appendChild(circle);
}

function getRandomColorGenerator() {
	// генератор цветов в замыкании
	const colorArr = [
		'rgb(232, 77, 77)', //red
		'rgb(240, 142, 65)', //orange
		'rgb(100, 200, 140)', //lightgreeen
		'rgb(144, 71, 220)', //purple
		'rgb(41, 117, 234)', //darkblue
		'rgb(76, 197, 240)', //lightblue
		'rgb(30, 139, 73)', // darkgreen
		'rgb(240, 194, 67)', //yellow
	];

	let colorArrCopy = [...colorArr];

	return () => {
		if (!colorArrCopy.length) colorArrCopy = [...colorArr];
		const randomIndex = Math.floor(Math.random() * colorArrCopy.length);
		const item = colorArrCopy[randomIndex];
		colorArrCopy.splice(randomIndex, 1);
		return item;
	};
}

function generateUniqueRandomValues(count) {
	const values = new Set();
	while (values.size < count) {
		values.add(Math.random());
	}
	return Array.from(values);
}

function generateChartData() {
	const numSectors = Math.floor(Math.random() * 8) + 1; // генерируем случайные значения
	const uniqueValues = generateUniqueRandomValues(numSectors); // генерируем значения внутри сектора чтобы определить его долю
	const totalValue = uniqueValues.reduce((sum, val) => sum + val, 0);

	const data = uniqueValues.map((value) => ({
		value: value / totalValue, // Смотрим на процентное соотношение
		radius: Math.random() * 100 + 50,
	}));

	return data;
}

function drawChart(data) {
	svg.innerHTML = '';

	calculateAngles(data);

	const colorGenerator = getRandomColorGenerator();

	if (data.length > 1) {
		data.forEach((sector) => {
			const radius = sector.radius;

			// Получаем координаты секторов

			const x1 =
				centerX + Math.cos((sector.startAngle - 90) * (Math.PI / 180)) * radius;
			const y1 =
				centerY + Math.sin((sector.startAngle - 90) * (Math.PI / 180)) * radius;

			const x2 =
				centerX + Math.cos((sector.endAngle - 90) * (Math.PI / 180)) * radius;
			const y2 =
				centerY + Math.sin((sector.endAngle - 90) * (Math.PI / 180)) * radius;

			const largeArcFlag = sector.value > 0.5 ? 1 : 0;

			// Смотрим нужен ли нам флаг большой дуги

			const pathData = `
                    M ${centerX},${centerY}
                    L ${x1},${y1}
                    A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}
                    Z
            `;
			// М -- начальная точка пути
			// L -- линейная траектория от точки до точки
			// A -- указывает дугу
			// первые 2 параметра - радиус дуги по горизонтали и вертикали.
			// 0 это параметр большой дуги
			// координаты заканчивающегося сектора
			// Z -- Указывает что путь должен быть замкнут, соединяя конечную точку с начальной.

			const path = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'path'
			);

			path.setAttribute('d', pathData);
			path.setAttribute('fill', colorGenerator());

			svg.appendChild(path);
		});
	}
	if (data.length === 1) {
		const item = data[0];

		// Если элемент один, то мы рисуем круг

		const circle = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'circle'
		);
		circle.setAttribute('cx', centerX);
		circle.setAttribute('cy', centerY);
		circle.setAttribute('r', item.radius);
		circle.setAttribute('fill', getRandomColorGenerator()());
		svg.appendChild(circle);
	}
}

function calculateAngles(data) {
	// Здесь мы считаем углы по которым мы будем рисовать сектора
	const totalValue = data.reduce((sum, sector) => sum + sector.value, 0);
	let startAngle = 0;

	data.forEach((sector) => {
		// конечный угол мы смотрим по доле значения
		const endAngle = startAngle + (sector.value / totalValue) * 360;

		sector.startAngle = startAngle;
		sector.endAngle = endAngle;

		startAngle = endAngle;
	});
}
