//get the elements
const selectEl = document.querySelector('#practice-select');
const timerDisplay = document.getElementById('timer');
const questionsSection = document.getElementById('questions');
const resultSection = document.getElementById('results');
const readingPassageSection = document.getElementById('reading-passage');
const nextTestBtn = document.getElementById('next-test-btn'); // New - Get the Next Test button
let currentQuestionIndex = 0;
let timerInterval;
let startTime;
let questions = [];
let userAnswers = {}; // Object to store user's answers

//json files directory
const jsonUrls = [
  './practice-json/practice1.json',
  './practice-json/practice2.json',
  './practice-json/practice3.json',
  './practice-json/practice4.json',
  './practice-json/practice5.json',
  './practice-json/practice6.json',
  './practice-json/practice7.json',
  './practice-json/practice8.json',
];

//Display passage
function displayReadingPassage(passage) {
  readingPassageSection.innerHTML =
    '<h2>Reading Passage</h2><p>' + passage + '</p>';
  readingPassageSection.style.display = 'block'; // Display the reading passage
}

//Display Questions
function displayQuestion() {
  questionsSection.innerHTML = '<h2>Question</h2>';
  const question = questions[currentQuestionIndex];
  let questionHTML =
    '<div class="question"><p>' +
    (currentQuestionIndex + 1) +
    '. ' +
    question.question +
    '</p>';
  question.options.forEach(function (option, optionIndex) {
    questionHTML +=
      '<input type="radio" id="q' +
      (currentQuestionIndex + 1) +
      '_option' +
      (optionIndex + 1) +
      '" name="q' +
      (currentQuestionIndex + 1) +
      '" value="' +
      optionIndex +
      '">';
    questionHTML +=
      '<label for="q' +
      (currentQuestionIndex + 1) +
      '_option' +
      (optionIndex + 1) +
      '">' +
      option +
      '</label><br>';
  });
  questionHTML += '<button id="submit-btn">Submit</button></div>';
  questionsSection.innerHTML += questionHTML;
}

//Add line breaks on the p element
function addLineBreaks(passage) {
  // Split the passage into paragraphs using newline characters (\n)
  const paragraphs = passage.split('\n');

  // Join the paragraphs with <br> tags to add line breaks
  const passageWithBreaks = paragraphs.join(
    '<br><br style="line-height: 5px;">'
  );

  return passageWithBreaks;
}

async function getData(e) {
  const selectInput = e.target.value;
  if (selectInput === 'default') {
    // Reset the page when the default option is selected
    clearInterval(timerInterval);
    timerDisplay.textContent = '10:00';
    readingPassageSection.innerHTML = '';
    questionsSection.innerHTML = '';
    readingPassageSection.style.display = 'none';
    questionsSection.style.display = 'none';
    resultSection.style.display = 'none';
    nextTestBtn.style.display = 'none';
    document.querySelector('.container').style.textAlign = 'center';
    return;
  }

  try {
    // Clear previous timer interval
    clearInterval(timerInterval);

    const response = await fetch(jsonUrls[selectInput]);
    const data = await response.json();

    // Shuffle questions
    questions = shuffleArray(data.questions);

    // Shuffle options for each question
    questions.forEach((question) => {
      question.options = shuffleArray(question.options);
    });

    // Adjust the layout to move content to the left
    document.querySelector('.container').style.textAlign = 'left';

    currentQuestionIndex = 0; // Reset current question index
    const passageWithBreaks = addLineBreaks(data.readingPassage);
    displayReadingPassage(passageWithBreaks);
    displayQuestion(); // Display the first question
    startTimer(); // Start the timer

    // Ensure questions section is displayed
    questionsSection.style.display = 'block';
  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}

//randomize questions
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startTimer() {
  // Capture the start time when the timer starts
  startTime = Date.now();

  // Rest of the function remains unchanged
  let timeLeft = 600; // 10 minutes in seconds
  timerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
    if (timeLeft === 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = "Time's up!";
      tallyAnswers();
    } else {
      timeLeft--;
    }
  }, 1000);
}

function handleSubmit() {
  const selectedOption = document.querySelector(
    'input[name="q' + (currentQuestionIndex + 1) + '"]:checked'
  );
  if (!selectedOption) {
    alert('Please select an option before submitting.');
    return;
  }

  // Store user's answer
  userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);

  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    clearInterval(timerInterval);
    timerDisplay.textContent = 'Test completed!';
    tallyAnswers(); // Tally answers when all questions are answered
  }
}

function tallyAnswers() {
  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedTimeInSeconds = Math.floor((endTime - startTime) / 1000);
  const elapsedMinutes = Math.floor(elapsedTimeInSeconds / 60);
  const elapsedSeconds = elapsedTimeInSeconds % 60;

  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let resultHTML = '';

  readingPassageSection.style.display = 'none';
  questionsSection.style.display = 'none';

  questions.forEach((question, index) => {
    const userAnswerIndex = userAnswers[index];
    const correctAnswer = question.answer;
    const userAnswer =
      userAnswerIndex !== undefined ? question.options[userAnswerIndex] : null;
    const isCorrect = userAnswer !== null && userAnswer === correctAnswer;

    // Determine color based on correctness
    const color = isCorrect ? '#009E60' : 'red';

    const icon = isCorrect ? '✓' : '✗';

    resultHTML += `<div class="result-top">Question ${index + 1}:</div>`;
    resultHTML += `<div class="result-top" style="color: ${color};">Your answer: ${
      userAnswer || 'No answer provided'
    } ${icon}</div>`;
    resultHTML += `<div class="result-top" style="color: green;">Correct answer: ${correctAnswer}</div>`;

    if (isCorrect) {
      correctAnswers++;
    } else {
      incorrectAnswers++;
    }
  });

  const totalQuestions = correctAnswers + incorrectAnswers;
  const scorePercentage = (correctAnswers / totalQuestions) * 100;

  resultHTML += `<div class="result-item">Total Questions: ${totalQuestions} </div>`;
  resultHTML += `<div class="result-item">Correct Answers: <span style="color: #0BDA51;">${correctAnswers}</span> </div>`;
  resultHTML += `<div class="result-item">Incorrect Answers: <span style="color: red;">${incorrectAnswers}</span> </div>`;
  resultHTML += `<div class="result-item">Score: ${scorePercentage.toFixed(
    2
  )}%</div>`;
  resultHTML += `<div class="result-item">Elapsed Time: ${elapsedMinutes} minutes ${elapsedSeconds} seconds</div>`;

  resultSection.innerHTML = resultHTML;
  resultSection.style.display = 'block';
  nextTestBtn.style.display = 'block'; // Display the Next Test button
}

// Function to select the next test
function selectNextTest() {
  const selectElement = document.getElementById('practice-select');
  const currentIndex = selectElement.selectedIndex;
  const nextIndex = currentIndex + 1;

  // Check if there is a next option
  if (nextIndex < selectElement.options.length) {
    selectElement.selectedIndex = nextIndex;
    selectElement.dispatchEvent(new Event('change')); // Trigger the change event
  } else {
    alert('No more tests available.'); // Alert if no more tests available
  }

  resultSection.style.display = 'none';
  nextTestBtn.style.display = 'none';
}

// Initially hide the reading passage, questions, and results
readingPassageSection.style.display = 'none';
questionsSection.style.display = 'none';
resultSection.style.display = 'none';
nextTestBtn.style.display = 'none';

// Add event listeners
selectEl.addEventListener('change', getData);
questionsSection.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'submit-btn') {
    handleSubmit();
  }
});
