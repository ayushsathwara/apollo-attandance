#include <stdio.h>
#include <ctype.h>
#define MAX 100

char stack[MAX];
int top = -1;

// Push function
void push(char x) {
    top = top + 1;     // Move top one step up
    stack[top] = x;    // Store value at top position
}

// Pop function
char pop() {
    char value;
    value = stack[top];   // Get top element
    top = top - 1;        // Move top one step down
    return value;         // Return removed value
}

// Function to check precedence
int precedence(char x) {
    if (x == '+' || x == '-')
        return 1;
    if (x == '*' || x == '/')
        return 2;
    if (x == '^')
        return 3;
    return 0;
}

int main() {
    char infix[MAX], postfix[MAX];
    int i = 0, j = 0;
    char ch;

    printf("Enter Infix Expression: ");
    scanf("%s", infix);

    while (infix[i] != '\0') {
        ch = infix[i];

        // If operand, add to postfix
        if (isalnum(ch)) {
            postfix[j++] = ch;
        }
        // If '(', push to stack
        else if (ch == '(') {
            push(ch);
        }
        // If ')', pop until '('
        else if (ch == ')') {
            while (stack[top] != '(')
                postfix[j++] = pop();
            pop(); // remove '('
        }
        // If operator
        else {
            while (top != -1 && precedence(stack[top]) >= precedence(ch))
                postfix[j++] = pop();
            push(ch);
        }
        i++;
    }

    // Pop remaining operators
    while (top != -1)
        postfix[j++] = pop();

    postfix[j] = '\0';

    printf("Postfix Expression: %s\n", postfix);

    return 0;
}