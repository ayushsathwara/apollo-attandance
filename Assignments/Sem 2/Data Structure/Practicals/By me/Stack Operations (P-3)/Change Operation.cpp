#include<stdio.h>
#define STACK_SIZE 5

int stack[STACK_SIZE];
int top=-1;

/*CHANGE Operation*/
void change()
{
	int pos,newitem;
	if(top==-1)
	{
		printf("Stack is empty\n");
	}
	else
	{
		printf("Enter Position From Top:");
		scanf("%d",&pos);
		
		if(pos<=0 || pos>top+1)
		{
			printf("Invalid Position\n");
		}
		else
		{
			printf("Enter new value:");
			scanf("%d",&newitem);
			stack[top-pos+1]=newitem;
			printf("Element Changed Successfully\n");
		}
	}
}
int main()
{
	change();
	return 0;
}