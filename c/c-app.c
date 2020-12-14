#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[])
{
  FILE *fPtr = NULL;
  fPtr = fopen("tmp.txt", "w");
  if (fPtr == NULL)
  {
    exit(EXIT_FAILURE);
  }

  char content[256];
  strcpy(content, "Hello World\n");
  int counter;
  if (argc >= 2)
  {
    for (counter = 1; counter < argc; counter++)
    {
      strcat(content, argv[counter]);
      strcat(content, "\n");
    }
  }
  fputs(content, fPtr);

  fclose(fPtr);

  return 0;
}
