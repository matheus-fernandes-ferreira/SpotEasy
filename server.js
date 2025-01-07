import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

// ===================== VEÍCULO =====================

// Criar veículo
app.post('/veiculos', async (req, res) => {
    try {
        const veiculo = await prisma.veiculo.create({
            data: {
                placa: req.body.placa,
                modelo: req.body.modelo,
                cor: req.body.cor,
                tipo: req.body.tipo,
            },
        });
        res.status(201).json(veiculo);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar veículo.' });
    }
});

// Listar veículos
app.get('/veiculos', async (req, res) => {
    try {
        const veiculos = await prisma.veiculo.findMany({
            include: { checkins: true }, // Inclui os check-ins se necessário
        });
        res.status(200).json(veiculos);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao listar veículos.' });
    }
});


// Rota para editar um veículo pelo ID
app.put('/veiculos/:id', async (req, res) => {
    const { id } = req.params;
    const { placa, modelo, cor, tipo } = req.body;

    try {
        // Verifica se o veículo existe antes de editar
        const veiculoExistente = await prisma.veiculo.findUnique({
            where: { id },
        });

        if (!veiculoExistente) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }

        // Atualiza os dados do veículo
        const veiculoAtualizado = await prisma.veiculo.update({
            where: { id },
            data: {
                placa: placa || veiculoExistente.placa,
                modelo: modelo || veiculoExistente.modelo,
                cor: cor || veiculoExistente.cor,
                tipo: tipo || veiculoExistente.tipo,
            },
        });

        res.status(200).json({ message: 'Veículo atualizado com sucesso.', veiculo: veiculoAtualizado });
    } catch (error) {
        console.error('Erro ao editar veículo:', error);
        res.status(500).json({ error: 'Erro ao editar veículo.' });
    }
});



// Rota para deletar um veículo pelo ID
app.delete('/veiculos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verifica se o veículo existe antes de deletar
        const veiculoExistente = await prisma.veiculo.findUnique({
            where: { id },
        });

        if (!veiculoExistente) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }

        // Deleta o veículo
        await prisma.veiculo.delete({
            where: { id },
        });

        res.status(200).json({ message: 'Veículo deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar veículo:', error);
        res.status(500).json({ error: 'Erro ao deletar veículo' });
    }
});

//Rota de Busca por ID
app.get('/veiculos/:id', async (req, res) => {
    try {
      const veiculo = await prisma.veiculo.findUnique({
        where: { id: req.params.id }
      });
  
      if (!veiculo) {
        return res.status(404).json({ error: 'Veículo não encontrado.' });
      }
  
      res.status(200).json(veiculo);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar veículo.' });
    }
  });

// ===================== ESTACIONAMENTO =====================

// Criar estacionamento
app.post('/estacionamento/configuracao', async (req, res) => {
    try {
        const estacionamento = await prisma.estacionamento.create({
            data: {
                totalVagas: req.body.totalVagas,
                vagasPorTipo: req.body.vagasPorTipo,
            },
        });
        res.status(201).json(estacionamento);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao salvar configurações do estacionamento.' });
    }
});

app.get('/vagas/status', async (req, res) => {
    try {
        console.log('Buscando total de vagas...');
        const totalVagas = await prisma.vaga.count();

        console.log('Buscando vagas livres...');
        const vagasLivres = await prisma.vaga.count({
            where: { status: 'livre' },
        });

        console.log('Calculando vagas ocupadas...');
        const vagasOcupadas = totalVagas - vagasLivres;

        console.log('Calculando taxa de ocupação...');
        const taxaOcupacao = totalVagas > 0 ? ((vagasOcupadas / totalVagas) * 100).toFixed(2) : 0;

        console.log('Enviando resposta:', { totalVagas, vagasLivres, vagasOcupadas, taxaOcupacao });
        res.status(200).json({
            totalVagas,
            vagasLivres,
            vagasOcupadas,
            taxaOcupacao,
        });
    } catch (error) {
        console.error('Erro ao buscar informações de vagas:', error);
        res.status(500).json({ error: 'Erro ao buscar informações de vagas.' });
    }
});


// Listar estacionamentos
app.get('/estacionamento/configuracao', async (req, res) => {
    try {
        const estacionamentos = await prisma.estacionamento.findMany();
        res.status(200).json(estacionamentos);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao listar estacionamentos.' });
    }
});

// Atualizar estacionamento
app.put('/estacionamento/configuracao/:id', async (req, res) => {
    try {
        const estacionamento = await prisma.estacionamento.update({
            where: { id: req.params.id },
            data: {
                totalVagas: req.body.totalVagas,
                vagasPorTipo: req.body.vagasPorTipo,
            },
        });
        res.status(200).json(estacionamento);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar configurações do estacionamento.' });
    }
});

// Deletar estacionamento
app.delete('/estacionamento/configuracao/:id', async (req, res) => {
    try {
        const estacionamento = await prisma.estacionamento.delete({
            where: { id: req.params.id },
        });
        res.status(200).json({ message: 'Estacionamento deletado com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao deletar estacionamento.' });
    }
});

