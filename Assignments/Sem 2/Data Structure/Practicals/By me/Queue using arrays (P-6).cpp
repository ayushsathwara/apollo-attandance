#include <stdio.h>
#define MAX 5

int cq[MAX];
int first = -1, last = -1;

/* INSERT operation */
void insert()
{
    int item;
    
    if ((last + 1) % MAX == first)
    {
        printf("Circular Queue Overflow\n");
        return;
    }

    if (last == -1)   // Queue is empty
    {
        first = last = 0;
    }
    else
    {
        last = (last + 1) % MAX;
    }

    printf("Enter element to insert: ");
    scanf("%d", &item);
    cq[last] = item;
    printf("Element inserted successfully\n");
}

/* DELETE operation */
void dequeue()
{
    if (first== -1)
    {
        printf("Circular Queue Underflow\n");
        return;
    }

    printf("Deleted element: %d\n", cq[first]);

    if (first == last)   // Only one element
    {
        first = last = -1;
    }
    else
    {
        first = (first+ 1) % MAX;
    }
}

/* DISPLAY operation */
void display()
{
    int i;

    if (first == -1)
    {
        printf("Circular Queue is empty\n");
        return;
    }

    printf("Circular Queue elements are:\n");
    i = first;
    while (1)
    {
        printf("%d ", cq[i]);
        if (i == last)
            break;
        i = (i + 1) % MAX;
    }
    printf("\n");
}

/* MAIN function */
int main()
{
    int choice;

    do
    {
        printf("\n--- Circular Queue Menu ---\n");
        printf("1. Insert\n");
        printf("2. Delete\n");
        printf("3. Display\n");
        printf("4. Exit\n");
        printf("Enter your choice: ");
        scanf("%d", &choice);

        switch (choice)
        {
            case 1: insert(); break;
            case 2: dequeue(); break;
            case 3: display(); break;
            case 4: printf("Exiting program\n"); break;
            default: printf("Invalid choice\n");
        }
    } while (choice != 4);

    return 0;
}