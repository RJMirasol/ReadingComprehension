//get the elements
const selectEl = document.querySelector('#practice-select');
const timerDisplay = document.getElementById('timer');
const questionsSection = document.getElementById('questions');
const resultSection = document.getElementById('results');
const readingPassageSection = document.getElementById('reading-passage');
const nextTestBtn = document.getElementById('next-test-btn'); // New - Get the Next Test button
let currentQuestionIndex = 0;
let timerInterval;
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
];

function displayReadingPassage(passage) {
  readingPassageSection.innerHTML =
    '<h2>Reading Passage</h2><p>' + passage + '</p>';
  readingPassageSection.style.display = 'block'; // Display the reading passage
}

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

async function getData(e) {
  const selectInput = e.target.value;
  if (selectInput === 'default') {
    clearInterval(timerInterval); // Reset the timer
    timerDisplay.textContent = '10:00'; // Reset timer display
    readingPassageSection.innerHTML = ''; // Clear reading passage
    questionsSection.innerHTML = ''; // Clear the questions
    readingPassageSection.style.display = 'none'; // Hide the reading passage
    questionsSection.style.display = 'none'; // Hide the questions
    resultSection.style.display = 'none'; // Hide the results
    nextTestBtn.style.display = 'none'; // Hide the next button
    // If layout was adjusted previously, reset it to center
    document.querySelector('.container').style.textAlign = 'center';
    return; // Do nothing if default option is selected
  }

  try {
    // Clear previous timer interval
    clearInterval(timerInterval);

    const response = await fetch(jsonUrls[selectInput]);
    const data = await response.json();

    displayReadingPassage(data.readingPassage);
    questions = shuffleArray(data.questions);

    // Adjust the layout to move content to the left
    document.querySelector('.container').style.textAlign = 'left';

    currentQuestionIndex = 0; // Reset current question index
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
      tallyAnswers(); // Tally answers when timer finishes
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
  let correctAnswers = 0;
  let incorrectAnswers = 0;

  questions.forEach((question, index) => {
    const userAnswerIndex = userAnswers[index];
    const correctAnswer = question.answer;

    if (
      userAnswerIndex !== undefined &&
      question.options[userAnswerIndex] === correctAnswer
    ) {
      correctAnswers++;
    } else {
      incorrectAnswers++;
    }
  });

  const totalQuestions = correctAnswers + incorrectAnswers;
  const scorePercentage = (correctAnswers / totalQuestions) * 100;

  readingPassageSection.style.display = 'none';
  questionsSection.style.display = 'none';

  if (scorePercentage < 70) {
    resultSection.innerHTML = `
  <h2>Results</h2>
  <strong>Correct Answers:</strong> ${correctAnswers}</br>
  <strong>Incorrect Answers:</strong> ${incorrectAnswers}</br>
  <strong>Your score is ${scorePercentage}% - You Failed! Please try again</strong>
  `;
  } else {
    resultSection.innerHTML = `
  <h2>Results</h2>
  <strong>Correct Answers:</strong> ${correctAnswers}</br>
  <strong>Incorrect Answers:</strong> ${incorrectAnswers}</br><strong>Your score is ${scorePercentage}% - You Passed! Great Job</strong>
  `;
  }
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
