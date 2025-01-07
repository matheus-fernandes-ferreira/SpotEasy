import express from 'express';
import prisma from '../prisma/client.js';

const router = express.Router();

// Criar estacionamento
router.post('/configuracao', async (req, res) => {
    try {
        const estacionamento = await prisma.estacionamento.create({
            data: req.body,
        });
        res.status(201).json(estacionamento);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar estacionamento.' });
    }
});

// Listar estacionamentos
router.get('/configuracao', async (req, res) => {
    try {
        const estacionamentos = await prisma.estacionamento.findMany();
        res.status(200).json(estacionamentos);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao listar estacionamentos.' });
    }
});

// Atualizar estacionamento
router.put('/configuracao/:id', async (req, res) => {
    try {
        const estacionamento = await prisma.estacionamento.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.status(200).json(estacionamento);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar estacionamento.' });
    }
});

// Deletar estacionamento
router.delete('/configuracao/:id', async (req, res) => {
    try {
        await prisma.estacionamento.delete({
            where: { id: req.params.id },
        });
        res.status(200).json({ message: 'Estacionamento deletado com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao deletar estacionamento.' });
    }
});

export default router;
