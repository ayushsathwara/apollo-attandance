#include<stdio.h>
#define STACK_SIZE 5

int stack[STACK_SIZE];
int top=-1;

/*PUSH Operation*/
void push()
{
	int item;
	if(top==STACK_SIZE-1)
	{
		printf("Stack Overflow\n");
	}
	else
	{
		printf("Enter Element to push:");
		scanf("%d",&item);
		top++;
		stack[top]=item;
		printf("Element Pushed Successfully\n");
	}
}
int main()
{
	push();
	return 0;
}
