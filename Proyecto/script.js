
let currentLanguage = 'es';
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let seconds = 0;
let userAnswers = [];
let xmlDoc;

// Elementos DOM
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const questionNumber = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const timerDisplay = document.getElementById('timer');
const progressDisplay = document.getElementById('progress');
const scoreDisplay = document.getElementById('score');
const resultsScore = document.getElementById('results-score');
const resultsTime = document.getElementById('results-time');
const resultsDetails = document.getElementById('results-details');
const restartBtn = document.getElementById('restart-btn');
const esBtn = document.getElementById('es-btn');
const enBtn = document.getElementById('en-btn');

// Textos en diferentes idiomas
const translations = {
    es: {
        mainTitle: 'Cuestionario Palos de la Frontera',
        subtitle: 'Pon a prueba tus conocimientos sobre Palos de la Frontera',
        welcomeTitle: 'Bienvenido al Cuestionario de Palos de la Frontera',
        instructions: 'Este cuestionario consta de preguntas sobre la historia y cultura de Palos de la Frontera. Selecciona la respuesta correcta para cada pregunta.',
        startBtn: 'Comenzar',
        nextBtn: 'Siguiente',
        submitBtn: 'Finalizar',
        timerLabel: 'Tiempo:',
        progressLabel: 'Pregunta:',
        scoreLabel: 'Puntuación:',
        resultsTitle: 'Resultados del Cuestionario',
        resultsScore: 'Tu puntuación:',
        resultsTime: 'Tiempo empleado:',
        restartBtn: 'Reiniciar Cuestionario',
        footerText: 'Proyecto Palos de la Frontera - Cuestionario Interactivo',
        questionPrefix: 'Pregunta'
    },
    en: {
        mainTitle: 'Palos de la Frontera Quiz',
        subtitle: 'Test your knowledge about Palos de la Frontera',
        welcomeTitle: 'Welcome to the Palos de la Frontera Quiz',
        instructions: 'This quiz consists of questions about the history and culture of Palos de la Frontera. Select the correct answer for each question.',
        startBtn: 'Start',
        nextBtn: 'Next',
        submitBtn: 'Finish',
        timerLabel: 'Time:',
        progressLabel: 'Question:',
        scoreLabel: 'Score:',
        resultsTitle: 'Quiz Results',
        resultsScore: 'Your score:',
        resultsTime: 'Time spent:',
        restartBtn: 'Restart Quiz',
        footerText: 'Palos de la Frontera Project - Interactive Quiz',
        questionPrefix: 'Question'
    }
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', init);

function init() {
  document.getElementById('start-btn').addEventListener('click', startQuiz);
  nextBtn.addEventListener('click', onNextClick);
  submitBtn.addEventListener('click', submitQuiz);
  restartBtn.addEventListener('click', restartQuiz);
  esBtn.addEventListener('click', () => changeLanguage('es'));
  enBtn.addEventListener('click', () => changeLanguage('en'));
  updateUILanguage();
}

function changeLanguage(lang) {
  if (currentLanguage === lang) return;
  currentLanguage = lang;

  esBtn.classList.toggle('active', lang === 'es');
  enBtn.classList.toggle('active', lang === 'en');

  updateUILanguage();

  if (quizScreen.style.display === 'block') {
    const currentIndex = currentQuestionIndex;
    const currentAnswers = [...userAnswers];
    loadQuestions(() => {
      userAnswers = currentAnswers;
      showQuestion(currentIndex);
    });
  }
}

function updateUILanguage() {
  const texts = translations[currentLanguage];

  document.getElementById('main-title').textContent = texts.mainTitle;
  document.getElementById('subtitle').textContent = texts.subtitle;
  document.getElementById('welcome-title').textContent = texts.welcomeTitle;
  document.getElementById('instructions').textContent = texts.instructions;
  document.getElementById('start-btn').textContent = texts.startBtn;
  document.getElementById('restart-btn').textContent = texts.restartBtn;
  nextBtn.textContent = texts.nextBtn;
  submitBtn.textContent = texts.submitBtn;
  document.getElementById('timer-label').textContent = texts.timerLabel;
  document.getElementById('progress-label').textContent = texts.progressLabel;
  document.getElementById('score-label').textContent = texts.scoreLabel;
  document.getElementById('results-title').textContent = texts.resultsTitle;
  document.getElementById('footer-text').textContent = texts.footerText;

  updateDynamicTexts();
}

function updateDynamicTexts() {
  const texts = translations[currentLanguage];

  if (questions.length > 0) {
    questionNumber.textContent = `${texts.questionPrefix} ${currentQuestionIndex + 1}`;
    progressDisplay.textContent = `${currentQuestionIndex + 1}/${questions.length}`;
  }

  resultsScore.textContent = `${texts.resultsScore} ${score}/${questions.length}`;
  resultsTime.textContent = `${texts.resultsTime} ${formatTime(seconds)}`;
}

function startQuiz() {
  startScreen.style.display = 'none';
  quizScreen.style.display = 'block';
  score = 0;
  startTimer();
  loadQuestions(() => {
    updateScoreDisplay();
    showQuestion(0);
  });
}

function loadQuestions(callback) {
  const xhr = new XMLHttpRequest();
  const xmlFile = currentLanguage === 'es' ? 'preguntas_es.xml' : 'preguntas_en.xml';

  xhr.onload = function () {
    if (this.status === 200) {
      xmlDoc = this.responseXML;
      parseQuestions();
      if (typeof callback === 'function') {
        callback();
      } else {
        showQuestion(0);
      }
    }
  };

  xhr.open('GET', xmlFile);
  xhr.send();
}

function parseQuestions() {
  questions = [];
  const questionElements = xmlDoc.getElementsByTagName('question');

  for (let i = 0; i < questionElements.length; i++) {
    const questionElement = questionElements[i];
    const id = questionElement.getAttribute('id');
    const wording = questionElement.getElementsByTagName('wording')[0].textContent;
    const choiceElements = questionElement.getElementsByTagName('choice');
    const choices = [];
    let correctIndex = -1;

    for (let j = 0; j < choiceElements.length; j++) {
      const choiceElement = choiceElements[j];
      const text = choiceElement.textContent;
      const isCorrect = choiceElement.getAttribute('correct') === 'yes';

      choices.push({ text, isCorrect });
      if (isCorrect) correctIndex = j;
    }

    const shuffledChoices = shuffleArray(choices);
    const newCorrectIndex = shuffledChoices.findIndex(choice => choice.isCorrect);

    questions.push({
      id,
      wording,
      choices: shuffledChoices.map(choice => choice.text),
      correctIndex: newCorrectIndex
    });
  }

  userAnswers = new Array(questions.length).fill(-1);
}

function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showQuestion(index) {
  if (index < 0 || index >= questions.length) return;

  currentQuestionIndex = index;
  const question = questions[index];
  const texts = translations[currentLanguage];

  questionNumber.textContent = `${texts.questionPrefix} ${index + 1}`;
  questionText.textContent = question.wording;
  progressDisplay.textContent = `${index + 1}/${questions.length}`;

  choicesContainer.innerHTML = '';
  question.choices.forEach((choice, i) => {
    const choiceElement = document.createElement('div');
    choiceElement.className = 'choice';
    choiceElement.textContent = choice;

    if (userAnswers[index] === i) {
      choiceElement.classList.add('selected');
    }

    choiceElement.addEventListener('click', () => selectChoice(i));
    choicesContainer.appendChild(choiceElement);
  });

  nextBtn.style.display = (index === questions.length - 1) ? 'none' : 'inline-block';
  submitBtn.style.display = (index === questions.length - 1) ? 'inline-block' : 'none';
}

function selectChoice(choiceIndex) {
  userAnswers[currentQuestionIndex] = choiceIndex;

  const choices = choicesContainer.querySelectorAll('.choice');
  choices.forEach((choice, i) => {
    if (i === choiceIndex) {
      choice.classList.add('selected');
    } else {
      choice.classList.remove('selected');
    }
  });
}

function onNextClick() {
  if (userAnswers[currentQuestionIndex] === -1) {
    alert('Por favor selecciona una respuesta antes de continuar.');
    return;
  }

  if (userAnswers[currentQuestionIndex] === questions[currentQuestionIndex].correctIndex) {
    score++;
  }

  updateScoreDisplay();

  if (currentQuestionIndex < questions.length - 1) {
    showQuestion(currentQuestionIndex + 1);
  }
}

function updateScoreDisplay() {
  scoreDisplay.textContent = `${score}/${questions.length}`;
}

function startTimer() {
  seconds = 0;
  timerDisplay.textContent = formatTime(seconds);

  timer = setInterval(() => {
    seconds++;
    timerDisplay.textContent = formatTime(seconds);
  }, 1000);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const secondsRest = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secondsRest.toString().padStart(2, '0')}`;
}

function submitQuiz() {
  if (userAnswers[currentQuestionIndex] === -1) {
    alert('Por favor selecciona una respuesta antes de finalizar.');
    return;
  }

  if (userAnswers[currentQuestionIndex] === questions[currentQuestionIndex].correctIndex) {
    score++;
  }

  updateScoreDisplay();
  clearInterval(timer);

  quizScreen.style.display = 'none';
  resultsScreen.style.display = 'block';

  const texts = translations[currentLanguage];
  resultsScore.textContent = `${texts.resultsScore} ${score}/${questions.length}`;
  resultsTime.textContent = `${texts.resultsTime} ${formatTime(seconds)}`;

  generateResultsDetails();
}

function generateResultsDetails() {
  resultsDetails.innerHTML = '';

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const userAnswer = userAnswers[i];
    const isCorrect = userAnswer === question.correctIndex;

    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${isCorrect ? 'correct' : 'incorrect'}`;

    const questionText = document.createElement('p');
    questionText.textContent = `${i + 1}. ${question.wording}`;
    resultItem.appendChild(questionText);

    const userAnswerText = document.createElement('p');
    userAnswerText.innerHTML = userAnswer === -1
      ? '<strong>Sin respuesta</strong>'
      : `Tu respuesta: <strong>${question.choices[userAnswer]}</strong>`;
    resultItem.appendChild(userAnswerText);

    if (!isCorrect && userAnswer !== -1) {
      const correctAnswerText = document.createElement('p');
      correctAnswerText.innerHTML = `Respuesta correcta: <strong>${question.choices[question.correctIndex]}</strong>`;
      resultItem.appendChild(correctAnswerText);
    }

    resultsDetails.appendChild(resultItem);
  }
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];

  resultsScreen.style.display = 'none';
  startScreen.style.display = 'block';

  updateUILanguage();
}
