const screen = document.getElementById('screen');
const buttons = Array.from(document.querySelectorAll('.btn'));
const clearButton = document.getElementById('clear');
const backButton = document.getElementById('back');
const equalsButton = document.getElementById('equals');
const replayButton = document.getElementById('replay');
const downloadButton = document.getElementById('download');
const clearHistoryButton = document.getElementById('clearHistory'); // New clear history button

let currentExpression = '';
let historyExpression = '';
let justEvaluated = false;

// Format number with commas
function formatNumberWithCommas(numStr) {
  if (!numStr) return '';
  const [intPart, decimalPart] = numStr.split('.');
  return (
    Number(intPart).toLocaleString() +
    (decimalPart ? '.' + decimalPart : '')
  );
}

// Update screen and apply formatting
function updateScreen(text) {
  screen.innerText = text;
}

// Evaluate expression safely
function evaluateExpression(expr) {
  try {
    const result = eval(expr);
    return result;
  } catch {
    return 'Error';
  }
}

// Button click handler
buttons.forEach(button => {
  const value = button.dataset.value;

  button.addEventListener('click', () => {
    if (value) {
      if (justEvaluated && !'+-*/'.includes(value)) {
        currentExpression = value;
        updateScreen(formatNumberWithCommas(value));
        justEvaluated = false;
        return;
      }

      if (justEvaluated && '+-*/'.includes(value)) {
        justEvaluated = false;
        currentExpression = screen.innerText.replace(/,/g, '') + value;
        updateScreen(screen.innerText + value);
        return;
      }

      const lastChar = currentExpression.slice(-1);

      // Prevent same operator from being entered consecutively
      if ('+-*/'.includes(lastChar) && '+-*/'.includes(value)) {
        if (lastChar === value) return; // Block repeating same operator
      }

      // Prevent entering multiple decimals for the same operand
      if (value === '.' && currentExpression.slice(-1) !== '.' && !/[+\-*/]/.test(currentExpression.slice(-1))) {
        const lastOperand = currentExpression.split(/[\+\-\*/]/).pop();
        if (lastOperand.includes('.')) return; // Prevent multiple decimals in the same number
      }

      currentExpression += value;
      if ('+-*/'.includes(value)) {
        updateScreen(screen.innerText + value);
      } else {
        const parts = currentExpression.split(/([+\-*/])/);
        const formatted = parts
          .map(part => (/[+\-*/]/.test(part) ? part : formatNumberWithCommas(part)))
          .join('');
        updateScreen(formatted);
      }
    }
  });
});

// Clear button (clear current input)
clearButton.addEventListener('click', () => {
  currentExpression = '';
  updateScreen('0');
});

// Backspace button
backButton.addEventListener('click', () => {
  currentExpression = currentExpression.slice(0, -1);
  if (!currentExpression) {
    updateScreen('0');
  } else {
    const parts = currentExpression.split(/([+\-*/])/);
    const formatted = parts
      .map(part => (/[+\-*/]/.test(part) ? part : formatNumberWithCommas(part)))
      .join('');
    updateScreen(formatted);
  }
});

// Equals button (show the result)
equalsButton.addEventListener('click', () => {
  const result = evaluateExpression(currentExpression);
  if (result !== 'Error') {
    historyExpression = `${currentExpression} = ${result}`;
    updateScreen(formatNumberWithCommas(result.toString()));
    currentExpression = result.toString();
    justEvaluated = true;
  } else {
    updateScreen('Error');
    currentExpression = '';
  }
});

// Replay button (show the full operation)
replayButton.addEventListener('click', () => {
  if (historyExpression) {
    updateScreen(historyExpression);
    justEvaluated = true;
  } else {
    updateScreen('No History');
  }
});

// Download result button
downloadButton.addEventListener('click', () => {
  if (historyExpression) {
    const blob = new Blob([historyExpression], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'calculator_result.txt';
    link.click();
  } else {
    alert('No calculation history to download.');
  }
});

// Clear history button (clear all history)
clearHistoryButton.addEventListener('click', () => {
  historyExpression = ''; // Clear history
  updateScreen('History Cleared');
  setTimeout(() => updateScreen('0'), 1000); // Clear message after 1 second
});

// Keyboard support
document.addEventListener('keydown', (event) => {
  const key = event.key;

  if ('0123456789+-*/.'.includes(key)) {
    const fakeButton = buttons.find(btn => btn.dataset.value === key);
    if (fakeButton) fakeButton.click();
  }

  if (key === 'Enter') equalsButton.click();
  if (key === 'Escape') clearButton.click();
  if (key === 'Backspace') backButton.click();
});
