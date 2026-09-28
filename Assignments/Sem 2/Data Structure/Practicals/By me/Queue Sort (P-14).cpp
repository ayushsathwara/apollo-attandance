#include<stdio.h>

int main(){
	int q[100], sorted[100];
	int n, i, j, min, pos, temp;
	
	printf("Enter number of element: ");
	scanf("%d", &n);
	
	printf("Enter element: ");
	for(i = 0; i < n; i++) {
	scanf("%d", &q[i]);
}

for(i = 0; i < n; i++) {
min = q[0];
pos = 0;

for(j = 1; j < n - i; j++) {
	if(q[j] < min) {
		min = q[j];
		pos = j;
	}
}
sorted[i] = min;

for(j = pos; j < n - i - 1; j++) {
	q[j] = q[j + 1];  
   }
}

printf("Sorted element: ");
for(i = 0; i < n; i++) {
	printf("%d", sorted[i]);
}
return 0;
}