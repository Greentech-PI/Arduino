  
/*Incluindo as bibliotecas do sensor DHT11*/
#include <DHT.h>
#include <DHT_U.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include "DHT.h"
/*fim*/

/*Definindo e indicando o endereço analogicos e digital (no caso do sensor de proximidade) da leitura(portas da placa)*/
#define DHTPIN A1
#define LM35PIN A5
#define LUMIPIN A0
#define CHAVPIN 7
DHT dht(DHTPIN, DHT11);

/*método de configuração*/
void setup()
{
/*configurando os pinos como entrada*/
pinMode(DHTPIN, INPUT);
pinMode(CHAVPIN, INPUT);
/*Definindo o bound rate (frequência) que capta os dados*/
Serial.begin(9600);
dht.begin();
}

/*método de repetição*/
void loop()
{
/*Definindo a váriável do sensor de umidade e temperatura*/
float dht11_umidade = dht.readHumidity();
float dht11_temperatura = dht.readTemperature();

/*printando os dados do sensor DHT_Umidade na tela*/
//Serial.print("DHT_Umidade: ");
Serial.print(dht11_umidade);
Serial.print("; ");

/*printando os dados dos sensor DHT_Temperatura na tela*/
//Serial.print("DHT_Temperatura: ");
Serial.print(dht11_temperatura);
Serial.print("; ");

/*Aqui esta printando os dados do sensor de luminosidade na tela*/
//Serial.print("Luminosidade: ");
float luminosidade = analogRead(LUMIPIN);
Serial.print(luminosidade);
Serial.print("; ");

/*Printando os dados do sensor de temperatura*/
float lm35_temperatura = analogRead(LM35PIN);
/*  milivolt = 1 grau celsius, por isso nos dividimos pelo numero mais proximo de 1000 em bit, que é o 1024 (2 elevado a 10)*/
lm35_temperatura = lm35_temperatura * 0.00488;
lm35_temperatura = lm35_temperatura * 100;
//Serial.print("Temperatura: ");
Serial.print(lm35_temperatura);
Serial.print("; ");

/*Printando os dados do sensor de proximidade*/
int chave = digitalRead(7);
if (chave == 0)
{
Serial.print("1");
}
else
{
Serial.print("0");
}
Serial.println();

/*Pausa entre os intervalos de looping - tempo que demora para mostrar os novos dados*/
delay(300000);
}
