#include<stdio.h>
#define STACk_SIZE 5

int stack[STACk_SIZE];
int top=-1;

/*PEEP Operation*/
void peep()
{
	int pos;
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
			printf("Element at position %d is %d\n",pos,stack[top-pos+1]);
		}
	}
}
int main()
{
	peep();
	return 0;
}