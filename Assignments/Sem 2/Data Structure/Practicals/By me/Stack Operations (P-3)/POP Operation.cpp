#include<stdio.h>
#define STACK_SIZE 5

int stack[STACK_SIZE];
int top=-1;

/*POP Operation*/
void pop()
{
	if(top==-1)
	{
		printf("Stack Underflow\n");
	}
	else
	{
		printf("Popped Element:%d\n",stack[top]);
		top--;
	}
}
int main()
{
	pop();
	return 0;
}