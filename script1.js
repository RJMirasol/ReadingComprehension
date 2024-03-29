//get the select element
const selectEl = document.querySelector('#practice-select');

//json files directory
const jsonUrls = [
  './practice-json/practice1.json',
  './practice-json/practice2.json',
  './practice-json/practice3.json',
];

function displayReadingPassage(passage) {
  const readingPassageSection = document.getElementById('reading-passage');
  readingPassageSection.innerHTML =
    '<h2>Reading Passage</h2><p>' + passage + '</p>';
}

function displayQuestions(questions) {
  const questionsSection = document.getElementById('questions');
  questionsSection.innerHTML = '<h2>Questions</h2>';
  questions.forEach(function (question, index) {
    let questionHTML =
      '<div class="question"><p>' +
      (index + 1) +
      '. ' +
      question.question +
      '</p>';
    question.options.forEach(function (option, optionIndex) {
      questionHTML +=
        '<input type="radio" id="q' +
        (index + 1) +
        '_option' +
        (optionIndex + 1) +
        '" name="q' +
        (index + 1) +
        '">';
      questionHTML +=
        '<label for="q' +
        (index + 1) +
        '_option' +
        (optionIndex + 1) +
        '">' +
        option +
        '</label><br>';
    });
    questionHTML += '</div>';
    questionsSection.innerHTML += questionHTML;
  });
}

async function getData(e) {
  const selectInput = e.target.value;
  const b = jsonUrls[selectInput];

  try {
    const response = await fetch(b);
    const data = await response.json();

    displayReadingPassage(data.readingPassage);
    displayQuestions(data.questions);
  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}

function pleaseSelect() {
  const h2Element = document.querySelector('h2');
  h2Element.textContent = 'Please select practice test';

  const label = document.querySelector('label');
  label.style.display = 'none';
}

selectEl.addEventListener('change', getData);
document.addEventListener('DOMContentLoaded', pleaseSelect);
