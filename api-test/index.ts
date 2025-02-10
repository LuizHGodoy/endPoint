import cors from "cors";
import express, { type Request, type Response } from "express";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

interface Item {
	id: number;
	name: string;
}

let items: Item[] = [
	{ id: 1, name: "Item 1" },
	{ id: 2, name: "Item 2" },
];

// GET - Listar todos
app.get("/items", (req: Request, res: Response) => {
	res.json({
		success: true,
		message: "Items listados com sucesso",
		data: items,
	});
});

// GET - Buscar por ID
app.get("/items/:id", (req: Request, res: Response) => {
	const item = items.find((i) => i.id === Number(req.params.id));
	if (!item) {
		return res.status(404).json({
			success: false,
			message: "Item não encontrado",
		});
	}
	res.json({
		success: true,
		message: "Item encontrado com sucesso",
		data: item,
	});
});

// POST - Criar
app.post("/items", (req: Request, res: Response) => {
	const { name } = req.body;
	if (!name) {
		return res.status(400).json({
			success: false,
			message: "Nome é obrigatório",
		});
	}

	const newItem = {
		id: items.length + 1,
		name,
	};

	items.push(newItem);
	res.status(201).json({
		success: true,
		message: "Item criado com sucesso",
		data: newItem,
	});
});

// PUT - Atualizar
app.put("/items/:id", (req: Request, res: Response) => {
	const { name } = req.body;
	const id = Number(req.params.id);

	const itemIndex = items.findIndex((i) => i.id === id);
	if (itemIndex === -1) {
		return res.status(404).json({
			success: false,
			message: "Item não encontrado",
		});
	}

	items[itemIndex] = { ...items[itemIndex], name };
	res.json({
		success: true,
		message: "Item atualizado com sucesso",
		data: items[itemIndex],
	});
});

// DELETE - Remover
app.delete("/items/:id", (req: Request, res: Response) => {
	const id = Number(req.params.id);
	const itemIndex = items.findIndex((i) => i.id === id);

	if (itemIndex === -1) {
		return res.status(404).json({
			success: false,
			message: "Item não encontrado",
		});
	}

	items = items.filter((i) => i.id !== id);
	res.json({
		success: true,
		message: "Item removido com sucesso",
	});
});

// Rota protegida para testar autenticação
app.get("/protected", (req: Request, res: Response) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({
			success: false,
			message: "Token não fornecido",
		});
	}

	if (authHeader !== "Bearer test-token") {
		return res.status(403).json({
			success: false,
			message: "Token inválido",
		});
	}

	res.json({
		success: true,
		message: "Acesso autorizado",
		data: { secretInfo: "Dados protegidos" },
	});
});

app.listen(port, () => {
	console.log(`API rodando em http://localhost:${port}`);
});
