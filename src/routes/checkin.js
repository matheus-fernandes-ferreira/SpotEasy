import express from 'express';
import prisma from '../prisma/client.js';

const router = express.Router();

// Realizar check-in de veículo
router.post('/', async (req, res) => {
    try {
        const { veiculoId, numeroVaga } = req.body;

        // Verificar se a vaga está ocupada
        const vaga = await prisma.vaga.findUnique({
            where: { numero: numeroVaga },
        });

        if (!vaga || vaga.status === 'ocupada') {
            return res.status(400).json({ error: 'Vaga não está disponível.' });
        }

        // Atualizar status da vaga para ocupada
        await prisma.vaga.update({
            where: { numero: numeroVaga },
            data: { status: 'ocupada' },
        });

        // Criar registro de check-in
        const checkin = await prisma.estacionamento.create({
            data: {
                veiculoId,
                numeroVaga,
                data_entrada: new Date(),
                status: 'ocupado',
            },
        });

        res.status(201).json(checkin);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao realizar check-in.' });
    }
});

// Realizar check-out de veículo
router.post('/checkout', async (req, res) => {
    try {
        const { veiculoId } = req.body;

        // Buscar o registro do veículo no estacionamento
        const estacionamento = await prisma.estacionamento.findFirst({
            where: { veiculoId, status: 'ocupado' },
        });

        if (!estacionamento) {
            return res.status(404).json({ error: 'Veículo não encontrado no estacionamento.' });
        }

        // Atualizar registro para indicar saída
        await prisma.estacionamento.update({
            where: { id: estacionamento.id },
            data: {
                status: 'finalizado',
                data_saida: new Date(),
            },
        });

        // Atualizar status da vaga para livre
        await prisma.vaga.update({
            where: { numero: estacionamento.numeroVaga },
            data: { status: 'livre' },
        });

        res.status(200).json({ message: 'Check-out realizado com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao realizar check-out.' });
    }
});

export default router;
