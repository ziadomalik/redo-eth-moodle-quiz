const REVEALED_TEXT = 'Hide';
const REVEALED_COLOR = '#d32f2f';

const HIDDEN_TEXT = 'Reveal';
const HIDDEN_COLOR = '#1e88e5';
const HIDDEN_COLOR_HOVER = '#1565c0';

function injectRevealButton(questionElement, originalData) {
  const button = document.createElement('button');

  button.textContent = HIDDEN_TEXT;
  button.style.cssText = `
    margin: 10px 0;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 4px;
    background-color: ${HIDDEN_COLOR};
    transition: background-color 0.2s; 
  `
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = HIDDEN_COLOR_HOVER;
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = button.dataset.revealed === 'true' ? REVEALED_COLOR : HIDDEN_COLOR;
  });

  let isRevealed = false;

  button.addEventListener('click', () => {
    isRevealed = !isRevealed;
    button.dataset.revealed = isRevealed;

    if (isRevealed) {
      button.textContent = REVEALED_TEXT;
      button.style.backgroundColor = REVEALED_COLOR;

      originalData.hiddenElements.forEach(el => {
        el.style.display = "";
      });

      originalData.inputs.forEach(data => {
        if (data.type === 'checked') {
          data.element.checked = data.value;
        } else if (data.type === 'select') {
          data.element.value = data.value;
        } else {
          data.element.value = data.value;
        }
      });
    } else {
        button.textContent = HIDDEN_TEXT;
        button.style.backgroundColor = HIDDEN_COLOR;

        originalData.hiddenElements.forEach(el => {
          el.style.display = "none";
        });

        originalData.inputs.forEach(data => {
          if (data.type === 'checked') {
            data.element.checked = false;
          } else if (data.type === 'select') {
            data.element.value = "";
          } else {
            data.element.value = "";
          }
        });
    }
  })

  questionElement.querySelector('.info').appendChild(button);
}

function hideAnswers() {
  console.log("[Moodle Modifier] Script started");

  // Find all divs whos id is "question-<number>":
  const questions = document.querySelectorAll('div[id^="question-"]');

  console.log("[Moodle Modifier] Found questions:", questions.length);


  questions.forEach(question => {
    // Create a NEW originalData object for THIS question only
    const originalData = {
      inputs: [],
      hiddenElements: [],
    };

    // (1) Hide the outcome div:
    const outcome = question.querySelector('.outcome');

    if (outcome) { 
      originalData.hiddenElements.push(outcome);
      outcome.style.display = "none"; 
    }

    // (2) Hide the input feedback div:
    const inputFeedback = question.querySelectorAll('.stackinputfeedback');

    inputFeedback.forEach(feedback => {
      originalData.hiddenElements.push(feedback);
      feedback.style.display = "none";
    })

    // (3) Clear all the input fields:
    const inputs = question.querySelectorAll('input');

    inputs.forEach(input => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        originalData.inputs.push({ element: input, type: "checked", value: input.checked });
        input.checked = false;
      } else {
        originalData.inputs.push({ element: input, type: "value", value: input.value });
        input.value = "";
      }
    });

    // (3b) Clear all the select elements:
    const selects = question.querySelectorAll('select');

    selects.forEach(select => {
      originalData.inputs.push({ element: select, type: "select", value: select.value });
      select.value = "";
    });

    // (4) Clear the specific feedback inside tables and stuff:
    const specificFeedback = question.querySelectorAll('.mtfspecificfeedback, .specificfeedback');

    specificFeedback.forEach(specificFeedback => {
      originalData.hiddenElements.push(specificFeedback);
      specificFeedback.style.display = "none";
    });

    // (5) Remove all the icons:
    const icons = question.querySelectorAll('.mtfgreyingout, .scgreyingout, .mtfcorrectness, .icon, .fa-regular');

    icons.forEach(icon => {
      originalData.hiddenElements.push(icon);
      icon.style.display = "none";
    });

    // We have to do that check because some question divs are here for context and don't contain any inputs.
    if (question.querySelector('.info > h3').innerHTML.includes('Frage')) {
      injectRevealButton(question, originalData);
    }
  });
}

hideAnswers();