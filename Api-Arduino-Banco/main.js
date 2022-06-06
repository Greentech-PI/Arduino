const serialport = require('serialport');
const express = require('express');
const mysql = require('mysql2');
const sql = require('mssql');

const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;
const HABILITAR_OPERACAO_INSERIR = true;

// escolha deixar a linha 'desenvolvimento' descomentada se quiser conectar seu arduino ao banco de dados local, MySQL Workbench
const AMBIENTE = 'desenvolvimento';

// escolha deixar a linha 'producao' descomentada se quiser conectar seu arduino ao banco de dados remoto, SQL Server
// const AMBIENTE = 'producao';

//variavel para prototipo -- AINDA NÃO FUNCIONA
// const AMBIENTE = 'prototipo';

/* if(AMBIENTE == 'prototipo'){
    console.log("AMBIENTE: PROTOTIPO");
    poolBancoDados = mysql.createPool(
        {
            // CREDENCIAIS DO BANCO LOCAL - MYSQL WORKBENCH
            host: 'localhost',
            user: 'user_atividePI',
            password: 'sptech',
            database: 'greentech'
        }
    ).promise();

    const serial = async (
        dht11_temperatura,
        dht11_umidade
    ) => {
        setInterval(function (){
            dht11_temperatura = Math.random()*10+15;
            var var1 = dht11_temperatura + 2;
            var var2 = dht11_temperatura - 2;
            dht11_umidade = Math.random()*10+75;
            var var3 = dht11_umidade + 5;
            var var4 = dht11_umidade - 5;
            console.log(dht11_temperatura);
            console.log(var1);
            console.log(var2);
            console.log(var3);
            console.log(var4);
            console.log("_______");
            await poolBancoDados.execute(
                'INSERT INTO MonitoramentoSensor (dht11_umidade, dht11_temperatura, momento, fkEmpresa, fkEstufa) VALUES (?, ?, now(), 500, 1); INSERT INTO MonitoramentoSensor (dht11_umidade, dht11_temperatura, momento, fkEmpresa, fkEstufa) VALUES (?, ?, now(), 500, 2)',
                [var1, var3, var2, var4]
            );
        }, 1000);
    }
    
}else{ */
    const serial = async (
        valoresDht11Umidade,
        valoresDht11Temperatura,
        valoresLuminosidade,
        valoresLm35Temperatura,
        valoresChave
    ) => {
        let poolBancoDados = ''
    
        if (AMBIENTE == 'desenvolvimento') {
            poolBancoDados = mysql.createPool(
                {
                    // CREDENCIAIS DO BANCO LOCAL - MYSQL WORKBENCH
                    host: 'localhost',
                    user: 'aluno',
                    password: 'sptech',
                    database: 'greentech'
                }
            ).promise();
        } else if (AMBIENTE == 'producao') {
    
            console.log('Projeto rodando inserindo dados em nuvem. Configure as credenciais abaixo.')
    
        } else {
            throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
        }
    
    
        const portas = await serialport.SerialPort.list();
        const portaArduino = portas.find((porta) => porta.vendorId == 2341 && porta.productId == 43);
        if (!portaArduino) {
            throw new Error('O arduino não foi encontrado em nenhuma porta serial');
        }
        const arduino = new serialport.SerialPort(
            {
                path: portaArduino.path,
                baudRate: SERIAL_BAUD_RATE
            }
        );
        arduino.on('open', () => {
            console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
        });
        arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
            const valores = data.split(';');
            const dht11Umidade = parseFloat(valores[0]);
            const dht11Temperatura = parseFloat(valores[1]);
            const luminosidade = parseFloat(valores[2]);
            const lm35Temperatura = parseFloat(valores[3]);
            const chave = parseInt(valores[4]);
    
            valoresDht11Umidade.push(dht11Umidade);
            valoresDht11Temperatura.push(dht11Temperatura);
            valoresLuminosidade.push(luminosidade);
            valoresLm35Temperatura.push(lm35Temperatura);
            valoresChave.push(chave);
    
            var idMonitoramento = 1;
    
            if (HABILITAR_OPERACAO_INSERIR) {
    
                if (AMBIENTE == 'producao') {
    
                    // Este insert irá inserir os dados na tabela "medida" -> altere se necessário
                    // Este insert irá inserir dados de fk_aquario id=1 >> você deve ter o aquario de id 1 cadastrado.
                    sqlquery = `INSERT INTO MonitoramentoSensor (dht11_temperatura, dht11_umidade, luminosidade, lm35_temperatura, chave, momento, fkEmpresa,fkEstufa) VALUES (${dht11Umidade}, ${dht11Temperatura}, ${luminosidade}, ${lm35Temperatura}, ${chave}, CURRENT_TIMESTAMP, 1)`;
    
                    // CREDENCIAIS DO BANCO REMOTO - SQL SERVER
                    const connStr = "Server=grupo1-1cco.database.windows.net;User = grupo1-1cco;Password=#GfgrupoGreentech;";
    
                    function inserirComando(conn, sqlquery) {
                        conn.query(sqlquery);
                        console.log("valores inseridos no banco: ", dht11Umidade + ", " + dht11Temperatura + ", " + luminosidade + ", " + lm35Temperatura + ", " + chave)
                    }
    
                    sql.connect(connStr)
                        .then(conn => inserirComando(conn, sqlquery))
                        .catch(err => console.log("erro! " + err));
    
                } else if (AMBIENTE == 'desenvolvimento') {
    
                    // Este insert irá inserir os dados na tabela "medida" -> altere se necessário
                    // Este insert irá inserir dados de fk_aquario id=1 >> você deve ter o aquario de id 1 cadastrado.
                    await poolBancoDados.execute(
                        'INSERT INTO MonitoramentoSensor (dht11_umidade, dht11_temperatura, luminosidade, lm35_temperatura, chave, momento, fkEmpresa, fkEstufa) VALUES (?, ?, ?, ?, ?, now(), 500, 1)',
                        [dht11Umidade, dht11Temperatura, luminosidade, lm35Temperatura, chave]
                    );
                    console.log("valores inseridos no banco: ", dht11Umidade + ", " + dht11Temperatura + ", " + luminosidade + ", " + lm35Temperatura + ", " + chave);
    
    
                } else {
                    throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
                }
    
            }
    
        });
        arduino.on('error', (mensagem) => {
            console.error(`Erro no arduino (Mensagem: ${mensagem}`)
        });
    }
    
    const servidor = (
        valoresDht11Umidade,
        valoresDht11Temperatura,
        valoresLuminosidade,
        valoresLm35Temperatura,
        valoresChave
    ) => {
        const app = express();
        app.use((request, response, next) => {
            response.header('Access-Control-Allow-Origin', '*');
            response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
            next();
        });
        app.listen(SERVIDOR_PORTA, () => {
            console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
        });
        app.get('/sensores/dht11/umidade', (_, response) => {
            return response.json(valoresDht11Umidade);
        });
        app.get('/sensores/dht11/temperatura', (_, response) => {
            return response.json(valoresDht11Temperatura);
        });
        app.get('/sensores/luminosidade', (_, response) => {
            return response.json(valoresLuminosidade);
        });
        app.get('/sensores/lm35/temperatura', (_, response) => {
            return response.json(valoresLm35Temperatura);
        });
        app.get('/sensores/chave', (_, response) => {
            return response.json(valoresChave);
        });
    }
    
    (async () => {
        const valoresDht11Umidade = [];
        const valoresDht11Temperatura = [];
        const valoresLuminosidade = [];
        const valoresLm35Temperatura = [];
        const valoresChave = [];
        await serial(
            valoresDht11Umidade,
            valoresDht11Temperatura,
            valoresLuminosidade,
            valoresLm35Temperatura,
            valoresChave
        );
        servidor(
            valoresDht11Umidade,
            valoresDht11Temperatura,
            valoresLuminosidade,
            valoresLm35Temperatura,
            valoresChave
        );
    })();
    
/* } */