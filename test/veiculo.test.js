import request from 'supertest';
import app from '../server'; // Ajuste o caminho conforme necessário
import { PrismaClient } from '@prisma/client';

// Inicializando o PrismaClient para limpar o banco de dados após os testes
const prisma = new PrismaClient();

describe('Testes da rota de criação de veículos', () => {

  // Antes de rodar os testes, limpa a tabela de veículos
  beforeEach(async () => {
    await prisma.veiculo.deleteMany(); // Apaga todos os veículos, se existirem
  });

  // Teste para a criação de veículo
  it('Deve criar um veículo com sucesso', async () => {
    const novoVeiculo = {
      placa: 'ABC-1234',
      modelo: 'Fusca',
      cor: 'Azul',
      tipo: 'Carro',
    };

    const response = await request(app)
      .post('/veiculos')
      .send(novoVeiculo)
      .expect('Content-Type', /json/)
      .expect(201); // Espera um status de 201 (Created)

    // Verificando a resposta
    expect(response.body).toHaveProperty('placa', novoVeiculo.placa);
    expect(response.body).toHaveProperty('modelo', novoVeiculo.modelo);
    expect(response.body).toHaveProperty('cor', novoVeiculo.cor);
    expect(response.body).toHaveProperty('tipo', novoVeiculo.tipo);
  });

  // Teste para erro ao criar veículo sem dados obrigatórios
  it('Deve retornar erro ao criar veículo sem dados obrigatórios', async () => {
    const response = await request(app)
      .post('/veiculos')
      .send({ modelo: 'Fusca' }) // Envia dados incompletos
      .expect('Content-Type', /json/)
      .expect(400); // Espera um status de 400 (Bad Request)

    // Verificando a resposta de erro
    expect(response.body.error).toBe('Erro ao criar veículo.');
  });

  // Teste para listar todos os veículos cadastrados
  it('Deve listar todos os veículos cadastrados', async () => {
    // Cria alguns veículos para testar a listagem
    await request(app)
      .post('/veiculos')
      .send({
        placa: 'DEF-5678',
        modelo: 'Gol',
        cor: 'Vermelho',
        tipo: 'Carro',
      });
    await request(app)
      .post('/veiculos')
      .send({
        placa: 'GHI-9012',
        modelo: 'Civic',
        cor: 'Preto',
        tipo: 'Carro',
      });

    const response = await request(app)
      .get('/veiculos')
      .expect('Content-Type', /json/)
      .expect(200);

    // Corrigido o número de veículos esperado para 3, pois agora já foram criados 3 veículos
    expect(response.body).toHaveLength(2); // Espera que o número de veículos seja 3
    expect(response.body[0]).toHaveProperty('placa', 'DEF-5678');
    expect(response.body[1]).toHaveProperty('placa', 'GHI-9012');
  });

 it('Deve excluir um veículo com sucesso', async () => {
  // Cria um veículo para testar a exclusão
  const novoVeiculo = {
    placa: 'DEF-5678',
    modelo: 'Gol',
    cor: 'Vermelho',
    tipo: 'Carro',
  };

  const createResponse = await request(app)
    .post('/veiculos')
    .send(novoVeiculo)
    .expect('Content-Type', /json/)
    .expect(201);

  // Exclui o veículo
  const response = await request(app)
    .delete(`/veiculos/${createResponse.body.id}`)
    .expect(200);

  // Verifica se o veículo foi realmente excluído
  expect(response.body.message).toBe('Veículo deletado com sucesso');
});
it('Deve atualizar um veículo com sucesso', async () => {
    const novoVeiculo = {
      placa: 'DEF-5678',
      modelo: 'Gol',
      cor: 'Vermelho',
      tipo: 'Carro',
    };
  
    const createResponse = await request(app)
      .post('/veiculos')
      .send(novoVeiculo)
      .expect('Content-Type', /json/)
      .expect(201);
  
    const updatedData = {
      placa: 'DEF-5678',
      modelo: 'Gol 1.6',
      cor: 'Vermelho',
      tipo: 'Carro',
    };
  
    // Atualizando o veículo
    const response = await request(app)
      .put(`/veiculos/${createResponse.body.id}`)
      .send(updatedData)
      .expect('Content-Type', /json/)
      .expect(200);
  
    // Verifica se o veículo foi atualizado com sucesso
    expect(response.body.veiculo).toHaveProperty('modelo', updatedData.modelo);
    expect(response.body.veiculo).toHaveProperty('cor', updatedData.cor);
  });
  

  it('Deve buscar um veículo por ID com sucesso', async () => {
    const novoVeiculo = {
      placa: 'DEF-5678',
      modelo: 'Gol',
      cor: 'Vermelho',
      tipo: 'Carro',
    };
  
    const createResponse = await request(app)
      .post('/veiculos')
      .send(novoVeiculo)
      .expect('Content-Type', /json/)
      .expect(201);
  
    const response = await request(app)
      .get(`/veiculos/${createResponse.body.id}`)
      .expect('Content-Type', /json/)
      .expect(200);
  
    expect(response.body).toHaveProperty('placa', novoVeiculo.placa);
    expect(response.body).toHaveProperty('modelo', novoVeiculo.modelo);
    expect(response.body).toHaveProperty('cor', novoVeiculo.cor);
    expect(response.body).toHaveProperty('tipo', novoVeiculo.tipo);
  });
  
  
  
  // Após todos os testes, limpar os dados do banco
//   afterAll(async () => {
//     await prisma.veiculo.deleteMany(); // Limpa a tabela de veículos novamente após os testes
//     await prisma.$disconnect(); // Desconecta o Prisma
//   });
});
