document.addEventListener("DOMContentLoaded", async () => {
    // URLs da API
    const apiUrl = 'http://localhost:3005/veiculos';
    const estacionamentoUrl = 'http://localhost:3005/estacionamento/configuracao';



    // Função para carregar as configurações do estacionamento
    const loadConfigurations = async () => {
        try {
            const response = await axios.get(estacionamentoUrl);

            if (response.status === 200 && response.data) {
                const data = response.data;

                // Verifica se as informações estão presentes
                if (data.totalVagas && data.vagasLivres !== undefined && data.vagasOcupadas !== undefined) {
                    // Preenchendo as labels com os dados obtidos
                    document.getElementById("total-vagas").textContent = `Total de Vagas: ${data.totalVagas}`;
                    document.getElementById("vagas-livres").textContent = `Vagas Livres: ${data.vagasLivres}`;
                    document.getElementById("vagas-ocupadas").textContent = `Vagas Ocupadas: ${data.vagasOcupadas}`;
                    document.getElementById("taxaocupacao").textContent = `Taxa de Ocupação: ${(data.vagasOcupadas / data.totalVagas * 100).toFixed(2)}%`;
                } else {
                    // Caso não haja dados configurados
                    document.getElementById("total-vagas").textContent = "";
                    document.getElementById("vagas-livres").textContent = "";
                    document.getElementById("vagas-ocupadas").textContent = "";
                    document.getElementById("taxaocupacao").textContent = "";
                }
            } else {
                alert("Nenhuma configuração encontrada.");
            }
        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
            alert("Erro ao carregar configurações. Tente novamente mais tarde.");
        }
    };

    // Carregar as configurações ao iniciar
    loadConfigurations();

    // Função para salvar 
   document.getElementById("btn-checkin").addEventListener("click", async (event) => {
    event.preventDefault();

    // Obtendo os valores dos campos do formulário
    const placa = document.getElementById("placa").value;
    const modelo = document.getElementById("modelo").value;
    const cor = document.getElementById("cor").value;
    const tipo = document.getElementById("tipo").value;

    // Validando os campos
    if (!placa || !modelo || !cor || !tipo) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // 1. Buscar uma vaga livre
    try {
        const vagasResponse = await axios.get('http://localhost:3005/vagas?status=livre');
        
        if (vagasResponse.data.length === 0) {
            alert('Não há vagas livres disponíveis.');
            return;
        }

        const vagaLivre = vagasResponse.data[0]; // Pega a primeira vaga livre
        const numeroVaga = vagaLivre.numeroVaga;

        // 2. Atualizar o status da vaga para "ocupada"
        await axios.put(`http://localhost:3005/vagas/${vagaLivre.id}`, {
            status: 'ocupada'
        });

        // 3. Registrar o check-in com a vaga alocada
        const dataEntrada = new Date().toISOString(); // data no formato ISO 8601
        const horaEntrada = new Date().toLocaleTimeString(); // hora no formato HH:MM:SS

        const responseVeiculo = await axios.post('http://localhost:3005/veiculos', {
            placa, modelo, cor, tipo
        });

        if (responseVeiculo.status === 201) {
            const responseCheckin = await axios.post('http://localhost:3005/checkins', {
                placa,
                numeroVaga,
                dataEntrada,
                horaEntrada,
                status: 'ocupado'
            });

            if (responseCheckin.status === 201) {
                alert('Veículo cadastrado e check-in realizado com sucesso!');
                loadConfigurations(); // Atualiza as configurações exibidas
            } else {
                alert('Erro ao registrar o check-in do veículo.');
            }
        } else {
            alert('Erro ao cadastrar o veículo.');
        }

    } catch (error) {
        console.error("Erro ao realizar o cadastro ou check-in:", error);
        alert("Erro ao realizar o cadastro ou check-in. Tente novamente mais tarde.");
    }
});


    // Função para excluir configurações
    document.getElementById("btn-excluirConfiguracoes").addEventListener("click", async () => {
        try {
            const response = await axios.delete(estacionamentoUrl);
            if (response.status === 200) {
                alert('Configurações excluídas com sucesso!');
                loadConfigurations(); // Atualiza as configurações exibidas
            } else {
                alert('Erro ao excluir configurações.');
            }
        } catch (error) {
            console.error("Erro ao excluir configurações:", error);
            alert("Erro ao excluir configurações. Tente novamente mais tarde.");
        }
    });



    //=================================INFORMAÇÕES DAS VAGAS

    // Define a função que será executada para carregar os dados das vagas
    async function carregarDadosVagas() {

        const apiUrl = 'http://localhost:3005/vagas/status'; // URL do endpoint

        const loadVagasData = async () => {
            try {
                // console.log('Buscando dados de vagas...'); // Log antes da requisição
                const response = await axios.get(apiUrl);
                // console.log('Resposta recebida:', response); // Log da resposta da API

                if (response.status === 200) {
                    const { totalVagas, vagasLivres, vagasOcupadas, taxaOcupacao } = response.data;

                    // Preenchendo os labels com as informações
                    document.getElementById("total-vagas").textContent = `Total de Vagas: ${totalVagas}`;
                    document.getElementById("vagas-livres").textContent = `Vagas Livres: ${vagasLivres}`;
                    document.getElementById("vagas-ocupadas").textContent = `Vagas Ocupadas: ${vagasOcupadas}`;
                    document.getElementById("texto-ocupacao").textContent = `${taxaOcupacao}%`;
                } else {
                    console.error('Erro ao carregar informações de vagas: Status diferente de 200', response.status);
                }
            } catch (error) {
                console.error('Erro ao buscar informações das vagas:', error);
                alert('Ocorreu um erro ao buscar as informações das vagas.');
            }
        };

        // Carrega as informações automaticamente ao carregar a página
        loadVagasData();
    }

    carregarDadosVagas();


    //===========================================


    // Função para carregar os veículos
    try {
        const response = await axios.get(apiUrl);
        const veiculos = response.data;
        const veiculosContainer = document.getElementById('veiculos');
        veiculosContainer.className = 'veiculos-container';

        // Gera o conteúdo HTML dinâmico dos veículos
        veiculos.forEach(veiculo => {
            const veiculoCard = document.createElement('div');
            veiculoCard.className = 'veiculo-card';

            veiculoCard.innerHTML = `
            <h3 class="veiculo-titulo">${veiculo.modelo} <span>(${veiculo.placa})</span></h3>
            <p><strong>Cor:</strong> ${veiculo.cor}</p>
            <p><strong>Tipo:</strong> ${veiculo.tipo}</p>
        `;

            veiculosContainer.appendChild(veiculoCard);
        });
    } catch (error) {
        console.error("Erro ao buscar os veículos:", error);
    }



    // ************************** CHECK-IN & CADASTRO *************************************
    document.getElementById("btn-checkin").addEventListener("click", async (event) => {
        event.preventDefault();

        // Obtendo os valores dos campos do formulário
        const placa = document.getElementById("placa").value;
        const modelo = document.getElementById("modelo").value;
        const cor = document.getElementById("cor").value;
        const tipo = document.getElementById("tipo").value;

        // O número da vaga será sempre 1 (pode ser ajustado conforme a lógica do seu sistema)
        const numeroVaga = 1;

        // Captura a data e hora atuais
        const dataEntrada = new Date().toISOString(); // data no formato ISO 8601
        const horaEntrada = new Date().toLocaleTimeString(); // hora no formato HH:MM:SS

        // Validando os campos
        if (!placa || !modelo || !cor || !tipo) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        // Enviar os dados para cadastrar o veículo
        try {
            const responseVeiculo = await axios.post('http://localhost:3005/veiculos', {
                placa, modelo, cor, tipo
            });

            if (responseVeiculo.status === 201) {
                // Após cadastrar o veículo, registrar a entrada no check-in
                const responseCheckin = await axios.post('http://localhost:3005/checkins', {
                    placa,
                    numeroVaga,
                    dataEntrada,
                    horaEntrada,
                    status: 'ocupado'
                });

                if (responseCheckin.status === 201) {
                    alert('Veículo cadastrado e check-in realizado com sucesso!');
                    loadConfigurations(); // Atualiza as configurações exibidas
                } else {
                    alert('Erro ao registrar o check-in do veículo.');
                }
            } else {
                alert('Erro ao cadastrar o veículo.');
            }
        } catch (error) {
            console.error("Erro ao salvar veículo ou realizar o check-in:", error);
            alert("Erro ao salvar veículo ou realizar o check-in. Tente novamente mais tarde.");
        }
    });
});



