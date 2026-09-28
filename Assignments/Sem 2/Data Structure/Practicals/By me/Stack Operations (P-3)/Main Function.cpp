#include<stdio.h>
#define STACK_SIZE 5

int stack[STACK_SIZE];
int top=-1;

void push() { }
void pop() { }
void peep() { }
void change() { }
void display() { }

/*Main Function*/
int main()
{
    int choice;
    do
    {
        printf("\n --- STACK OPERATIONS --- \n");
        printf("1. PUSH\n");
        printf("2. POP\n");
        printf("3. PEEP\n");
        printf("4. CHANGE\n");
        printf("5. DISPLAY\n");
        printf("6. EXIT\n");
        printf("Enter your choice: ");
        scanf("%d", &choice);

        switch (choice)
        {
        case 1: push(); break;
        case 2: pop(); break;
        case 3: peep(); break;
        case 4: change(); break;
        case 5: display(); break;
        case 6: printf("Exiting program\n"); break;
        default: printf("Invalid choice\n");
        }
    } while (choice != 6);

    return 0;
}

