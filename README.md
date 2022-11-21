# Implementação de uma Máquina de Turing Teversível

O programa simula a execução de uma Máquina de Tuting Reversível, utilizando a linguagem JavaScript. 

A entrada se dá via arquivo, e segue o seguinte formato:
```
    A primeira linha é composta por números que indicam, respectivamente: o número de estados, o número de símbolos no alfabeto de entrada, o número de símbolos no alfabeto da fita e o número de transições. A seguir, temos os estados, na próxima linha o alfabeto de entrada e logo o alfabeto da fita. Nas linhas sequentes temos as funções de transição em formato de quíntuplas. Depois da funcão de transição, segue uma entrada.
```

Você pode chamar o programa com o comando
```
    node main.js entry.txt
```

Por padrão, tem-se algumas regras:

1. O único Estado Final aceito é o último da lista de estados, que está na segunda linha
2. As funções de transição devem ser construídas sem espaços, conforme o exemplo "entry.txt"
3. Os movimentos de fita contidos nas funções de transição devem ser "R" ou "L", em formato de caixa alta
4. O último caracter do alfabeto da fita (linha 4) deve ser o branco, represnetado por "B"



        