//====================== T A B E L A ======================

// Função para carregar os dados dos veículos na tabela
document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = 'http://localhost:3005/veiculos';

    // Função para carregar os dados dos veículos na tabela
    async function carregarVeiculos() {
        try {
            const resposta = await axios.get(apiUrl);
            const veiculos = resposta.data;

            const tabelaVeiculos = document.getElementById('tabelaVeiculos');
            tabelaVeiculos.innerHTML = ''; // Limpa a tabela antes de inserir novos dados

            // Linha de cabeçalho
            const cabecalho = document.createElement('tr');
            cabecalho.innerHTML = `
                <th>ID</th>
                <th>Placa</th>
                <th>Modelo</th>
                <th>Cor</th>
                <th>Tipo</th>
                <th>Ações</th>
            `;
            tabelaVeiculos.appendChild(cabecalho);

            // Adicionando os veículos na tabela
            veiculos.forEach(veiculo => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${veiculo.id}</td>
                    <td>${veiculo.placa}</td>
                    <td>${veiculo.modelo}</td>
                    <td>${veiculo.cor}</td>
                    <td>${veiculo.tipo}</td>
                    <td>
                       
                        <button class="deletar-btn" data-id="${veiculo.id}">Deletar</button>
                    </td>
                `;
                tabelaVeiculos.appendChild(linha);
            });

            // Adicionar eventos aos botões após a tabela ser preenchida
            adicionarEventosBotoes();
        } catch (error) {
            console.error('Erro ao carregar os veículos:', error);
        }
    }

    // Função para adicionar eventos aos botões de deletar
    function adicionarEventosBotoes() {
        // Botões de deletar
        const botoesDeletar = document.querySelectorAll('.deletar-btn');
        botoesDeletar.forEach(botao => {
            botao.addEventListener('click', async (event) => {
                const id = event.target.getAttribute('data-id');
                try {
                    await axios.delete(`http://localhost:3005/veiculos/${id}`);
                    alert(`Veículo com ID: ${id} foi deletado.`);
                    carregarVeiculos(); // Recarrega os dados
                } catch (error) {
                    console.error('Erro ao deletar o veículo:', error);
                    alert('Erro ao tentar deletar o veículo.');
                    // Chama a função para carregar os veículos ao carregar a página
                    carregarVeiculos();
                }
            });
        });


    }

    // Chama a função para carregar os veículos ao carregar a página
    carregarVeiculos();
});


/*
dESCOBRIR QUAL O PROCESSO ESTÁ EM USO
tasklist | findstr node 

SUBSTITUTIR O SEGUNDO PID PELO NUMERO DO PROCESSO
taskkill /PID PID /F
*/