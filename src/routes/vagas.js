import express from 'express';
import prisma from '../prisma/client.js';

const router = express.Router();

// Criar novas vagas
router.post('/', async (req, res) => {
    try {
        const { numero, tipo } = req.body;

        const vaga = await prisma.vaga.create({
            data: {
                numero,
                tipo,
                status: 'livre',
            },
        });

        res.status(201).json(vaga);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar vaga.' });
    }
});

// Listar todas as vagas
router.get('/', async (req, res) => {
    try {
        const vagas = await prisma.vaga.findMany();
        res.status(200).json(vagas);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao listar vagas.' });
    }
});

// Buscar vaga por número
router.get('/:numero', async (req, res) => {
    try {
        const { numero } = req.params;

        const vaga = await prisma.vaga.findUnique({
            where: { numero },
        });

        if (!vaga) {
            return res.status(404).json({ error: 'Vaga não encontrada.' });
        }

        res.status(200).json(vaga);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao buscar vaga.' });
    }
});

// Atualizar status ou tipo da vaga
router.put('/:numero', async (req, res) => {
    try {
        const { numero } = req.params;
        const { status, tipo } = req.body;

        const vaga = await prisma.vaga.update({
            where: { numero },
            data: { status, tipo },
        });

        res.status(200).json(vaga);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar vaga.' });
    }
});

// Deletar vaga
router.delete('/:numero', async (req, res) => {
    try {
        const { numero } = req.params;

        await prisma.vaga.delete({
            where: { numero },
        });

        res.status(200).json({ message: 'Vaga deletada com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao deletar vaga.' });
    }
});

export default router;
