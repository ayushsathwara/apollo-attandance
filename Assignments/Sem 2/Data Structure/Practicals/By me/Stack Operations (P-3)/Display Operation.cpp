#include<stdio.h>
#define STACK_SIZE 5

int stack[STACK_SIZE];
int top=-1;

/*DISPLAY Operation*/
void display()
{
	int i;
	if(top==-1)
	{
		printf("Stack is empty\n");
	}
	else
	{
		printf("Stack Element:\n");
		for(i=top;i>=0;i--)
		{
			printf("%d\n",stack[i]);
		}
	}
}
int main()
{
	display();
	return 0;
}