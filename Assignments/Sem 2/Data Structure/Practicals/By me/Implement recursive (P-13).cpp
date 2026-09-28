#include<stdio.h>
#include<stdlib.h>

//Node structure
struct Node{
	int data;
	struct Node*left,*right;
};

//Create new node
struct Node* createNode(int data){
	struct Node* newNode=(struct Node*)malloc(sizeof(struct Node));
	newNode->data=data;
	newNode->left=newNode->right=NULL;
	return newNode;
}

//Inorder Traversal(Recursive)
void inorder(struct Node*root){
	if(root != NULL){
		inorder(root->left);
		printf("%d",root->data);
		inorder(root->right);
	}
}

//Preorder Traversal(Recursive)
void preorder(struct Node*root){
	if(root != NULL){
		printf("%d",root->data);
		preorder(root->left);
		preorder(root->right);
	}
}

//Postorder Traversal(Recursive)
void postorder(struct Node*root){
	if(root != NULL){
		postorder(root->left);
		postorder(root->right);
		printf("%d",root->data);
	}
}

//Main Function
int main(){
	//Creating sample tree
	struct Node*root=createNode(1);
	root->left=createNode(2);
	root->right=createNode(3);
	root->left->left=createNode(4);
	root->left->right=createNode(5);
	
	printf("Inorder Traversal:");
	inorder(root);
	
	printf("\nPreorder Traversal:");
	preorder(root);
	
	printf("\nPostorder Traversal:");
	postorder(root);
	
	return 0;
}