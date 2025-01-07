import express from 'express';
import prisma from '../prisma/client.js';

const router = express.Router();

// Criar veículo
router.post('/', async (req, res) => {
    try {
        const veiculo = await prisma.veiculo.create({
            data: req.body,
        });
        res.status(201).json(veiculo);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar veículo.' });
    }
});

// Listar veículos
router.get('/', async (req, res) => {
    try {
        const veiculos = await prisma.veiculo.findMany();
        res.status(200).json(veiculos);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao listar veículos.' });
    }
});

// Buscar veículo por ID
router.get('/:id', async (req, res) => {
    try {
        const veiculo = await prisma.veiculo.findUnique({
            where: { id: req.params.id },
        });
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }
        res.status(200).json(veiculo);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao buscar veículo.' });
    }
});

// Atualizar veículo
router.put('/:id', async (req, res) => {
    try {
        const veiculo = await prisma.veiculo.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.status(200).json(veiculo);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar veículo.' });
    }
});

// Deletar veículo
router.delete('/:id', async (req, res) => {
    try {
        await prisma.veiculo.delete({
            where: { id: req.params.id },
        });
        res.status(200).json({ message: 'Veículo deletado com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao deletar veículo.' });
    }
});

export default router;
