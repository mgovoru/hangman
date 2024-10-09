import { data } from "./data.js"

const bodyHtml = document.querySelector("body");
//функция создающая элемент
function createElement(tag, classTag, parentElement) {
	const element = document.createElement(tag);
	element.classList.add(classTag);
	parentElement.append(element);
	return element;
}
// вставка в html main container
const main = createElement("main", "main", bodyHtml);
const container = createElement("div", "main__container", main);

// вставка контента правой части
const content = createElement("div", "main__content", container);
const pngImage = createElement("div", "main__image", content);
const title = createElement("h1", "main__title", content);
title.innerHTML = "HANGMAN GAME";

//функция устанавливающая атрибуты
const createSVGElement = (tag, attrs) => {
	const svgNS = "http://www.w3.org/2000/svg";
	const element = document.createElementNS(svgNS, tag);
	Object.entries(attrs).forEach(([attr, value]) => {
		element.setAttribute(attr, value);
	});
	return element;
}

// вставка отдельных элементов, чтобы собрать svg
const svg = createSVGElement('svg', { width: "370", height: "581", viewBox: "0 0 370 581", fill: "none" });
pngImage.append(svg);

//основа
const rect = createSVGElement('rect', { x: "176.337", y: "34.6662", width: "39", height: "199.598", transform: "rotate(45 176.337 34.6662)", fill: "black", stroke: "#FFFEFE", "stroke-width": "3" });
svg.append(rect);
const rectOne = createSVGElement('rect', { x: "34.5", y: "1.5", width: "39", height: "578", rx: "3.5", fill: "black", stroke: "#FFFEFE", "stroke-width": "3" });
svg.append(rectOne);
const rectTwo = createSVGElement('rect', { x: "351.5", y: "34.5", width: "39", height: "350", rx: "3.5", transform: "rotate(90 351.5 34.5)", fill: "black", stroke: "#FFFEFE", "stroke-width": "3" });
svg.append(rectTwo);
const rectThree = createSVGElement('rect', { x: "298", y: "75", width: "10", height: "74", fill: "black" });
svg.append(rectThree);

// фигура
const head = createSVGElement('circle', { cx: "302.5", cy: "199.5", r: "48", fill: "white", stroke: "transperent", "stroke-width": "5" });
svg.append(head);
const bodyMan = createSVGElement('rect', { x: "302", y: "247", width: "5", height: "131", fill: "transperent" });
svg.append(bodyMan);
const handRight = createSVGElement('rect', { x: "302", y: "254.189", width: "5", height: "100", transform: "rotate(-39.6353 302 254.189)", fill: "transperent" });
svg.append(handRight);
const handLeft = createSVGElement('rect', { x: "302.796", y: "251", width: "5", height: "100", transform: "rotate(39.64 302.796 251)", fill: "transperent" });
svg.append(handLeft);
const legLeft = createSVGElement('rect', {
	x: "302", y: "381.19", width: "5", height: "100", transform: "rotate(-39.6353 302 381.19)", fill: "transperent"
});
svg.append(legLeft);
const legRight = createSVGElement('rect', { x: "302.796", y: "378", width: "5", height: "100", transform: "rotate(39.64 302.796 378)", fill: "transperent" });
svg.append(legRight);

//вставка контента левой части
const game = createElement("div", "main__game", container);
const gameButton = createElement("button", "main__button", game);
gameButton.innerHTML = "game";
const gameWord = createElement("div", "main__word", game);
const question = createElement("h2", "main__question", game);
question.innerHTML = "Hint:"
const score = createElement("p", "main__score", game);
score.innerHTML = "incorrect quesses: "
const keyword = createElement("div", "main__keyword", game);

//вставка букв алфавита
const strAlf = "abcdefghijklmnopqrstuvwxyz";
let currentLetter = "";
strAlf.split('').map(el => {
	let block = createElement("div", "letter", keyword);
	block.innerHTML = el;
	block.setAttribute('data-value', `${el}`);
});


let gameAnswer; let attempt; let arrayWord = []; let gretting; let lettersBlocks;
let pressKeys = [];
// задаем id списку вопросов
for (let i = 0; i < data.length; i++) {
	data[i].id = i;
}

let isProcess = false;
// игра начинается нажатием кнопки
gameButton.addEventListener('click', () => {
	newGame();
})
function checkID(id) {
	// Проверяем, существует ли уже такой ID в localStorage
	return localStorage.getItem(`questionId_${id}`) !== null;
}
//считаем записи в локал сторидж
function countKeys(prefix) {
	let count = 0;
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key.startsWith(prefix)) {
			count++;
		}
	}
	return count;
}

