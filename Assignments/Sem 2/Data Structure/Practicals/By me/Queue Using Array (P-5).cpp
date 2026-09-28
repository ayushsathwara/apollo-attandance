#include <stdio.h>
#define MAX 5

int queue[MAX];
int front = -1, last = -1;

/* INSERT operation */
void insert()
{
    int item;
    if (last == MAX - 1)
    {
        printf("Queue Overflow\n");
    }
    else
    {
        if (front == -1)
            front = 0;
        printf("Enter element to insert: ");
        scanf("%d", &item);
        last++;
        queue[last] = item;
        printf("Element inserted successfully\n");
    }
}

/* DELETE operation */
void dequeue()
{
    if (front == -1 || front > last)
    {
        printf("Queue Underflow\n");
    }
    else
    {
        printf("Deleted element: %d\n", queue[front]);
        front++;
    }
}

/* DISPLAY operation */
void display()
{
    int i;
    if (front == -1 || front > last)
    {
        printf("Queue is Empty\n");
    }
    else
    {
        printf("Queue elements are:\n");
        for (i = front; i <= last; i++)
        {
            printf("%d ", queue[i]);
        }
        printf("\n");
    }
}

int main()
{
    int choice;
    do
    {
        printf("\n--- QUEUE OPERATIONS ---\n");
        printf("1. Insert\n2. Delete\n3. Display\n4. Exit\n");
        printf("Enter your choice: ");
        scanf("%d", &choice);

        switch (choice)
        {
        case 1:
            insert();
            break;
        case 2:
            dequeue();
            break;
        case 3:
            display();
            break;
        case 4:
            printf("Exiting program\n");
            break;
        default:
            printf("Invalid choice\n");
        }
    } while (choice != 4);

    return 0;
}

