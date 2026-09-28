#include<stdio.h>
#include<stdlib.h>
struct node
{
 int data;
 struct node *next;
 struct node *prev;
};
struct node *start=NULL;
/* Insert at Front */
void insertFront()
{
 struct node *newnode;
 newnode=(struct node*)malloc(sizeof(struct node));
 printf("Enter value: ");
 scanf("%d",&newnode->data);
 newnode->prev=NULL;
 newnode->next=start;
 if(start!=NULL)
 start->prev=newnode;
 start=newnode;
}
/* Insert at End */
void insertEnd()
{
 struct node *newnode,*temp;
 newnode=(struct node*)malloc(sizeof(struct node));
 printf("Enter value: ");
 scanf("%d",&newnode->data);
 newnode->next=NULL;
 if(start==NULL)
 {
 newnode->prev=NULL;
 start=newnode;
 }
 else
 {
 temp=start;
 while(temp->next!=NULL)
 temp=temp->next;
 temp->next=newnode;
 newnode->prev=temp;
 }
}
/* Main Function */
int main()
{
 int ch;
 while(1)
 {
 printf("\n--- Doubly Linked List ---\n");
 printf("1.Insert Front\n");
 printf("2.Insert End\n");
scanf("%d",&ch);
switch(ch)
 {
 case 1: insertFront(); break;
 case 2: insertEnd(); break;
 default: printf("Invalid choice\n");
 }
 }
}