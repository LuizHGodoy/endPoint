GET http://localhost:3001/items - Lista todos
GET http://localhost:3001/items/1 - Busca por ID
POST http://localhost:3001/items - Cria novo (body: { "name": "Novo Item" })
PUT http://localhost:3001/items/1 - Atualiza (body: { "name": "Item Atualizado" })
DELETE http://localhost:3001/items/1 - Remove
GET http://localhost:3001/protected - Rota protegida (precisa do header Authorization: Bearer test-token)