// ===================== VAGA =====================

// Endpoint para criar as vagas no banco de dados
app.post('/criarVagas', async (req, res) => {
    try {
        // Buscar o estacionamento
        const estacionamento = await prisma.estacionamento.findUnique({
            where: { id: req.body.estacionamentoId },
        });

        if (!estacionamento) {
            return res.status(404).json({ error: 'Estacionamento não encontrado.' });
        }

        const vagasPorTipo = estacionamento.vagasPorTipo;

        // Criação das vagas
        let numeroVaga = 1;
        let vagasCriadas = [];

        // Gerar vagas para cada tipo de veículo
        for (const tipo in vagasPorTipo) {
            const quantidadePorTipo = vagasPorTipo[tipo];

            for (let i = 0; i < quantidadePorTipo; i++) {
                const vaga = await prisma.vaga.create({
                    data: {
                        numero: numeroVaga.toString(),
                        tipo: tipo,
                        status: 'livre',  // Inicializa a vaga como livre
                        estacionamentoId: estacionamento.id,  // A vaga pertence a este estacionamento
                    },
                });
                vagasCriadas.push(vaga);
                numeroVaga++;
            }
        }

        // Retornar as vagas criadas
        res.status(201).json(vagasCriadas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar as vagas.' });
    }
});


// Listar todas as vagas
app.get('/vagas', async (req, res) => {
    try {
        // Busca todas as vagas
        const vagas = await prisma.vaga.findMany();

        // Retorna as vagas encontradas
        res.status(200).json(vagas);
    } catch (error) {
        console.error('Erro ao listar todas as vagas:', error);
        res.status(500).json({ error: 'Erro ao listar todas as vagas.' });
    }
});

// Listar vagas por status
app.get('/vagas/status/:status', async (req, res) => {
    const { status } = req.params; // Obtém o status do parâmetro da URL

    try {
        // Busca as vagas pelo status
        const vagas = await prisma.vaga.findMany({
            where: {
                status: status, // Filtra as vagas pelo status
            },
        });

        // Verifica se há vagas com o status especificado
        if (vagas.length === 0) {
            return res.status(404).json({ message: 'Nenhuma vaga encontrada com o status especificado.' });
        }

        // Retorna as vagas encontradas
        res.status(200).json(vagas);
    } catch (error) {
        console.error('Erro ao listar vagas por status:', error);
        res.status(500).json({ error: 'Erro ao listar vagas por status.' });
    }
});




// ===================== CHECKIN =====================

// Criar check-in
app.post('/checkins', async (req, res) => {
    try {
        const { tipoVeiculo, veiculoId, dataEntrada, horaEntrada } = req.body;

        // Buscar a primeira vaga livre que seja compatível com o tipo de veículo
        const vaga = await prisma.vaga.findFirst({
            where: {
                status: 'livre',  // A vaga precisa estar livre
                tipo: tipoVeiculo,  // A vaga precisa ser do tipo do veículo
            },
        });

        if (!vaga) {
            return res.status(404).json({ error: 'Não há vagas disponíveis para este tipo de veículo.' });
        }

        // Criar o check-in
        const checkin = await prisma.checkin.create({
            data: {
                veiculoId,
                vagaId: vaga.id,
                dataEntrada: new Date(dataEntrada),
                horaEntrada: new Date(horaEntrada),
            },
        });

        // Atualizar o status da vaga para "ocupada"
        await prisma.vaga.update({
            where: { id: vaga.id },
            data: { status: 'ocupada' },
        });

        res.status(201).json(checkin);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar check-in.' });
    }
});

// Listar check-ins
app.get('/checkins', async (req, res) => {
    try {
        const checkins = await prisma.checkin.findMany({
            include: { veiculo: true },
        });
        res.status(200).json(checkins);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao listar check-ins.' });
    }
});

// Atualizar check-in (check-out)
app.put('/checkins/:id', async (req, res) => {
    try {
        const checkin = await prisma.checkin.update({
            where: { id: req.params.id },
            data: {
                dataSaida: req.body.dataSaida ? new Date(req.body.dataSaida) : null,
                horaSaida: req.body.horaSaida ? new Date(req.body.horaSaida) : null,
            },
        });

        // Atualizar o status da vaga para "livre" após o check-out
        await prisma.vaga.update({
            where: { id: checkin.vagaId },
            data: { status: 'livre' },
        });

        res.status(200).json(checkin);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar check-in.' });
    }
});

// Deletar check-in
app.delete('/checkins/:id', async (req, res) => {
    try {
        const checkin = await prisma.checkin.findUnique({
            where: { id: req.params.id },
        });

        if (checkin) {
            await prisma.vaga.update({
                where: { id: checkin.vagaId },
                data: { status: 'livre' },
            });
        }

        await prisma.checkin.delete({
            where: { id: req.params.id },
        });

        res.status(200).json({ message: 'Check-in deletado com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao deletar check-in.' });
    }
});

app.listen(3005, () => {
    console.log('Servidor rodando na porta 3005.');
});

export default app;
