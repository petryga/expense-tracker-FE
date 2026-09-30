import { stripCommas } from '../../utils';

export const evaluateExpression = (expression: string) => {
  try {
    return new Function('return (' + stripCommas(expression) + ')')();
  } catch (error) {
    console.error('Error evaluating expression:', error);
    return expression;
  }
};