//функция реализующая функционал игры
function newGame() {
	changeColor('transperent');
	// обнуляются данные и счетчики
	attempt = 0;
	gameAnswer = "";
	arrayWord = [];
	pressKeys = [];
	score.innerHTML = "incorrect quesses: 0"

	//выбирается случайный вопрос и ответ
	let indexRandom = Math.floor(Math.random() * data.length);
	while (checkID(indexRandom)) { indexRandom = Math.floor(Math.random() * data.length); }
	if (countKeys('questionId_') < data.length) { localStorage.setItem(`questionId_${indexRandom}`, indexRandom.toString()); }

	question.innerHTML = `Hint:${data[indexRandom].question}`;
	gameAnswer = data[indexRandom].answer;

	// формируется визульно загаданное слово
	gameWord.style.cssText = `display: flex;
	gap:16px;`
	gameWord.innerHTML = "";
	gameAnswer.split('').map((el, index) => gameWord.innerHTML += `<div class = "letter-block letter-block_${index}"></div>`);
	let letters = document.querySelectorAll(".letter");
	lettersBlocks = document.querySelectorAll(".letter-block");
	let mainGame = document.querySelector(".main__game");
	Array.from(lettersBlocks).forEach(el => el.setAttribute('style', `width:${mainGame.offsetWidth / (2 * lettersBlocks.length)}px`));

	// на каждую букву виртуальной клавиатуры навашивается событие
	Array.from(letters).map((el) => el.addEventListener('click', (event) => {
		event.stopPropagation();
		event.preventDefault();
		currentLetter = el.getAttribute('data-value');
		if (!isProcess && pressKeys.indexOf(currentLetter) == -1) {
			checkWord(currentLetter, isProcess)
		}
		pressKeys.push(currentLetter);
	}));
	// на каждое нажатие клавиши навешивается событие
	document.addEventListener("keydown", (event) => {
		event.stopPropagation();
		event.preventDefault();
		currentLetter = event.key.toLowerCase();
		if (!isProcess && /^[a-z]$/i.test(event.key) && pressKeys.indexOf(currentLetter) == -1) {
			checkWord(currentLetter, isProcess)
		}
		pressKeys.push(currentLetter);
	})
}

//функция проверяет есть ли буква в слове
function guessLetter(currentLetter) {
	if (isProcess) return;
	isProcess = true;
	let indexsLetter = indexInWord(currentLetter, gameAnswer);
	if (indexsLetter.length === 0 && attempt <= 6) {
		attempt++;
		switch (attempt) {
			case 1: head.setAttribute('stroke', "#909090"); break;
			case 2: bodyMan.setAttribute('fill', "#909090"); break;
			case 3: handLeft.setAttribute('fill', "#909090"); break;
			case 4: handRight.setAttribute('fill', "#909090"); break;
			case 5: legRight.setAttribute('fill', "#909090"); break;
			case 6: legLeft.setAttribute('fill', "#909090"); break;
		}
		score.innerHTML = `incorrect quesses: ${attempt} `;
	}
	else if (indexsLetter.length > 0 && attempt < 6) {
		for (let i = 0; i < indexsLetter.length; i++) {
			lettersBlocks[indexsLetter[i]].style.border = "none";
			lettersBlocks[indexsLetter[i]].innerHTML = `${currentLetter}`;
			arrayWord[indexsLetter[i]] = currentLetter;
		}
	}
	setTimeout(() => {
		isProcess = false;
	}, 300);
	return arrayWord;
}

// функция проверяющая результат
function checkWord(currentLetter, isProcess) {
	arrayWord = guessLetter(currentLetter, isProcess);
	if (attempt === 6 && arrayWord.join('') !== gameAnswer.toLowerCase()) {
		gretting = `We're sorry, you lost!`;
		modalWindow();
	} else if (attempt <= 6 && arrayWord.join('') === gameAnswer.toLowerCase()) {
		gretting = `Congratulations, you've won!`;
		modalWindow();
	}
}



// функция возвращает массив индексов совпаданий
function indexInWord(currentLetter, gameAnswer) {
	let array = [];
	let lastResult;
	while (lastResult !== -1) {
		lastResult = gameAnswer.toLowerCase().indexOf(currentLetter, lastResult + 1)
		if (lastResult !== -1) {
			array.push(lastResult);
		}
	}
	return array;
}
function changeColor(color) {
	head.setAttribute('stroke', color);
	bodyMan.setAttribute('fill', color);
	handLeft.setAttribute('fill', color);
	handRight.setAttribute('fill', color);
	legRight.setAttribute('fill', color);
	legLeft.setAttribute('fill', color);
}

function modalWindow() {
	const modalWindow = createElement("div", "modal-window", main);
	const blackCover = createElement("div", "black-cover", modalWindow);
	const modal = createElement("div", "modal", modalWindow);
	const greetingMessage = `<div>${gretting}</div>
	<div> Hidden word ${gameAnswer.toLowerCase()}</div>`;

	if (countKeys('questionId_') < data.length) {
		modal.innerHTML = `${greetingMessage}
	<button class="button-modal">Play again</button>`;
		let gameNewButton = document.querySelector('.button-modal');
		gameNewButton.addEventListener('click', () => {
			modalWindow.replaceChildren();
			newGame();
		});
	}
	else {
		modal.innerHTML = `${greetingMessage}
	<div>You have answered all the questions</div>
	<button class="button-modal">Repeat game</button>`;
		let gameNewButton = document.querySelector('.button-modal');
		gameNewButton.addEventListener('click', () => {
			localStorage.clear();
			modalWindow.replaceChildren();
			newGame();
		});
	}
}
