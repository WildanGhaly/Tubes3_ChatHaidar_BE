function infixToPostfix(infix) {
    const postfix = [];
    const operatorStack = [];
  
    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '&': 0,
        '|': -1,
        '/': 2,
        '%': 2,
        '^': 3,
    };
  
    infix.forEach((token) => {
        if (isNumber(token)) {
            postfix.push(token);
        } else if (isOperator(token)) {
            while (
                operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1] !== '(' &&
                precedence[token] <= precedence[operatorStack[operatorStack.length - 1]]
            ) {
                postfix.push(operatorStack.pop());
            }
    
            operatorStack.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack[operatorStack.length - 1] !== '(') {
            postfix.push(operatorStack.pop());
            }
    
            operatorStack.pop(); // Pop the '('
        }
    });
  
    while (operatorStack.length > 0) {
        postfix.push(operatorStack.pop());
    }
  
    return postfix;
}

function isNumber(char) {
    return !isNaN(parseFloat(char));
}
  
function isOperator(char) {
    return ['+', '-', '*', '/','%','^','|','&'].includes(char);
}
  
function evaluatePostfix(postfix) {
    const stack = [];
  
    postfix.forEach((token) => {
        if (isNumber(token)) {
            stack.push(parseFloat(token));
        } else if (isOperator(token)) {
            const b = stack.pop();
            const a = stack.pop();
            const result = applyOperator(a, token, b);
            stack.push(result);
        } else {
            throw new Error(`Unknown token: ${token}`);
        }
    });
  
    if (stack.length !== 1) {
        throw new Error('Invalid postfix expression');
    }
  
    return stack[0];
}

function applyOperator(a, operator, b) {
    switch (operator) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            return a / b;
        case '%':
            return a % b;
        case '&':
            return a & b;
        case '|':
            return a | b;
        case '^':
            return Math.pow(a,b);
        default:
            throw new Error(`Unknown operator: ${operator}`);
    }
}

function evaluateExpression(tokens) {
    const postfix = infixToPostfix(tokens);
    return evaluatePostfix(postfix);
}

function calculateEquation(equationString){
    console.log(equationString);
    const equation = equationString
        .replace(/\s/g, '') 
        .replace(/^what(is)?/i, '')
        .replace(/\?+$/g, ''); 

    const equationParts = equation.split(/([\+\-\*\/\^\\%\|\&\(\)])/).filter(part => part !== ''); 

    const result = evaluateExpression(equationParts).toFixed(2); // Round the result to 2 decimal places
    console.log(result);
    return result.toString();
}

module.exports = { calculateEquation };