class MultiplicationTable {
	constructor(selectorTable, num1, num2, result, spanScore, buttonRefresh, test, config) {
		this.table = document.querySelector(selectorTable);
		this.num1 = document.querySelector(num1);
		this.num2 = document.querySelector(num2);
		this.buttonRefresh = document.querySelectorAll(buttonRefresh);
		this.result = document.querySelector(result);
		this.buttonTest = document.querySelector(test);
		this.spanScore = document.querySelectorAll(spanScore);
		this.score = 0;
		this.historyOperations = [];
		this.generateOperation = this.generateOperation.bind(this);
		this.test = this.test.bind(this);
		this.prepare(config);
		this.generateOperation(config);
		this.events(config);
	}
	events(config) {
		this.buttonRefresh.forEach(button => {
			button.addEventListener('click', () => {
				const modal = document.querySelector('.modal');
				if(modal.classList.contains('show')) {
					modal.classList.remove('show');
				}
				const tds = this.table.querySelectorAll('td:not(.heading)');
				tds.forEach(td => {
					td.textContent = '';
				});
				this.historyOperations = [];
				this.generateOperation(config);
				this.score = 0;
				this.printScore();
			});
		})
		this.buttonTest.addEventListener('click', () => {
			this.test(config);
		});
		this.result.addEventListener('keydown', e => {
			if(e.which === 13) {
				this.test(config);
			}
		});
	}
	showModal(title) {
		const modal = document.querySelector('.modal');
		const modalTitle = modal.querySelector('h1');
		modalTitle.textContent = title;
		modal.classList.add('show');
	}
	test(config) {
		const num1 = Number(this.num1.textContent);
		const num2 = Number(this.num2.textContent);
		let result = Number(this.result.value);
		if(this.historyOperations.length < config.cels * config.cels) {
			if(num1 * num2 === result) {
				const tdOutput = this.table.querySelector('.td-result');
				tdOutput.textContent = result;
				// Si es correcta la respuesta
				this.historyOperations.push(`${num1}x${num2}`);
				this.generateOperation(config);

				// Resetear el campo
				this.result.value = '';

				// Aumentar el score
				this.score += 5;
				this.printScore();
			}else {
				// Resetear el campo
				this.result.value = '';

				// Decrementar el score
				this.score -= 5;
				this.printScore();
				if(this.score < 0) {
					this.showModal('Perdiste :C');
				}
			}
		}
		if(this.historyOperations.length === (config.cels * config.cels)) {
			if(num1 * num2 === result) {
				this.showModal('Ganaste!');
				console.log(localStorage.getItem('mult-score'))
				if(localStorage.getItem('mult-score')) {
					const scores = JSON.parse(localStorage.getItem('mult-score'));
					if(this.score > scores[config.level]) {
						// Mayor puntaje
						scores[config.level] = this.score;
						localStorage.setItem('mult-score', JSON.stringify(scores));
					}
				}else {
					const scores = {
						easy: 0,
						medium: 0,
						hard: 0
					}
					scores[config.level] = this.score;
					console.log(scores)
					console.log(scores[config.level]);
					localStorage.setItem('mult-score', JSON.stringify(scores));
				}
			}
		}
	}
	printScore() {
		this.spanScore.forEach(score => {
			score.textContent = this.score;
		});
	}
	prepare(config) {
		this.insertRowsAndCels(config.rows, config.cels);
	}
	generateOperation(config) {
		// Reset
		const tds = this.table.querySelectorAll('td');
		tds.forEach(td => {
			if(td.style.backgroundColor === 'lightgreen') {
				td.style.backgroundColor = '';
				if(td.classList.contains('td-result')) {
					td.classList.remove('td-result');
				}
			}
		});
		if(this.historyOperations.length < config.cels * config.cels) {
			let num1 = Math.ceil(Math.random() * config.cels);
			let num2 = Math.ceil(Math.random() * config.cels);
			while(this.historyOperations.includes(`${num1}x${num2}`)) {
				num1 = Math.ceil(Math.random() * config.cels);
				num2 = Math.ceil(Math.random() * config.cels);
			}
			const cel = this.table.querySelector(`tr:nth-child(${num1 + 1}) td:nth-child(${num2 + 1})`);
			cel.style.backgroundColor = 'lightgreen';
			cel.classList.add('td-result');
			this.num1.textContent = num1;
			this.num2.textContent = num2;
		}

		// Resetear el campo
		this.result.value = '';
	}
	insertRowsAndCels(rows, cels) {
		const frag = document.createDocumentFragment();
		// Agregar filas
		for(let Irows = 0; Irows <= rows; Irows++) {
			const tr = document.createElement('tr');
			// Agregar celdas
			for(let Icels = 0; Icels <= cels; Icels++) {
				const td = document.createElement('td');

				// Insertar X en la primera columna de la primera fila
				if(Irows === 0 && Icels === 0) {
					td.innerHTML = '&times;';
					td.classList.add('heading');
				}

				// Insertar numeros en la primera fila
				if(Irows === 0 && Icels > 0) {
					td.textContent = Icels;
					td.classList.add('heading');
				}

				// Insertar numero en la primera celda de cada columna
				if(Irows > 0 && Icels === 0) {
					td.textContent = Irows;
					td.classList.add('heading');
				}

				tr.appendChild(td);
			}
			frag.appendChild(tr);
		}
		this.table.appendChild(frag);
	}
}

const selectLevels = document.querySelector('#select-level .level-navigation');

const datosLS = localStorage.getItem('mult-score');

if(datosLS) {
	const datos = JSON.parse(datosLS);
	selectLevels.querySelectorAll('.link').forEach(link => {
		let maxScore = link.querySelector('.max-score');
		switch(maxScore.dataset.score) {
			case 'easy':
				maxScore.textContent = datos.easy;
				break;
			case 'medium':
				maxScore.textContent = datos.medium;
				break;
			case 'hard':
				maxScore.textContent = datos.hard;
				break;
		}
	});
}else {
	selectLevels.querySelectorAll('.link').forEach(link => {
		let maxScore = link.querySelector('.max-score');
		maxScore.textContent = 0;
	});
}

selectLevels.addEventListener('click', e => {
	let colsRows,
		level;
	if(e.target.classList.contains('link')) {
		e.preventDefault();
		const hash = e.target.getAttribute('href');
		switch(hash) {
			case '#easy':
				colsRows = 4;
				level = 'easy';
				break;
			case '#medium':
				colsRows = 6;
				level = 'medium';
				break;
			case '#hard':
				colsRows = 8;
				level = 'hard';
				break;
		}
		selectLevels.parentElement.classList.add('hidden');
		// Las propiedades Rows y Cels deven tener el mismo valor!
		const table = new MultiplicationTable(
			'#mult-table tbody',
			'#number-1',
			'#number-2',
			'#result',
			'.score-count',
			'.again',
			'#test',
			{
				rows: colsRows,
				cels: colsRows,
				level
			}
		);
	}
});